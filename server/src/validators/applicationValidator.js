import { HttpError } from "../utils/httpError.js";

const TYPES = new Set(["text", "textarea", "number", "dropdown", "checkbox", "boolean"]);

function isBlank(value) {
  return (
    value === undefined ||
    value === null ||
    (typeof value === "string" && value.trim() === "") ||
    (Array.isArray(value) && value.length === 0)
  );
}

export function validateAnswers(job, answers) {
  if (!answers || typeof answers !== "object" || Array.isArray(answers)) {
    throw new HttpError(400, "answers must be an object.");
  }

  const questions = job.questions || [];
  const allowedIds = new Set(questions.map((q) => q.id));

  for (const key of Object.keys(answers)) {
    if (!allowedIds.has(key)) {
      throw new HttpError(400, `Unknown question id: ${key}.`);
    }
  }

  const errors = {};

  for (const question of questions) {
    const value = answers[question.id];

    if (question.required && isBlank(value)) {
      errors[question.id] = "This question is required.";
      continue;
    }

    if (isBlank(value)) continue;

    if (!TYPES.has(question.type)) {
      errors[question.id] = `Unsupported question type: ${question.type}.`;
      continue;
    }

    if ((question.type === "text" || question.type === "textarea") && typeof value !== "string") {
      errors[question.id] = "Expected text.";
    }

    if (question.type === "number" && (typeof value !== "number" || Number.isNaN(value))) {
      errors[question.id] = "Expected a number.";
    }

    if (question.type === "boolean" && typeof value !== "boolean") {
      errors[question.id] = "Expected true or false.";
    }

    if (question.type === "dropdown") {
      if (typeof value !== "string" || !question.options.includes(value)) {
        errors[question.id] = "Select one of the allowed options.";
      }
    }

    if (question.type === "checkbox") {
      if (!Array.isArray(value)) {
        errors[question.id] = "Expected an array of selections.";
      } else if (!value.every((item) => question.options.includes(item))) {
        errors[question.id] = "One or more selections are not allowed.";
      }
    }
  }

  if (Object.keys(errors).length) {
    throw new HttpError(400, "Application answers are invalid.", errors);
  }

  return true;
}
