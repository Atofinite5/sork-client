"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Bot, User, Loader2, Paperclip, Globe, Settings2,
  FileCode, X, GitBranch, Github
} from "lucide-react";
import { apiPost, apiGet } from "@/lib/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  role: "user" | "assistant";
  content: string;
  byokIntent?: boolean;
  attachments?: AttachedFile[];
}

interface AttachedFile {
  name: string;
  content: string;
  type: "file" | "folder";
  size: number;
}

interface ChatResponse {
  reply: string;
  sessionId: string;
  byokIntent?: boolean;
  modelSwitched?: boolean;
  activeModel?: string;
}

interface Props {
  clerkId: string;
  preloadedFile?: { name: string; content: string };
}

const MAX_FILE_SIZE = 100_000;
const SUPPORTED_EXTS = [".ts",".tsx",".js",".jsx",".py",".go",".rs",".java",".cs",".rb",".php",".vue",".svelte",".json",".yaml",".yml",".sh",".md",".env",".toml",".sql"];

const WELCOME = `Hey! I'm **SORK**, your advanced security engineer. Here's what's available:

- **Scan code** — attach a file or paste code to run the full pipeline
- **Fix & verify** — I generate a minimal patch, then confirm every issue is resolved
- **BYOK setup** — say *"add my Groq key"* or *"connect Claude"* to wire up your API
- **Switch model** — say *"use llama-3.1-8b"* or *"switch to mixtral"*
- **VS Code** — run \`sork hook vscode\` to send files straight from your editor

What would you like to do?`;

export default function ChatSection({ clerkId, preloadedFile }: Props) {
  const [messages, setMessages] = useState<Message[]>([{
    role: "assistant",
    content: preloadedFile
      ? `File received: \`@${preloadedFile.name}\` **(${(preloadedFile.content.length / 1024).toFixed(1)} KB)**\n\nReady to scan. Hit **Send** to run Nemotron → Triage → Fix → Verify.`
      : WELCOME,
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>();
  const [activeModel, setActiveModel] = useState("llama-3.3-70b-versatile");
  const [attachments, setAttachments] = useState<AttachedFile[]>(() =>
    preloadedFile ? [{ name: preloadedFile.name, content: preloadedFile.content, type: "file", size: preloadedFile.content.length }] : []
  );
  const [dragging, setDragging] = useState(false);
  const [repoPickerOpen, setRepoPickerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [repos, setRepos] = useState<{ fullName: string; language: string | null }[]>([]);
  const [reposLoading, setReposLoading] = useState(false);
  const [ghConnected, setGhConnected] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /* Repo scan flow */
  async function openRepoPicker() {
    setRepoPickerOpen(true);
    if (repos.length > 0) return;
    setReposLoading(true);
    try {
      const status = await apiGet<{ connected: boolean }>("/api/github/status", clerkId);
      setGhConnected(status.connected);
      if (status.connected) {
        const data = await apiGet<{ repos: { fullName: string; language: string | null }[] }>("/api/github/repos", clerkId);
        setRepos(data.repos);
      }
    } catch { setGhConnected(false); }
    setReposLoading(false);
  }

  async function scanRepo(fullName: string) {
    setRepoPickerOpen(false);
    const [owner, repo] = fullName.split("/");
    setMessages(prev => [...prev, { role: "user", content: `Scan repository **${fullName}**` }]);
    setLoading(true);
    try {
      const res = await apiPost<{
        ok: boolean; filesScanned: number; totalFiles: number;
        findings: { filePath: string; language: string; code: string; issues: { severity: string; line: number; cwe: string; title: string; description: string; fix: string }[] }[];
        stats: { critical: number; high: number; medium: number; low: number; total: number };
        summary: string;
      }>(`/api/github/repos/${owner}/${repo}/scan`, clerkId, {});

      const sevDot = (s: string) => s === "critical" ? "🔴" : s === "high" ? "🟠" : s === "medium" ? "🟡" : "🟢";

      let reply = `## 🔍 Scan Report — \`${fullName}\`\n\n`;
      reply += `**${res.summary}**\n\n`;
      reply += `Files scanned: **${res.filesScanned}** of ${res.totalFiles}\n\n`;
      reply += `### Findings\n`;
      reply += `| Severity | Count |\n|---|---|\n`;
      reply += `| 🔴 Critical | ${res.stats.critical} |\n`;
      reply += `| 🟠 High | ${res.stats.high} |\n`;
      reply += `| 🟡 Medium | ${res.stats.medium} |\n`;
      reply += `| 🟢 Low | ${res.stats.low} |\n\n`;

      if (res.findings.length > 0) {
        reply += `### Top issues with code\n\n`;
        for (const f of res.findings.slice(0, 5)) {
          for (const issue of f.issues.slice(0, 2)) {
            reply += `${sevDot(issue.severity)} **${issue.title}** — \`${f.filePath}:${issue.line}\`\n`;
            reply += `> ${issue.description}\n\n`;
            // Show offending code with line highlight
            const lines = f.code.split("\n");
            const start = Math.max(0, issue.line - 3);
            const end   = Math.min(lines.length, issue.line + 2);
            reply += "```" + f.language + "\n";
            for (let i = start; i < end; i++) {
              const marker = (i + 1) === issue.line ? ">>> " : "    ";
              reply += `${marker}${String(i + 1).padStart(3)} | ${lines[i] ?? ""}\n`;
            }
            reply += "```\n";
            reply += `💡 **Fix:** ${issue.fix}\n\n---\n\n`;
          }
        }
      } else {
        reply += `✓ No issues detected — codebase is clean.\n`;
      }

      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setMessages(prev => [...prev, { role: "assistant", content: `❌ Scan failed: ${msg}\n\nMake sure GitHub is connected in the **Repositories** tab.` }]);
    }
    setLoading(false);
  }

  function connectGitHub() {
    apiGet<{ url: string }>("/api/github/oauth/init", clerkId).then(r => window.location.href = r.url).catch(() => alert("GitHub OAuth not configured"));
  }

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const readFile = (file: File): Promise<AttachedFile> =>
    new Promise((resolve, reject) => {
      if (file.size > MAX_FILE_SIZE) { reject(new Error(`${file.name} too large`)); return; }
      const reader = new FileReader();
      reader.onload = (e) => resolve({ name: file.name, content: e.target?.result as string, type: "file", size: file.size });
      reader.onerror = reject;
      reader.readAsText(file);
    });

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const arr = Array.from(files).filter(f => SUPPORTED_EXTS.includes("." + f.name.split(".").pop()?.toLowerCase()));
    const results = await Promise.allSettled(arr.map(readFile));
    const loaded: AttachedFile[] = results.filter(r => r.status === "fulfilled").map(r => (r as PromiseFulfilledResult<AttachedFile>).value);
    setAttachments(prev => [...prev, ...loaded]);
    const mentions = loaded.map(f => `@${f.name}`).join(" ");
    setInput(prev => (prev ? `${prev} ${mentions}` : mentions).trim() + " ");
    textareaRef.current?.focus();
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  async function sendMessage() {
    const msg = input.trim();
    if (!msg || loading) return;
    setInput("");
    const cur = [...attachments];
    setAttachments([]);
    setMessages(prev => [...prev, { role: "user", content: msg, attachments: cur }]);
    setLoading(true);
    try {
      const fileContext = cur.length > 0
        ? "\n\nAttached files:\n" + cur.map(f => `\`\`\`${f.name}\n${f.content.slice(0, 8000)}\n\`\`\``).join("\n")
        : "";
      const res = await apiPost<ChatResponse>("/api/chat", clerkId, {
        message: msg + fileContext,
        sessionId,
        hasAttachments: cur.length > 0,
        attachedFiles: cur.map(f => ({ name: f.name, size: f.size })),
      });
      setSessionId(res.sessionId);
      if (res.activeModel) setActiveModel(res.activeModel);
      setMessages(prev => [...prev, { role: "assistant", content: res.reply, byokIntent: res.byokIntent }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setMessages(prev => [...prev, { role: "assistant", content: `Error: ${msg}. Check your connection and try again.` }]);
    } finally { setLoading(false); }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  void activeModel;

  return (
    <div
      style={{
        background: "#101112",
        border: `1px solid ${dragging ? "#5E6BFF" : "#1B1C1E"}`,
        borderRadius: 4,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        minHeight: 480,
        transition: "border-color 0.15s ease",
      }}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
    >
      {/* Header */}
      <div
        style={{
          borderBottom: "1px solid #1B1C1E",
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: "#0e0e0f",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 4,
            backgroundColor: "#5E6BFF18",
            border: "1px solid #5E6BFF30",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Bot style={{ width: 18, height: 18, color: "#5E6BFF" }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#e5e2e3",
              fontFamily: "'Manrope', sans-serif",
              letterSpacing: "-0.04em",
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            SORK Cloud
          </p>
          <p style={{ fontSize: 11, color: "#9A9DA3", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            Security Pipeline&nbsp;•&nbsp;
            <span style={{ color: "#92f1ff" }}>sork.ai handles everything</span>
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <span style={{ fontSize: 12, color: "#9A9DA3", opacity: 0.5 }} className="hidden sm:block">drag files here</span>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span
              style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#92f1ff", display: "inline-block" }}
              className="animate-pulse"
            />
            <span style={{ fontSize: 11, color: "#9A9DA3" }}>Live</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
          minHeight: 300,
          maxHeight: 400,
        }}
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                display: "flex",
                gap: 12,
                flexDirection: msg.role === "user" ? "row-reverse" : "row",
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 2,
                  border: msg.role === "assistant" ? "1px solid #5E6BFF30" : "1px solid #1B1C1E",
                  background: msg.role === "assistant" ? "#5E6BFF18" : "#1B1C1E",
                }}
              >
                {msg.role === "assistant"
                  ? <Bot style={{ width: 14, height: 14, color: "#5E6BFF" }} />
                  : <User style={{ width: 14, height: 14, color: "#9A9DA3" }} />}
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  maxWidth: "82%",
                  alignItems: msg.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                {/* File chips */}
                {msg.attachments && msg.attachments.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {msg.attachments.map(a => (
                      <span
                        key={a.name}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          padding: "2px 8px",
                          backgroundColor: "#5E6BFF18",
                          border: "1px solid #5E6BFF30",
                          borderRadius: 999,
                          fontSize: 11,
                          color: "#bec2ff",
                        }}
                      >
                        <FileCode style={{ width: 12, height: 12 }} />@{a.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Bubble */}
                <div
                  style={{
                    borderRadius: 4,
                    padding: "12px 16px",
                    fontSize: 13,
                    background: msg.role === "assistant" ? "#0e0e0f" : "#1B1C1E",
                    border: msg.role === "assistant" ? "1px solid #232426" : "1px solid #5E6BFF20",
                    color: "#e5e2e3",
                  }}
                >
                  {msg.role === "assistant" ? (
                    <div className="sork-chat-prose">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => <p style={{ marginBottom: 10, lineHeight: 1.7, margin: "0 0 10px 0" }}>{children}</p>,
                          ul: ({ children }) => <ul style={{ margin: "8px 0", display: "flex", flexDirection: "column", gap: 6 }}>{children}</ul>,
                          ol: ({ children }) => <ol style={{ margin: "8px 0", display: "flex", flexDirection: "column", gap: 6, paddingLeft: 20, listStyleType: "decimal" }}>{children}</ol>,
                          li: ({ children }) => (
                            <li style={{ display: "flex", gap: 8, lineHeight: 1.65 }}>
                              <span style={{ color: "#5E6BFF", marginTop: 3, flexShrink: 0, fontSize: 10 }}>●</span>
                              <span style={{ flex: 1 }}>{children}</span>
                            </li>
                          ),
                          strong: ({ children }) => <strong style={{ fontWeight: 600, color: "#ffffff" }}>{children}</strong>,
                          em: ({ children }) => <em style={{ fontStyle: "italic", color: "#c6c5d8" }}>{children}</em>,
                          code: ({ children, className }) =>
                            className ? (
                              <pre
                                style={{
                                  background: "#070708",
                                  border: "1px solid #232426",
                                  borderRadius: 4,
                                  padding: 14,
                                  overflowX: "auto",
                                  margin: "10px 0",
                                  fontSize: 12,
                                }}
                              >
                                <code style={{ color: "#92f1ff", fontFamily: "'Inter', monospace", lineHeight: 1.6 }}>{children}</code>
                              </pre>
                            ) : (
                              <code
                                style={{
                                  background: "#1B1C1E",
                                  border: "1px solid #232426",
                                  borderRadius: 2,
                                  padding: "1px 6px",
                                  color: "#bec2ff",
                                  fontFamily: "'Inter', monospace",
                                  fontSize: "0.8em",
                                }}
                              >
                                {children}
                              </code>
                            ),
                          blockquote: ({ children }) => (
                            <blockquote
                              style={{
                                borderLeft: "2px solid #5E6BFF40",
                                paddingLeft: 12,
                                margin: "8px 0",
                                color: "#9A9DA3",
                                fontStyle: "italic",
                              }}
                            >
                              {children}
                            </blockquote>
                          ),
                          h3: ({ children }) => (
                            <h3
                              style={{
                                fontWeight: 600,
                                color: "#ffffff",
                                fontSize: 13,
                                marginTop: 12,
                                marginBottom: 4,
                                fontFamily: "'Manrope', sans-serif",
                                letterSpacing: "-0.04em",
                              }}
                            >
                              {children}
                            </h3>
                          ),
                        }}
                      >
                        {msg.content.replace(/\n\nAttached files:[\s\S]*/m, "")}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p style={{ lineHeight: 1.65, fontSize: 13, margin: 0 }}>
                      {msg.content.replace(/\n\nAttached files:[\s\S]*/m, "")}
                    </p>
                  )}
                  {msg.byokIntent && (
                    <div
                      style={{
                        marginTop: 10,
                        paddingTop: 10,
                        borderTop: "1px solid #232426",
                        fontSize: 11,
                        color: "#bec2ff",
                      }}
                    >
                      → Use the <strong>BYOK Manager</strong> below to add your API key
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: "flex", gap: 12, alignItems: "center" }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: "1px solid #5E6BFF30",
                backgroundColor: "#5E6BFF18",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Bot style={{ width: 14, height: 14, color: "#5E6BFF" }} />
            </div>
            <div
              style={{
                background: "#0e0e0f",
                border: "1px solid #232426",
                borderRadius: 4,
                padding: "10px 16px",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div style={{ display: "flex", gap: 4 }}>
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#5E6BFF" }}
                    animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
              <span style={{ fontSize: 12, color: "#9A9DA3" }}>SORK is analyzing...</span>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Attachment chips */}
      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              padding: "8px 20px",
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              borderTop: "1px solid #1B1C1E",
            }}
          >
            {attachments.map(a => (
              <motion.span
                key={a.name}
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 10px",
                  backgroundColor: "#5E6BFF18",
                  border: "1px solid #5E6BFF30",
                  borderRadius: 999,
                  fontSize: 11,
                  color: "#bec2ff",
                }}
              >
                <FileCode style={{ width: 12, height: 12 }} />
                @{a.name}
                <span style={{ color: "#5E6BFF60", fontFamily: "'Inter', monospace" }}>{(a.size / 1024).toFixed(1)}KB</span>
                <button
                  onClick={() => setAttachments(p => p.filter(x => x.name !== a.name))}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#ffb4ab", display: "flex", alignItems: "center", marginLeft: 2 }}
                >
                  <X style={{ width: 10, height: 10 }} />
                </button>
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input bar */}
      <div
        style={{
          borderTop: "1px solid #1B1C1E",
          background: "#0e0e0f",
          padding: "12px 16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
          {/* Left icon buttons */}
          <div style={{ display: "flex", gap: 4, flexShrink: 0, paddingBottom: 4 }}>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: 32,
                height: 32,
                borderRadius: 2,
                border: "1px solid #1B1C1E",
                background: "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#9A9DA3",
              }}
              title="Attach file"
            >
              <Paperclip style={{ width: 14, height: 14 }} />
            </button>
            <button
              onClick={openRepoPicker}
              style={{
                width: 32, height: 32, borderRadius: 2,
                border: "1px solid #1B1C1E", background: "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "#9A9DA3", transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.color = "#bec2ff"; e.currentTarget.style.borderColor = "#454655"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "#9A9DA3"; e.currentTarget.style.borderColor = "#1B1C1E"; }}
              title="Scan a GitHub repository"
            >
              <Github style={{ width: 14, height: 14 }} />
            </button>
            <button
              onClick={() => setSettingsOpen(v => !v)}
              style={{
                width: 32, height: 32, borderRadius: 2,
                border: `1px solid ${settingsOpen ? "#5E6BFF" : "#1B1C1E"}`,
                background: settingsOpen ? "rgba(94,107,255,0.08)" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: settingsOpen ? "#bec2ff" : "#9A9DA3", transition: "all 0.15s",
              }}
              title="Model & settings"
            >
              <Settings2 style={{ width: 14, height: 14 }} />
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={SUPPORTED_EXTS.join(",")}
            style={{ display: "none" }}
            onChange={e => e.target.files && handleFiles(e.target.files)}
          />

          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={attachments.length > 0 ? "Ask SORK to scan the attached files..." : "Ask SORK • search project files..."}
            rows={1}
            style={{
              flex: 1,
              background: "#0a0a0b",
              border: "1px solid #1B1C1E",
              borderRadius: 2,
              padding: "8px 12px",
              fontSize: 13,
              color: "#e5e2e3",
              outline: "none",
              resize: "none",
              fontFamily: "inherit",
            }}
          />

          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            style={{
              width: 36,
              height: 36,
              borderRadius: 2,
              background: "#5E6BFF",
              border: "none",
              cursor: loading || !input.trim() ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              alignSelf: "flex-end",
              opacity: loading || !input.trim() ? 0.3 : 1,
              transition: "opacity 0.15s ease",
            }}
          >
            <Send style={{ width: 14, height: 14, color: "#070708" }} />
          </button>
        </div>

        {/* Footer tip */}
        <p
          style={{
            fontSize: 11,
            color: "#9A9DA3",
            opacity: 0.5,
            textAlign: "center",
            marginTop: 10,
            lineHeight: 1.6,
          }}
        >
          Tip: Run{" "}
          <code
            style={{
              background: "#1B1C1E",
              border: "1px solid #232426",
              borderRadius: 2,
              padding: "0 4px",
              color: "#bec2ff",
              fontFamily: "'Inter', monospace",
            }}
          >
            sork send ./file.ts
          </code>
          {" "}from your terminal to send any file directly into this chat.
        </p>
      </div>

      {/* ── Settings popover ── */}
      {settingsOpen && (
        <div style={{
          position: "absolute", bottom: 60, right: 90, width: 280,
          background: "#0e0e0f", border: "1px solid #232426", borderRadius: 4,
          padding: 14, zIndex: 100, boxShadow: "0 12px 32px rgba(0,0,0,0.7)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 13, color: "#e5e2e3" }}>Settings</span>
            <button onClick={() => setSettingsOpen(false)} style={{ background: "transparent", border: "none", color: "#9A9DA3", cursor: "pointer", fontSize: 16 }}>×</button>
          </div>
          <div style={{ fontFamily: "'Inter', monospace", fontSize: 10, color: "#9A9DA3", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Active model</div>
          <div style={{ fontFamily: "'Inter', monospace", fontSize: 12, color: "#50d8e9", marginBottom: 14, padding: "6px 10px", background: "rgba(80,216,233,0.06)", border: "1px solid rgba(80,216,233,0.2)", borderRadius: 2 }}>
            {activeModel}
          </div>
          <div style={{ fontFamily: "'Inter', monospace", fontSize: 10, color: "#9A9DA3", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Switch model</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {[
              { id: "llama-3.3-70b-versatile", label: "llama-3.3-70b (best)" },
              { id: "llama-3.1-8b-instant",   label: "llama-3.1-8b (fastest)" },
              { id: "mixtral-8x7b-32768",      label: "mixtral-8x7b" },
            ].map(m => (
              <button key={m.id}
                onClick={() => { setInput(`use ${m.id}`); setSettingsOpen(false); textareaRef.current?.focus(); }}
                style={{ textAlign: "left", padding: "6px 10px", background: m.id === activeModel ? "#1c1b1d" : "transparent",
                  border: `1px solid ${m.id === activeModel ? "#454655" : "#1B1C1E"}`, borderRadius: 2,
                  color: m.id === activeModel ? "#bec2ff" : "#c6c5d8", fontSize: 11,
                  fontFamily: "'Inter', monospace", cursor: "pointer" }}>
                {m.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Repo picker modal ── */}
      {repoPickerOpen && (
        <div onClick={() => setRepoPickerOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, backdropFilter: "blur(4px)" }}>
          <div onClick={e => e.stopPropagation()}
            style={{ width: 480, maxHeight: "70vh", background: "#0e0e0f", border: "1px solid #232426", borderRadius: 4, display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "14px 16px", borderBottom: "1px solid #1B1C1E", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Github style={{ width: 16, height: 16, color: "#bec2ff" }} />
                <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 14, color: "#e5e2e3" }}>Scan a Repository</span>
              </div>
              <button onClick={() => setRepoPickerOpen(false)} style={{ background: "transparent", border: "none", color: "#9A9DA3", cursor: "pointer", fontSize: 18 }}>×</button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
              {reposLoading && <div style={{ padding: 20, textAlign: "center", fontFamily: "'Inter', monospace", fontSize: 12, color: "#9A9DA3" }}>Loading repositories…</div>}
              {!reposLoading && !ghConnected && (
                <div style={{ padding: 28, textAlign: "center" }}>
                  <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 14, color: "#e5e2e3", marginBottom: 8 }}>GitHub not connected</div>
                  <div style={{ fontFamily: "'Inter', monospace", fontSize: 11, color: "#9A9DA3", marginBottom: 16 }}>Connect GitHub to scan any of your repositories.</div>
                  <button onClick={connectGitHub}
                    style={{ background: "#fff", color: "#000", border: "none", padding: "8px 20px", borderRadius: 2, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
                    Connect GitHub
                  </button>
                </div>
              )}
              {!reposLoading && ghConnected && repos.length === 0 && (
                <div style={{ padding: 20, textAlign: "center", fontFamily: "'Inter', monospace", fontSize: 12, color: "#9A9DA3" }}>No repositories found</div>
              )}
              {!reposLoading && ghConnected && repos.map(r => (
                <button key={r.fullName} onClick={() => scanRepo(r.fullName)}
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: "transparent", border: "1px solid #1B1C1E", borderRadius: 2, marginBottom: 4, cursor: "pointer", color: "#e5e2e3", fontFamily: "'Inter', monospace", fontSize: 12, transition: "all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#5E6BFF"; e.currentTarget.style.background = "rgba(94,107,255,0.06)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#1B1C1E"; e.currentTarget.style.background = "transparent"; }}>
                  <span>{r.fullName}</span>
                  <span style={{ fontSize: 10, color: "#9A9DA3" }}>{r.language ?? ""}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
