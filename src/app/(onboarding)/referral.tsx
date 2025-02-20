import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { Button } from "../../components/Button";
import { SelectionCard } from "../../components/SelectionCard";
import { OnboardingLayout } from "../../components/OnboardingLayout";
import { useColors } from "../../constants/colors";
import { useOnboarding } from "../../contexts/OnboardingContext";

const TOTAL_STEPS = 10;
const CURRENT_STEP = 3;

const REFERRAL_OPTIONS = [
  {
    id: "instagram" as const,
    title: "Instagram",
    icon: (color: string) => (
      <FontAwesome name="instagram" size={24} color={color} />
    ),
  },
  {
    id: "facebook" as const,
    title: "Facebook",
    icon: (color: string) => (
      <FontAwesome name="facebook" size={24} color={color} />
    ),
  },
  {
    id: "tiktok" as const,
    title: "TikTok",
    icon: (color: string) => (
      <MaterialCommunityIcons name="music-note" size={24} color={color} />
    ),
  },
  {
    id: "youtube" as const,
    title: "Youtube",
    icon: (color: string) => (
      <FontAwesome name="youtube-play" size={24} color={color} />
    ),
  },
  {
    id: "google" as const,
    title: "Google",
    icon: (color: string) => (
      <FontAwesome name="google" size={24} color={color} />
    ),
  },
  {
    id: "tv" as const,
    title: "TV",
    icon: (color: string) => (
      <MaterialCommunityIcons name="television" size={24} color={color} />
    ),
  },
] as const;

export default function ReferralScreen() {
  const router = useRouter();
  const { data, dispatch } = useOnboarding();
  const colors = useColors();

  const handleNext = () => {
    if (data.referralSource) {
      router.push("/birth-date");
    }
  };

  return (
    <OnboardingLayout
      currentStep={CURRENT_STEP}
      totalSteps={TOTAL_STEPS}
      footer={
        <Button
          label="Próximo"
          onPress={handleNext}
          disabled={!data.referralSource}
        />
      }
    >
      <Text style={[styles.title, { color: colors.text }]}>
        Onde você ouviu{"\n"}falar de nós?
      </Text>

      <View style={styles.options}>
        {REFERRAL_OPTIONS.map((option) => (
          <SelectionCard
            key={option.id}
            title={option.title}
            selected={data.referralSource === option.id}
            onPress={() =>
              dispatch({
                type: "SET_REFERRAL_SOURCE",
                payload: option.id,
              })
            }
            leftContent={option.icon(
              data.referralSource === option.id ? colors.primary : colors.text
            )}
          />
        ))}
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 32,
  },
  options: {
    marginTop: 24,
  },
});
