import React, { useEffect, useState } from "react";
import QuestionRenderer from "./QuestionRenderer.jsx";
import { validateQuestions } from "../utils.js";

export default function QuestionForm({
  questions,
  initialAnswers = {},
  onSubmit,
  submitLabel = "Submit Application",
  disabled = false
}) {
  const [answers, setAnswers] = useState(initialAnswers);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setAnswers(initialAnswers);
  }, [initialAnswers]);

  function updateAnswer(id, value) {
    setAnswers((current) => ({ ...current, [id]: value }));
    setErrors((current) => ({ ...current, [id]: "" }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const nextErrors = validateQuestions(questions, answers);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      onSubmit(answers);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="application-form">
      {questions.map((question) => (
        <QuestionRenderer
          key={question.id}
          question={question}
          value={answers[question.id]}
          error={errors[question.id]}
          onChange={(value) => updateAnswer(question.id, value)}
        />
      ))}

      <button className="primary" disabled={disabled} type="submit">
        {disabled ? "Submitting..." : submitLabel}
      </button>
    </form>
  );
}
