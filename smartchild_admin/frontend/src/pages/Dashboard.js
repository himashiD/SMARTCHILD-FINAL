import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/dashboard.css";

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    totalChildren: 0,
    vaccinated: 0,
    pending: 0,
    totalVaccines: 0,
    activeNotices: 0,
    emergencyContacts: 0
  });
  const navigate = useNavigate();

  // Simulate loading stats from API
  useEffect(() => {
    const loadStats = () => {
      // Simulate API call
      setStats({
        totalChildren: 145,
        vaccinated: 128,
        pending: 17,
        totalVaccines: 24,
        activeNotices: 8,
        emergencyContacts: 12
      });
    };
    
    loadStats();
  }, []);

  const quickActions = [
    {
      title: "Add New Child",
      description: "Register a new child in the system",
      icon: "👶",
      path: "/children/add",
      color: "blue"
    },
    {
      title: "Manage Vaccines",
      description: "View and manage vaccination records",
      icon: "💉",
      path: "/vaccines",
      color: "green"
    },
    {
      title: "Notice Board",
      description: "Create and manage notices",
      icon: "📋",
      path: "/notices",
      color: "orange"
    },
    {
      title: "Emergency Contacts",
      description: "Quick access to emergency numbers",
      icon: "🚨",
      path: "/emergency-contacts",
      color: "red"
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: "child_added",
      message: "New child registration: Sarah Johnson",
      time: "2 hours ago",
      icon: "👶"
    },
    {
      id: 2,
      type: "vaccine_updated",
      message: "Vaccination record updated for Michael Chen",
      time: "4 hours ago",
      icon: "💉"
    },
    {
      id: 3,
      type: "notice_created",
      message: "New notice posted: Health Check-up Schedule",
      time: "1 day ago",
      icon: "📋"
    },
    {
      id: 4,
      type: "system_update",
      message: "System backup completed successfully",
      time: "2 days ago",
      icon: "⚙️"
    }
  ];

  return (
    <div className="dashboard-page">
      <div className="page-content">
        {/* Header */}
        <header className="page-header">
          <div className="header-content">
            <div className="header-left">
              <nav className="breadcrumb">
                <span className="breadcrumb-item">
                  <i className="icon-home">🏠</i>
                  Home
                </span>
                <span className="breadcrumb-separator">/</span>
                <span className="breadcrumb-current">Dashboard</span>
              </nav>
              <h1 className="page-title">Smart Child Dashboard</h1>
            </div>
            
            <div className="header-actions">
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search children..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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

        {/* Welcome Section */}
        <div className="welcome-section">
          <div className="welcome-card">
            <div className="welcome-content">
              <h2 className="welcome-title">Welcome back, Admin!</h2>
              <p className="welcome-subtitle">Here's what's happening with your Smart Child management system today.</p>
            </div>
            <div className="welcome-icon">
              <i className="dashboard-icon">📊</i>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{stats.totalChildren}</div>
            <div className="stat-label">TOTAL CHILDREN</div>
            <div className="stat-trend positive">+12 this month</div>
            <div className="stat-bar">
              <div className="stat-progress gray" style={{width: '100%'}}></div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-number green">{stats.vaccinated}</div>
            <div className="stat-label">VACCINATED</div>
            <div className="stat-trend positive">+8 this week</div>
            <div className="stat-bar">
              <div className="stat-progress green" style={{width: '100%'}}></div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-number red">{stats.pending}</div>
            <div className="stat-label">PENDING</div>
            <div className="stat-trend neutral">Need attention</div>
            <div className="stat-bar">
              <div className="stat-progress red" style={{width: '100%'}}></div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-number">{stats.totalVaccines}</div>
            <div className="stat-label">TOTAL VACCINES</div>
            <div className="stat-trend positive">All active</div>
            <div className="stat-bar">
              <div className="stat-progress gray" style={{width: '100%'}}></div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="main-grid">
          {/* Quick Actions */}
          <div className="section-card">
            <div className="section-header">
              <h3 className="section-title">Quick Actions</h3>
              <p className="section-subtitle">Frequently used features</p>
            </div>
            
            <div className="actions-grid">
              {quickActions.map((action, index) => (
                <div 
                  key={index}
                  className={`action-card action-${action.color}`}
                  onClick={() => navigate(action.path)}
                >
                  <div className="action-icon">{action.icon}</div>
                  <div className="action-content">
                    <h4 className="action-title">{action.title}</h4>
                    <p className="action-description">{action.description}</p>
                  </div>
                  <div className="action-arrow">
                    <i className="chevron">➡️</i>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="section-card">
            <div className="section-header">
              <h3 className="section-title">Recent Activity</h3>
              <p className="section-subtitle">Latest system updates</p>
            </div>
            
            <div className="activity-list">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon">{activity.icon}</div>
                  <div className="activity-content">
                    <p className="activity-message">{activity.message}</p>
                    <span className="activity-time">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="section-footer">
              <button className="view-all-btn">View All Activity</button>
            </div>
          </div>

          {/* System Status */}
          <div className="section-card">
            <div className="section-header">
              <h3 className="section-title">System Status</h3>
              <p className="section-subtitle">Current system health</p>
            </div>
            
            <div className="status-list">
              <div className="status-item">
                <div className="status-indicator green"></div>
                <span className="status-label">Database Connection</span>
                <span className="status-value">Online</span>
              </div>
              
              <div className="status-item">
                <div className="status-indicator green"></div>
                <span className="status-label">Backup Service</span>
                <span className="status-value">Active</span>
              </div>
              
              <div className="status-item">
                <div className="status-indicator orange"></div>
                <span className="status-label">Storage Usage</span>
                <span className="status-value">78%</span>
              </div>
              
              <div className="status-item">
                <div className="status-indicator green"></div>
                <span className="status-label">API Response</span>
                <span className="status-value">Fast</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}