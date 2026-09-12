import React from "react";

export default function QuestionRenderer({ question, value, onChange, error }) {
  const id = `question-${question.id}`;

  return (
    <div className="field">
      <label htmlFor={id}>
        {question.label}
        {question.required && <span className="required"> *</span>}
      </label>

      {question.type === "text" && (
        <input
          id={id}
          type="text"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {question.type === "number" && (
        <input
          id={id}
          type="number"
          value={value ?? ""}
          onChange={(e) =>
            onChange(e.target.value === "" ? "" : Number(e.target.value))
          }
        />
      )}

      {question.type === "textarea" && (
        <textarea
          id={id}
          rows="5"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {question.type === "dropdown" && (
        <select
          id={id}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Select an option</option>
          {question.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      )}

      {question.type === "checkbox" && (
        <div className="checkbox-group">
          {question.options.map((option) => {
            const selected = Array.isArray(value) && value.includes(option);
            return (
              <label className="choice" key={option}>
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={(e) => {
                    const current = Array.isArray(value) ? value : [];
                    onChange(
                      e.target.checked
                        ? [...current, option]
                        : current.filter((item) => item !== option)
                    );
                  }}
                />
                {option}
              </label>
            );
          })}
        </div>
      )}

      {question.type === "boolean" && (
        <div className="choice-row">
          <label className="choice">
            <input
              type="radio"
              name={id}
              checked={value === true}
              onChange={() => onChange(true)}
            />
            Yes
          </label>
          <label className="choice">
            <input
              type="radio"
              name={id}
              checked={value === false}
              onChange={() => onChange(false)}
            />
            No
          </label>
        </div>
      )}

      {error && <div className="field-error">{error}</div>}
    </div>
  );
}
