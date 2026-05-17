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

const PROVIDERS = [
  { value: "groq", label: "Groq", placeholder: "gsk_..." },
  { value: "anthropic", label: "Claude (Anthropic)", placeholder: "sk-ant-..." },
  { value: "nvidia", label: "NVIDIA NIM", placeholder: "nvapi-..." },
  { value: "openai", label: "OpenAI", placeholder: "sk-..." },
  { value: "cohere", label: "Cohere", placeholder: "..." },
  { value: "custom", label: "Custom Endpoint", placeholder: "..." },
];

const PROVIDER_COLORS: Record<string, string> = {
  groq: "#f59e0b",
  anthropic: "#c084fc",
  nvidia: "#22d3ee",
  openai: "#22c55e",
  cohere: "#f97316",
  custom: "#94a3b8",
};

export default function ByokManager({ clerkId }: { clerkId: string }) {
  const [keys, setKeys] = useState<ByokKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    provider: "groq",
    label: "",
    apiKey: "",
    baseUrl: "",
    model: "",
  });

  useEffect(() => {
    loadKeys();
  }, []);

  async function loadKeys() {
    try {
      const data = await apiGet<{ keys: ByokKey[] }>("/api/byok", clerkId);
      setKeys(data.keys);
    } catch {
    } finally {
      setLoading(false);
    }
  }

  async function addKey() {
    if (!form.label || !form.apiKey) return;
    setAdding(true);
    try {
      await apiPost("/api/byok", clerkId, {
        provider: form.provider,
        label: form.label,
        apiKey: form.apiKey,
        baseUrl: form.baseUrl || undefined,
        model: form.model || undefined,
      });
      setForm({ provider: "groq", label: "", apiKey: "", baseUrl: "", model: "" });
      setShowForm(false);
      await loadKeys();
    } catch {
    } finally {
      setAdding(false);
    }
  }

  async function deleteKey(id: string) {
    await apiDelete(`/api/byok/${id}`, clerkId);
    setKeys((prev) => prev.filter((k) => k.id !== id));
  }

  async function toggleKey(id: string) {
    const data = await apiPatch<{ active: boolean }>(`/api/byok/${id}/toggle`, clerkId);
    setKeys((prev) => prev.map((k) => (k.id === id ? { ...k, active: data.active } : k)));
  }

  const selectedProvider = PROVIDERS.find((p) => p.value === form.provider);

  return (
    <div className="rounded-2xl border border-border bg-[#0f0f0f] overflow-hidden">
      <div className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center">
            <Key className="w-4 h-4 text-accent" />
          </div>
          <div>
            <h2 className="font-semibold text-sm">BYOK Manager</h2>
            <p className="text-muted text-xs">Bring your own API keys</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-lg text-accent text-xs hover:bg-accent/20 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add key
        </button>
      </div>

      <div className="px-6 py-4 space-y-3">
        {/* Add Key Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 rounded-xl border border-accent/20 bg-accent/5 space-y-3 mb-4">
                <p className="text-xs font-medium text-accent">New API endpoint</p>

                {/* Provider selector */}
                <div className="relative">
                  <select
                    value={form.provider}
                    onChange={(e) => setForm((f) => ({ ...f, provider: e.target.value }))}
                    className="w-full bg-[#141414] border border-border rounded-lg px-3 py-2 text-sm text-fg focus:outline-none focus:border-accent/50 appearance-none"
                  >
                    {PROVIDERS.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-muted pointer-events-none" />
                </div>

                <input
                  value={form.label}
                  onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                  placeholder="Label (e.g. My Groq Key)"
                  className="w-full bg-[#141414] border border-border rounded-lg px-3 py-2 text-sm text-fg placeholder:text-muted focus:outline-none focus:border-accent/50"
                />

                <input
                  type="password"
                  value={form.apiKey}
                  onChange={(e) => setForm((f) => ({ ...f, apiKey: e.target.value }))}
                  placeholder={selectedProvider?.placeholder ?? "API key"}
                  className="w-full bg-[#141414] border border-border rounded-lg px-3 py-2 text-sm text-fg placeholder:text-muted focus:outline-none focus:border-accent/50 font-mono"
                />

                {form.provider === "custom" && (
                  <input
                    value={form.baseUrl}
                    onChange={(e) => setForm((f) => ({ ...f, baseUrl: e.target.value }))}
                    placeholder="Base URL (https://...)"
                    className="w-full bg-[#141414] border border-border rounded-lg px-3 py-2 text-sm text-fg placeholder:text-muted focus:outline-none focus:border-accent/50"
                  />
                )}

                <input
                  value={form.model}
                  onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
                  placeholder="Model (optional, e.g. llama-3.3-70b-versatile)"
                  className="w-full bg-[#141414] border border-border rounded-lg px-3 py-2 text-sm text-fg placeholder:text-muted focus:outline-none focus:border-accent/50"
                />

                <div className="flex gap-2">
                  <button
                    onClick={addKey}
                    disabled={adding || !form.label || !form.apiKey}
                    className="flex-1 py-2 bg-accent text-bg text-sm font-semibold rounded-lg hover:bg-accent/90 disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
                  >
                    {adding && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Save key
                  </button>
                  <button
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 border border-border rounded-lg text-sm text-muted hover:text-fg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Key List */}
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-5 h-5 text-muted animate-spin" />
          </div>
        ) : keys.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted text-sm">No API keys yet.</p>
            <p className="text-muted text-xs mt-1">Add a key or ask SORK to set one up via chat.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {keys.map((key) => (
              <motion.div
                key={key.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                  key.active ? "border-border bg-[#141414]" : "border-border/50 bg-[#0c0c0c] opacity-60"
                }`}
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: PROVIDER_COLORS[key.provider] ?? "#94a3b8" }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{key.label}</p>
                  <p className="text-xs text-muted">
                    {key.provider}{key.model ? ` · ${key.model}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleKey(key.id)}
                    className="p-1.5 rounded-lg hover:bg-border transition-colors text-muted hover:text-fg"
                  >
                    {key.active ? (
                      <ToggleRight className="w-4 h-4 text-success" />
                    ) : (
                      <ToggleLeft className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => deleteKey(key.id)}
                    className="p-1.5 rounded-lg hover:bg-danger/10 transition-colors text-muted hover:text-danger"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
