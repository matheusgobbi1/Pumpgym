import { Audio } from 'expo-av';
import { useCallback } from 'react';

export function useSound() {
  const playSelectSound = useCallback(async () => {
    const { sound } = await Audio.Sound.createAsync(
      require('../assets/sounds/select.mp3')
    );
    await sound.playAsync();
  }, []);

  const playErrorSound = useCallback(async () => {
    const { sound } = await Audio.Sound.createAsync(
      require('../assets/sounds/error.mp3')
    );
    await sound.playAsync();
  }, []);

  return {
    playSelectSound,
    playErrorSound,
  };
} 