import { isValid, parse, differenceInYears } from "date-fns";
import { OnboardingData } from "../contexts/OnboardingContext";

interface ValidationError {
  field: string;
  message: string;
}

export function validateUserData(data: OnboardingData): ValidationError[] {
  console.log("🔍 Iniciando validação dos dados:", data);
  const errors: ValidationError[] = [];

  // Validar campos obrigatórios
  if (
    !data.gender ||
    !data.birthDate ||
    !data.height ||
    !data.weight ||
    !data.goal
  ) {
    errors.push({
      field: "required",
      message: "Todos os campos obrigatórios devem ser preenchidos",
    });
  }

  // Validar combinações lógicas
  if (data.goal !== "maintain" && (!data.weightGoal || !data.weightSpeed)) {
    errors.push({
      field: "goal",
      message: "Meta e velocidade são obrigatórios para perda/ganho de peso",
    });
  }

  // Validação de gênero
  if (!data.gender) {
    errors.push({
      field: "gender",
      message: "Gênero é obrigatório",
    });
  }

  // Validação de data de nascimento
  if (data.birthDate) {
    const age = differenceInYears(new Date(), data.birthDate);

    if (age < 13) {
      errors.push({
        field: "birthDate",
        message: "Você precisa ter pelo menos 13 anos para usar o app",
      });
    }

    if (age > 100) {
      errors.push({
        field: "birthDate",
        message: "Data de nascimento inválida",
      });
    }

    // Validar data impossível
    if (!isValid(data.birthDate)) {
      errors.push({
        field: "birthDate",
        message: "Data inválida",
      });
    }
  }

  // Validação de altura
  if (data.height) {
    if (data.height < 100) {
      errors.push({
        field: "height",
        message: "Altura mínima é 100cm",
      });
    }
    if (data.height > 250) {
      errors.push({
        field: "height",
        message: "Altura máxima é 250cm",
      });
    }
  }

  // Validação de peso
  if (data.weight) {
    if (data.weight < 30) {
      errors.push({
        field: "weight",
        message: "Peso mínimo é 30kg",
      });
    }
    if (data.weight > 300) {
      errors.push({
        field: "weight",
        message: "Peso máximo é 300kg",
      });
    }
  }

  // Validação de velocidade de perda/ganho
  if (data.weightSpeed && data.goal !== "maintain") {
    if (data.weightSpeed < 0.1) {
      errors.push({
        field: "weightSpeed",
        message: "Velocidade mínima é 0.1kg por semana",
      });
    }
    if (data.weightSpeed > 1.5) {
      errors.push({
        field: "weightSpeed",
        message: "Velocidade máxima é 1.5kg por semana",
      });
    }
  }

  // Validação de frequência de treino
  if (
    data.trainingFrequency &&
    !["sedentary", "light", "moderate", "heavy", "athlete"].includes(
      data.trainingFrequency
    )
  ) {
    errors.push({
      field: "trainingFrequency",
      message: "Frequência de treino inválida",
    });
  }

  if (errors.length > 0) {
    console.warn("⚠️ Erros encontrados na validação:", errors);
  } else {
    console.log("✅ Dados válidos!");
  }

  return errors;
}

function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}
