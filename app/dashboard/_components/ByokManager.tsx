"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, ToggleLeft, ToggleRight, Key, Loader2, ChevronDown } from "lucide-react";
import { apiGet, apiPost, apiDelete, apiPatch } from "@/lib/api";

interface ByokKey {
  id: string;
  provider: string;
  label: string;
  baseUrl?: string;
  model?: string;
  active: boolean;
  createdAt: string;
}

type KeyStatus = "ok" | "limited" | "error" | "inactive" | "checking" | "unknown";

interface StatusResult { id: string; status: KeyStatus; }

const PROVIDERS = [
  { value: "groq",      label: "Groq",            placeholder: "gsk_..." },
  { value: "anthropic", label: "Claude (Anthropic)", placeholder: "sk-ant-..." },
  { value: "nvidia",    label: "NVIDIA NIM",       placeholder: "nvapi-..." },
  { value: "openai",    label: "OpenAI",           placeholder: "sk-..." },
  { value: "cohere",    label: "Cohere",           placeholder: "..." },
  { value: "custom",    label: "Custom Endpoint",  placeholder: "..." },
];

const PROVIDER_COLORS: Record<string, string> = {
  groq:      "#ffb689",
  anthropic: "#bec2ff",
  nvidia:    "#50d8e9",
  openai:    "#92f1ff",
  cohere:    "#ffb4ab",
  custom:    "#c6c5d8",
};

function StatusDot({ status }: { status: KeyStatus }) {
  if (status === "checking") {
    return (
      <motion.div
        style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#bec2ff" }}
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1, repeat: Infinity }}
      />
    );
  }

  const config: Record<string, { color: string; label: string; pulse: boolean }> = {
    ok:       { color: "#92f1ff",  label: "working",  pulse: true  },
    limited:  { color: "#E5FD17",  label: "limited",  pulse: true  },
    error:    { color: "#ffb4ab",  label: "invalid",  pulse: false },
    inactive: { color: "#454655",  label: "inactive", pulse: false },
    unknown:  { color: "#9A9DA3",  label: "unknown",  pulse: false },
  };

  const cfg = config[status] ?? config.unknown;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }} title={cfg.label}>
      {cfg.pulse ? (
        <span style={{ position: "relative", display: "flex", width: 8, height: 8 }}>
          <motion.span
            style={{
              position: "absolute",
              display: "inline-flex",
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              backgroundColor: cfg.color,
              opacity: 0.75,
            }}
            animate={{ scale: [1, 1.8, 1], opacity: [0.75, 0, 0.75] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span
            style={{
              position: "relative",
              display: "inline-flex",
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: cfg.color,
            }}
          />
        </span>
      ) : (
        <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: cfg.color, display: "inline-block" }} />
      )}
      <span style={{ fontSize: 10, color: cfg.color }}>{cfg.label}</span>
    </div>
  );
}

export default function ByokManager({ clerkId }: { clerkId: string }) {
  const [keys, setKeys] = useState<ByokKey[]>([]);
  const [statuses, setStatuses] = useState<Record<string, KeyStatus>>({});
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ provider: "groq", label: "", apiKey: "", baseUrl: "", model: "" });

  async function loadKeys() {
    const data = await apiGet<{ keys: ByokKey[] }>("/api/byok", clerkId);
    setKeys(data.keys);
  }

  async function checkStatuses() {
    if (checking) return;
    setChecking(true);
    try {
      const data = await apiGet<{ statuses: StatusResult[] }>("/api/byok/status", clerkId);
      const map: Record<string, KeyStatus> = {};
      for (const s of data.statuses) map[s.id] = s.status;
      setStatuses(map);
    } catch { /* silent */ }
    finally { setChecking(false); }
  }

  useEffect(() => {
    loadKeys().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (keys.length > 0) checkStatuses();
    const interval = setInterval(() => { if (keys.length > 0) checkStatuses(); }, 60_000);
    return () => clearInterval(interval);
  }, [keys.length]);

  async function addKey() {
    if (!form.label || !form.apiKey) return;
    setAdding(true);
    try {
      await apiPost("/api/byok", clerkId, {
        provider: form.provider, label: form.label, apiKey: form.apiKey,
        baseUrl: form.baseUrl || undefined, model: form.model || undefined,
      });
      setForm({ provider: "groq", label: "", apiKey: "", baseUrl: "", model: "" });
      setShowForm(false);
      await loadKeys();
    } finally { setAdding(false); }
  }

  async function deleteKey(id: string) {
    await apiDelete(`/api/byok/${id}`, clerkId);
    setKeys(prev => prev.filter(k => k.id !== id));
    setStatuses(prev => { const n = { ...prev }; delete n[id]; return n; });
  }

  async function toggleKey(id: string) {
    const data = await apiPatch<{ active: boolean }>(`/api/byok/${id}/toggle`, clerkId);
    setKeys(prev => prev.map(k => k.id === id ? { ...k, active: data.active } : k));
  }

  const selectedProvider = PROVIDERS.find(p => p.value === form.provider);

  const inputStyle: React.CSSProperties = {
    background: "#0a0a0b",
    border: "1px solid #1B1C1E",
    borderRadius: 2,
    padding: "8px 12px",
    fontSize: 13,
    color: "#e5e2e3",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
        background: "#101112",
        border: "1px solid #1B1C1E",
        borderRadius: 4,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          borderBottom: "1px solid #1B1C1E",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 4,
              backgroundColor: "#50d8e915",
              border: "1px solid #50d8e930",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Key style={{ width: 16, height: 16, color: "#50d8e9" }} />
          </div>
          <div>
            <h2
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#e5e2e3",
                fontFamily: "'Manrope', sans-serif",
                letterSpacing: "-0.04em",
                margin: 0,
              }}
            >
              API Credentials
            </h2>
            <p style={{ fontSize: 11, color: "#9A9DA3", margin: "2px 0 0 0" }}>bring your own keys · live status check</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {keys.length > 0 && (
            <button
              onClick={checkStatuses}
              disabled={checking}
              style={{
                fontSize: 11,
                color: checking ? "#454655" : "#9A9DA3",
                background: "none",
                border: "none",
                cursor: checking ? "not-allowed" : "pointer",
                opacity: checking ? 0.4 : 1,
              }}
            >
              {checking ? "checking..." : "recheck"}
            </button>
          )}
          <button
            onClick={() => setShowForm(v => !v)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 16px",
              borderRadius: 2,
              fontSize: 12,
              fontWeight: 600,
              color: "#50d8e9",
              backgroundColor: "#50d8e918",
              border: "1px solid #50d8e930",
              cursor: "pointer",
            }}
          >
            <Plus style={{ width: 12, height: 12 }} /> Add key
          </button>
        </div>
      </div>

      {/* Add key form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: "hidden" }}
          >
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid #1B1C1E",
                display: "flex",
                flexDirection: "column",
                gap: 12,
                background: "#0a0a0b",
              }}
            >
              <p style={{ fontSize: 11, color: "#9A9DA3", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>
                New credential
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ position: "relative" }}>
                  <select
                    value={form.provider}
                    onChange={e => setForm(f => ({ ...f, provider: e.target.value }))}
                    style={{ ...inputStyle, appearance: "none", paddingRight: 32 }}
                  >
                    {PROVIDERS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                  <ChevronDown style={{ position: "absolute", right: 10, top: 10, width: 14, height: 14, color: "#9A9DA3", pointerEvents: "none" }} />
                </div>
                <input
                  value={form.label}
                  onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                  placeholder="Name (e.g. My API Key)"
                  style={{ ...inputStyle }}
                />
              </div>
              <input
                type="password"
                value={form.apiKey}
                onChange={e => setForm(f => ({ ...f, apiKey: e.target.value }))}
                placeholder={selectedProvider?.placeholder ?? "API key"}
                style={{ ...inputStyle, fontFamily: "'Inter', monospace" }}
              />
              {form.provider === "custom" && (
                <input
                  value={form.baseUrl}
                  onChange={e => setForm(f => ({ ...f, baseUrl: e.target.value }))}
                  placeholder="Base URL (https://...)"
                  style={inputStyle}
                />
              )}
              <input
                value={form.model}
                onChange={e => setForm(f => ({ ...f, model: e.target.value }))}
                placeholder="Model override (optional)"
                style={inputStyle}
              />
              <div style={{ display: "flex", gap: 8, paddingTop: 4 }}>
                <button
                  onClick={addKey}
                  disabled={adding || !form.label || !form.apiKey}
                  style={{
                    flex: 1,
                    padding: "8px 0",
                    borderRadius: 2,
                    fontSize: 13,
                    fontWeight: 600,
                    background: "#5E6BFF",
                    color: "#F0F1F2",
                    border: "none",
                    cursor: adding || !form.label || !form.apiKey ? "not-allowed" : "pointer",
                    opacity: adding || !form.label || !form.apiKey ? 0.4 : 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  {adding && <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" />}
                  Save
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  style={{
                    padding: "8px 16px",
                    border: "1px solid #232426",
                    borderRadius: 2,
                    fontSize: 12,
                    color: "#c6c5d8",
                    background: "transparent",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      {loading ? (
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 8 }}>
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse"
              style={{ height: 40, background: "#1B1C1E", borderRadius: 4 }}
            />
          ))}
        </div>
      ) : keys.length === 0 ? (
        <div style={{ padding: "32px 20px", textAlign: "center" }}>
          <p style={{ fontSize: 13, color: "#454655", margin: 0 }}>No credentials yet.</p>
          <p style={{ fontSize: 11, color: "#454655", marginTop: 4 }}>Add a key or tell SORK via chat.</p>
        </div>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(12, 1fr)",
              padding: "8px 20px",
              borderBottom: "1px solid #1B1C1E",
              fontSize: 10,
              color: "#454655",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            <span style={{ gridColumn: "span 4" }}>Name</span>
            <span style={{ gridColumn: "span 3" }}>Provider</span>
            <span style={{ gridColumn: "span 3" }}>Status</span>
            <span style={{ gridColumn: "span 2", textAlign: "right" }}>Actions</span>
          </div>

          <div>
            {keys.map((key, i) => {
              const status: KeyStatus = statuses[key.id] ?? (checking ? "checking" : "unknown");
              const provColor = PROVIDER_COLORS[key.provider] ?? "#c6c5d8";

              return (
                <motion.div
                  key={key.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(12, 1fr)",
                    alignItems: "center",
                    padding: "12px 20px",
                    borderBottom: "1px solid #1B1C1E",
                    opacity: !key.active ? 0.4 : 1,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#0e0e0f")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  {/* Name */}
                  <div style={{ gridColumn: "span 4", minWidth: 0 }}>
                    <p style={{ fontSize: 13, color: "#e5e2e3", fontWeight: 500, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {key.label}
                    </p>
                    {key.model && (
                      <p style={{ fontSize: 10, color: "#454655", fontFamily: "'Inter', monospace", margin: "2px 0 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {key.model}
                      </p>
                    )}
                  </div>

                  {/* Provider */}
                  <div style={{ gridColumn: "span 3" }}>
                    <span
                      style={{
                        fontSize: 11,
                        padding: "1px 8px",
                        borderRadius: 999,
                        fontWeight: 500,
                        color: provColor,
                        backgroundColor: provColor + "18",
                        border: `1px solid ${provColor}30`,
                      }}
                    >
                      {key.provider}
                    </span>
                  </div>

                  {/* Status dot */}
                  <div style={{ gridColumn: "span 3" }}>
                    <StatusDot status={status} />
                  </div>

                  {/* Actions */}
                  <div style={{ gridColumn: "span 2", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
                    <button
                      onClick={() => toggleKey(key.id)}
                      style={{
                        padding: 6,
                        borderRadius: 2,
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {key.active
                        ? <ToggleRight style={{ width: 16, height: 16, color: "#92f1ff" }} />
                        : <ToggleLeft style={{ width: 16, height: 16, color: "#9A9DA3" }} />}
                    </button>
                    <button
                      onClick={() => deleteKey(key.id)}
                      style={{
                        padding: 6,
                        borderRadius: 2,
                        background: "transparent",
                        border: "1px solid rgba(255,180,171,0.3)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#ffb4ab",
                      }}
                    >
                      <Trash2 style={{ width: 14, height: 14 }} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
