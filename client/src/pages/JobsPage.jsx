import React, { useEffect, useMemo, useState } from "react";
import { getJobs } from "../api.js";
import JobCard from "../components/JobCard.jsx";
import { ErrorMessage, Loading } from "../components/Status.jsx";
import { Link, useNavigate } from "react-router-dom";

const locations = ["All", "Remote", "Hybrid", "On-site"];

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadJobs();
  }, []);

  async function loadJobs(query = "") {
    try {
      setLoading(true);
      setError("");
      setJobs(await getJobs(query));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load jobs.");
    } finally {
      setLoading(false);
    }
  }

  function submitSearch(e) {
    e.preventDefault();
    loadJobs(search);
  }

  function toggleJob(job) {
    setSelected((current) =>
      current.some((item) => item.externalId === job.externalId)
        ? current.filter((item) => item.externalId !== job.externalId)
        : [...current, job]
    );
  }

  const filteredJobs = useMemo(
    () => location === "All" ? jobs : jobs.filter((job) => job.location === location),
    [jobs, location]
  );

  return (
    <div className="jobs-page">
      <section className="hero container">
        <div className="hero-copy">
          <span className="hero-kicker">YOUR NEXT MOVE</span>
          <h1>Find work that<br /><em>fits you.</em></h1>
          <p>Explore open roles, answer job-specific questions, and apply to multiple opportunities in one streamlined flow.</p>
        </div>
        <div className="hero-stat">
          <strong>{jobs.length}</strong>
          <span>open roles</span>
        </div>
      </section>

      <section className="container search-panel">
        <form className="search-bar" onSubmit={submitSearch}>
          <div className="search-input-wrap">
            <span>⌕</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search roles, companies, or locations"
            />
          </div>
          <button className="primary" type="submit">Search jobs</button>
        </form>

        <div className="filter-row">
          <span className="filter-label">Work mode</span>
          {locations.map((item) => (
            <button
              key={item}
              type="button"
              className={`filter-chip ${location === item ? "selected" : ""}`}
              onClick={() => setLocation(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className="container jobs-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">OPEN POSITIONS</span>
            <h2>Latest opportunities</h2>
          </div>
          <span className="result-count">{filteredJobs.length} roles</span>
        </div>

        {loading && <Loading text="Finding open roles..." />}
        {error && <ErrorMessage message={error} />}

        {!loading && !error && (
          <div className="job-grid">
            {filteredJobs.map((job) => (
              <JobCard
                key={job.externalId}
                job={job}
                selected={selected.some((item) => item.externalId === job.externalId)}
                onToggle={toggleJob}
              />
            ))}
          </div>
        )}

        {!loading && !error && filteredJobs.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">⌕</div>
            <h3>No matching roles</h3>
            <p>Try a different search or work mode.</p>
          </div>
        )}
      </section>

      <div className={`bulk-bar ${selected.length ? "visible" : ""}`}>
        <div>
          <strong>{selected.length} {selected.length === 1 ? "role" : "roles"} selected</strong>
          <span>Answer each role's questions in one review flow.</span>
        </div>
        <div className="bulk-actions">
          <button className="link-button" onClick={() => setSelected([])}>Clear</button>
          <button
            className="primary"
            onClick={() => navigate("/apply-all", {
              state: { jobIds: selected.map((job) => job.externalId) }
            })}
          >
            Apply to all →
          </button>
        </div>
      </div>

      <div className="container bottom-note">
        <span>Already applied?</span>
        <Link to="/applications">View your applications →</Link>
      </div>
    </div>
  );
}
