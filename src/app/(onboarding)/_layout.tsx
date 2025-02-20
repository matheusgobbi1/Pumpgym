import { Stack } from 'expo-router'
import { OnboardingProvider } from '../../contexts/OnboardingContext'

export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
    </OnboardingProvider>
  )
} 