import React from "react";
import { Link } from "react-router-dom";

const initials = (company) =>
  company.split(" ").map((word) => word[0]).slice(0, 2).join("").toUpperCase();

export default function JobCard({ job, selected, onToggle }) {
  return (
    <article className={`job-card ${selected ? "selected" : ""}`}>
      <div className="job-card-top">
        <div className="company-avatar">{initials(job.company)}</div>
        <label className="select-toggle" title="Select this job">
          <input type="checkbox" checked={selected} onChange={() => onToggle(job)} />
          <span />
        </label>
      </div>

      <div className="job-card-body">
        <div className="eyebrow">{job.company}</div>
        <h2>{job.title}</h2>
        <div className="job-meta">
          <span>⌖ {job.location}</span>
          <span>•</span>
          <span>{job.questions?.length ?? 0} question{job.questions?.length !== 1 ? "s" : ""}</span>
        </div>
        <p>{job.description}</p>
      </div>

      <div className="job-card-footer">
        <Link className="secondary" to={`/jobs/${job.externalId}`}>View role</Link>
        <button className={`quick-select ${selected ? "chosen" : ""}`} onClick={() => onToggle(job)}>
          {selected ? "Selected ✓" : "Select"}
        </button>
      </div>
    </article>
  );
}
