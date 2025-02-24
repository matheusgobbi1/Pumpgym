import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from 'firebase/auth';
import { auth, restoreSession } from '../services/firebase';
import { signOut as firebaseSignOut } from 'firebase/auth';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { serverTimestamp } from 'firebase/firestore';

interface AuthContextData {
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: () => void;

    async function loadUser() {
      try {
        // Restaurar sessão do Firebase primeiro
        await restoreSession();
        
        unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          console.log("🔐 Estado de autenticação mudou:", firebaseUser?.uid);
          
          if (firebaseUser) {
            // Criar/atualizar documento do usuário
            try {
              const userRef = doc(db, "users", firebaseUser.uid);
              const userDoc = await getDoc(userRef);
              
              if (!userDoc.exists()) {
                console.log("📝 Criando documento do usuário");
                await setDoc(userRef, {
                  email: firebaseUser.email,
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp(),
                  hasCompletedOnboarding: false
                }, { merge: true });
              }
            } catch (error) {
              console.error("❌ Erro ao criar documento do usuário:", error);
            }
            
            // Usar o usuário do Firebase diretamente
            setUser(firebaseUser);
            
            // Salvar apenas o ID para referência rápida
            await SecureStore.setItemAsync('userId', firebaseUser.uid);
          } else {
            setUser(null);
            await SecureStore.deleteItemAsync('userId');
          }
          
          setIsLoading(false);
        });
      } catch (error) {
        console.error('❌ Erro ao carregar usuário:', error);
        setIsLoading(false);
      }
    }

    loadUser();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const signOut = async () => {
    try {
      const hasCompletedOnboarding = await AsyncStorage.getItem('hasCompletedOnboarding');
      
      // Limpar dados de autenticação
      await SecureStore.deleteItemAsync('userId');
      await firebaseSignOut(auth);
      
      // Limpar outros dados mas manter onboarding
      await AsyncStorage.clear();
      if (hasCompletedOnboarding === 'true') {
        await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
      }
      
      router.replace(hasCompletedOnboarding === 'true' ? '/(auth)/login' : '/(onboarding)/gender');
    } catch (error) {
      console.error('❌ Erro ao fazer logout:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
