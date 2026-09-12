export function isBlank(value) {
  return (
    value === undefined ||
    value === null ||
    (typeof value === "string" && value.trim() === "") ||
    (Array.isArray(value) && value.length === 0)
  );
}

export function validateQuestion(question, value) {
  if (question.required && isBlank(value)) return "This question is required.";

  if (isBlank(value)) return "";

  if (question.type === "number" && (typeof value !== "number" || Number.isNaN(value))) {
    return "Enter a valid number.";
  }

  if (question.type === "dropdown" && !question.options.includes(value)) {
    return "Choose a valid option.";
  }

  if (
    question.type === "checkbox" &&
    (!Array.isArray(value) || !value.every((item) => question.options.includes(item)))
  ) {
    return "Choose valid options.";
  }

  if (question.type === "boolean" && typeof value !== "boolean") {
    return "Choose Yes or No.";
  }

  return "";
}

export function validateQuestions(questions, answers) {
  const errors = {};
  for (const question of questions) {
    const error = validateQuestion(question, answers[question.id]);
    if (error) errors[question.id] = error;
  }
  return errors;
}
