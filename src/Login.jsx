import { useState, useEffect, useRef } from "react";
import "./Login.css";

// ─── IMPORTANT ───────────────────────────────────────────────────────────────
// Replace the value below with your own Google OAuth Client ID.
// How to get one (free, 2 minutes):
//   1. Go to https://console.cloud.google.com/
//   2. Create a project → APIs & Services → Credentials
//   3. Create OAuth 2.0 Client ID → Web application
//   4. Add your localhost (e.g. http://localhost:5173) to "Authorised JavaScript origins"
//   5. Copy the Client ID and paste it below
const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID_HERE";
// ─────────────────────────────────────────────────────────────────────────────

const USERS_KEY = "habitUsers";

function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY)) || {};
}
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Each user's habit data is namespaced by their unique userId key
// so data is 100% isolated between accounts.
export function getUserStorageKey(userId, dataType) {
  return `habitData_${userId}_${dataType}`;
}

export default function Login({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm]         = useState({ username: "", password: "", confirm: "" });
  const [error, setError]       = useState("");
  const [shake, setShake]       = useState(false);
  const [success, setSuccess]   = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const googleBtnRef = useRef(null);
  const particles = Array.from({ length: 18 }, (_, i) => i);

  // ── Load Google GSI script ─────────────────────────────────────────────────
  useEffect(() => {
    if (GOOGLE_CLIENT_ID === "YOUR_GOOGLE_CLIENT_ID_HERE") {
      setGoogleReady(false);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setGoogleReady(true);
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  // ── Render Google button once GSI is ready ─────────────────────────────────
  useEffect(() => {
    if (!googleReady || !googleBtnRef.current) return;
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleResponse,
    });
    window.google.accounts.id.renderButton(googleBtnRef.current, {
      theme: "filled_black",
      size: "large",
      shape: "rectangular",
      width: 340,
      text: "continue_with",
    });
  }, [googleReady]);

  // ── Google JWT decode (no library needed) ─────────────────────────────────
  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch {
      return null;
    }
  };

  const handleGoogleResponse = (response) => {
    const payload = parseJwt(response.credential);
    if (!payload) return triggerShake("Google sign-in failed. Try again.");

    const userId   = `google_${payload.sub}`;
    const name     = payload.name || payload.email;
    const avatar   = payload.picture || null;
    const email    = payload.email;

    // Store/update Google user profile
    const users = getUsers();
    users[userId] = { type: "google", name, email, avatar };
    saveUsers(users);

    setSuccess(true);
    setTimeout(() => {
      localStorage.setItem("loggedInUser", userId);
      localStorage.setItem("loggedInUserName", name);
      localStorage.setItem("loggedInUserAvatar", avatar || "");
      onLogin(userId, { name, avatar, email, type: "google" });
    }, 700);
  };

  // ── Username/password auth ─────────────────────────────────────────────────
  const triggerShake = (msg) => {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleSubmit = () => {
    const { username, password, confirm } = form;
    if (!username.trim() || !password) return triggerShake("All fields are required.");

    const users = getUsers();
    const userId = `local_${username.trim().toLowerCase()}`;

    if (isSignup) {
      if (password.length < 6) return triggerShake("Password must be at least 6 characters.");
      if (password !== confirm)  return triggerShake("Passwords don't match.");
      if (users[userId])         return triggerShake("Username already taken.");
      users[userId] = { type: "local", name: username.trim(), password };
      saveUsers(users);
    } else {
      const u = users[userId];
      if (!u || u.type !== "local" || u.password !== password)
        return triggerShake("Invalid username or password.");
    }

    setSuccess(true);
    setTimeout(() => {
      const name = users[userId].name;
      localStorage.setItem("loggedInUser", userId);
      localStorage.setItem("loggedInUserName", name);
      localStorage.setItem("loggedInUserAvatar", "");
      onLogin(userId, { name, avatar: null, type: "local" });
    }, 800);
  };

  const switchMode = () => {
    setIsSignup(!isSignup);
    setError("");
    setForm({ username: "", password: "", confirm: "" });
  };

  return (
    <div className="login-root">
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <div className="particles">
        {particles.map((i) => (
          <div key={i} className="particle" style={{ "--i": i }} />
        ))}
      </div>

      <div className="grid-overlay" />

      <div className={`login-card ${shake ? "shake" : ""} ${success ? "success-flash" : ""}`}>

        {/* Brand */}
        <div className="login-brand">
          <span className="login-logo">🌿</span>
          <h1 className="login-title">HabitFlow</h1>
          <p className="login-sub">Build better days, one habit at a time</p>
        </div>

        {/* Google Button */}
        <div className="google-section">
          {GOOGLE_CLIENT_ID === "YOUR_GOOGLE_CLIENT_ID_HERE" ? (
            <div className="google-placeholder">
              <span>🔑</span>
              <span>Add your Google Client ID in <code>Login.jsx</code> to enable Google Sign-In</span>
            </div>
          ) : googleReady ? (
            <div className="google-btn-wrap" ref={googleBtnRef} />
          ) : (
            <div className="google-loading">Loading Google Sign-In...</div>
          )}
        </div>

        {/* Divider */}
        <div className="divider">
          <span className="divider-line" />
          <span className="divider-text">or continue with username</span>
          <span className="divider-line" />
        </div>

        {/* Tabs */}
        <div className="login-tabs">
          <button className={`tab-btn ${!isSignup ? "active" : ""}`} onClick={() => !isSignup || switchMode()}>
            Sign In
          </button>
          <button className={`tab-btn ${isSignup ? "active" : ""}`} onClick={() => isSignup || switchMode()}>
            Create Account
          </button>
        </div>

        {/* Fields */}
        <div className="login-fields">
          <div className="field-group">
            <label>Username</label>
            <div className="input-wrap">
              <span className="input-icon">👤</span>
              <input
                type="text"
                placeholder="yourname"
                value={form.username}
                autoComplete="username"
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>
          </div>

          <div className="field-group">
            <label>Password</label>
            <div className="input-wrap">
              <span className="input-icon">🔒</span>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                autoComplete={isSignup ? "new-password" : "current-password"}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>
          </div>

          {isSignup && (
            <div className="field-group field-group--confirm">
              <label>Confirm Password</label>
              <div className="input-wrap">
                <span className="input-icon">✅</span>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={form.confirm}
                  autoComplete="new-password"
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
              </div>
            </div>
          )}
        </div>

        {error && <p className="login-error">⚠️ {error}</p>}

        <button
          className={`login-submit ${success ? "login-submit--success" : ""}`}
          onClick={handleSubmit}
        >
          {success ? <>✓ Welcome!</> : (
            <>{isSignup ? "Create Account" : "Sign In"}<span className="submit-arrow">→</span></>
          )}
        </button>

        <p className="login-footer">
          {isSignup ? "Already have an account? " : "New here? "}
          <span className="login-switch" onClick={switchMode}>
            {isSignup ? "Sign in" : "Create one"}
          </span>
        </p>

        <div className="card-glow-line" />
      </div>
    </div>
  );
}