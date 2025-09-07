import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../styles/medical-records.css";

const API = process.env.REACT_APP_API || "http://localhost:5000";

export default function MedicalRecords() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [headerSearchTerm, setHeaderSearchTerm] = useState("");
  const [childId, setChildId] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;
  const navigate = useNavigate();

  const load = async () => {
    try {
      const { data } = await axios.get(`${API}/medical-records`, {
        params: { q, child_id: childId, page, limit }
      });
      setItems(data.items);
      setTotal(data.total);
    } catch (error) {
      console.error("Error loading medical records:", error);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [page]);

  const search = async (e) => {
    e.preventDefault();
    setPage(1);
    await load();
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this medical record?")) return;
    try {
      await axios.delete(`${API}/medical-records/${id}`);
      load();
    } catch (error) {
      console.error("Error deleting medical record:", error);
    }
  };

  const filtered = items.filter((it) =>
    Object.values(it).join(" ").toLowerCase().includes(q.toLowerCase())
  );

  const pages = Math.max(1, Math.ceil(total / limit));

  // Calculate stats
  const totalRecords = items.length;
  const thisMonth = items.filter(record => {
    const visitDate = new Date(record.visit_date);
    const now = new Date();
    return visitDate.getMonth() === now.getMonth() && visitDate.getFullYear() === now.getFullYear();
  }).length;
  const uniqueChildren = new Set(items.map(record => record.child_id)).size;
  const uniqueDoctors = new Set(items.map(record => record.doctor_name)).size;

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const getPriorityColor = (diagnosis) => {
    if (!diagnosis) return 'normal';
    const lowerDiagnosis = diagnosis.toLowerCase();
    if (lowerDiagnosis.includes('emergency') || lowerDiagnosis.includes('urgent') || lowerDiagnosis.includes('critical')) {
      return 'high';
    }
    if (lowerDiagnosis.includes('follow-up') || lowerDiagnosis.includes('routine') || lowerDiagnosis.includes('checkup')) {
      return 'low';
    }
    return 'normal';
  };

  return (
    <div className="medical-records-page">
      <div className="page-content">
        {/* Header */}
        <header className="page-header">
          <div className="header-content">
            {/* Breadcrumb and Title */}
            <div className="header-left">
              <nav className="breadcrumb">
                <span className="breadcrumb-item">
                  <i className="icon-home"></i>
                  Home
                </span>
                <span className="breadcrumb-separator">/</span>
                <span className="breadcrumb-current">Medical Records</span>
              </nav>
              <h1 className="page-title">Medical Records Management</h1>
            </div>
            
            {/* Header Actions */}
            <div className="header-actions">
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search medical records..."
                  value={headerSearchTerm}
                  onChange={(e) => setHeaderSearchTerm(e.target.value)}
                  className="header-search"
                />
                <i className="search-icon">🔍</i>
              </div>
              
              <div className="header-icons">
                <div className="notification-wrapper">
                  <i className="icon-bell">🔔</i>
                  <span className="notification-badge">3</span>
                </div>
                
                <i className="icon-mail">✉️</i>
                
                <div className="user-profile">
                  <div className="user-avatar">
                    <i className="icon-user">👤</i>
                  </div>
                  <span className="user-name">Admin</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="stats-grid">
          {/* Total Records */}
          <div className="stat-card">
            <div className="stat-number">{totalRecords}</div>
            <div className="stat-label">TOTAL RECORDS</div>
            <div className="stat-trend positive">+18% from last month</div>
            <div className="stat-bar">
              <div className="stat-progress gray" style={{width: '100%'}}></div>
            </div>
          </div>

          {/* This Month */}
          <div className="stat-card">
            <div className="stat-number green">{thisMonth}</div>
            <div className="stat-label">THIS MONTH</div>
            <div className="stat-trend positive">+25% from last month</div>
            <div className="stat-bar">
              <div className="stat-progress green" style={{width: '100%'}}></div>
            </div>
          </div>

          {/* Unique Children */}
          <div className="stat-card">
            <div className="stat-number blue">{uniqueChildren}</div>
            <div className="stat-label">CHILDREN</div>
            <div className="stat-trend positive">+12% from last month</div>
            <div className="stat-bar">
              <div className="stat-progress blue" style={{width: '100%'}}></div>
            </div>
          </div>

          {/* Add Button */}
          <div className="add-card">
            <button 
              onClick={() => navigate("/AddMedicalRecord")}
              className="add-button"
            >
              <i className="icon-plus">➕</i>
              <span>Add New Record</span>
            </button>
          </div>
        </div>

        {/* Medical Records */}
        <div className="records-card">
          {/* Table Header */}
          <div className="table-header">
            <h2 className="table-title">Medical Records</h2>
            <div className="table-controls">
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search records..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="table-search"
                />
                <i className="search-icon">🔍</i>
              </div>
              
              <div className="filter-dropdown">
                <input
                  type="text"
                  placeholder="Child ID (optional)"
                  value={childId}
                  onChange={(e) => setChildId(e.target.value)}
                  className="filter-input"
                />
              </div>

              <button onClick={search} className="search-btn">
                Search
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="table-container">
            <table className="medical-records-table">
              <thead>
                <tr>
                  <th className="checkbox-col">
                    <input type="checkbox" className="table-checkbox" />
                  </th>
                  <th>RECORD ID</th>
                  <th>CHILD ID</th>
                  <th>CHILD INFO</th>
                  <th>VISIT DATE</th>
                  <th>DOCTOR</th>
                  <th>DIAGNOSIS</th>
                  <th>PRIORITY</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, index) => (
                  <tr key={r.record_id} className="table-row">
                    <td>
                      <input type="checkbox" className="table-checkbox" />
                    </td>
                    <td className="record-id">
                      MR-{String(r.record_id || index + 1).padStart(4, '0')}
                    </td>
                    <td className="record-id">
                      {r.child_id}
                    </td>
                    <td>
                      <div className="name-cell">
                        <div className="avatar">
                          <span className="avatar-text">{getInitials(r.first_name, r.last_name)}</span>
                        </div>
                        <div className="name-info">
                          <div className="child-name">
                            {r.first_name} {r.last_name}
                          </div>
                          <div className="child-email">
                            {r.email || 'No email'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="visit-date">
                      {formatDate(r.visit_date)}
                    </td>
                    <td>
                      <div className="doctor-info">
                        <div className="doctor-name">{r.doctor_name || '-'}</div>
                      </div>
                    </td>
                    <td>
                      <div className="diagnosis-info">
                        <div className="diagnosis-text">
                          {r.diagnosis ? (
                            r.diagnosis.length > 50 ? 
                            r.diagnosis.substring(0, 50) + '...' : 
                            r.diagnosis
                          ) : '-'}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`priority-badge ${getPriorityColor(r.diagnosis)}`}>
                        {getPriorityColor(r.diagnosis).toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <Link to={`/ViewMedicalRecord/${r.record_id}`}>
                          <button className="action-btn view" title="View">
                            👁️
                          </button>
                        </Link>
                        <Link to={`/UpdateMedicalRecord/${r.record_id}`}>
                          <button className="action-btn edit" title="Edit">
                            ✏️
                          </button>
                        </Link>
                        <button 
                          onClick={() => onDelete(r.record_id)}
                          className="action-btn delete"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!filtered.length && (
                  <tr>
                    <td colSpan="8" className="no-data">
                      <div className="no-data-content">
                        <i className="no-data-icon">🏥</i>
                        <p className="no-data-title">No medical records found</p>
                        <p className="no-data-subtitle">Try adjusting your search terms or add a new record</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="pagination">
              <button 
                disabled={page <= 1} 
                onClick={() => setPage(p => p - 1)}
                className="pagination-btn"
              >
                ← Previous
              </button>
              <span className="pagination-info">
                Page {page} of {pages} ({total} total)
              </span>
              <button 
                disabled={page >= pages} 
                onClick={() => setPage(p => p + 1)}
                className="pagination-btn"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}