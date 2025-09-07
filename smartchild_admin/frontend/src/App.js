import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";

// Pages
import Dashboard from "./pages/Dashboard";
import Children from "./pages/Children";
import AddChild from "./pages/AddChild";
import UpdateChild from "./pages/UpdateChild";
import ViewChild from "./pages/ViewChild";
import Vaccines from "./pages/Vaccines";
import AddVaccine from "./pages/AddVaccine";
import UpdateVaccine from "./pages/UpdateVaccine";
import ViewVaccine from "./pages/ViewVaccine";
import Notices from "./pages/Notices";
import AddNotice from "./pages/AddNotice";
import UpdateNotice from "./pages/UpdateNotice";
import ViewNotice from "./pages/ViewNotice";
import MedicalRecords from "./pages/MedicalRecords";
import AddMedicalRecord from "./pages/AddMedicalRecord";
import UpdateMedicalRecord from "./pages/UpdateMedicalRecord";
import ViewMedicalRecord from "./pages/ViewMedicalRecord";
import Nutritions from "./pages/Nutritions";
import AddNutrition from "./pages/AddNutrition";
import UpdateNutrition from "./pages/UpdateNutrition";
import ViewNutrition from "./pages/ViewNutrition";

import GrowthDetails from "./pages/GrowthDetails";
import ChildMedicalHistory from "./pages/ChildMedicalHistory";

import Login from "./pages/Login";
// Styles
import "./styles/app.css";

// SVG Icon Components
const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l10 9h-3v9h-6v-6h-2v6h-6v-9h-3l10-9z"/>
  </svg>
);

const AnalyticsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 20h16v2H4zm0-4h3v3H4zm5 0h3v3H9zm5 0h3v3h-3zM4 7h3v8H4zm5-5h3v13H9zm5 8h3v5h-3z"/>
  </svg>
);

const ChildrenIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
  </svg>
);

const VaccineIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.5 2.5l-1.5 1.5h-3v2h3l1.5 1.5 1.5-1.5h3v-2h-3l-1.5-1.5zm-7.5 3v16h2v-2h2v-2h-2v-2h2v-2h-2v-2h2v-2h-2v-2h2v-2h-2zm14 0v16h-2v-2h-2v-2h2v-2h-2v-2h2v-2h-2v-2h2v-2h-2v-2h2z"/>
  </svg>
);

const MedicalRecordIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
  </svg>
);

const NoticesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z"/>
  </svg>
);

const NutritionIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.18,14C12.18,14.83 11.84,15.55 11.29,16.06L16,21H14L10.5,17.5C9.84,17.81 9.09,18 8.27,18C5.34,18 3,15.66 3,12.73C3,11.85 3.26,11.04 3.68,10.36C4.45,10.73 5.33,11 6.27,11C9.2,11 11.54,8.66 11.54,5.73C11.54,4.85 11.28,4.04 10.86,3.36C11.5,3.13 12.2,3 12.95,3C15.88,3 18.22,5.34 18.22,8.27C18.22,9.15 17.96,9.96 17.54,10.64C16.77,10.27 15.89,10 14.95,10C13.03,10 11.45,11.18 10.86,12.82C11.22,13.17 11.45,13.65 11.45,14.18C11.45,14.2 11.45,14.21 11.45,14.22H12.18V14Z"/>
  </svg>
);

const SupportIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12,2C6.48,2 2,6.48 2,12s4.48,10 10,10 10,-4.48 10,-10S17.52,2 12,2zM13,19h-2v-2h2v2zM15.07,11.25l-0.9,0.92C13.45,12.9 13,13.5 13,15h-2v-0.5c0,-1.1 0.45,-2.1 1.17,-2.83l1.24,-1.26c0.37,-0.36 0.59,-0.86 0.59,-1.41 0,-1.1 -0.9,-2 -2,-2s-2,0.9 -2,2H8c0,-2.21 1.79,-4 4,-4s4,1.79 4,4c0,0.88 -0.36,1.68 -0.93,2.25z"/>
  </svg>
);

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5a3.5,3.5 0 0,1 3.5,3.5A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"/>
  </svg>
);

const LogoutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z"/>
  </svg>
);

const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
  </svg>
);

// Placeholder pages
const Analytics = () => <div>Analytics Page</div>;
const Support = () => <div>Support Page</div>;
const Settings = () => <div>Settings Page</div>;
const Logout = () => <div>Logout Page</div>;

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <Router>
      <div className="app-container">
        {/* Sidebar */}
        <aside className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
          <div className="sidebar-header">
            <h2 className="sidebar-title">SMARTCHILD</h2>
            <button className="sidebar-toggle" onClick={toggleSidebar}>
              {isSidebarOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>

          <nav className="sidebar-nav">
            {/* MAIN */}
            <div className="nav-section">
              <div className="nav-section-title">MAIN</div>
              <NavLink
                to="/"
                end
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                onClick={closeSidebar}
              >
                <span className="nav-icon">
                  <HomeIcon />
                </span>
                <span className="nav-text">Dashboard</span>
              </NavLink>
              <NavLink
                to="/analytics"
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                onClick={closeSidebar}
              >
                <span className="nav-icon">
                  <AnalyticsIcon />
                </span>
                <span className="nav-text">Analytics</span>
              </NavLink>
            </div>

            {/* MANAGEMENT */}
            <div className="nav-section">
              <div className="nav-section-title">MANAGEMENT</div>
              <NavLink
                to="/children"
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                onClick={closeSidebar}
              >
                <span className="nav-icon">
                  <ChildrenIcon />
                </span>
                <span className="nav-text">Children</span>
              </NavLink>
              <NavLink
                to="/vaccines"
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                onClick={closeSidebar}
              >
                <span className="nav-icon">
                  <VaccineIcon />
                </span>
                <span className="nav-text">Vaccination</span>
              </NavLink>
              <NavLink
                to="/medicalRecords"
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                onClick={closeSidebar}
              >
                <span className="nav-icon">
                  <MedicalRecordIcon />
                </span>
                <span className="nav-text">Medical Records</span>
              </NavLink>
              <NavLink
                to="/notices"
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                onClick={closeSidebar}
              >
                <span className="nav-icon">
                  <NoticesIcon />
                </span>
                <span className="nav-text">Notices</span>
              </NavLink>
              <NavLink
                to="/nutritions"
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                onClick={closeSidebar}
              >
                <span className="nav-icon">
                  <NutritionIcon />
                </span>
                <span className="nav-text">Nutrition</span>
              </NavLink>
            </div>

            {/* SUPPORT */}
            <div className="nav-section">
              <div className="nav-section-title">SUPPORT</div>
              <NavLink
                to="/support"
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                onClick={closeSidebar}
              >
                <span className="nav-icon">
                  <SupportIcon />
                </span>
                <span className="nav-text">Support</span>
              </NavLink>
              <NavLink
                to="/settings"
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                onClick={closeSidebar}
              >
                <span className="nav-icon">
                  <SettingsIcon />
                </span>
                <span className="nav-text">Settings</span>
              </NavLink>
              <NavLink
                to="/logout"
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                onClick={closeSidebar}
              >
                <span className="nav-icon">
                  <LogoutIcon />
                </span>
                <span className="nav-text">Logout</span>
              </NavLink>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <div className="content-wrapper">
            <Routes>
              {/* Dashboard */}
              <Route path="/" element={<Dashboard />} />
              <Route path="/analytics" element={<Analytics />} />

              {/* Children */}
              <Route path="/children" element={<Children />} />
              <Route path="/children/add" element={<AddChild />} />
              <Route path="/children/update/:id" element={<UpdateChild />} />
              <Route path="/children/view/:id" element={<ViewChild />} />

              <Route path="/GrowthDetails/:id" element={<GrowthDetails />} />
              <Route path="/ChildMedicalHistory/:id" element={<ChildMedicalHistory />} /> 
              

              {/* Vaccines */}
              <Route path="/vaccines" element={<Vaccines />} />
              <Route path="/vaccines/add" element={<AddVaccine />} />
              <Route path="/vaccines/update/:id" element={<UpdateVaccine />} />
              <Route path="/vaccines/view/:id" element={<ViewVaccine />} />

              {/* Notices */}
              <Route path="/notices" element={<Notices />} />
              <Route path="/notices/add" element={<AddNotice />} />
              <Route path="/notices/update/:id" element={<UpdateNotice />} />
              <Route path="/notices/view/:id" element={<ViewNotice />} />

              {/* Medical Records */}
              <Route path="/MedicalRecords" element={<MedicalRecords />} />
              <Route path="/AddMedicalRecord" element={<AddMedicalRecord />} />
              <Route path="/UpdateMedicalRecord/:id" element={<UpdateMedicalRecord />} />
              <Route path="/ViewMedicalRecord/:id" element={<ViewMedicalRecord />} />

              {/* Nutrition */}
              <Route path="/Nutritions" element={<Nutritions />} />
              <Route path="/AddNutrition" element={<AddNutrition />} />
              <Route path="/UpdateNutrition/:id" element={<UpdateNutrition />} />
              <Route path="/ViewNutrition/:id" element={<ViewNutrition />} />

              {/* Support */}
              <Route path="/support" element={<Support />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/logout" element={<Logout />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </div>
        </main>

        {/* Overlay for mobile */}
        {isSidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}
      </div>
    </Router>
  );
}