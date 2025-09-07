import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/viewmedicalrecord.css";

const API = process.env.REACT_APP_API || "http://localhost:5000";
const fileURL = (p) => `${API}/${String(p || "").replace(/^\/?/, "")}`;

export default function ViewMedicalRecord() {
  const { id } = useParams();                // ✅ useParams, not window.location
  const nav = useNavigate();
  const [record, setRecord] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        // ✅ correct endpoint (no /api prefix)
        const { data } = await axios.get(`${API}/medical-records/${id}`);
        setRecord(data);
      } catch (error) {
        console.error("Error fetching medical record:", error);
        alert(
          error?.response?.data?.message ||
          "Error loading medical record. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

  const handleEdit = () => nav(`/UpdateMedicalRecord/${id}`);

  const handleDelete = async () => {
    if (!window.confirm("Delete this medical record?")) return;
    try {
      // ✅ correct endpoint (no /api prefix)
      await axios.delete(`${API}/medical-records/${id}`);
      nav("/MedicalRecords");
    } catch (error) {
      console.error("Error deleting medical record:", error);
      alert(
        error?.response?.data?.message ||
        "Error deleting medical record. Please try again."
      );
    }
  };

  const openAttachment = () => {
    if (record?.attachment) window.open(fileURL(record.attachment), "_blank");
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <svg className="loading-spinner large" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p>Loading medical record...</p>
        </div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="page-container">
        <div className="error-container">
          <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2>Medical Record Not Found</h2>
          <p>The requested medical record could not be found.</p>
          <button className="btn btn-primary" onClick={() => nav("/MedicalRecords")}>
            Back to Medical Records
          </button>
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
        <span className="breadcrumb-item active">View Record</span>
      </nav>

      {/* Main Card */}
      <div className="record-card">
        <div className="record-header">
          <div className="record-title-section">
            <div className="record-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="record-title">MEDICAL RECORD</h1>
              <p className="record-subtitle">Patient examination and treatment details</p>
            </div>
          </div>
          <div className="record-meta">
            <div className="record-id">Record ID: {id}</div>
            <div className="record-status">Status: Active</div>
          </div>
        </div>

        <div className="record-content">
          {/* Patient Info */}
          <div className="info-section">
            <div className="section-header">
              <div className="section-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="section-title">PATIENT INFORMATION</h2>
            </div>

            <div className="patient-info-card">
              <div className="patient-info-grid">
                <div className="info-item"><span className="info-label">Patient Name</span><span className="info-value">{record.child_name || "N/A"}</span></div>
                <div className="info-item"><span className="info-label">Child ID</span><span className="info-value">{record.child_id || "N/A"}</span></div>
                <div className="info-item"><span className="info-label">Date of Birth</span><span className="info-value">{record.dob ? String(record.dob).slice(0,10) : "N/A"}</span></div>
                <div className="info-item"><span className="info-label">Contact Email</span><span className="info-value">{record.email || "Not provided"}</span></div>
              </div>
            </div>
          </div>

          {/* Visit Info */}
          <div className="info-section">
            <div className="section-header">
              <div className="section-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="section-title">VISIT INFORMATION</h2>
            </div>

            <div className="visit-info-card">
              <div className="visit-info-grid">
                <div className="info-item"><span className="info-label">Visit Date</span><span className="info-value visit-date">{record.visit_date ? String(record.visit_date).slice(0,10) : "N/A"}</span></div>
                <div className="info-item"><span className="info-label">Attending Doctor</span><span className="info-value doctor-name">{record.doctor_name || "N/A"}</span></div>
              </div>
            </div>
          </div>

          {/* Medical Details */}
          <div className="info-section">
            <div className="section-header">
              <div className="section-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="section-title">MEDICAL DETAILS</h2>
            </div>

            <div className="medical-details-grid">
              <DetailCard title="Diagnosis" value={record.diagnosis} />
              <DetailCard title="Treatment Plan" value={record.treatment} />
              <DetailCard title="Prescription" value={record.prescription} />
              <DetailCard title="Additional Notes" value={record.notes} />
            </div>
          </div>

          {/* Attachment */}
          {record.attachment && (
            <div className="info-section">
              <div className="section-header">
                <div className="section-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </div>
                <h2 className="section-title">ATTACHMENTS</h2>
              </div>

              <div className="attachment-card">
                <div className="attachment-item">
                  <div className="attachment-info">
                    <span className="attachment-name">Medical Document</span>
                    <span className="attachment-type">Click to view attachment</span>
                  </div>
                  <button className="attachment-btn" onClick={openAttachment}>View</button>
                </div>
              </div>
            </div>
          )}

          {/* Meta */}
          <div className="info-section">
            <div className="section-header">
              <div className="section-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="section-title">RECORD INFORMATION</h2>
            </div>

            <div className="metadata-card">
              <div className="metadata-grid">
                <div className="metadata-item"><span className="metadata-label">Created</span><span className="metadata-value">{record.created_at ? new Date(record.created_at).toLocaleString() : "-"}</span></div>
                <div className="metadata-item"><span className="metadata-label">Last Updated</span><span className="metadata-value">{record.updated_at ? new Date(record.updated_at).toLocaleString() : "-"}</span></div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="record-actions">
            <button className="btn btn-secondary" onClick={() => nav("/MedicalRecords")}>Back to Records</button>
            <div className="action-group">
              <button className="btn btn-primary" onClick={handleEdit}>Edit Record</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete Record</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailCard({ title, value }) {
  return (
    <div className="detail-card">
      <div className="detail-header">
        <h3 className="detail-title">{title}</h3>
      </div>
      <div className="detail-content">
        {value ? <pre className="detail-text">{value}</pre> : <span className="no-data">No {title.toLowerCase()} recorded</span>}
      </div>
    </div>
  );
}
