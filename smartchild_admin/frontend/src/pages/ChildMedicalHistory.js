import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/childmedicalhistory.css";

const API = process.env.REACT_APP_API || "http://localhost:5000";
const fileURL = (p) => `${API}/${String(p || "").replace(/^\/?/, "")}`;

export default function ChildMedicalHistory() {
  const { id } = useParams(); // child_id
  const nav = useNavigate();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [child, setChild] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const limit = 10;

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setNotFound(false);

        // Header child info
        try {
          const { data } = await axios.get(`${API}/medical-records/child/${id}`);
          setChild(data || null);
        } catch {
          setChild(null);
        }

        // Paged records
        const { data } = await axios.get(`${API}/medical-records`, {
          params: { child_id: id, page, limit },
        });

        setItems(data.items || []);
        setTotal(data.total || 0);
        if ((data.total || 0) === 0 && (!data.items || !data.items.length)) {
          // not truly 404, but show empty state later
        }
      } catch (e) {
        console.error("Error loading child medical history:", e);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, page]);

  const pages = Math.max(1, Math.ceil(total / limit));

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : "-");
  const shortDate = (d) => (d ? String(d).slice(0, 10) : "-");
  const clip = (t, n = 80) => (!t ? "-" : t.length > n ? t.slice(0, n - 1) + "…" : t);

  const priority = (diagnosis) => {
    if (!diagnosis) return { k: "normal", label: "Normal" };
    const d = diagnosis.toLowerCase();
    if (d.includes("urgent") || d.includes("emergency") || d.includes("critical"))
      return { k: "high", label: "High" };
    if (d.includes("follow-up") || d.includes("routine") || d.includes("checkup"))
      return { k: "low", label: "Low" };
    return { k: "normal", label: "Normal" };
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <svg className="loading-spinner large" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
            <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
          <p>Loading medical history…</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="page-container">
        <div className="error-container">
          <div className="error-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
          </div>
          <h2>Unable to load history</h2>
          <p>Please try again later.</p>
          <button className="btn btn-primary" onClick={() => nav(-1)}>Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <button className="breadcrumb-item linklike" onClick={() => nav("/")}>Dashboard</button>
        <span className="breadcrumb-separator">›</span>
        <button className="breadcrumb-item linklike" onClick={() => nav("/MedicalRecords")}>Medical Records</button>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-item active">Child History</span>
      </nav>

      {/* Main Card */}
      <div className="history-card">
        {/* Header */}
        <div className="history-header">
          <div className="title-section">
            <div className="header-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
            <div>
              <h1 className="title">CHILD MEDICAL HISTORY</h1>
              <p className="subtitle">{child?.name ? child.name : "Child"}</p>
            </div>
          </div>
          <div className="header-meta">
            <div>ID: {id}</div>
            <div>Records: {total}</div>
            <div>Last Updated: {new Date().toLocaleDateString()}</div>
          </div>
        </div>

        <div className="history-content">
          {/* Quick Info */}
          <div className="quick-grid">
            <div className="quick-card">
              <div className="quick-label">Child Name</div>
              <div className="quick-value">{child?.name || "-"}</div>
            </div>
            <div className="quick-card">
              <div className="quick-label">DOB</div>
              <div className="quick-value">{child?.dob ? formatDate(child.dob) : "-"}</div>
            </div>
            <div className="quick-card">
              <div className="quick-label">Child ID</div>
              <div className="quick-value">{child?.child_id || id}</div>
            </div>
            <div className="quick-card">
              <div className="quick-label">Guardian</div>
              <div className="quick-value">{child?.guardian_name || "-"}</div>
            </div>
          </div>

          {/* Table */}
          <div className="table-card">
            <div className="table-header">
              <h3>Record Timeline</h3>
              <p className="muted">Showing {items.length} of {total} results</p>
            </div>

            <div className="table-scroll">
              <table className="records-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Visit Date</th>
                    <th>Doctor</th>
                    <th>Diagnosis</th>
                    <th>Treatment</th>
                    <th>Prescription</th>
                    <th>Notes</th>
                    <th>Attachment</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((r, i) => {
                    const idx = (page - 1) * limit + i + 1;
                    const pr = priority(r.diagnosis);
                    return (
                      <tr key={r.record_id || r.id || i}>
                        <td className="col-index"><span className="index-pill">{idx}</span></td>
                        <td>{shortDate(r.visit_date)}</td>
                        <td>{r.doctor_name || "-"}</td>
                        <td>
                          <div className="diag-wrap">
                            <span className={`badge ${pr.k}`}>{pr.label}</span>
                            <span className="diag-text">{clip(r.diagnosis)}</span>
                          </div>
                        </td>
                        <td><div className="mono">{clip(r.treatment, 120)}</div></td>
                        <td><div className="mono">{clip(r.prescription, 120)}</div></td>
                        <td><div className="mono">{clip(r.notes, 120)}</div></td>
                        <td>
                          {r.attachment ? (
                            <button
                              className="link-btn"
                              type="button"
                              onClick={() => window.open(fileURL(r.attachment), "_blank")}
                            >
                              Open
                            </button>
                          ) : <span className="muted">—</span>}
                        </td>
                        <td className="table-actions">
                          <Link className="btn btn-secondary" to={`/ViewMedicalRecord/${r.record_id || r.id}`}>View</Link>
                          <Link className="btn btn-primary" to={`/UpdateMedicalRecord/${r.record_id || r.id}`}>Edit</Link>
                        </td>
                      </tr>
                    );
                  })}
                  {!items.length && (
                    <tr>
                      <td colSpan="9">
                        <div className="empty-state">
                          <div className="empty-icon">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
                            </svg>
                          </div>
                          <h4>No records found</h4>
                          <p>This child has no medical records yet.</p>
                          <button className="btn btn-primary" onClick={() => nav("/AddMedicalRecord")}>Add Record</button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {total > limit && (
              <div className="pagination">
                <div className="pagination-info">
                  Showing {Math.min((page - 1) * limit + 1, total)}–{Math.min(page * limit, total)} of {total}
                </div>
                <div className="pagination-controls">
                  <button
                    className="btn btn-secondary"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </button>
                  <div className="page-buttons">
                    {Array.from({ length: Math.min(5, pages) }).map((_, i) => {
                      const base = Math.max(1, Math.min(page - 2, pages - 4));
                      const num = Math.min(pages, base + i);
                      return (
                        <button
                          key={num}
                          className={`page-btn ${page === num ? "active" : ""}`}
                          onClick={() => setPage(num)}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    className="btn btn-secondary"
                    disabled={page >= pages}
                    onClick={() => setPage((p) => Math.min(pages, p + 1))}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
