import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "../styles/viewvaccine.css";

const API = "http://localhost:5000";

export default function ViewVaccine() {
  const { id } = useParams();
  const nav = useNavigate();
  const [v, setV] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchVaccine = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${API}/api/vaccines/${id}`);
        setV(data);
      } catch (e) {
        console.error("Error fetching vaccine:", e);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchVaccine();
  }, [id]);

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <svg className="loading-spinner large" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p>Loading vaccine details...</p>
        </div>
      </div>
    );
  }

  if (notFound || !v) {
    return (
      <div className="page-container">
        <div className="error-container">
          <div className="error-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2>Vaccine Not Found</h2>
          <p>The requested vaccine information could not be found.</p>
          <button className="btn btn-primary" onClick={() => nav("/vaccines")}>
            Back to Vaccines List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <span className="breadcrumb-item">Dashboard</span>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-item">Vaccine Management</span>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-item active">Vaccine Details</span>
      </nav>

      {/* Main Profile Card */}
      <div className="profile-card">
        {/* Header */}
        <div className="profile-header">
          <div className="profile-title-section">
            <div className="profile-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h1 className="profile-title">VACCINE DETAILS</h1>
              <p className="profile-subtitle">{v.name}</p>
            </div>
          </div>
          <div className="profile-actions">
            <Link to={`/vaccines/update/${v.id}`} className="btn btn-primary">
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
              {v.vaccine_image ? (
                <img
                  src={`${API}/uploads/${v.vaccine_image}`}
                  alt={v.name}
                  className="profile-photo"
                />
              ) : (
                <div className="profile-photo-placeholder">
                  <svg className="photo-placeholder-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span>No Photo</span>
                </div>
              )}
            </div>
            
            <div className="quick-info">
              <div className="quick-info-item">
                <div className="quick-info-label">Vaccine ID</div>
                <div className="quick-info-value">VAC-{v.id}</div>
              </div>
              <div className="quick-info-item">
                <div className="quick-info-label">Dose</div>
                <div className="quick-info-value">{v.dose || "-"}</div>
              </div>
              <div className="quick-info-item">
                <div className="quick-info-label">Age (Weeks)</div>
                <div className="quick-info-value">{v.age_weeks}</div>
              </div>
              <div className="quick-info-item">
                <div className="quick-info-label">Status</div>
                <div className="quick-info-value">
                  <span className="status-badge active">Active</span>
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h2 className="section-title">VACCINE INFORMATION</h2>
              </div>
              
              <div className="fields-grid">
                <Field label="Name" value={v.name} />
                <Field label="Dose" value={v.dose || "-"} />
                <Field label="Age (weeks)" value={v.age_weeks} />
                <Field label="Description" value={v.description || "-"} fullWidth />
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