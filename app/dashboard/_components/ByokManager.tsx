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
  groq:      "#ffcb8e",
  anthropic: "#d4bdff",
  nvidia:    "#a0e8ef",
  openai:    "#aadfb4",
  cohere:    "#ffadad",
  custom:    "#b0b8c1",
};

// Status dot component with pastel blink animation
function StatusDot({ status }: { status: KeyStatus }) {
  if (status === "checking") {
    return (
      <motion.div
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: "#b5d5ff" }}
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1, repeat: Infinity }}
      />
    );
  }

  const config: Record<string, { color: string; label: string; pulse: boolean }> = {
    ok:       { color: "#aadfb4", label: "working",  pulse: true  },
    limited:  { color: "#fff3a3", label: "limited",  pulse: true  },
    error:    { color: "#ffadad", label: "invalid",  pulse: false },
    inactive: { color: "#3d444c", label: "inactive", pulse: false },
    unknown:  { color: "#5c6672", label: "unknown",  pulse: false },
  };

  const cfg = config[status] ?? config.unknown;

  return (
    <div className="flex items-center gap-1.5" title={cfg.label}>
      {cfg.pulse ? (
        <span className="relative flex h-2 w-2">
          <motion.span
            className="absolute inline-flex h-full w-full rounded-full opacity-75"
            style={{ backgroundColor: cfg.color }}
            animate={{ scale: [1, 1.8, 1], opacity: [0.75, 0, 0.75] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
        </span>
      ) : (
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
      )}
      <span className="text-[10px]" style={{ color: cfg.color }}>{cfg.label}</span>
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

  return (
    <div className="rounded-2xl border border-border bg-[#0f0f0f] overflow-hidden">
      {/* Header */}
      <div className="border-b border-border px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#a0e8ef15] border border-[#a0e8ef30] flex items-center justify-center">
            <Key className="w-4 h-4 text-[#a0e8ef]" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[#dce1e7]">API Credentials</h2>
            <p className="text-[11px] text-[#5c6672] mt-0.5">bring your own keys · live status check</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {keys.length > 0 && (
            <button onClick={checkStatuses} disabled={checking}
              className="text-[11px] text-[#5c6672] hover:text-[#b0b8c1] transition-colors disabled:opacity-40">
              {checking ? "checking..." : "recheck"}
            </button>
          )}
          <button onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors"
            style={{ backgroundColor: "#a0e8ef18", color: "#a0e8ef", border: "1px solid #a0e8ef30" }}>
            <Plus className="w-3 h-3" /> Add key
          </button>
        </div>
      </div>

      {/* Add key form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="px-5 py-4 border-b border-border space-y-3 bg-[#0a0a0a]">
              <p className="text-[11px] text-[#5c6672] font-medium uppercase tracking-wider">New credential</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <select value={form.provider} onChange={e => setForm(f => ({ ...f, provider: e.target.value }))}
                    className="w-full bg-[#141414] border border-border rounded-xl px-3 py-2 text-sm text-[#dce1e7] focus:outline-none focus:border-[#a0e8ef50] appearance-none">
                    {PROVIDERS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 w-3.5 h-3.5 text-[#5c6672] pointer-events-none" />
                </div>
                <input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                  placeholder="Name (e.g. My Groq Key)"
                  className="bg-[#141414] border border-border rounded-xl px-3 py-2 text-sm text-[#dce1e7] placeholder:text-[#3d444c] focus:outline-none focus:border-[#a0e8ef50]" />
              </div>
              <input type="password" value={form.apiKey} onChange={e => setForm(f => ({ ...f, apiKey: e.target.value }))}
                placeholder={selectedProvider?.placeholder ?? "API key"}
                className="w-full bg-[#141414] border border-border rounded-xl px-3 py-2 text-sm text-[#dce1e7] placeholder:text-[#3d444c] focus:outline-none focus:border-[#a0e8ef50] font-mono" />
              {form.provider === "custom" && (
                <input value={form.baseUrl} onChange={e => setForm(f => ({ ...f, baseUrl: e.target.value }))}
                  placeholder="Base URL (https://...)"
                  className="w-full bg-[#141414] border border-border rounded-xl px-3 py-2 text-sm text-[#dce1e7] placeholder:text-[#3d444c] focus:outline-none focus:border-[#a0e8ef50]" />
              )}
              <input value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))}
                placeholder="Model override (optional)"
                className="w-full bg-[#141414] border border-border rounded-xl px-3 py-2 text-sm text-[#dce1e7] placeholder:text-[#3d444c] focus:outline-none focus:border-[#a0e8ef50]" />
              <div className="flex gap-2 pt-1">
                <button onClick={addKey} disabled={adding || !form.label || !form.apiKey}
                  className="flex-1 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-40"
                  style={{ backgroundColor: "#a0e8ef", color: "#0a0a0a" }}>
                  {adding && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Save
                </button>
                <button onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-border rounded-xl text-sm text-[#5c6672] hover:text-[#b0b8c1] transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      {loading ? (
        <div className="p-5 space-y-2">
          {[...Array(2)].map((_, i) => <div key={i} className="h-10 bg-[#141414] rounded-xl animate-pulse" />)}
        </div>
      ) : keys.length === 0 ? (
        <div className="px-5 py-8 text-center">
          <p className="text-sm text-[#3d444c]">No credentials yet.</p>
          <p className="text-[11px] text-[#3d444c] mt-1">Add a key or tell SORK via chat.</p>
        </div>
      ) : (
        <>
          {/* Column headers */}
          <div className="grid grid-cols-12 px-5 py-2 border-b border-border text-[10px] text-[#3d444c] uppercase tracking-wider">
            <span className="col-span-4">Name</span>
            <span className="col-span-3">Provider</span>
            <span className="col-span-3">Status</span>
            <span className="col-span-2 text-right">Actions</span>
          </div>

          <div className="divide-y divide-border">
            {keys.map((key, i) => {
              const status: KeyStatus = statuses[key.id] ?? (checking ? "checking" : "unknown");
              const provColor = PROVIDER_COLORS[key.provider] ?? "#b0b8c1";

              return (
                <motion.div
                  key={key.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className={`grid grid-cols-12 items-center px-5 py-3 hover:bg-[#111] transition-colors ${!key.active ? "opacity-40" : ""}`}
                >
                  {/* Name */}
                  <div className="col-span-4 min-w-0">
                    <p className="text-sm text-[#dce1e7] truncate font-medium">{key.label}</p>
                    {key.model && <p className="text-[10px] text-[#3d444c] font-mono truncate">{key.model}</p>}
                  </div>

                  {/* Provider */}
                  <div className="col-span-3">
                    <span className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                      style={{ color: provColor, backgroundColor: provColor + "18", border: `1px solid ${provColor}30` }}>
                      {key.provider}
                    </span>
                  </div>

                  {/* Status dot */}
                  <div className="col-span-3">
                    <StatusDot status={status} />
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 flex items-center justify-end gap-1">
                    <button onClick={() => toggleKey(key.id)}
                      className="p-1.5 rounded-lg hover:bg-border transition-colors text-[#5c6672] hover:text-[#b0b8c1]">
                      {key.active
                        ? <ToggleRight className="w-4 h-4 text-[#aadfb4]" />
                        : <ToggleLeft className="w-4 h-4" />}
                    </button>
                    <button onClick={() => deleteKey(key.id)}
                      className="p-1.5 rounded-lg hover:bg-[#ffadad15] transition-colors text-[#5c6672] hover:text-[#ffadad]">
                      <Trash2 className="w-3.5 h-3.5" />
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
