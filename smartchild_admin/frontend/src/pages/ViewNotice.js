import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "../styles/viewnotice.css";

const API = "http://localhost:5000";

export default function ViewNotice() {
  const { id } = useParams();
  const nav = useNavigate();
  const [n, setN] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchNotice = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${API}/api/notices/${id}`);
        setN(data);
      } catch (e) {
        console.error("Error fetching notice:", e);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchNotice();
  }, [id]);

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <svg className="loading-spinner large" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p>Loading notice details...</p>
        </div>
      </div>
    );
  }

  if (notFound || !n) {
    return (
      <div className="page-container">
        <div className="error-container">
          <div className="error-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2>Notice Not Found</h2>
          <p>The requested notice information could not be found.</p>
          <button className="btn btn-primary" onClick={() => nav("/notices")}>
            Back to Notices List
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString) => {
    if (!timeString) return "-";
    return timeString.slice(0, 5);
  };

  return (
    <div className="page-container">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <span className="breadcrumb-item">Dashboard</span>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-item">Notice Management</span>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-item active">Notice Details</span>
      </nav>

      {/* Main Profile Card */}
      <div className="profile-card">
        {/* Header */}
        <div className="profile-header">
          <div className="profile-title-section">
            <div className="profile-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </div>
            <div>
              <h1 className="profile-title">NOTICE DETAILS</h1>
              <p className="profile-subtitle">{n.notice_title}</p>
            </div>
          </div>
          <div className="profile-actions">
            <Link to={`/notices/update/${n.notice_id}`} className="btn btn-primary">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </Link>
            <button className="btn btn-secondary" onClick={() => nav(-1)}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
          </div>
        </div>

        {/* Profile Content */}
        <div className="profile-content">
          {/* Photo and Quick Info */}
          <div className="profile-overview">
            <div className="profile-photo-section">
              {n.notice_image ? (
                <img
                  src={`${API}/uploads/${n.notice_image}`}
                  alt={n.notice_title}
                  className="profile-photo"
                />
              ) : (
                <div className="profile-photo-placeholder">
                  <svg className="photo-placeholder-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                  <span>No Image</span>
                </div>
              )}
            </div>
            
            <div className="quick-info">
              <div className="quick-info-item">
                <div className="quick-info-label">Notice ID</div>
                <div className="quick-info-value">NOT-{n.notice_id}</div>
              </div>
              <div className="quick-info-item">
                <div className="quick-info-label">Date</div>
                <div className="quick-info-value">{formatDate(n.notice_date)}</div>
              </div>
              <div className="quick-info-item">
                <div className="quick-info-label">Start Time</div>
                <div className="quick-info-value">{formatTime(n.notice_start_time)}</div>
              </div>
              <div className="quick-info-item">
                <div className="quick-info-label">Status</div>
                <div className="quick-info-value">
                  <span className="status-badge active">Published</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Information Sections */}
          <div className="info-sections">
            {/* Basic Information */}
            <div className="info-section">
              <div className="section-header">
                <div className="section-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="section-title">BASIC INFORMATION</h2>
              </div>
              
              <div className="fields-grid">
                <Field label="Title" value={n.notice_title} />
                <Field label="Date" value={formatDate(n.notice_date)} />
                <Field label="Start Time" value={formatTime(n.notice_start_time)} />
                <Field label="End Time" value={formatTime(n.notice_end_time)} />
                <Field label="Venue" value={n.notice_venue} />
                <Field label="Description" value={n.notice_description || "-"} fullWidth />
              </div>
            </div>

            {/* Event Details */}
            <div className="info-section">
              <div className="section-header">
                <div className="section-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="section-title">EVENT DETAILS</h2>
              </div>
              
              <div className="fields-grid">
                <Field label="Duration" value={`${formatTime(n.notice_start_time)} - ${formatTime(n.notice_end_time)}`} />
                <Field label="Location" value={n.notice_venue || "Not specified"} />
                <Field label="Event Date" value={formatDate(n.notice_date)} />
                <Field label="Created" value={formatDate(n.created_at)} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, fullWidth = false }) {
  return (
    <div className={`field-group ${fullWidth ? 'field-full-width' : ''}`}>
      <div className="field-label">{label}</div>
      <div className="field-value">{value || "-"}</div>
    </div>
  );
}