import React, { useState, useEffect, useRef } from "react";
import { Search, X, Layers, ArrowRight, CornerDownLeft } from "lucide-react";

export default function SearchModal({
  isOpen,
  onClose,
  cards = [],
  onSelectCard,
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredCards = query.trim()
    ? cards.filter((c) => {
        const q = query.toLowerCase();
        const matchesTitle = c.title?.toLowerCase().includes(q);
        const matchesKey = c.key?.toLowerCase().includes(q);
        const matchesDesc = c.description?.toLowerCase().includes(q);
        return matchesTitle || matchesKey || matchesDesc;
      })
    : [];

  const getPriorityColor = (p) => {
    switch (p) {
      case "urgent":
        return "#DC2626";
      case "high":
        return "#EA580C";
      case "medium":
        return "#4F46E5";
      default:
        return "#64748B";
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.45)",
        backdropFilter: "blur(4px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "12vh",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-panel animate-modal"
        style={{
          width: "90%",
          maxWidth: "580px",
          backgroundColor: "#FFFFFF",
          borderRadius: "14px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          border: "1px solid #E2E8F0",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Search Bar Input */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "0.85rem 1rem",
            borderBottom: "1px solid #F1F5F9",
            gap: "0.6rem",
          }}
        >
          <Search size={18} color="#4F46E5" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search tasks by title, key (PULSE-...), or description..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              fontSize: "0.95rem",
              fontWeight: 500,
              color: "#0F172A",
              background: "transparent",
            }}
          />
          {query ? (
            <button
              onClick={() => setQuery("")}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "2px",
                color: "#94A3B8",
              }}
            >
              <X size={16} />
            </button>
          ) : (
            <kbd
              style={{
                fontSize: "0.65rem",
                padding: "2px 6px",
                borderRadius: "4px",
                border: "1px solid #CBD5E1",
                background: "#F8FAFC",
                color: "#64748B",
                fontFamily: "var(--font-mono)",
                fontWeight: 600,
              }}
            >
              ESC
            </kbd>
          )}
        </div>

        {/* Results List */}
        <div
          style={{
            maxHeight: "360px",
            overflowY: "auto",
            padding: "0.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.35rem",
          }}
        >
          {!query.trim() ? (
            <div
              style={{
                textAlign: "center",
                padding: "2rem 1rem",
                color: "#94A3B8",
                fontSize: "0.8rem",
              }}
            >
              Type a keyword or task key to search across your workspace...
            </div>
          ) : filteredCards.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "2rem 1rem",
                color: "#94A3B8",
                fontSize: "0.8rem",
              }}
            >
              No tasks matching "<strong>{query}</strong>"
            </div>
          ) : (
            filteredCards.map((card) => (
              <div
                key={card._id}
                onClick={() => {
                  onSelectCard(card._id);
                  onClose();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.6rem 0.75rem",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  border: "1px solid transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#F8FAFC";
                  e.currentTarget.style.borderColor = "#E2E8F0";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.borderColor = "transparent";
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      color: "#4F46E5",
                      fontFamily: "var(--font-mono)",
                      background: "#EEF2FF",
                      padding: "2px 6px",
                      borderRadius: "4px",
                    }}
                  >
                    {card.key || "TASK"}
                  </span>
                  <span
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "#0F172A",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {card.title}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      color: getPriorityColor(card.priority),
                      textTransform: "capitalize",
                    }}
                  >
                    {card.priority}
                  </span>
                  <ArrowRight size={14} color="#94A3B8" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: "0.5rem 1rem",
            background: "#F8FAFC",
            borderTop: "1px solid #F1F5F9",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "0.7rem",
            color: "#64748B",
          }}
        >
          <span>
            {query.trim() ? `${filteredCards.length} result(s)` : "Global Task Search"}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span>Navigate: click item</span>
            <span>Close: <kbd style={{ fontFamily: "var(--font-mono)" }}>ESC</kbd></span>
          </div>
        </div>
      </div>
    </div>
  );
}