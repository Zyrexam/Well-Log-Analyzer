import React, { useState, useEffect, useRef } from "react";
import { API_BASE } from "../App";
import "./ChatbotTab.css";

const STARTER_QUESTIONS = [
  "What does TOTAL_GAS indicate in this well?",
  "Summarize the hydrocarbon composition at shallow depths",
  "What are the key differences between HC1 and HC10?",
  "Are there any zones of anomalously high gas readings?",
  "What does the Benzene/Aromatics ratio tell us?",
];

export default function ChatbotTab({ well }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/chat/wells/${well.id}/chat/history`,
        );
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages || []);
        }
      } catch (e) {}
    };
    fetchHistory();
  }, [well.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;

    setInput("");
    setError(null);
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ well_id: well.id, message: msg }),
      });

      if (!res.ok) throw new Error("Chat request failed");

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch (e) {
      setError(e.message);
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    try {
      await fetch(`${API_BASE}/chat/wells/${well.id}/chat/history`, {
        method: "DELETE",
      });
      setMessages([]);
    } catch (e) {}
  };

  return (
    <div className="chat-layout">
      <div className="chat-header">
        <div className="chat-title">
          <div className="chat-title-dot"></div>
          GeoBot – AI Well Analyst
        </div>
        <div className="chat-toolbar">
          <span className="chat-well-name">{well?.well_name}</span>
          {messages.length > 0 && (
            <button className="btn-danger" onClick={clearHistory}>
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && !loading && (
          <div className="chat-empty">
            <div className="chat-empty-icon">◉</div>
            <div className="chat-empty-title">Ask anything about this well</div>
            <div className="chat-empty-subtitle">
              I have full context on {well?.well_name} and its{" "}
              {well?.curves?.length} curves
            </div>
            <div className="chat-starters">
              {STARTER_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  className="starter-btn"
                  onClick={() => sendMessage(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`chat-msg ${msg.role}`}>
            <div className="chat-avatar">{msg.role === "user" ? "◇" : "◉"}</div>
            <div className="chat-bubble">{msg.content}</div>
          </div>
        ))}

        {loading && (
          <div className="chat-msg assistant">
            <div className="chat-avatar">◉</div>
            <div className="chat-bubble chat-loading">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            <span>⚠</span> {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <input
          className="chat-input"
          placeholder="Ask about your well data..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          disabled={loading}
        />
        <button
          className="chat-send-btn"
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
        >
          ↗
        </button>
      </div>
    </div>
  );
}
