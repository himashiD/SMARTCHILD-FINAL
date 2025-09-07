import React, { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/addnutrition.css";

const API = process.env.REACT_APP_API || "http://localhost:5000";

export default function AddNutrition() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    category: "General",
    type: "Article", 
    title: "",
    summary: "",
    content: "",
    external_link: "",
    published_date: "",
    status: "Published",
  });
  
  const [image, setImage] = useState(null);
  const [document, setDocument] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const imageRef = useRef();
  const documentRef = useRef();

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.summary.trim()) newErrors.summary = "Summary is required";
    if (!form.content.trim()) newErrors.content = "Content is required";
    if (!form.published_date) newErrors.published_date = "Published date is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const ch = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleDocumentChange = (e) => {
    setDocument(e.target.files[0]);
  };

  const submit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (image) fd.append("image", image);
      if (document) fd.append("document", document);
      
      await axios.post(`${API}/nutrition`, fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      nav("/Nutritions");
    } catch (error) {
      console.error("Error saving nutrition guide:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <span className="breadcrumb-item">Dashboard</span>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-item">Nutrition Management</span>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-item active">Add Nutrition Guide</span>
      </nav>

      {/* Main Form Card */}
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
              <h1 className="form-title">ADD NUTRITION GUIDE</h1>
              <p className="form-subtitle">Create comprehensive nutrition information and guidelines</p>
            </div>
          </div>
          <div className="form-meta">
            <div className="form-date">Date: {new Date().toLocaleDateString()}</div>
          </div>
        </div>

        <form onSubmit={submit} className="registration-form">
          {/* File Upload Section */}
          <div className="upload-section">
            <div className="section-header">
              <div className="section-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h2 className="section-title">MEDIA ATTACHMENTS</h2>
            </div>
            
            <div className="upload-grid">
              <div className="upload-item">
                <div className="upload-area" onClick={() => imageRef.current?.click()}>
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="upload-preview" />
                  ) : (
                    <div className="upload-placeholder">
                      <svg className="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Upload Image</span>
                    </div>
                  )}
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={imageRef}
                  onChange={handleImageChange} 
                  className="file-input-hidden" 
                />
                <div className="upload-info">
                  <strong>Image File</strong>
                  <p>JPG, PNG (Max: 5MB)</p>
                </div>
              </div>

              <div className="upload-item">
                <div className="upload-area" onClick={() => documentRef.current?.click()}>
                  <div className="upload-placeholder">
                    <svg className="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>{document ? document.name : "Upload Document"}</span>
                  </div>
                </div>
                <input 
                  type="file" 
                  accept=".pdf,.doc,.docx" 
                  ref={documentRef}
                  onChange={handleDocumentChange} 
                  className="file-input-hidden" 
                />
                <div className="upload-info">
                  <strong>Document File</strong>
                  <p>PDF, DOC, DOCX (Max: 10MB)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section A: Basic Information */}
          <div className="form-section">
            <div className="section-header">
              <h2 className="section-title">SECTION A: BASIC INFORMATION</h2>
              <p className="section-subtitle">Essential details about the nutrition guide</p>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">CATEGORY <span className="required">*</span></label>
                <div className="input-wrapper">
                  <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <select name="category" value={form.category} onChange={ch} className="form-select">
                    <option value="Infant">Infant</option>
                    <option value="Toddler">Toddler</option>
                    <option value="Child">Child</option>
                    <option value="Teen">Teen</option>
                    <option value="Mother">Mother</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">TYPE <span className="required">*</span></label>
                <div className="input-wrapper">
                  <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <select name="type" value={form.type} onChange={ch} className="form-select">
                    <option value="Article">Article</option>
                    <option value="Tip">Tip</option>
                    <option value="Plan">Plan</option>
                    <option value="FAQ">FAQ</option>
                  </select>
                </div>
              </div>

              <div className="form-group form-group-full">
                <label className="form-label">TITLE <span className="required">*</span></label>
                <div className="input-wrapper">
                  <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <input 
                    name="title" 
                    value={form.title} 
                    onChange={ch} 
                    className={`form-input ${errors.title ? 'error' : ''}`}
                    placeholder="Enter guide title"
                    required 
                  />
                </div>
                {errors.title && <span className="error-text">{errors.title}</span>}
              </div>
            </div>
          </div>

          {/* Section B: Content */}
          <div className="form-section">
            <div className="section-header">
              <h2 className="section-title">SECTION B: CONTENT DETAILS</h2>
              <p className="section-subtitle">Comprehensive information and description</p>
            </div>

            <div className="form-grid">
              <div className="form-group form-group-full">
                <label className="form-label">SUMMARY <span className="required">*</span></label>
                <div className="input-wrapper">
                  <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                  </svg>
                  <textarea 
                    name="summary" 
                    value={form.summary} 
                    onChange={ch} 
                    className={`form-textarea ${errors.summary ? 'error' : ''}`}
                    placeholder="Brief summary of the nutrition guide"
                    rows={3}
                  />
                </div>
                {errors.summary && <span className="error-text">{errors.summary}</span>}
              </div>

              <div className="form-group form-group-full">
                <label className="form-label">FULL CONTENT <span className="required">*</span></label>
                <div className="input-wrapper">
                  <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <textarea 
                    name="content" 
                    value={form.content} 
                    onChange={ch} 
                    className={`form-textarea ${errors.content ? 'error' : ''}`}
                    placeholder="Detailed nutrition information and guidelines"
                    rows={8}
                  />
                </div>
                {errors.content && <span className="error-text">{errors.content}</span>}
              </div>
            </div>
          </div>

          {/* Section C: Publication Details */}
          <div className="form-section">
            <div className="section-header">
              <h2 className="section-title">SECTION C: PUBLICATION DETAILS</h2>
              <p className="section-subtitle">External links and publication information</p>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">EXTERNAL LINK</label>
                <div className="input-wrapper">
                  <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <input 
                    name="external_link" 
                    value={form.external_link} 
                    onChange={ch} 
                    className="form-input"
                    placeholder="https://example.com"
                    type="url"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">PUBLISHED DATE <span className="required">*</span></label>
                <div className="input-wrapper">
                  <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <input 
                    type="date" 
                    name="published_date" 
                    value={form.published_date} 
                    onChange={ch} 
                    className={`form-input ${errors.published_date ? 'error' : ''}`}
                    required 
                  />
                </div>
                {errors.published_date && <span className="error-text">{errors.published_date}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">STATUS</label>
                <div className="input-wrapper">
                  <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <select name="status" value={form.status} onChange={ch} className="form-select">
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => nav("/Nutritions")}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? (
                <>
                  <svg className="loading-spinner" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </>
              ) : (
                "Save Nutrition Guide"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}