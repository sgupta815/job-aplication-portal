import React from "react";

export function Loading({ text = "Loading..." }) {
  return <div className="status-card">{text}</div>;
}

export function ErrorMessage({ message }) {
  return <div className="status-card error-card">{message}</div>;
}
