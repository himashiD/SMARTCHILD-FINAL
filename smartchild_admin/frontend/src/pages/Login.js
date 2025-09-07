import React, { useEffect, useMemo, useState } from "react";
import "../styles/AdminLogin.css";

/** In production, all auth must be handled by your backend */
const AUTH_CONFIG = {
  validCredentials: [
    { username: "admin",         password: "admin123" },
    { username: "administrator", password: "secure@2024" },
    { username: "superuser",     password: "manager@123" },
  ],
  maxAttempts: 3,
  lockoutTimeMs: 5 * 60 * 1000, // 5 minutes
  tokenTtlMs: 24 * 60 * 60 * 1000, // 24h
};

export default function AdminLogin() {
  // form
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ui
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");

  // validation
  const [uErr, setUErr] = useState("");
  const [pErr, setPErr] = useState("");

  // security / lockout
  const [attempts, setAttempts] = useState(() =>
    parseInt(localStorage.getItem("loginAttempts") || "0", 10)
  );
  const [lockoutEnd, setLockoutEnd] = useState(() =>
    parseInt(localStorage.getItem("lockoutEndTime") || "0", 10)
  );

  // remaining lockout time (mm:ss)
  const remaining = useMemo(() => {
    const ms = Math.max(0, lockoutEnd - Date.now());
    const m  = Math.floor(ms / 60000);
    const s  = Math.floor((ms % 60000) / 1000);
    return { ms, label: `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` };
  }, [lockoutEnd]);

  /** Init: remembered username & existing auth */
  useEffect(() => {
    const remembered = localStorage.getItem("rememberedUsername");
    if (remembered) {
      setUsername(remembered);
      setRemember(true);
    }
    checkExistingAuth();
  }, []);

  /** Lockout countdown tick */
  useEffect(() => {
    if (lockoutEnd > Date.now()) {
      const id = setInterval(() => {
        // force re-render
        setLockoutEnd((t) => t);
      }, 1000);
      return () => clearInterval(id);
    }
  }, [lockoutEnd]);

  /** If lockout expired, clear state */
  useEffect(() => {
    if (lockoutEnd && lockoutEnd <= Date.now()) {
      setAttempts(0);
      setLockoutEnd(0);
      localStorage.removeItem("loginAttempts");
      localStorage.removeItem("lockoutEndTime");
      setError("");
    }
  }, [remaining.ms, lockoutEnd]);

  function checkExistingAuth() {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    try {
      const [user, tsStr] = atob(token).split(":");
      const ts = parseInt(tsStr, 10);
      if (Date.now() - ts < AUTH_CONFIG.tokenTtlMs) {
        setSuccess("Already logged in. Redirecting…");
        setTimeout(() => {
          // Replace with your router redirect
          alert(`User "${user}" is authenticated.\nRedirect to /admin/dashboard`);
        }, 800);
      } else {
        localStorage.removeItem("authToken");
      }
    } catch {
      localStorage.removeItem("authToken");
    }
  }

  const validate = () => {
    let ok = true;
    if (!username.trim()) {
      setUErr("Username is required");
      ok = false;
    } else if (username.trim().length < 3) {
      setUErr("Username must be at least 3 characters");
      ok = false;
    } else {
      setUErr("");
    }

    if (!password) {
      setPErr("Password is required");
      ok = false;
    } else if (password.length < 6) {
      setPErr("Password must be at least 6 characters");
      ok = false;
    } else {
      setPErr("");
    }

    return ok;
  };

  const authenticate = (u, p) =>
    AUTH_CONFIG.validCredentials.some((c) => c.username === u && c.password === p);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (lockoutEnd > Date.now()) {
      setError(`Too many failed attempts. Please try again in ${remaining.label}.`);
      return;
    }

    if (!validate()) return;

    setLoading(true);
    await new Promise((r) => setTimeout(r, 900)); // simulate API

    if (authenticate(username.trim(), password)) {
      // success
      localStorage.removeItem("loginAttempts");
      localStorage.removeItem("lockoutEndTime");
      setAttempts(0);
      setLockoutEnd(0);

      if (remember) {
        localStorage.setItem("rememberedUsername", username.trim());
      } else {
        localStorage.removeItem("rememberedUsername");
      }

      const token = btoa(`${username.trim()}:${Date.now()}`);
      localStorage.setItem("authToken", token);

      setSuccess("Login successful! Redirecting to dashboard…");
      setError("");
      setTimeout(() => {
        // Replace with your router navigation (react-router-dom)
        // navigate("/admin/dashboard");
        alert("Redirecting to admin dashboard…");
      }, 1200);
    } else {
      // failure
      const next = attempts + 1;
      setAttempts(next);
      localStorage.setItem("loginAttempts", String(next));

      if (next >= AUTH_CONFIG.maxAttempts) {
        const end = Date.now() + AUTH_CONFIG.lockoutTimeMs;
        setLockoutEnd(end);
        localStorage.setItem("lockoutEndTime", String(end));
        setError(
          `Too many failed attempts. Please try again in ${Math.ceil(
            AUTH_CONFIG.lockoutTimeMs / 60000
          )} minutes.`
        );
      } else {
        setError(`Invalid credentials. ${AUTH_CONFIG.maxAttempts - next} attempt(s) remaining.`);
      }
    }

    setLoading(false);
  }

  const formDisabled = lockoutEnd > Date.now();

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="logo">
          <h1>Admin</h1>
          <p>Dashboard Login</p>
        </div>

        {error ? <div className="error-message">{error}</div> : null}
        {success ? <div className="success-message">{success}</div> : null}

        {formDisabled && (
          <div className="error-message" style={{ display: "block" }}>
            Locked due to failed attempts. Try again in <b>{remaining.label}</b>.
          </div>
        )}

        <form onSubmit={onSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              className={uErr ? "error" : ""}
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError("");
                setSuccess("");
                if (uErr) setUErr("");
              }}
              disabled={formDisabled || loading}
              autoComplete="username"
            />
            {uErr ? <div className="validation-message">{uErr}</div> : null}
          </div>

          <div className="form-group" style={{ position: "relative" }}>
            <label htmlFor="password">Password</label>
            <input
              className={pErr ? "error" : ""}
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
                setSuccess("");
                if (pErr) setPErr("");
              }}
              disabled={formDisabled || loading}
              autoComplete="current-password"
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((s) => !s)}
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>

            {pErr ? <div className="validation-message">{pErr}</div> : null}
          </div>

          <div className="remember-forgot">
            <label className="remember">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                disabled={formDisabled || loading}
              />
              Remember me
            </label>

            <a
              href="#forgot"
              className="forgot-link"
              onClick={(e) => {
                e.preventDefault();
                alert(
                  "Password reset flow would go here.\n\nDemo users:\n- admin / admin123\n- administrator / secure@2024\n- superuser / manager@123"
                );
              }}
            >
              Forgot Password?
            </a>
          </div>

          <button type="submit" className="login-btn" disabled={formDisabled || loading}>
            {!loading ? (
              <span>Sign In</span>
            ) : (
              <span className="loading" aria-label="Loading…" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
