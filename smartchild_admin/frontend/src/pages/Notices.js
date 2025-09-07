import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../styles/notices.css";

const API = "http://localhost:5000";

export default function Notices() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [headerSearchTerm, setHeaderSearchTerm] = useState("");
  const navigate = useNavigate();

  const load = async () => {
    try {
      const { data } = await axios.get(`${API}/api/notices`);
      setItems(data);
    } catch (error) {
      console.error("Error loading notices:", error);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = items.filter(n =>
    Object.values(n).join(" ").toLowerCase().includes(q.toLowerCase())
  );

  const onDelete = async (id) => {
    if (!window.confirm("Delete this notice?")) return;
    try {
      await axios.delete(`${API}/api/notices/${id}`);
      load();
    } catch (error) {
      console.error("Error deleting notice:", error);
    }
  };

  const getNoticeInitials = (title) => {
    return title?.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2) || 'N';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  const formatTime = (startTime, endTime) => {
    if (!startTime || !endTime) return "-";
    return `${startTime.slice(0, 5)} - ${endTime.slice(0, 5)}`;
  };

  // Calculate stats
  const todayNotices = items.filter(n => {
    const noticeDate = new Date(n.notice_date);
    const today = new Date();
    return noticeDate.toDateString() === today.toDateString();
  }).length;

  const upcomingNotices = items.filter(n => {
    const noticeDate = new Date(n.notice_date);
    const today = new Date();
    return noticeDate > today;
  }).length;

  const pastNotices = items.filter(n => {
    const noticeDate = new Date(n.notice_date);
    const today = new Date();
    return noticeDate < today;
  }).length;

  return (
    <div className="notices-page">
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
                <span className="breadcrumb-current">Notice Board</span>
              </nav>
              <h1 className="page-title">Notice Board Management</h1>
            </div>
            
            {/* Header Actions */}
            <div className="header-actions">
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search notices..."
                  value={headerSearchTerm}
                  onChange={(e) => setHeaderSearchTerm(e.target.value)}
                  className="header-search"
                />
                <i className="search-icon">🔍</i>
              </div>
              
              <div className="header-icons">
                <div className="notification-wrapper">
                  <i className="icon-bell">🔔</i>
                  <span className="notification-badge">4</span>
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
          {/* Total Notices */}
          <div className="stat-card">
            <div className="stat-number">{items.length}</div>
            <div className="stat-label">TOTAL NOTICES</div>
            <div className="stat-trend positive">+2 this week</div>
            <div className="stat-bar">
              <div className="stat-progress gray" style={{width: '100%'}}></div>
            </div>
          </div>

          {/* Today's Notices */}
          <div className="stat-card">
            <div className="stat-number green">{todayNotices}</div>
            <div className="stat-label">TODAY'S EVENTS</div>
            <div className="stat-trend positive">Active now</div>
            <div className="stat-bar">
              <div className="stat-progress green" style={{width: '100%'}}></div>
            </div>
          </div>

          {/* Upcoming */}
          <div className="stat-card">
            <div className="stat-number red">{upcomingNotices}</div>
            <div className="stat-label">UPCOMING</div>
            <div className="stat-trend neutral">Next events</div>
            <div className="stat-bar">
              <div className="stat-progress red" style={{width: '100%'}}></div>
            </div>
          </div>

          {/* Add Button */}
          <div className="add-card">
            <button 
              onClick={() => navigate("/notices/add")}
              className="add-button"
            >
              <i className="icon-plus">➕</i>
              <span>Add New Notice</span>
            </button>
          </div>
        </div>

        {/* Notice Records */}
        <div className="records-card">
          {/* Table Header */}
          <div className="table-header">
            <h2 className="table-title">Notice Records</h2>
            <div className="table-controls">
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search notices..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="table-search"
                />
                <i className="search-icon">🔍</i>
              </div>
              
              <div className="filter-dropdown">
                <span>All Notices</span>
                <i className="dropdown-icon">⬇️</i>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="table-container">
            <table className="notices-table">
              <thead>
                <tr>
                  <th className="checkbox-col">
                    <input type="checkbox" className="table-checkbox" />
                  </th>
                  <th>NOTICE ID</th>
                  <th>NOTICE TITLE</th>
                  <th>DATE & TIME</th>
                  <th>VENUE</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((n, index) => {
                  const noticeDate = new Date(n.notice_date);
                  const today = new Date();
                  const isToday = noticeDate.toDateString() === today.toDateString();
                  const isUpcoming = noticeDate > today;
                  const isPast = noticeDate < today;

                  return (
                    <tr key={n.notice_id} className="table-row">
                      <td>
                        <input type="checkbox" className="table-checkbox" />
                      </td>
                      <td className="notice-id">
                        NOT-{String(n.notice_id || index + 1).padStart(4, '0')}
                      </td>
                      <td>
                        <div className="name-cell">
                          <div className="avatar">
                            {n.notice_image ? (
                              <img 
                                src={`${API}/uploads/${n.notice_image}`} 
                                alt={n.notice_title}
                                className="avatar-img"
                              />
                            ) : (
                              <span className="avatar-text">{getNoticeInitials(n.notice_title)}</span>
                            )}
                          </div>
                          <div className="name-info">
                            <div className="notice-title">
                              {n.notice_title || "Untitled Notice"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="datetime-info">
                          <div className="notice-date">{formatDate(n.notice_date)}</div>
                          <div className="notice-time">{formatTime(n.notice_start_time, n.notice_end_time)}</div>
                        </div>
                      </td>
                      <td className="venue">
                        {n.notice_venue || "-"}
                      </td>
                      <td>
                        <span className={`status-badge ${
                          isToday ? 'completed' : isUpcoming ? 'pending' : 'expired'
                        }`}>
                          {isToday ? 'TODAY' : isUpcoming ? 'UPCOMING' : 'PAST'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <Link to={`/notices/view/${n.notice_id}`}>
                            <button className="action-btn view" title="View">
                              👁️
                            </button>
                          </Link>
                          <Link to={`/notices/update/${n.notice_id}`}>
                            <button className="action-btn edit" title="Edit">
                              ✏️
                            </button>
                          </Link>
                          <button 
                            onClick={() => onDelete(n.notice_id)}
                            className="action-btn delete"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!filtered.length && (
                  <tr>
                    <td colSpan="7" className="no-data">
                      <div className="no-data-content">
                        <i className="no-data-icon">📋</i>
                        <p className="no-data-title">No notice records found</p>
                        <p className="no-data-subtitle">Try adjusting your search terms or add a new notice</p>
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