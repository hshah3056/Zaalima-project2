import React, { useState, useRef, useEffect } from "react";
import {
  Zap,
  Layers,
  Database,
  Plus,
  Search,
  UserCheck,
  RefreshCw,
  User,
  Users,
  ChevronDown,
  LogOut,
  UserPlus,
  Bell,
  CheckCheck,
} from "lucide-react";

export default function Header({
  currentWorkspace,
  workspaces,
  onSelectWorkspace,
  onOpenDataModelsModal,
  onOpenCreateTask,
  onOpenCreateBoard,
  onResetData,
  activeView,
  setActiveView,
  users,
  currentUser,
  onOpenLoginModal,
  onLogoutUser,
  onOpenInviteModal,
  activeBoardPeers = [],
  isSocketConnected = true,
  notifications = [],
  onClearNotifications = () => {},
  onOpenSearch = () => {},
}) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const notifMenuRef = useRef(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(e.target)
      ) {
        setIsProfileMenuOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      className="glass-panel"
      style={{
        borderRadius: 0,
        borderTop: 0,
        borderLeft: 0,
        borderRight: 0,
        padding: "0.5rem 1rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "0.5rem 0.75rem",
        zIndex: 50,
        background: "#FFFFFF",
        borderBottom: "1px solid #E2E8F0",
        boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.04)",
        width: "100%",
        boxSizing: "border-box",
        minHeight: "52px",
      }}
    >
      {/* LEFT SECTION: Logo, Workspace Dropdown & Search Button */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          flexWrap: "wrap",
        }}
      >
        {/* Brand */}
        <div
          onClick={() => setActiveView("kanban")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.45rem",
            cursor: "pointer",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #4F46E5 0%, #EC4899 100%)",
              width: "30px",
              height: "30px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 6px rgba(79, 70, 229, 0.25)",
              flexShrink: 0,
            }}
          >
            <Zap size={16} color="#FFFFFF" />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <h1
              style={{
                fontSize: "1rem",
                fontWeight: 800,
                color: "#0F172A",
                letterSpacing: "-0.02em",
                margin: 0,
                lineHeight: 1,
              }}
            >
              PULSE<span style={{ color: "#4F46E5" }}>WORK</span>
            </h1>
            <span
              style={{
                fontSize: "0.55rem",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                color: "#059669",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: "3px",
                marginTop: "2px",
              }}
            >
              <span className="status-online-dot"></span> Socket Live
            </span>
          </div>
        </div>

        <div style={{ height: "18px", width: "1px", background: "#E2E8F0" }} />

        {/* Workspace Dropdown */}
        <select
          value={currentWorkspace?._id || ""}
          onChange={(e) => onSelectWorkspace(e.target.value)}
          style={{
            background: "#F8FAFC",
            color: "#0F172A",
            border: "1px solid #CBD5E1",
            borderRadius: "6px",
            padding: "0.28rem 0.45rem",
            fontSize: "0.76rem",
            fontWeight: 600,
            cursor: "pointer",
            outline: "none",
            maxWidth: "140px",
          }}
        >
          {workspaces.map((ws) => (
            <option key={ws._id} value={ws._id}>
              {ws.name} ({ws.boards?.length || 0})
            </option>
          ))}
        </select>

        {/* Search trigger */}
        <button
          onClick={onOpenSearch}
          title="Search tasks (Ctrl + K)"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.35rem",
            background: "#F8FAFC",
            border: "1px solid #CBD5E1",
            borderRadius: "6px",
            padding: "0.28rem 0.5rem",
            color: "#64748B",
            fontSize: "0.75rem",
            cursor: "pointer",
            outline: "none",
          }}
        >
          <Search size={13} color="#64748B" />
          <span>Search...</span>
          <kbd
            style={{
              fontSize: "0.58rem",
              padding: "1px 4px",
              borderRadius: "3px",
              border: "1px solid #CBD5E1",
              background: "#FFFFFF",
              color: "#64748B",
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
            }}
          >
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* CENTER SECTION: View Switcher */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.2rem",
          background: "#F1F5F9",
          padding: "0.2rem",
          borderRadius: "8px",
          border: "1px solid #E2E8F0",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={() => setActiveView("kanban")}
          title="Board Canvas"
          style={{
            background: activeView === "kanban" ? "#4F46E5" : "transparent",
            color: activeView === "kanban" ? "#FFFFFF" : "#475569",
            border: "none",
            padding: "0.28rem 0.55rem",
            borderRadius: "5px",
            fontSize: "0.75rem",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.3rem",
            whiteSpace: "nowrap",
          }}
        >
          <Layers size={13} />
          <span>Canvas</span>
        </button>

        <button
          onClick={() => setActiveView("team")}
          title="Work with Team"
          style={{
            background: activeView === "team" ? "#4F46E5" : "transparent",
            color: activeView === "team" ? "#FFFFFF" : "#475569",
            border: "none",
            padding: "0.28rem 0.55rem",
            borderRadius: "5px",
            fontSize: "0.75rem",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.3rem",
            whiteSpace: "nowrap",
          }}
        >
          <Users
            size={13}
            color={activeView === "team" ? "#FFFFFF" : "#059669"}
          />
          <span>Team</span>
        </button>

        <button
          onClick={() => setActiveView("user_panel")}
          title="My Tasks"
          style={{
            background: activeView === "user_panel" ? "#4F46E5" : "transparent",
            color: activeView === "user_panel" ? "#FFFFFF" : "#475569",
            border: "none",
            padding: "0.28rem 0.55rem",
            borderRadius: "5px",
            fontSize: "0.75rem",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.3rem",
            whiteSpace: "nowrap",
          }}
        >
          <User
            size={13}
            color={activeView === "user_panel" ? "#FFFFFF" : "#4F46E5"}
          />
          <span>My Tasks</span>
        </button>

        <button
          onClick={onOpenDataModelsModal}
          title="ERD Models"
          style={{
            background: activeView === "models" ? "#4F46E5" : "transparent",
            color: activeView === "models" ? "#FFFFFF" : "#475569",
            border: "none",
            padding: "0.28rem 0.55rem",
            borderRadius: "5px",
            fontSize: "0.75rem",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.3rem",
            whiteSpace: "nowrap",
          }}
        >
          <Database
            size={13}
            color={activeView === "models" ? "#FFFFFF" : "#0891B2"}
          />
          <span>Models</span>
        </button>
      </div>

      {/* RIGHT SECTION: Status, Notifications, Profile, Create */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.45rem",
          flexWrap: "wrap",
        }}
      >
        {/* Live / Offline pill */}
        <div
          title={
            isSocketConnected
              ? "Real-time sync active"
              : "Disconnected from socket server"
          }
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "0.68rem",
            fontWeight: 700,
            padding: "2px 7px",
            borderRadius: "9999px",
            border: `1px solid ${isSocketConnected ? "#BBF7D0" : "#FECACA"}`,
            background: isSocketConnected ? "#F0FDF4" : "#FEF2F2",
            color: isSocketConnected ? "#15803D" : "#B91C1C",
            userSelect: "none",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: isSocketConnected ? "#22C55E" : "#EF4444",
              boxShadow: isSocketConnected
                ? "0 0 0 2px rgba(34, 197, 94, 0.25)"
                : "none",
            }}
          />
          <span>{isSocketConnected ? "Live" : "Offline"}</span>
        </div>

        {/* Notifications Icon Button */}
        <div ref={notifMenuRef} style={{ position: "relative" }}>
          <button
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen);
              setIsProfileMenuOpen(false);
            }}
            title="Notifications"
            style={{
              position: "relative",
              background: isNotificationsOpen ? "#EEF2FF" : "#F8FAFC",
              border: isNotificationsOpen
                ? "1px solid #4F46E5"
                : "1px solid #CBD5E1",
              color: isNotificationsOpen ? "#4F46E5" : "#64748B",
              padding: "0.32rem",
              borderRadius: "6px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Bell size={14} />
            {notifications.length > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-4px",
                  right: "-4px",
                  background: "#EF4444",
                  color: "#FFFFFF",
                  fontSize: "0.55rem",
                  fontWeight: 800,
                  width: "14px",
                  height: "14px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid #FFFFFF",
                }}
              >
                {notifications.length > 9 ? "9+" : notifications.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {isNotificationsOpen && (
            <div
              className="glass-panel animate-modal"
              style={{
                position: "absolute",
                right: 0,
                top: "34px",
                width: "280px",
                background: "#FFFFFF",
                border: "1px solid #E2E8F0",
                borderRadius: "10px",
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
                padding: "0.6rem",
                zIndex: 100,
                display: "flex",
                flexDirection: "column",
                gap: "0.35rem",
                maxHeight: "320px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingBottom: "0.35rem",
                  borderBottom: "1px solid #F1F5F9",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "5px" }}
                >
                  <Bell size={13} color="#4F46E5" />
                  <span
                    style={{
                      fontSize: "0.78rem",
                      fontWeight: 800,
                      color: "#0F172A",
                    }}
                  >
                    Notifications ({notifications.length})
                  </span>
                </div>
                {notifications.length > 0 && (
                  <button
                    onClick={onClearNotifications}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#4F46E5",
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "3px",
                    }}
                  >
                    <CheckCheck size={11} /> Clear
                  </button>
                )}
              </div>

              <div
                style={{
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.35rem",
                  maxHeight: "220px",
                }}
              >
                {notifications.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "1rem 0",
                      color: "#94A3B8",
                      fontSize: "0.72rem",
                    }}
                  >
                    No unread notifications
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      style={{
                        padding: "0.4rem",
                        borderRadius: "6px",
                        background: "#F8FAFC",
                        border: "1px solid #E2E8F0",
                        display: "flex",
                        flexDirection: "column",
                        gap: "2px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          color: "#0F172A",
                        }}
                      >
                        {notif.title}
                      </div>
                      <div style={{ fontSize: "0.66rem", color: "#475569" }}>
                        {notif.message}
                      </div>
                      <span
                        style={{
                          fontSize: "0.55rem",
                          color: "#94A3B8",
                          marginTop: "2px",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {notif.time}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill & Dropdown */}
        <div ref={profileMenuRef} style={{ position: "relative" }}>
          <div
            onClick={() => {
              if (!currentUser) {
                onOpenLoginModal();
              } else {
                setIsProfileMenuOpen(!isProfileMenuOpen);
                setIsNotificationsOpen(false);
              }
            }}
            title={currentUser ? "User Profile Controls" : "Click to Login"}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
              background: "#F8FAFC",
              border: currentUser ? "1px solid #C7D2FE" : "1px solid #CBD5E1",
              padding: "0.22rem 0.5rem",
              borderRadius: "16px",
              cursor: "pointer",
              transition: "all 0.15s",
              maxWidth: "135px",
            }}
          >
            {currentUser ? (
              <>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      width: "5px",
                      height: "5px",
                      borderRadius: "50%",
                      background: "#059669",
                      border: "1px solid #FFF",
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    minWidth: 0,
                    overflow: "hidden",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      color: "#0F172A",
                      lineHeight: "1",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {currentUser.name}
                  </span>
                </div>
                <ChevronDown
                  size={11}
                  color="#64748B"
                  style={{ flexShrink: 0 }}
                />
              </>
            ) : (
              <span
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: "#4F46E5",
                  display: "flex",
                  alignItems: "center",
                  gap: "3px",
                }}
              >
                <UserCheck size={13} /> Sign In
              </span>
            )}
          </div>

          {/* User Menu Dropdown */}
          {isProfileMenuOpen && currentUser && (
            <div
              className="glass-panel animate-modal"
              style={{
                position: "absolute",
                right: 0,
                top: "34px",
                width: "200px",
                background: "#FFFFFF",
                border: "1px solid #E2E8F0",
                borderRadius: "10px",
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
                padding: "0.5rem",
                zIndex: 100,
                display: "flex",
                flexDirection: "column",
                gap: "0.3rem",
              }}
            >
              <div
                style={{
                  padding: "0.3rem 0.4rem 0.4rem",
                  borderBottom: "1px solid #F1F5F9",
                }}
              >
                <div
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 800,
                    color: "#0F172A",
                  }}
                >
                  {currentUser.name}
                </div>
                <div
                  style={{
                    fontSize: "0.65rem",
                    color: "#64748B",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {currentUser.email}
                </div>
                <span
                  style={{
                    fontSize: "0.58rem",
                    color: "#059669",
                    background: "#ECFDF5",
                    padding: "1px 4px",
                    borderRadius: "4px",
                    fontWeight: 700,
                    display: "inline-block",
                    marginTop: "2px",
                  }}
                >
                  Online
                </span>
              </div>

              <button
                onClick={() => {
                  setActiveView("team");
                  setIsProfileMenuOpen(false);
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  padding: "0.35rem",
                  borderRadius: "5px",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  color: "#334155",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  textAlign: "left",
                }}
              >
                <Users size={12} color="#4F46E5" /> Work with Team
              </button>

              <button
                onClick={() => {
                  onOpenInviteModal();
                  setIsProfileMenuOpen(false);
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  padding: "0.35rem",
                  borderRadius: "5px",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  color: "#334155",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  textAlign: "left",
                }}
              >
                <UserPlus size={12} color="#059669" /> Invite Member
              </button>

              <button
                onClick={() => {
                  onOpenLoginModal();
                  setIsProfileMenuOpen(false);
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  padding: "0.35rem",
                  borderRadius: "5px",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  color: "#334155",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  textAlign: "left",
                }}
              >
                <UserCheck size={12} color="#0891B2" /> Switch Account
              </button>

              <div
                style={{
                  height: "1px",
                  background: "#F1F5F9",
                  margin: "1px 0",
                }}
              />

              <button
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  onLogoutUser();
                }}
                style={{
                  background: "#FEF2F2",
                  border: "1px solid #FCA5A5",
                  padding: "0.35rem",
                  borderRadius: "5px",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: "#DC2626",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px",
                }}
              >
                <LogOut size={12} /> Sign Out
              </button>
            </div>
          )}
        </div>

        {/* Reset Data */}
        <button
          onClick={onResetData}
          title="Reset Seed Data"
          style={{
            background: "#F1F5F9",
            border: "1px solid #CBD5E1",
            color: "#64748B",
            padding: "0.32rem",
            borderRadius: "6px",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <RefreshCw size={12} />
        </button>

        {/* Create Card Button */}
        <button
          onClick={onOpenCreateTask}
          style={{
            background: "#4F46E5",
            color: "#FFFFFF",
            border: "none",
            padding: "0.32rem 0.65rem",
            borderRadius: "6px",
            fontSize: "0.74rem",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
            boxShadow: "0 2px 6px rgba(79, 70, 229, 0.25)",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          <Plus size={13} /> Card
        </button>
      </div>
    </header>
  );
}
