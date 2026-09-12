import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { applyToJob, getJob } from "../api.js";
import QuestionForm from "../components/QuestionForm.jsx";
import { ErrorMessage, Loading } from "../components/Status.jsx";

export default function JobDetailPage() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [applicant, setApplicant] = useState(() => {
    try { return JSON.parse(localStorage.getItem("hireflowApplicant")) || { name: "", email: "" }; }
    catch { return { name: "", email: "" }; }
  });

  useEffect(() => {
    getJob(id)
      .then(setJob)
      .catch((err) => setError(err.response?.data?.message || "Unable to load job."))
      .finally(() => setLoading(false));
  }, [id]);

  async function submit(answers) {
    if (!applicant.name.trim() || !applicant.email.trim()) {
      setError("Enter your name and email before applying.");
      return;
    }

    try {
      setSubmitLoading(true);
      setError("");
      localStorage.setItem("hireflowApplicant", JSON.stringify(applicant));
      const data = await applyToJob(id, { applicant, answers });
      setSuccess(data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to submit application.");
    } finally {
      setSubmitLoading(false);
    }
  }

  if (loading) return <div className="container narrow"><Loading text="Loading role..." /></div>;
  if (error && !job) return <div className="container narrow"><ErrorMessage message={error} /></div>;

  return (
    <div className="container narrow detail-page">
      <Link className="back-link" to="/jobs">← All jobs</Link>

      <section className="detail-hero">
        <div className="detail-company">
          <div className="company-avatar large">{job.company.split(" ").map(x => x[0]).slice(0,2).join("")}</div>
          <div>
            <div className="eyebrow">{job.company}</div>
            <h1>{job.title}</h1>
            <div className="job-meta"><span>⌖ {job.location}</span><span>•</span><span>Open position</span></div>
          </div>
        </div>
        <p>{job.description}</p>
      </section>

      {success && <div className="success-card"><strong>Application received.</strong><span>{success}</span></div>}
      {error && <ErrorMessage message={error} />}

      {!success && (
        <section className="panel application-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">APPLICATION</span>
              <h2>Tell us about yourself</h2>
            </div>
            <span className="required-note">* Required</span>
          </div>

          <div className="applicant-fields">
            <div className="field">
              <label>Full name <span className="required">*</span></label>
              <input value={applicant.name} onChange={(e) => setApplicant({ ...applicant, name: e.target.value })} placeholder="Your full name" />
            </div>
            <div className="field">
              <label>Email <span className="required">*</span></label>
              <input type="email" value={applicant.email} onChange={(e) => setApplicant({ ...applicant, email: e.target.value })} placeholder="you@example.com" />
            </div>
          </div>

          <QuestionForm questions={job.questions} onSubmit={submit} disabled={submitLoading} />
        </section>
      )}
    </div>
  );
}
