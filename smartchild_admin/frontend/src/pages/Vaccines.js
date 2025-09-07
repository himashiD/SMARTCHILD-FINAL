import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../styles/vaccines.css";

const API = "http://localhost:5000";

export default function Vaccines() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [headerSearchTerm, setHeaderSearchTerm] = useState("");
  const navigate = useNavigate();

  const load = async () => {
    try {
      const { data } = await axios.get(`${API}/api/vaccines`);
      setItems(data);
    } catch (error) {
      console.error("Error loading vaccines:", error);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = items.filter(v =>
    Object.values(v).join(" ").toLowerCase().includes(q.toLowerCase())
  );

  const onDelete = async (id) => {
    if (!window.confirm("Delete this vaccine?")) return;
    try {
      await axios.delete(`${API}/api/vaccines/${id}`);
      load();
    } catch (error) {
      console.error("Error deleting vaccine:", error);
    }
  };

  const getVaccineInitials = (name) => {
    return name?.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2) || 'V';
  };

  // Calculate stats
  const activeVaccines = items.filter(v => v.status !== 'INACTIVE').length;
  const infantVaccines = items.filter(v => parseInt(v.age_weeks) <= 52).length;
  const childVaccines = items.filter(v => parseInt(v.age_weeks) > 52).length;

  return (
    <div className="vaccines-page">
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
                <span className="breadcrumb-current">Manage Vaccines</span>
              </nav>
              <h1 className="page-title">Vaccination Management</h1>
            </div>
            
            {/* Header Actions */}
            <div className="header-actions">
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search vaccines..."
                  value={headerSearchTerm}
                  onChange={(e) => setHeaderSearchTerm(e.target.value)}
                  className="header-search"
                />
                <i className="search-icon">🔍</i>
              </div>
              
              <div className="header-icons">
                <div className="notification-wrapper">
                  <i className="icon-bell">🔔</i>
                  <span className="notification-badge">2</span>
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
          {/* Total Vaccines */}
          <div className="stat-card">
            <div className="stat-number">{items.length}</div>
            <div className="stat-label">TOTAL VACCINES</div>
            <div className="stat-trend positive">+3 new this month</div>
            <div className="stat-bar">
              <div className="stat-progress gray" style={{width: '100%'}}></div>
            </div>
          </div>

          {/* Active Vaccines */}
          <div className="stat-card">
            <div className="stat-number green">{activeVaccines}</div>
            <div className="stat-label">ACTIVE VACCINES</div>
            <div className="stat-trend positive">Available now</div>
            <div className="stat-bar">
              <div className="stat-progress green" style={{width: '100%'}}></div>
            </div>
          </div>

          {/* Infant Vaccines */}
          <div className="stat-card">
            <div className="stat-number red">{infantVaccines}</div>
            <div className="stat-label">INFANT (0-1 YR)</div>
            <div className="stat-trend neutral">Early protection</div>
            <div className="stat-bar">
              <div className="stat-progress red" style={{width: '100%'}}></div>
            </div>
          </div>

          {/* Add Button */}
          <div className="add-card">
            <button 
              onClick={() => navigate("/vaccines/add")}
              className="add-button"
            >
              <i className="icon-plus">➕</i>
              <span>Add New Vaccine</span>
            </button>
          </div>
        </div>

        {/* Vaccines Records */}
        <div className="records-card">
          {/* Table Header */}
          <div className="table-header">
            <h2 className="table-title">Vaccine Records</h2>
            <div className="table-controls">
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search vaccines..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="table-search"
                />
                <i className="search-icon">🔍</i>
              </div>
              
              <div className="filter-dropdown">
                <span>All Vaccines</span>
                <i className="dropdown-icon">⬇️</i>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="table-container">
            <table className="vaccines-table">
              <thead>
                <tr>
                  <th className="checkbox-col">
                    <input type="checkbox" className="table-checkbox" />
                  </th>
                  <th>VACCINE ID</th>
                  <th>VACCINE NAME</th>
                  <th>DOSE</th>
                  <th>AGE (WEEKS)</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((v, index) => (
                  <tr key={v.id} className="table-row">
                    <td>
                      <input type="checkbox" className="table-checkbox" />
                    </td>
                    <td className="vaccine-id">
                      VAC-{String(v.id || index + 1).padStart(4, '0')}
                    </td>
                    <td>
                      <div className="name-cell">
                        <div className="avatar">
                          {v.vaccine_image ? (
                            <img 
                              src={`${API}/uploads/${v.vaccine_image}`} 
                              alt={v.name}
                              className="avatar-img"
                            />
                          ) : (
                            <span className="avatar-text">{getVaccineInitials(v.name)}</span>
                          )}
                        </div>
                        <div className="name-info">
                          <div className="vaccine-name">
                            {v.name || "Unnamed Vaccine"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="dose">
                      {v.dose || "1 dose"}
                    </td>
                    <td className="age-weeks">
                      {v.age_weeks || "-"}
                    </td>
                    <td>
                      <span className={`status-badge ${
                        v.status === 'ACTIVE' || !v.status ? 'completed' : 'pending'
                      }`}>
                        {v.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <Link to={`/vaccines/view/${v.id}`}>
                          <button className="action-btn view" title="View">
                            👁️
                          </button>
                        </Link>
                        <Link to={`/vaccines/update/${v.id}`}>
                          <button className="action-btn edit" title="Edit">
                            ✏️
                          </button>
                        </Link>
                        <button 
                          onClick={() => onDelete(v.id)}
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
                    <td colSpan="7" className="no-data">
                      <div className="no-data-content">
                        <i className="no-data-icon">💉</i>
                        <p className="no-data-title">No vaccine records found</p>
                        <p className="no-data-subtitle">Try adjusting your search terms or add a new vaccine</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}