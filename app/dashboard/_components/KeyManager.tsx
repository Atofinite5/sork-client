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
    <div
      style={{
        background: "#101112",
        border: "1px solid #1B1C1E",
        borderRadius: 4,
        overflow: "hidden",
      }}
    >
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
              backgroundColor: "#5E6BFF18",
              border: "1px solid #5E6BFF30",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ShieldCheck style={{ width: 16, height: 16, color: "#5E6BFF" }} />
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
              License Keys
            </h2>
            <p style={{ fontSize: 11, color: "#9A9DA3", margin: 0, marginTop: 2 }}>For SORK CLI authentication</p>
          </div>
        </div>
        <button
          onClick={issueKey}
          disabled={issuing}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 16px",
            background: "#5E6BFF",
            border: "none",
            borderRadius: 2,
            color: "#F0F1F2",
            fontSize: 12,
            fontWeight: 600,
            cursor: issuing ? "not-allowed" : "pointer",
            opacity: issuing ? 0.4 : 1,
          }}
        >
          {issuing ? <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" /> : <Plus style={{ width: 14, height: 14 }} />}
          Issue key
        </button>
      </div>

      <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
        {/* New key reveal */}
        <AnimatePresence>
          {newKey && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              style={{
                padding: 16,
                borderRadius: 4,
                border: "1px solid #92f1ff30",
                background: "#92f1ff08",
              }}
            >
              <p style={{ fontSize: 12, color: "#92f1ff", fontWeight: 500, marginBottom: 8, margin: "0 0 8px 0" }}>
                New key issued — copy now, won&apos;t show again
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <code
                  style={{
                    flex: 1,
                    fontSize: 12,
                    fontFamily: "'Inter', monospace",
                    color: "#e5e2e3",
                    background: "#0a0a0b",
                    border: "1px solid #1B1C1E",
                    borderRadius: 2,
                    padding: "8px 12px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    display: "block",
                  }}
                >
                  {newKey}
                </code>
                <button
                  onClick={copyKey}
                  style={{
                    padding: 8,
                    borderRadius: 2,
                    border: "1px solid #1B1C1E",
                    background: "transparent",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {copied ? (
                    <Check style={{ width: 14, height: 14, color: "#92f1ff" }} />
                  ) : (
                    <Copy style={{ width: 14, height: 14, color: "#9A9DA3" }} />
                  )}
                </button>
              </div>
              <button
                onClick={() => setNewKey(null)}
                style={{
                  fontSize: 12,
                  color: "#9A9DA3",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  marginTop: 8,
                  padding: 0,
                }}
              >
                I&apos;ve saved it ✓
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "24px 0" }}>
            <Loader2 style={{ width: 20, height: 20, color: "#9A9DA3" }} className="animate-spin" />
          </div>
        ) : keys.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <p style={{ color: "#9A9DA3", fontSize: 13, margin: 0 }}>No active keys.</p>
            <p style={{ color: "#9A9DA3", fontSize: 12, marginTop: 4 }}>Issue one to start using SORK CLI.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {keys.map((key) => (
              <motion.div
                key={key.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: 12,
                  borderRadius: 4,
                  border: "1px solid #1B1C1E",
                  background: "#0e0e0f",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <code style={{ fontSize: 12, fontFamily: "'Inter', monospace", color: "#5E6BFF" }}>{key.keyPrefix}…</code>
                    <span style={{ fontSize: 12, color: "#9A9DA3" }}>{key.name}</span>
                  </div>
                  <p style={{ fontSize: 12, color: "#9A9DA3", marginTop: 2, margin: "2px 0 0 0" }}>
                    {key.lastUsedAt
                      ? `Last used ${new Date(key.lastUsedAt).toLocaleDateString()}`
                      : "Never used"}
                  </p>
                </div>
                <button
                  onClick={() => revokeKey(key.id)}
                  style={{
                    padding: 6,
                    borderRadius: 2,
                    background: "transparent",
                    border: "1px solid rgba(255,180,171,0.3)",
                    cursor: "pointer",
                    color: "#ffb4ab",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Trash2 style={{ width: 14, height: 14 }} />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
