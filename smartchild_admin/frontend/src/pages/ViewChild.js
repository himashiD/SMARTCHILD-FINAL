import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "../styles/viewchild.css";

const API = "http://localhost:5000";

// Safe date formatter
const toYMD = (d) => {
  if (!d) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  const iso = (typeof d === "string") ? d : new Date(d).toISOString();
  return iso.slice(0, 10);
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return "-";
  try {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return String(dateStr).replace("T", " ").slice(0, 19);
  }
};

export default function ViewChild() {
  const { id } = useParams();
  const nav = useNavigate();
  const [child, setChild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchChild = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${API}/api/children/${id}`);
        setChild(data);
      } catch (e) {
        console.error("Error fetching child:", e);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchChild();
  }, [id]);

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <svg className="loading-spinner large" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p>Loading child profile...</p>
        </div>
      </div>
    );
  }

  if (notFound || !child) {
    return (
      <div className="page-container">
        <div className="error-container">
          <div className="error-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2>Child Not Found</h2>
          <p>The requested child profile could not be found.</p>
          <button className="btn btn-primary" onClick={() => nav("/children")}>
            Back to Children List
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
        <span className="breadcrumb-item">Children Management</span>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-item active">Child Profile</span>
      </nav>

      {/* Main Profile Card */}
      <div className="profile-card">
        {/* Header */}
        <div className="profile-header">
          <div className="profile-title-section">
            <div className="profile-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h1 className="profile-title">CHILD PROFILE</h1>
              <p className="profile-subtitle">{child.first_name} {child.last_name}</p>
            </div>
          </div>
          <div className="profile-actions">
            <Link to={`/children/update/${child.child_id}`} className="btn btn-primary">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Profile
            </Link>
            <button className="btn btn-secondary" onClick={() => nav("/children")}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to List
            </button>
          </div>
        </div>

        {/* Profile Content */}
        <div className="profile-content">
          {/* Photo and Quick Info */}
          <div className="profile-overview">
            <div className="profile-photo-section">
              {child.child_image ? (
                <img
                  src={`${API}/uploads/${child.child_image}`}
                  alt={`${child.first_name} ${child.last_name}`}
                  className="profile-photo"
                />
              ) : (
                <div className="profile-photo-placeholder">
                  <svg className="photo-placeholder-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>No Photo</span>
                </div>
              )}
            </div>
            
            <div className="quick-info">
              <div className="quick-info-item">
                <div className="quick-info-label">Child ID</div>
                <div className="quick-info-value">{child.child_id}</div>
              </div>
              <div className="quick-info-item">
                <div className="quick-info-label">Age</div>
                <div className="quick-info-value">
                  {child.dob ? Math.floor((new Date() - new Date(child.dob)) / (365.25 * 24 * 60 * 60 * 1000)) + " years" : "-"}
                </div>
              </div>
              <div className="quick-info-item">
                <div className="quick-info-label">Gender</div>
                <div className="quick-info-value">{child.gender || "-"}</div>
              </div>
              <div className="quick-info-item">
                <div className="quick-info-label">Blood Type</div>
                <div className="quick-info-value">{child.blood_type || "-"}</div>
              </div>
            </div>
          </div>

          {/* Detailed Information Sections */}
          <div className="info-sections">
            {/* Personal Information */}
            <div className="info-section">
              <div className="section-header">
                <div className="section-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="section-title">PERSONAL INFORMATION</h2>
              </div>
              
              <div className="fields-grid">
                <Field label="First Name" value={child.first_name} />
                <Field label="Last Name" value={child.last_name} />
                <Field label="Date of Birth" value={toYMD(child.dob)} />
                <Field label="Gender" value={child.gender} />
                <Field label="Birth Weight" value={child.birth_weight ? `${child.birth_weight} kg` : "-"} />
                <Field label="Blood Type" value={child.blood_type} />
              </div>
            </div>

            {/* Parent Information */}
            <div className="info-section">
              <div className="section-header">
                <div className="section-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h2 className="section-title">PARENT/GUARDIAN INFORMATION</h2>
              </div>
              
              <div className="fields-grid">
                <Field label="Parent Name" value={child.parent_name} />
                <Field label="Parent NIC" value={child.parent_nic} />
                <Field label="Contact Number" value={child.contact_no} />
                <Field label="Email Address" value={child.email} />
                <Field label="Address" value={child.address} fullWidth />
              </div>
            </div>

            {/* Account Information */}
            <div className="info-section">
              <div className="section-header">
                <div className="section-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="section-title">ACCOUNT INFORMATION</h2>
              </div>
              
              <div className="fields-grid">
                <Field label="Username" value={child.username} />
                <Field label="Account Status" value="Active" />
                <Field label="Registration Date" value={formatDateTime(child.registered_at)} />
                <Field label="Last Updated" value={formatDateTime(child.update_date)} />
              </div>
            </div>
            <div className="profile-actions">
              <Link to={`/GrowthDetails/${child.child_id}`} className="btn btn-secondary">
              Growth Details
              </Link>   
              <Link to={`/ChildMedicalHistory/${child.child_id}`} className="btn btn-secondary">
              Medical Record History
             </Link>
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