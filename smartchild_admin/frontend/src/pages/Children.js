import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../styles/child.css";

const API = "http://localhost:5000";

export default function Children() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [headerSearchTerm, setHeaderSearchTerm] = useState("");
  const navigate = useNavigate();

  const load = async () => {
    try {
      const { data } = await axios.get(`${API}/api/children`);
      setItems(data);
    } catch (error) {
      console.error("Error loading children:", error);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const formatDate = (dob) => {
    if (!dob) return "-";
    const date = new Date(dob);
    return date.toISOString().split("T")[0];
  };

  const filtered = items.filter((it) =>
    Object.values(it).join(" ").toLowerCase().includes(q.toLowerCase())
  );

  const onDelete = async (id) => {
    if (!window.confirm("Delete this child?")) return;
    try {
      await axios.delete(`${API}/api/children/${id}`);
      load();
    } catch (error) {
      console.error("Error deleting child:", error);
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  // Calculate stats
  const completedCount = items.filter(child => child.vaccination_status === 'COMPLETED').length;
  const pendingCount = items.filter(child => child.vaccination_status === 'PENDING').length;

  return (
    <div className="children-page">
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
              <span className="breadcrumb-current">Manage Children</span>
            </nav>
            <h1 className="page-title">Children Management</h1>
          </div>
          
          {/* Header Actions */}
          <div className="header-actions">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search children..."
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
          {/* Total Children */}
          <div className="stat-card">
            <div className="stat-number">{items.length}</div>
            <div className="stat-label">TOTAL CHILDREN</div>
            <div className="stat-trend positive">+12% from last month</div>
            <div className="stat-bar">
              <div className="stat-progress gray" style={{width: '100%'}}></div>
            </div>
          </div>

          {/* Vaccinated */}
          <div className="stat-card">
            <div className="stat-number green">{completedCount}</div>
            <div className="stat-label">VACCINATED</div>
            <div className="stat-trend positive">+8% from last month</div>
            <div className="stat-bar">
              <div className="stat-progress green" style={{width: '100%'}}></div>
            </div>
          </div>

          {/* Pending */}
          <div className="stat-card">
            <div className="stat-number red">{pendingCount}</div>
            <div className="stat-label">PENDING</div>
            <div className="stat-trend negative">-4% from last month</div>
            <div className="stat-bar">
              <div className="stat-progress red" style={{width: '100%'}}></div>
            </div>
          </div>

          {/* Add Button */}
          <div className="add-card">
            <button 
              onClick={() => navigate("/children/add")}
              className="add-button"
            >
              <i className="icon-plus">➕</i>
              <span>Add New Child</span>
            </button>
          </div>
        </div>

        {/* Children Records */}
        <div className="records-card">
          {/* Table Header */}
          <div className="table-header">
            <h2 className="table-title">Children Records</h2>
            <div className="table-controls">
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search children..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="table-search"
                />
                <i className="search-icon">🔍</i>
              </div>
              
              <div className="filter-dropdown">
                <span>All Children</span>
                <i className="dropdown-icon">⬇️</i>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="table-container">
            <table className="children-table">
              <thead>
                <tr>
                  <th className="checkbox-col">
                    <input type="checkbox" className="table-checkbox" />
                  </th>
                  <th>CHILD ID</th>
                  <th>NAME</th>
                  {/*<th>REGISTER NO</th>*/}
                  <th>GENDER</th>
                  <th>PARENT INFO</th>
                  <th>VACCINATION STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, index) => (
                  <tr key={c.child_id} className="table-row">
                    <td>
                      <input type="checkbox" className="table-checkbox" />
                    </td>
                    <td className="child-id">
                      CH-{String(c.child_id || index + 1).padStart(4, '0')}
                    </td>
                    <td>
                      <div className="name-cell">
                        <div className="avatar">
                          {c.child_image ? (
                            <img 
                              src={`${API}/uploads/${c.child_image}`} 
                              alt={c.first_name}
                              className="avatar-img"
                            />
                          ) : (
                            <span className="avatar-text">{getInitials(c.first_name, c.last_name)}</span>
                          )}
                        </div>
                        <div className="name-info">
                          <div className="child-name">
                            {c.first_name} {c.last_name}
                          </div>
                          
                        </div>
                      </div>
                    </td>

                    <td className="gender">
                      {c.gender || "-"}
                    </td>
                    <td>
                      <div className="parent-info">
                        <div className="parent-name">{c.parent_name || "-"}</div>
                        <div className="parent-contact">{c.contact_no || "-"}</div>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${
                        c.vaccination_status === 'COMPLETED' ? 'completed' : 'pending'
                      }`}>
                        {c.vaccination_status || 'PENDING'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <Link to={`/children/view/${c.child_id}`}>
                          <button className="action-btn view" title="View">
                            👁️
                          </button>
                        </Link>
                        <Link to={`/children/update/${c.child_id}`}>
                          <button className="action-btn edit" title="Edit">
                            ✏️
                          </button>
                        </Link>
                        <button 
                          onClick={() => onDelete(c.child_id)}
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
                        <i className="no-data-icon">👥</i>
                        <p className="no-data-title">No children records found</p>
                        <p className="no-data-subtitle">Try adjusting your search terms or add a new child</p>
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