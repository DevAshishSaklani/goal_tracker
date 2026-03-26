import { useState, useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from "chart.js";
import { Line } from "react-chartjs-2";
 
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);
 
import "./App.css";
 
// ─── MONTHLY SUMMARY MODAL ───────────────────────────────────────────────────
function MonthlySummaryModal({ summary, onClose, darkMode }) {
  if (!summary) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={darkMode ? "modal-box dark" : "modal-box"}
        onClick={(e) => e.stopPropagation()}
      >
        <h2>📋 {summary.monthName} Summary</h2>
        <p className="summary-subtitle">Here's how you did last month:</p>
 
        <div className="summary-stats">
          {summary.habits.map((h) => (
            <div key={h.name} className="summary-row">
              <span className="summary-habit-name">{h.name}</span>
              <div className="summary-bar-wrap">
                <div
                  className="summary-bar-fill"
                  style={{ width: `${h.pct}%` }}
                />
              </div>
              <span className="summary-pct">{h.days}/30 days ({h.pct}%)</span>
            </div>
          ))}
        </div>
 
        <div className="summary-overall">
          Overall completion: <strong>{summary.overall}%</strong>
        </div>
 
        <button className="summary-close-btn" onClick={onClose}>
          Got it 👍
        </button>
      </div>
    </div>
  );
}
 
// ─── HISTORY PAGE ────────────────────────────────────────────────────────────
function HistoryPage({ allData, globalHabits, darkMode, onBack }) {
  const todayDate = new Date();
  const currentMonthKey = `${todayDate.getFullYear()}-${String(
    todayDate.getMonth() + 1
  ).padStart(2, "0")}`;
 
  const formatMonth = (m) => {
    const [y, mo] = m.split("-");
    return new Date(y, mo - 1).toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
  };
 
  const days = Array.from({ length: 30 }, (_, i) => i + 1);
 
  const pastMonths = Object.keys(allData)
    .filter((m) => m < currentMonthKey)
    .sort((a, b) => (a > b ? -1 : 1));
 
  const getMonthProgress = (monthKey) => {
    const checked = allData[monthKey]?.checked || {};
    const total = globalHabits.length * 30;
    if (!total) return 0;
    const done = Object.values(checked).filter(Boolean).length;
    return Math.round((done / total) * 100);
  };
 
  const getDayProgress = (monthKey, day) => {
    const checked = allData[monthKey]?.checked || {};
    let done = 0;
    globalHabits.forEach((h) => { if (checked[`${h}-${day}`]) done++; });
    return globalHabits.length ? Math.round((done / globalHabits.length) * 100) : 0;
  };
 
  const [expandedMonth, setExpandedMonth] = useState(null);
 
  return (
    <div className={darkMode ? "app dark" : "app"}>
      <div className="top-bar">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h1>History</h1>
        <div />
      </div>
 
      {pastMonths.length === 0 ? (
        <div className="no-history">
          <p>No history yet. Come back after your first month! 🗓️</p>
        </div>
      ) : (
        <div className="history-list">
          {pastMonths.map((m) => {
            const checked = allData[m]?.checked || {};
            const overall = getMonthProgress(m);
            const isExpanded = expandedMonth === m;
 
            const graphData = {
              labels: days,
              datasets: [
                {
                  label: "Progress %",
                  data: days.map((d) => getDayProgress(m, d)),
                  borderColor: "#4caf50",
                  backgroundColor: "rgba(76,175,80,0.15)",
                  tension: 0.3,
                  pointRadius: 2,
                },
              ],
            };
 
            return (
              <div key={m} className="history-card">
                <div
                  className="history-card-header"
                  onClick={() => setExpandedMonth(isExpanded ? null : m)}
                >
                  <div className="history-month-name">{formatMonth(m)}</div>
                  <div className="history-meta">
                    <div className="history-circle" style={{ "--progress": overall }}>
                      <div className="history-inner">{overall}%</div>
                    </div>
                    <span className="history-expand-icon">{isExpanded ? "▲" : "▼"}</span>
                  </div>
                </div>
 
                {isExpanded && (
                  <div className="history-detail">
                    <div className="history-graph">
                      <Line
                        data={graphData}
                        options={{
                          plugins: { legend: { display: false } },
                          scales: { y: { min: 0, max: 100 } },
                        }}
                      />
                    </div>
                    <div className="history-table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>Habit</th>
                            {days.map((d) => <th key={d}>{d}</th>)}
                          </tr>
                        </thead>
                        <tbody>
                          {globalHabits.map((habit, i) => (
                            <tr key={i}>
                              <td>
                                <div className="habit-cell">
                                  <span className="habit-text">{habit}</span>
                                </div>
                              </td>
                              {days.map((d) => (
                                <td key={d}>
                                  <input
                                    type="checkbox"
                                    checked={checked[`${habit}-${d}`] || false}
                                    readOnly
                                    disabled
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
 
// ─── MAIN APP ─────────────────────────────────────────────────────────────────
function App() {
  const todayDate = new Date();
  const today = todayDate.getDate();
 
  const currentMonthKey = `${todayDate.getFullYear()}-${String(
    todayDate.getMonth() + 1
  ).padStart(2, "0")}`;
 
  const formatMonthLabel = (m) => {
    const [y, mo] = m.split("-");
    return new Date(y, mo - 1).toLocaleString("default", {
      month: "long", year: "numeric",
    });
  };
 
  const [darkMode, setDarkMode]   = useState(false);
  const [newHabit, setNewHabit]   = useState("");
  const [page, setPage]           = useState("main");
  const [monthlySummary, setMonthlySummary] = useState(null);
 
  // Notification state
  const [notifTime, setNotifTime]       = useState(() => localStorage.getItem("notifTime") || "20:00");
  const [notifEnabled, setNotifEnabled] = useState(() => localStorage.getItem("notifEnabled") === "true");
  const [notifPermission, setNotifPermission] = useState(Notification.permission);
  const notifTimerRef = useRef(null);
 
  const [globalHabits, setGlobalHabits] = useState(() => {
    return JSON.parse(localStorage.getItem("globalHabits")) || [
      "Wake Up Early", "Gym", "Study",
    ];
  });
 
  const [selectedDay, setSelectedDay] = useState(today);
 
  const [allData, setAllData] = useState(() => {
    return JSON.parse(localStorage.getItem("habitData")) || {};
  });
 
  const [contextMenu, setContextMenu]   = useState(null);
  const [editingHabit, setEditingHabit] = useState(null);
  const contextMenuRef = useRef(null);
 
  const monthData = allData[currentMonthKey] || { checked: {} };
  const checked   = monthData.checked;
  const habits    = globalHabits;
  const days      = Array.from({ length: 30 }, (_, i) => i + 1);
 
  // ── Streak calculation ─────────────────────────────────────────────────────
  // A day "counts" if at least one habit was checked that day in the current month
  const calculateStreak = () => {
    let streak = 0;
    for (let d = today; d >= 1; d--) {
      const anyDone = habits.some((h) => checked[`${h}-${d}`]);
      if (anyDone) streak++;
      else break;
    }
    return streak;
  };
  const streak = calculateStreak();
 
  // ── Monthly summary detection ──────────────────────────────────────────────
  // Show summary if we're on day 1 and last month has data and summary not yet seen
  useEffect(() => {
    if (today !== 1) return;
 
    const prevDate = new Date(todayDate.getFullYear(), todayDate.getMonth() - 1, 1);
    const prevKey  = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`;
    const seenKey  = `summaryShown-${prevKey}`;
 
    if (!allData[prevKey] || localStorage.getItem(seenKey)) return;
 
    const prevChecked = allData[prevKey]?.checked || {};
    const habitStats  = globalHabits.map((h) => {
      const days30 = Array.from({ length: 30 }, (_, i) => i + 1);
      const doneDays = days30.filter((d) => prevChecked[`${h}-${d}`]).length;
      return { name: h, days: doneDays, pct: Math.round((doneDays / 30) * 100) };
    });
    const totalDone  = Object.values(prevChecked).filter(Boolean).length;
    const totalSlots = globalHabits.length * 30;
    const overall    = totalSlots ? Math.round((totalDone / totalSlots) * 100) : 0;
 
    setMonthlySummary({
      monthName: formatMonthLabel(prevKey),
      habits: habitStats,
      overall,
    });
    localStorage.setItem(seenKey, "true");
  }, []);
 
  // ── Notification scheduler ─────────────────────────────────────────────────
  const scheduleNotification = (time) => {
    if (notifTimerRef.current) clearTimeout(notifTimerRef.current);
    const [h, m] = time.split(":").map(Number);
    const now  = new Date();
    const fire = new Date();
    fire.setHours(h, m, 0, 0);
    if (fire <= now) fire.setDate(fire.getDate() + 1);
    const delay = fire - now;
    notifTimerRef.current = setTimeout(() => {
      const todayDone = habits.filter((habit) => checked[`${habit}-${today}`]).length;
      const remaining = habits.length - todayDone;
      new Notification("Habit Tracker Reminder 🔔", {
        body: remaining > 0
          ? `You still have ${remaining} habit${remaining > 1 ? "s" : ""} left for today!`
          : "All habits done today! Great job! 🎉",
        icon: "/favicon.ico",
      });
      scheduleNotification(time); // reschedule for next day
    }, delay);
  };
 
  const requestAndEnableNotifs = async () => {
    const permission = await Notification.requestPermission();
    setNotifPermission(permission);
    if (permission === "granted") {
      setNotifEnabled(true);
      localStorage.setItem("notifEnabled", "true");
      scheduleNotification(notifTime);
    }
  };
 
  const disableNotifs = () => {
    setNotifEnabled(false);
    localStorage.setItem("notifEnabled", "false");
    if (notifTimerRef.current) clearTimeout(notifTimerRef.current);
  };
 
  const handleTimeChange = (e) => {
    const t = e.target.value;
    setNotifTime(t);
    localStorage.setItem("notifTime", t);
    if (notifEnabled && notifPermission === "granted") {
      scheduleNotification(t);
    }
  };
 
  useEffect(() => {
    if (notifEnabled && notifPermission === "granted") {
      scheduleNotification(notifTime);
    }
    return () => { if (notifTimerRef.current) clearTimeout(notifTimerRef.current); };
  }, []);
 
  // ── Data helpers ───────────────────────────────────────────────────────────
  const updateData = (newChecked) => {
    setAllData({ ...allData, [currentMonthKey]: { checked: newChecked } });
  };
 
  const handleCheck = (habit, day) => {
    const key = `${habit}-${day}`;
    updateData({ ...checked, [key]: !checked[key] });
  };
 
  const addHabit = () => {
    if (newHabit.trim()) {
      setGlobalHabits([...globalHabits, newHabit]);
      setNewHabit("");
    }
  };
 
  const getProgress = (day) => {
    let done = 0;
    habits.forEach((h) => { if (checked[`${h}-${day}`]) done++; });
    return habits.length ? Math.round((done / habits.length) * 100) : 0;
  };
 
  const progress = getProgress(selectedDay);
 
  const graphData = {
    labels: days,
    datasets: [
      {
        label: "Progress %",
        data: days.map(getProgress),
        borderColor: "#4caf50",
        backgroundColor: "rgba(76,175,80,0.2)",
        tension: 0.3,
      },
    ],
  };
 
  useEffect(() => {
    localStorage.setItem("habitData", JSON.stringify(allData));
    localStorage.setItem("globalHabits", JSON.stringify(globalHabits));
  }, [allData, globalHabits]);
 
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target)) {
        setContextMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
 
  // ── Context menu ───────────────────────────────────────────────────────────
  const handleRightClick = (e, habit) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, habit });
  };
 
  const handleDelete = () => {
    setGlobalHabits(globalHabits.filter((h) => h !== contextMenu.habit));
    setContextMenu(null);
  };
 
  const handleEditStart = () => {
    setEditingHabit({ oldName: contextMenu.habit, newName: contextMenu.habit });
    setContextMenu(null);
  };
 
  const handleEditSave = () => {
    const { oldName, newName } = editingHabit;
    if (!newName.trim() || newName === oldName) { setEditingHabit(null); return; }
    setGlobalHabits(globalHabits.map((h) => (h === oldName ? newName.trim() : h)));
    const updatedAllData = {};
    for (const month in allData) {
      const oldChecked = allData[month].checked || {};
      const newChecked = {};
      for (const key in oldChecked) {
        const newKey = key.startsWith(`${oldName}-`)
          ? key.replace(`${oldName}-`, `${newName.trim()}-`)
          : key;
        newChecked[newKey] = oldChecked[key];
      }
      updatedAllData[month] = { checked: newChecked };
    }
    setAllData(updatedAllData);
    setEditingHabit(null);
  };
 
  // ── Pages ──────────────────────────────────────────────────────────────────
  if (page === "history") {
    return (
      <HistoryPage
        allData={allData}
        globalHabits={globalHabits}
        darkMode={darkMode}
        onBack={() => setPage("main")}
      />
    );
  }
 
  return (
    <div className={darkMode ? "app dark" : "app"}>
 
      {/* MONTHLY SUMMARY MODAL */}
      <MonthlySummaryModal
        summary={monthlySummary}
        onClose={() => setMonthlySummary(null)}
        darkMode={darkMode}
      />
 
      {/* TOP BAR */}
      <div className="top-bar">
        <h1>Habit Tracker</h1>
        <div className="top-actions">
          <button className="history-btn" onClick={() => setPage("history")}>
            📅 History
          </button>
          <button onClick={() => setDarkMode(!darkMode)}>
            Toggle Mode
          </button>
        </div>
      </div>
 
      {/* STREAK BANNER */}
      {streak > 0 && (
        <div className="streak-banner">
          🔥 {streak}-day streak — keep it up!
        </div>
      )}
 
      {/* NOTIFICATION SETTINGS */}
      <div className="notif-bar">
        <span className="notif-label">🔔 Daily Reminder:</span>
        <input
          type="time"
          className="notif-time-input"
          value={notifTime}
          onChange={handleTimeChange}
        />
        {notifPermission === "denied" ? (
          <span className="notif-blocked">Notifications blocked in browser</span>
        ) : notifEnabled ? (
          <button className="notif-btn notif-off" onClick={disableNotifs}>
            Turn Off
          </button>
        ) : (
          <button className="notif-btn notif-on" onClick={requestAndEnableNotifs}>
            Enable
          </button>
        )}
      </div>
 
      {/* ADD HABIT */}
      <div className="add-habit">
        <input
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          placeholder="Add habit"
        />
        <button onClick={addHabit}>Add</button>
      </div>
 
      {/* TABLE */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Habit</th>
              {days.map((d) => (
                <th
                  key={d}
                  onClick={() => setSelectedDay(d)}
                  className={d === selectedDay ? "selected" : ""}
                >
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {habits.map((habit, i) => (
              <tr key={i} onContextMenu={(e) => handleRightClick(e, habit)}>
                <td>
                  <div className="habit-cell">
                    {editingHabit && editingHabit.oldName === habit ? (
                      <input
                        className="edit-input"
                        value={editingHabit.newName}
                        autoFocus
                        onChange={(e) =>
                          setEditingHabit({ ...editingHabit, newName: e.target.value })
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleEditSave();
                          if (e.key === "Escape") setEditingHabit(null);
                        }}
                        onBlur={handleEditSave}
                      />
                    ) : (
                      <span className="habit-text">{habit}</span>
                    )}
                  </div>
                </td>
                {days.map((d) => (
                  <td key={d}>
                    <input
                      type="checkbox"
                      checked={checked[`${habit}-${d}`] || false}
                      onChange={() => handleCheck(habit, d)}
                      disabled={d !== today}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
 
      {/* CONTEXT MENU */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button className="context-menu-btn edit-btn" onClick={handleEditStart}>
            ✏️ Edit
          </button>
          <button className="context-menu-btn delete-btn" onClick={handleDelete}>
            🗑️ Delete
          </button>
        </div>
      )}
 
      {/* DASHBOARD */}
      <div className="dashboard">
        <div className="progress-box">
          <h3>Day {selectedDay}</h3>
          <div className="circle" style={{ "--progress": progress }}>
            <div className="inner">{progress}%</div>
          </div>
          {streak > 0 && (
            <div className="streak">🔥 {streak} day streak</div>
          )}
        </div>
        <div className="graph-box">
          <Line data={graphData} />
        </div>
      </div>
    </div>
  );
}
 
export default App;