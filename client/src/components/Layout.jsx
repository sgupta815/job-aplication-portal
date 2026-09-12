import React from "react";
import { Link, NavLink } from "react-router-dom";

export default function Layout({ children }) {
  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="container nav">
          <Link to="/jobs" className="brand">
            <span className="brand-mark">H</span>
            <span>HireFlow</span>
          </Link>

          <nav>
            <NavLink to="/jobs" className={({ isActive }) => isActive ? "active" : ""}>
              Find jobs
            </NavLink>
            <NavLink to="/applications" className={({ isActive }) => isActive ? "active" : ""}>
              My applications
            </NavLink>
          </nav>
        </div>
      </header>

      <main>{children}</main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <span>HireFlow · Job Application Portal</span>
          <span>Built with React, Express & MongoDB</span>
        </div>
      </footer>
    </div>
  );
}
