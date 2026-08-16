import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Login from './login.jsx'


function Root() {
  const [session, setSession] = useState(() => {
    const userId = localStorage.getItem("loggedInUser");
    if (!userId) return null;
    return {
      userId,
      name:   localStorage.getItem("loggedInUserName")   || userId,
      avatar: localStorage.getItem("loggedInUserAvatar") || null,
    };
  });

  const handleLogin = (userId, profile) => {
    setSession({ userId, ...profile });
  };

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("loggedInUserName");
    localStorage.removeItem("loggedInUserAvatar");
    setSession(null);
  };

  if (!session) return <Login onLogin={handleLogin} />;
  return <App session={session} onLogout={handleLogout} />;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)