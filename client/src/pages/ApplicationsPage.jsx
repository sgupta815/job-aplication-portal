import React, { useState } from "react";
import { getApplications } from "../api.js";
import { ErrorMessage, Loading } from "../components/Status.jsx";

export default function ApplicationsPage() {
  const [email, setEmail] = useState(() => {
    try { return JSON.parse(localStorage.getItem("hireflowApplicant"))?.email || ""; }
    catch { return ""; }
  });
  const [applicant, setApplicant] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  async function search(e) {
    e.preventDefault();
    if (!email.trim()) {
      setError("Enter the email used for your applications.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const data = await getApplications(email);
      setApplicant(data.applicant);
      setApplications(data.applications);
      setSearched(true);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load applications.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container narrow detail-page">
      <section className="detail-hero compact">
        <span className="hero-kicker">YOUR JOURNEY</span>
        <h1>My <em>applications.</em></h1>
        <p>See the roles you've submitted applications for using your application email.</p>
      </section>

      <form className="search-bar applications-search" onSubmit={search}>
        <div className="search-input-wrap">
          <span>✉</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <button className="primary" type="submit">View applications</button>
      </form>

      {loading && <Loading text="Loading your applications..." />}
      {error && <ErrorMessage message={error} />}

      {!loading && searched && !error && (
        <>
          <div className="applications-summary">
            <div>
              <span className="eyebrow">APPLICATIONS</span>
              <h2>{applications.length} submitted</h2>
            </div>
            {applicant && <span>{applicant.name}</span>}
          </div>

          {applications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">○</div>
              <h3>No applications yet</h3>
              <p>Once you apply to a role, it will appear here.</p>
            </div>
          ) : (
            <div className="application-list">
              {applications.map((application) => {
                // Guard against deleted jobs where populate returns null.
                const job = application.jobId;
                if (!job) return null;
                const avatarInitials = job.company
                  .split(" ")
                  .map(x => x[0])
                  .slice(0, 2)
                  .join("");
                return (
                  <article className="application-card" key={application._id}>
                    <div className="company-avatar">{avatarInitials}</div>
                    <div className="application-info">
                      <div className="eyebrow">{job.company}</div>
                      <h2>{job.title}</h2>
                      <div className="job-meta"><span>⌖ {job.location}</span><span>•</span><span>Submitted {new Date(application.createdAt).toLocaleDateString()}</span></div>
                    </div>
                    <span className="status-pill">Submitted ✓</span>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
