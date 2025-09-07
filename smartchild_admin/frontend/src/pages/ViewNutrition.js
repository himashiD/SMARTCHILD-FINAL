// src/pages/ViewNutrition.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/addnutrition.css"; // ✅ reuse your earlier design styles

const API = process.env.REACT_APP_API || "http://localhost:5000";
const fileURL = (p) => `${API}/${String(p || "").replace(/^\/?/, "")}`;

export default function ViewNutrition() {
  const { id } = useParams();
  const nav = useNavigate();
  const [g, setG] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${API}/nutrition/${id}`);
        setG(data || null);
      } catch (e) {
        console.error(e);
        alert("Failed to load nutrition guide.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <svg className="loading-spinner-large" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p>Loading nutrition guide...</p>
        </div>
      </div>
    );
  }

  if (!g) {
    return (
      <div className="page-container">
        <div className="error-container">
          <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2>Nutrition Guide Not Found</h2>
          <p>The requested record could not be found.</p>
          <button className="btn btn-primary" onClick={() => nav("/Nutritions")}>Back to List</button>
        </div>
      </div>
    );
  }

  // Support either shape the API may return
  const imagePath = g.image_path || g.image;
  const documentPath = g.document_path || g.document;

  return (
    <div className="page-container">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <span className="breadcrumb-item" onClick={() => nav("/")} style={{cursor:"pointer"}}>Dashboard</span>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-item" onClick={() => nav("/Nutritions")} style={{cursor:"pointer"}}>Nutrition Management</span>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-item active">View Nutrition Guide</span>
      </nav>

      {/* Main Card (reusing form-card styles for view page) */}
      <div className="form-card">
        {/* Header */}
        <div className="form-header">
          <div className="form-title-section">
            <div className="form-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h1 className="form-title">NUTRITION GUIDE</h1>
              <p className="form-subtitle">{g.title || "Untitled"}</p>
            </div>
          </div>
          <div className="form-meta">
            <div>Published: {g.published_date ? String(g.published_date).slice(0, 10) : "-"}</div>
            <div>Status: {g.status || "—"}</div>
          </div>
        </div>

        <div className="registration-form">
          {/* Overview */}
          <div className="form-section">
            <div className="section-header">
              <h2 className="section-title">OVERVIEW</h2>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">CATEGORY</label>
                <div className="field-value">{g.category || "-"}</div>
              </div>
              <div className="form-group">
                <label className="form-label">TYPE</label>
                <div className="field-value">{g.type || "-"}</div>
              </div>
              <div className="form-group">
                <label className="form-label">STATUS</label>
                <div className="field-value" data-status={g.status?.toLowerCase()==="published" ? "active":"inactive"}>
                  {g.status || "-"}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">PUBLISHED DATE</label>
                <div className="field-value">{g.published_date ? String(g.published_date).slice(0,10) : "-"}</div>
              </div>
            </div>
          </div>

          {/* Media */}
          {(imagePath || documentPath) && (
            <div className="form-section">
              <div className="section-header">
                <h2 className="section-title">MEDIA</h2>
              </div>
              <div className="upload-grid">
                {imagePath && (
                  <div className="upload-item">
                    <div className="upload-area" style={{cursor:"default"}}>
                      <img src={fileURL(imagePath)} alt="Guide" className="upload-preview" />
                    </div>
                    <div className="upload-info">
                      <strong>Image</strong>
                      <p>Preview of attached image</p>
                    </div>
                  </div>
                )}
                {documentPath && (
                  <div className="upload-item">
                    <div className="upload-area" style={{cursor:"default"}}>
                      <div className="upload-placeholder">
                        <svg className="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Attached Document</span>
                      </div>
                    </div>
                    <div className="upload-info">
                      <strong>Document</strong>
                      <p>
                        <a href={fileURL(documentPath)} target="_blank" rel="noreferrer">View / Download</a>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="form-section">
            <div className="section-header">
              <h2 className="section-title">SUMMARY</h2>
            </div>
            <div className="form-grid">
              <div className="form-group form-group-full">
                <div className="field-value" style={{whiteSpace:"pre-wrap"}}>{g.summary || "No summary provided."}</div>
              </div>
            </div>
          </div>

          {/* Full Content */}
          <div className="form-section">
            <div className="section-header">
              <h2 className="section-title">FULL CONTENT</h2>
            </div>
            <div className="form-grid">
              <div className="form-group form-group-full">
                <div className="field-value" style={{whiteSpace:"pre-wrap"}}>{g.content || "No content provided."}</div>
              </div>
            </div>
          </div>

          {/* External Link */}
          {g.external_link && (
            <div className="form-section">
              <div className="section-header">
                <h2 className="section-title">EXTERNAL LINK</h2>
              </div>
              <div className="form-grid">
                <div className="form-group form-group-full">
                  <div className="field-value">
                    <a href={g.external_link} target="_blank" rel="noreferrer">{g.external_link}</a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="form-actions">
            <button className="btn btn-secondary" onClick={() => nav("/Nutritions")}>Back to List</button>
            <button className="btn btn-primary" onClick={() => nav(`/UpdateNutrition/${id}`)}>Edit Guide</button>
          </div>
        </div>
      </div>
    </div>
  );
}
