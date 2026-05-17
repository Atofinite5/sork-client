"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Trash2, Plus, Check, Loader2, ShieldCheck } from "lucide-react";
import { apiGet, apiPost, apiDelete } from "@/lib/api";

interface LicenseKey {
  id: string;
  name: string;
  keyPrefix: string;
  lastUsedAt?: string;
  createdAt: string;
  expiresAt?: string;
}

export default function KeyManager({ clerkId }: { clerkId: string }) {
  const [keys, setKeys] = useState<LicenseKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [issuing, setIssuing] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadKeys();
  }, []);

  async function loadKeys() {
    try {
      const data = await apiGet<{ keys: LicenseKey[] }>("/api/license/list", clerkId);
      setKeys(data.keys);
    } catch {
    } finally {
      setLoading(false);
    }
  }

  async function issueKey() {
    setIssuing(true);
    try {
      const data = await apiPost<{ key: string; prefix: string; name: string }>(
        "/api/license/issue",
        clerkId,
        { name: "Default Key" }
      );
      setNewKey(data.key);
      await loadKeys();
    } catch {
    } finally {
      setIssuing(false);
    }
  }

  async function revokeKey(id: string) {
    await apiDelete(`/api/license/revoke/${id}`, clerkId);
    setKeys((prev) => prev.filter((k) => k.id !== id));
  }

  async function copyKey() {
    if (!newKey) return;
    await navigator.clipboard.writeText(newKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-2xl border border-border bg-[#0f0f0f] overflow-hidden">
      <div className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-accent" />
          </div>
          <div>
            <h2 className="font-semibold text-sm">License Keys</h2>
            <p className="text-muted text-xs">For SORK CLI authentication</p>
          </div>
        </div>
        <button
          onClick={issueKey}
          disabled={issuing}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-lg text-accent text-xs hover:bg-accent/20 transition-colors disabled:opacity-40"
        >
          {issuing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          Issue key
        </button>
      </div>

      <div className="px-6 py-4 space-y-3">
        {/* New key reveal */}
        <AnimatePresence>
          {newKey && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="p-4 rounded-xl border border-success/30 bg-success/5"
            >
              <p className="text-xs text-success font-medium mb-2">
                New key issued — copy now, won't show again
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs font-mono text-fg bg-[#141414] border border-border rounded-lg px-3 py-2 truncate">
                  {newKey}
                </code>
                <button
                  onClick={copyKey}
                  className="p-2 rounded-lg border border-border hover:border-accent/40 transition-colors"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-success" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-muted" />
                  )}
                </button>
              </div>
              <button
                onClick={() => setNewKey(null)}
                className="text-xs text-muted hover:text-fg mt-2 transition-colors"
              >
                I've saved it ✓
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-5 h-5 text-muted animate-spin" />
          </div>
        ) : keys.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted text-sm">No active keys.</p>
            <p className="text-muted text-xs mt-1">Issue one to start using SORK CLI.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {keys.map((key) => (
              <motion.div
                key={key.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 p-3 rounded-xl border border-border bg-[#141414]"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono text-accent">{key.keyPrefix}…</code>
                    <span className="text-xs text-muted">{key.name}</span>
                  </div>
                  <p className="text-xs text-muted mt-0.5">
                    {key.lastUsedAt
                      ? `Last used ${new Date(key.lastUsedAt).toLocaleDateString()}`
                      : "Never used"}
                  </p>
                </div>
                <button
                  onClick={() => revokeKey(key.id)}
                  className="p-1.5 rounded-lg hover:bg-danger/10 transition-colors text-muted hover:text-danger"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
