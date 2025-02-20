import { OnboardingData } from "../contexts/OnboardingContext";

export interface HealthMetrics {
  bmi: number;
  healthScore: number;
  recommendations: string[];
}

export function calculateHealthMetrics(data: OnboardingData): HealthMetrics {
  const metrics: HealthMetrics = {
    bmi: 0,
    healthScore: 0,
    recommendations: [],
  };

  // Cálculo do BMI
  const bmi = data.weight! / Math.pow(data.height! / 100, 2);
  metrics.bmi = Number(bmi.toFixed(1));

  // Base score começa em 7
  let score = 7;

  // BMI Score (-2 to +1)
  if (bmi < 18.5) {
    score -= 1;
    metrics.recommendations.push(
      "Você está abaixo do peso ideal. Foque em ganhar massa de forma saudável."
    );
  } else if (bmi >= 25 && bmi < 30) {
    score -= 1;
    metrics.recommendations.push(
      "Você está levemente acima do peso. Considere ajustar sua dieta."
    );
  } else if (bmi >= 30) {
    score -= 2;
    metrics.recommendations.push(
      "Obesidade detectada. Recomendamos consultar um profissional de saúde."
    );
  } else {
    score += 1; // BMI ideal
  }

  // Atividade Física Score (-2 to +2)
  switch (data.trainingFrequency) {
    case "sedentary":
      score -= 2;
      metrics.recommendations.push(
        "Aumente sua frequência de exercícios para melhorar sua saúde."
      );
      break;
    case "light":
      score -= 1;
      metrics.recommendations.push(
        "Considere aumentar gradualmente sua frequência de exercícios."
      );
      break;
    case "moderate":
      score += 1;
      break;
    case "heavy":
      score += 1.5;
      break;
    case "athlete":
      score += 2;
      break;
  }

  // Dieta Score (-1 to +1)
  switch (data.diet) {
    case "classic":
      // Score neutro para dieta clássica
      break;
    case "lowcarb":
    case "vegetarian":
    case "vegan":
      score += 1; // Bônus para dietas mais saudáveis
      break;
  }

  // Idade Score (-1 to 0)
  const age = data.birthDate
    ? Math.floor(
        (new Date().getTime() - data.birthDate.getTime()) / 31557600000
      )
    : 30;

  if (age > 50) {
    score -= 1;
    metrics.recommendations.push(
      "Considere exercícios de baixo impacto e suplementação de vitamina D."
    );
  }

  // Ajusta o score final para o range 0-10
  metrics.healthScore = Math.max(0, Math.min(10, score));

  return metrics;
}
