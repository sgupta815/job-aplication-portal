import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { applyToAll, getJob } from "../api.js";
import QuestionRenderer from "../components/QuestionRenderer.jsx";
import { validateQuestions } from "../utils.js";
import { ErrorMessage, Loading } from "../components/Status.jsx";

export default function ApplyAllPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const jobIds = location.state?.jobIds || [];

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [applicant, setApplicant] = useState(() => {
    try { return JSON.parse(localStorage.getItem("hireflowApplicant")) || { name: "", email: "" }; }
    catch { return { name: "", email: "" }; }
  });
  const [answersByJob, setAnswersByJob] = useState({});
  const [errorsByJob, setErrorsByJob] = useState({});

  // Stable reference so the effect dependency doesn't change on every render.
  const jobIdsKey = jobIds.join(",");

  useEffect(() => {
    if (!jobIds.length) {
      setLoading(false);
      return;
    }

    Promise.all(jobIds.map(getJob))
      .then((loaded) => {
        setJobs(loaded);
        const initial = {};
        loaded.forEach((job) => { initial[job.externalId] = {}; });
        setAnswersByJob(initial);
      })
      .catch((err) => setError(err.response?.data?.message || "Unable to load selected jobs."))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobIdsKey]);

  const sharedFullNameQuestions = useMemo(() => {
    const first = jobs.flatMap(j => j.questions).find(q => q.label.toLowerCase() === "full name");
    return first ? [first] : [];
  }, [jobs]);

  function updateAnswer(jobId, questionId, value) {
    setAnswersByJob((current) => ({
      ...current,
      [jobId]: { ...current[jobId], [questionId]: value }
    }));
    setErrorsByJob((current) => ({
      ...current,
      [jobId]: { ...current[jobId], [questionId]: "" }
    }));
  }

  function setCommonAnswer(question, value) {
    setApplicant((current) => ({ ...current, name: value }));
    for (const job of jobs) {
      // Case-insensitive label match so "Full Name" and "full name" both sync.
      const matching = job.questions.find(
        q => q.label.toLowerCase() === question.label.toLowerCase() && q.type === question.type
      );
      if (matching) updateAnswer(job.externalId, matching.id, value);
    }
  }

  function validateAll() {
    const nextErrors = {};
    for (const job of jobs) {
      const errors = validateQuestions(job.questions, answersByJob[job.externalId] || {});
      if (Object.keys(errors).length) nextErrors[job.externalId] = errors;
    }
    setErrorsByJob(nextErrors);
    return nextErrors;
  }

  async function submit(e) {
    e.preventDefault();
    if (!applicant.name.trim() || !applicant.email.trim()) {
      setError("Enter your name and email before applying.");
      return;
    }

    const validationErrors = validateAll();
    if (Object.keys(validationErrors).length) {
      setError("Some required answers are missing. Review the highlighted fields.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      localStorage.setItem("hireflowApplicant", JSON.stringify(applicant));

      const data = await applyToAll({
        applicant,
        applications: jobs.map(job => ({
          jobId: job.externalId,
          answers: answersByJob[job.externalId] || {}
        }))
      });

      setSuccess(data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to submit applications.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="container narrow"><Loading text="Preparing your applications..." /></div>;

  if (!jobIds.length) {
    return (
      <div className="container narrow empty-state">
        <div className="empty-icon">＋</div>
        <h3>No roles selected</h3>
        <p>Choose two or more roles from the jobs page to use Apply to All.</p>
        <button className="primary" onClick={() => navigate("/jobs")}>Browse jobs</button>
      </div>
    );
  }

  return (
    <div className="container narrow detail-page bulk-page">
      <button className="back-button" onClick={() => navigate("/jobs")}>← Back to jobs</button>

      <section className="detail-hero compact">
        <span className="hero-kicker">MULTI-APPLICATION</span>
        <h1>Apply to <em>{jobs.length} roles</em></h1>
        <p>Shared details are collected once. Each role keeps its own questions and validation.</p>
      </section>

      <div className="progress-strip">
        <span className="progress-dot active">1</span><span>Review details</span>
        <i />
        <span className="progress-dot">2</span><span>Submit applications</span>
      </div>

      {error && <ErrorMessage message={error} />}
      {success && (
        <div className="success-card">
          <strong>All done.</strong>
          <span>{success}</span>
          <button className="secondary" onClick={() => navigate("/applications")}>View applications</button>
        </div>
      )}

      {!success && (
        <form onSubmit={submit}>
          <section className="panel">
            <div className="panel-heading">
              <div><span className="eyebrow">SHARED DETAILS</span><h2>Applicant information</h2></div>
              <span className="step-label">Applies to all roles</span>
            </div>

            {sharedFullNameQuestions.map(q => (
              <QuestionRenderer key="shared-name" question={q} value={applicant.name} onChange={(v) => setCommonAnswer(q, v)} />
            ))}

            <div className="field">
              <label>Email <span className="required">*</span></label>
              <input type="email" value={applicant.email} onChange={(e) => setApplicant({ ...applicant, email: e.target.value })} placeholder="you@example.com" />
            </div>
          </section>

          {jobs.map((job, index) => (
            <section className="panel role-panel" key={job.externalId}>
              <div className="job-section-title">
                <div className="role-number">{String(index + 1).padStart(2, "0")}</div>
                <div className="role-title">
                  <div className="eyebrow">{job.company}</div>
                  <h2>{job.title}</h2>
                  <div className="job-meta"><span>⌖ {job.location}</span></div>
                </div>
              </div>

              {job.questions.filter(q => q.label.toLowerCase() !== "full name").map(question => (
                <QuestionRenderer
                  key={`${job.externalId}-${question.id}`}
                  question={question}
                  value={answersByJob[job.externalId]?.[question.id]}
                  error={errorsByJob[job.externalId]?.[question.id]}
                  onChange={(value) => updateAnswer(job.externalId, question.id, value)}
                />
              ))}
            </section>
          ))}

          <div className="submit-row">
            <div>
              <strong>Ready to submit?</strong>
              <span>{jobs.length} applications will be created together.</span>
            </div>
            <button className="primary" type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : `Apply to all ${jobs.length} →`}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
