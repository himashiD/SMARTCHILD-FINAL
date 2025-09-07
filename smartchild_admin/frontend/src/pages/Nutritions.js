import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../styles/nutrition.css";

const API = process.env.REACT_APP_API || "http://localhost:5000";
const fileURL = (p) => `${API}/${String(p || "").replace(/^\/?/, "")}`;

export default function Nutritions() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [headerSearchTerm, setHeaderSearchTerm] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;
  const navigate = useNavigate();

  const load = async () => {
    try {
      const params = { q, category, type, page, limit };
      const { data } = await axios.get(`${API}/nutrition`, { params });
      setItems(data.items);
      setTotal(data.total);
    } catch (error) {
      console.error("Error loading nutrition guides:", error);
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
    if (!window.confirm("Delete this nutrition guide?")) return;
    try {
      await axios.delete(`${API}/nutrition/${id}`);
      load();
    } catch (error) {
      console.error("Error deleting nutrition guide:", error);
    }
  };

  const filtered = items.filter((it) =>
    Object.values(it).join(" ").toLowerCase().includes(q.toLowerCase())
  );

  const pages = Math.max(1, Math.ceil(total / limit));

  // Calculate stats
  const totalGuides = items.length;
  const articleCount = items.filter(guide => guide.type === 'Article').length;
  const planCount = items.filter(guide => guide.type === 'Plan').length;
  const tipCount = items.filter(guide => guide.type === 'Tip').length;

  const getInitials = (title) => {
    return title?.split(' ').slice(0, 2).map(word => word[0]).join('').toUpperCase() || 'NG';
  };

  return (
    <div className="nutrition-page">
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
                <span className="breadcrumb-current">Nutrition Guides</span>
              </nav>
              <h1 className="page-title">Nutrition Management</h1>
            </div>
            
            {/* Header Actions */}
            <div className="header-actions">
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search nutrition guides..."
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
          {/* Total Guides */}
          <div className="stat-card">
            <div className="stat-number">{totalGuides}</div>
            <div className="stat-label">TOTAL GUIDES</div>
            <div className="stat-trend positive">+15% from last month</div>
            <div className="stat-bar">
              <div className="stat-progress gray" style={{width: '100%'}}></div>
            </div>
          </div>

          {/* Articles */}
          <div className="stat-card">
            <div className="stat-number green">{articleCount}</div>
            <div className="stat-label">ARTICLES</div>
            <div className="stat-trend positive">+12% from last month</div>
            <div className="stat-bar">
              <div className="stat-progress green" style={{width: '100%'}}></div>
            </div>
          </div>

          {/* Plans */}
          <div className="stat-card">
            <div className="stat-number blue">{planCount}</div>
            <div className="stat-label">PLANS</div>
            <div className="stat-trend positive">+8% from last month</div>
            <div className="stat-bar">
              <div className="stat-progress blue" style={{width: '100%'}}></div>
            </div>
          </div>

          {/* Add Button */}
          <div className="add-card">
            <button 
              onClick={() => navigate("/AddNutrition")}
              className="add-button"
            >
              <i className="icon-plus">➕</i>
              <span>Add New Guide</span>
            </button>
          </div>
        </div>

        {/* Nutrition Records */}
        <div className="records-card">
          {/* Table Header */}
          <div className="table-header">
            <h2 className="table-title">Nutrition Guides</h2>
            <div className="table-controls">
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search guides..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="table-search"
                />
                <i className="search-icon">🔍</i>
              </div>
              
              <div className="filter-dropdown">
                <select value={category} onChange={e=>setCategory(e.target.value)} className="filter-select">
                  <option value="">All Categories</option>
                  <option>Infant</option>
                  <option>Toddler</option>
                  <option>Child</option>
                  <option>Teen</option>
                  <option>Mother</option>
                  <option>General</option>
                </select>
              </div>

              <div className="filter-dropdown">
                <select value={type} onChange={e=>setType(e.target.value)} className="filter-select">
                  <option value="">All Types</option>
                  <option>Article</option>
                  <option>Tip</option>
                  <option>Plan</option>
                  <option>FAQ</option>
                </select>
              </div>

              <button onClick={search} className="search-btn">
                Search
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="table-container">
            <table className="nutrition-table">
              <thead>
                <tr>
                  <th className="checkbox-col">
                    <input type="checkbox" className="table-checkbox" />
                  </th>
                  <th>GUIDE ID</th>
                  <th>TITLE</th>
                  <th>CATEGORY</th>
                  <th>TYPE</th>
                  <th>PUBLISHED</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((g, index) => (
                  <tr key={g.guide_id} className="table-row">
                    <td>
                      <input type="checkbox" className="table-checkbox" />
                    </td>
                    <td className="guide-id">
                      NG-{String(g.guide_id || index + 1).padStart(4, '0')}
                    </td>
                    <td>
                      <div className="name-cell">
                        <div className="avatar">
                          {g.image_path ? (
                            <img 
                              src={fileURL(g.image_path)} 
                              alt={g.title}
                              className="avatar-img"
                            />
                          ) : (
                            <span className="avatar-text">{getInitials(g.title)}</span>
                          )}
                        </div>
                        <div className="name-info">
                          <div className="guide-title">
                            {g.title}
                          </div>
                          <div className="guide-summary">
                            {g.summary ? g.summary.substring(0, 50) + '...' : 'No summary'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`category-badge ${g.category?.toLowerCase() || 'general'}`}>
                        {g.category || 'General'}
                      </span>
                    </td>
                    <td>
                      <span className={`type-badge ${g.type?.toLowerCase() || 'article'}`}>
                        {g.type || 'Article'}
                      </span>
                    </td>
                    <td className="published-date">
                      {g.published_date ? new Date(g.published_date).toLocaleDateString() : '-'}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <Link to={`/ViewNutrition/${g.guide_id}`}>
                          <button className="action-btn view" title="View">
                            👁️
                          </button>
                        </Link>
                        <Link to={`/UpdateNutrition/${g.guide_id}`}>
                          <button className="action-btn edit" title="Edit">
                            ✏️
                          </button>
                        </Link>
                        <button 
                          onClick={() => onDelete(g.guide_id)}
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
                        <i className="no-data-icon">📖</i>
                        <p className="no-data-title">No nutrition guides found</p>
                        <p className="no-data-subtitle">Try adjusting your search terms or add a new guide</p>
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