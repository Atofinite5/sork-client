"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Bot, User, Paperclip, Globe, Settings2,
  FileCode, X, Github, Shield, Zap, Brain, CheckCircle2,
  AlertTriangle, Copy, Check,
} from "lucide-react";
import { apiPost, apiGet } from "@/lib/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeDiffEditor from "@/components/CodeDiffEditor";

interface Message {
  role: "user" | "assistant";
  content: string;
  byokIntent?: boolean;
  attachments?: AttachedFile[];
  steps?: AgentStep[];
  fixProposal?: FixProposal;
  awaitingFixConfirmation?: boolean;
  intent?: string;
}

interface AttachedFile {
  name: string;
  content: string;
  type: "file" | "folder";
  size: number;
}

interface AgentStep {
  agent: string;
  tier: "fast" | "deep" | "embed";
  status: "running" | "done" | "skipped" | "error";
  durationMs?: number;
  detail?: string;
}

interface GeneratedTest {
  testCode: string;
  framework: string;
  description: string;
  coversIssues?: string[];
}

interface FixProposal {
  originalCode: string;
  fixedCode: string;
  changes: { issueId: string; title: string; original: string; patched: string; explanation: string }[];
  explanation: string;
  score: number;
  recommendation: "approve" | "rework" | "escalate";
  generatedTest?: GeneratedTest;
  category?: string;
  severity?: string;
}

interface ChatResponse {
  reply: string;
  sessionId: string;
  intent?: string;
  steps?: AgentStep[];
  fixProposal?: FixProposal;
  awaitingFixConfirmation?: boolean;
  ragContextUsed?: boolean;
  durationMs?: number;
}

interface Props {
  clerkId: string;
  preloadedFile?: { name: string; content: string };
}

const MAX_FILE_SIZE = 100_000;
const SUPPORTED_EXTS = [".ts",".tsx",".js",".jsx",".py",".go",".rs",".java",".cs",".rb",".php",".vue",".svelte",".json",".yaml",".yml",".sh",".md",".env",".toml",".sql"];

const WELCOME = `Hey! I'm **SORK** — your AI security engineer. Here's what I can do:

– **Scan code** — attach a file or paste code. I'll triage, find vulnerabilities, and show you exactly what's wrong
– **Fix automatically** — say *"fix it"* after a scan and I'll generate a verified security patch
– **Deep review** — I use multiple analysis tiers for thorough coverage
– **RAG memory** — I remember your past scans and conversations for better context

Attach a file or ask me anything.`;

const TIER_LABELS: Record<string, { label: string; icon: typeof Zap; color: string }> = {
  fast: { label: "Fast Analysis", icon: Zap, color: "#92f1ff" },
  deep: { label: "Deep Analysis", icon: Brain, color: "#bec2ff" },
  embed: { label: "Memory", icon: Shield, color: "#a8e6cf" },
};

const AGENT_LABELS: Record<string, string> = {
  "safety-gate": "Safety Check",
  "memory-retrieval": "Loading Context",
  "code-embed": "Storing Context",
  "triage": "Security Triage",
  "fix": "Generating Patch",
  "verify": "Verifying Fix",
  "chat": "Thinking",
};

export default function ChatSection({ clerkId, preloadedFile }: Props) {
  const [messages, setMessages] = useState<Message[]>([{
    role: "assistant",
    content: preloadedFile
      ? `File received: \`@${preloadedFile.name}\` **(${(preloadedFile.content.length / 1024).toFixed(1)} KB)**\n\nReady to scan. Hit **Send** to run the full security pipeline.`
      : WELCOME,
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>();
  const [attachments, setAttachments] = useState<AttachedFile[]>(() =>
    preloadedFile ? [{ name: preloadedFile.name, content: preloadedFile.content, type: "file", size: preloadedFile.content.length }] : []
  );
  const [dragging, setDragging] = useState(false);
  const [repoPickerOpen, setRepoPickerOpen] = useState(false);
  const [repos, setRepos] = useState<{ fullName: string; language: string | null }[]>([]);
  const [reposLoading, setReposLoading] = useState(false);
  const [ghConnected, setGhConnected] = useState(false);
  const [activeSteps, setActiveSteps] = useState<AgentStep[]>([]);
  const [pendingFixCode, setPendingFixCode] = useState<string | undefined>();
  const [pendingFixTriage, setPendingFixTriage] = useState<unknown | undefined>();
  const [copiedCode, setCopiedCode] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
      let reply = `## Scan Report — \`${fullName}\`\n\n**${res.summary}**\n\nFiles scanned: **${res.filesScanned}** of ${res.totalFiles}\n\n`;
      if (res.findings.length > 0) {
        reply += `### Top Issues\n\n`;
        for (const f of res.findings.slice(0, 5)) {
          for (const issue of f.issues.slice(0, 2)) {
            reply += `${sevDot(issue.severity)} **${issue.title}** — \`${f.filePath}:${issue.line}\`\n> ${issue.description}\n\n`;
          }
        }
      } else {
        reply += `✅ No issues detected — codebase is clean.\n`;
      }
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setMessages(prev => [...prev, { role: "assistant", content: `Error: ${msg}` }]);
    }
    setLoading(false);
  }

  function connectGitHub() {
    apiGet<{ url: string }>("/api/github/oauth/init", clerkId).then(r => window.location.href = r.url).catch(() => {});
  }

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, activeSteps]);

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
    const curFiles = [...attachments];
    setAttachments([]);
    setMessages(prev => [...prev, { role: "user", content: msg, attachments: curFiles }]);
    setLoading(true);
    setActiveSteps([]);

    try {
      const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
      const payload = {
        message: msg + (curFiles.length > 0
          ? "\n\nAttached files:\n" + curFiles.map(f => `\`\`\`${f.name}\n${f.content.slice(0, 8000)}\n\`\`\``).join("\n")
          : ""),
        sessionId,
        hasAttachments: curFiles.length > 0,
        attachedFiles: curFiles.map(f => ({ name: f.name, content: f.content.slice(0, 8000), size: f.size })),
        pendingFixCode,
        pendingFixTriage,
      };

      // Try streaming first
      const streamRes = await fetch(`${BASE}/api/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-clerk-user-id": clerkId },
        body: JSON.stringify(payload),
      });

      if (streamRes.ok && streamRes.headers.get("content-type")?.includes("text/event-stream")) {
        const reader = streamRes.body?.getReader();
        if (!reader) throw new Error("No stream reader");

        const decoder = new TextDecoder();
        let fullContent = "";
        let steps: AgentStep[] = [];
        let doneData: { intent?: string; fixProposal?: FixProposal; awaitingFixConfirmation?: boolean } = {};

        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (line.startsWith("data:")) {
              const raw = line.slice(5).trim();
              if (!raw) continue;
              try {
                const event = JSON.parse(raw);
                switch (event.type) {
                  case "session":
                    setSessionId(event.sessionId);
                    break;
                  case "step":
                    steps = [...steps, event];
                    setActiveSteps([...steps]);
                    break;
                  case "content":
                    fullContent += event.text;
                    setMessages(prev => {
                      const last = prev[prev.length - 1];
                      if (last?.role === "assistant" && last.intent === "__streaming__") {
                        return [...prev.slice(0, -1), { ...last, content: fullContent }];
                      }
                      return [...prev, { role: "assistant", content: fullContent, intent: "__streaming__" }];
                    });
                    break;
                  case "done":
                    doneData = event;
                    break;
                  case "error":
                    fullContent += `\n\nError: ${event.message}`;
                    break;
                }
              } catch { /* skip malformed SSE lines */ }
            }
          }
        }

        // Finalize the streamed message
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return [...prev.slice(0, -1), {
              ...last,
              content: fullContent,
              intent: doneData.intent,
              steps,
              fixProposal: doneData.fixProposal,
              awaitingFixConfirmation: doneData.awaitingFixConfirmation,
            }];
          }
          return prev;
        });

        if (doneData.awaitingFixConfirmation) {
          const codeFromFiles = curFiles.length > 0
            ? curFiles.map(f => f.content).join("\n\n")
            : (msg.match(/```(?:\w+)?\n?([\s\S]+?)```/)?.[1] ?? "");
          setPendingFixCode(codeFromFiles);
        } else {
          setPendingFixCode(undefined);
          setPendingFixTriage(undefined);
        }
      } else {
        // Fallback to non-streaming
        const res = await apiPost<ChatResponse>("/api/chat", clerkId, payload);
        setSessionId(res.sessionId);
        setMessages(prev => [...prev, {
          role: "assistant",
          content: res.reply,
          intent: res.intent,
          steps: res.steps,
          fixProposal: res.fixProposal,
          awaitingFixConfirmation: res.awaitingFixConfirmation,
        }]);

        if (res.awaitingFixConfirmation) {
          const codeFromFiles = curFiles.length > 0
            ? curFiles.map(f => f.content).join("\n\n")
            : (msg.match(/```(?:\w+)?\n?([\s\S]+?)```/)?.[1] ?? "");
          setPendingFixCode(codeFromFiles);
        } else {
          setPendingFixCode(undefined);
          setPendingFixTriage(undefined);
        }
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Something went wrong";
      setMessages(prev => [...prev, { role: "assistant", content: `Error: ${errMsg}. Check your connection and try again.` }]);
    } finally {
      setLoading(false);
      setActiveSteps([]);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  function copyFixedCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  }

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
      <div style={{ borderBottom: "1px solid #1B1C1E", padding: "12px 20px", display: "flex", alignItems: "center", gap: 12, background: "#0e0e0f" }}>
        <div style={{ width: 36, height: 36, borderRadius: 4, backgroundColor: "#5E6BFF18", border: "1px solid #5E6BFF30", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Bot style={{ width: 18, height: 18, color: "#5E6BFF" }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#e5e2e3", fontFamily: "'Manrope', sans-serif", letterSpacing: "-0.04em", margin: 0, lineHeight: 1.3 }}>
            SORK Engine
          </p>
          <p style={{ fontSize: 11, color: "#9A9DA3", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            Multi-Agent Security Pipeline&nbsp;•&nbsp;
            <span style={{ color: "#92f1ff" }}>RAG-enhanced</span>
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <span style={{ fontSize: 12, color: "#9A9DA3", opacity: 0.5 }} className="hidden sm:block">drag files here</span>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#92f1ff", display: "inline-block" }} className="animate-pulse" />
            <span style={{ fontSize: 11, color: "#9A9DA3" }}>Live</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: 20, minHeight: 300, maxHeight: 400 }}>
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
              style={{ display: "flex", gap: 12, flexDirection: msg.role === "user" ? "row-reverse" : "row" }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2,
                border: msg.role === "assistant" ? "1px solid #5E6BFF30" : "1px solid #1B1C1E",
                background: msg.role === "assistant" ? "#5E6BFF18" : "#1B1C1E",
              }}>
                {msg.role === "assistant" ? <Bot style={{ width: 14, height: 14, color: "#5E6BFF" }} /> : <User style={{ width: 14, height: 14, color: "#9A9DA3" }} />}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 4, maxWidth: "82%", alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
                {msg.attachments && msg.attachments.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {msg.attachments.map(a => (
                      <span key={a.name} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", backgroundColor: "#5E6BFF18", border: "1px solid #5E6BFF30", borderRadius: 999, fontSize: 11, color: "#bec2ff" }}>
                        <FileCode style={{ width: 12, height: 12 }} />@{a.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Agent steps */}
                {msg.steps && msg.steps.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 4 }}>
                    {msg.steps.map((step, si) => {
                      const tierInfo = TIER_LABELS[step.tier] ?? TIER_LABELS.fast;
                      const TierIcon = tierInfo.icon;
                      return (
                        <span key={si} style={{
                          display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px",
                          backgroundColor: step.status === "done" ? "rgba(168,230,207,0.08)" : step.status === "error" ? "rgba(255,180,171,0.08)" : "rgba(146,241,255,0.08)",
                          border: `1px solid ${step.status === "done" ? "rgba(168,230,207,0.2)" : step.status === "error" ? "rgba(255,180,171,0.2)" : "rgba(146,241,255,0.2)"}`,
                          borderRadius: 999, fontSize: 10, color: tierInfo.color,
                        }}>
                          <TierIcon style={{ width: 10, height: 10 }} />
                          {AGENT_LABELS[step.agent] ?? step.agent}
                          {step.durationMs != null && <span style={{ color: "#9A9DA3", fontSize: 9 }}>{step.durationMs}ms</span>}
                          {step.status === "done" && <CheckCircle2 style={{ width: 9, height: 9, color: "#a8e6cf" }} />}
                        </span>
                      );
                    })}
                  </div>
                )}

                <div style={{
                  borderRadius: 4, padding: "12px 16px", fontSize: 13,
                  background: msg.role === "assistant" ? "#0e0e0f" : "#1B1C1E",
                  border: msg.role === "assistant" ? "1px solid #232426" : "1px solid #5E6BFF20",
                  color: "#e5e2e3",
                }}>
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
                              <pre style={{ background: "#070708", border: "1px solid #232426", borderRadius: 4, padding: 14, overflowX: "auto", margin: "10px 0", fontSize: 12 }}>
                                <code style={{ color: "#92f1ff", fontFamily: "'Inter', monospace", lineHeight: 1.6 }}>{children}</code>
                              </pre>
                            ) : (
                              <code style={{ background: "#1B1C1E", border: "1px solid #232426", borderRadius: 2, padding: "1px 6px", color: "#bec2ff", fontFamily: "'Inter', monospace", fontSize: "0.8em" }}>
                                {children}
                              </code>
                            ),
                          blockquote: ({ children }) => (
                            <blockquote style={{ borderLeft: "2px solid #5E6BFF40", paddingLeft: 12, margin: "8px 0", color: "#9A9DA3", fontStyle: "italic" }}>
                              {children}
                            </blockquote>
                          ),
                          h2: ({ children }) => (
                            <h2 style={{ fontWeight: 700, color: "#ffffff", fontSize: 15, marginTop: 14, marginBottom: 6, fontFamily: "'Manrope', sans-serif", letterSpacing: "-0.04em" }}>
                              {children}
                            </h2>
                          ),
                          h3: ({ children }) => (
                            <h3 style={{ fontWeight: 600, color: "#ffffff", fontSize: 13, marginTop: 12, marginBottom: 4, fontFamily: "'Manrope', sans-serif", letterSpacing: "-0.04em" }}>
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

                  {/* Interactive diff editor for fix proposals */}
                  {msg.fixProposal && (
                    <CodeDiffEditor
                      originalCode={msg.fixProposal.originalCode}
                      fixedCode={msg.fixProposal.fixedCode}
                      changes={msg.fixProposal.changes}
                      explanation={msg.fixProposal.explanation}
                      score={msg.fixProposal.score}
                      recommendation={msg.fixProposal.recommendation}
                      generatedTest={msg.fixProposal.generatedTest}
                      category={msg.fixProposal.category}
                      severity={msg.fixProposal.severity}
                      clerkId={clerkId}
                      onApply={(code) => copyFixedCode(code)}
                    />
                  )}

                  {/* Awaiting fix confirmation */}
                  {msg.awaitingFixConfirmation && (
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #232426", display: "flex", gap: 8 }}>
                      <button
                        onClick={() => { setInput("fix it"); setTimeout(() => sendMessage(), 100); }}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px",
                          background: "#5E6BFF", border: "none", borderRadius: 2,
                          color: "#070708", fontSize: 11, fontWeight: 700, cursor: "pointer",
                        }}
                      >
                        <Zap style={{ width: 12, height: 12 }} /> SORK Fix
                      </button>
                      <button
                        onClick={() => { setInput("I'll fix it myself"); setTimeout(() => sendMessage(), 100); }}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px",
                          background: "transparent", border: "1px solid #232426", borderRadius: 2,
                          color: "#9A9DA3", fontSize: 11, cursor: "pointer",
                        }}
                      >
                        I'll fix it
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Active agent steps while loading */}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", border: "1px solid #5E6BFF30", backgroundColor: "#5E6BFF18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Bot style={{ width: 14, height: 14, color: "#5E6BFF" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {activeSteps.length > 0 ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {activeSteps.map((step, si) => {
                    const tierInfo = TIER_LABELS[step.tier] ?? TIER_LABELS.fast;
                    const TierIcon = tierInfo.icon;
                    return (
                      <motion.span key={si} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px",
                          backgroundColor: "rgba(94,107,255,0.06)", border: "1px solid rgba(94,107,255,0.15)",
                          borderRadius: 999, fontSize: 10, color: tierInfo.color,
                        }}>
                        <TierIcon style={{ width: 10, height: 10 }} />
                        {AGENT_LABELS[step.agent] ?? step.agent}
                        {step.durationMs != null && <span style={{ color: "#9A9DA3", fontSize: 9 }}>{step.durationMs}ms</span>}
                        {step.status === "done" && <CheckCircle2 style={{ width: 9, height: 9, color: "#a8e6cf" }} />}
                      </motion.span>
                    );
                  })}
                </div>
              ) : (
                <div style={{ background: "#0e0e0f", border: "1px solid #232426", borderRadius: 4, padding: "10px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[0, 1, 2].map(i => (
                      <motion.div key={i} style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#5E6BFF" }}
                        animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 12, color: "#9A9DA3" }}>SORK is analyzing...</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Attachment chips */}
      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            style={{ padding: "8px 20px", display: "flex", flexWrap: "wrap", gap: 6, borderTop: "1px solid #1B1C1E" }}>
            {attachments.map(a => (
              <motion.span key={a.name} initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", backgroundColor: "#5E6BFF18", border: "1px solid #5E6BFF30", borderRadius: 999, fontSize: 11, color: "#bec2ff" }}>
                <FileCode style={{ width: 12, height: 12 }} />@{a.name}
                <span style={{ color: "#5E6BFF60", fontFamily: "'Inter', monospace" }}>{(a.size / 1024).toFixed(1)}KB</span>
                <button onClick={() => setAttachments(p => p.filter(x => x.name !== a.name))}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#ffb4ab", display: "flex", alignItems: "center", marginLeft: 2 }}>
                  <X style={{ width: 10, height: 10 }} />
                </button>
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input bar */}
      <div style={{ borderTop: "1px solid #1B1C1E", background: "#0e0e0f", padding: "12px 16px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
          <div style={{ display: "flex", gap: 4, flexShrink: 0, paddingBottom: 4 }}>
            <button onClick={() => fileInputRef.current?.click()}
              style={{ width: 32, height: 32, borderRadius: 2, border: "1px solid #1B1C1E", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#9A9DA3" }}
              title="Attach file">
              <Paperclip style={{ width: 14, height: 14 }} />
            </button>
            <button onClick={openRepoPicker}
              style={{ width: 32, height: 32, borderRadius: 2, border: "1px solid #1B1C1E", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#9A9DA3", transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.color = "#bec2ff"; e.currentTarget.style.borderColor = "#454655"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "#9A9DA3"; e.currentTarget.style.borderColor = "#1B1C1E"; }}
              title="Scan a GitHub repository">
              <Github style={{ width: 14, height: 14 }} />
            </button>
          </div>

          <input ref={fileInputRef} type="file" multiple accept={SUPPORTED_EXTS.join(",")} style={{ display: "none" }}
            onChange={e => e.target.files && handleFiles(e.target.files)} />

          <textarea ref={textareaRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
            placeholder={attachments.length > 0 ? "Ask SORK to scan the attached files..." : "Ask SORK anything about security..."}
            rows={1}
            style={{ flex: 1, background: "#0a0a0b", border: "1px solid #1B1C1E", borderRadius: 2, padding: "8px 12px", fontSize: 13, color: "#e5e2e3", outline: "none", resize: "none", fontFamily: "inherit" }} />

          <button onClick={sendMessage} disabled={loading || !input.trim()}
            style={{
              width: 36, height: 36, borderRadius: 2, background: "#5E6BFF", border: "none",
              cursor: loading || !input.trim() ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, alignSelf: "flex-end",
              opacity: loading || !input.trim() ? 0.3 : 1, transition: "opacity 0.15s ease",
            }}>
            <Send style={{ width: 14, height: 14, color: "#070708" }} />
          </button>
        </div>

        <p style={{ fontSize: 11, color: "#9A9DA3", opacity: 0.5, textAlign: "center", marginTop: 10, lineHeight: 1.6 }}>
          SORK Engine — multi-tier security analysis with RAG memory
        </p>
      </div>

      {/* Repo picker modal */}
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
              <button onClick={() => setRepoPickerOpen(false)} style={{ background: "transparent", border: "none", color: "#9A9DA3", cursor: "pointer", fontSize: 18 }}>x</button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
              {reposLoading && <div style={{ padding: 20, textAlign: "center", fontFamily: "'Inter', monospace", fontSize: 12, color: "#9A9DA3" }}>Loading repositories...</div>}
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
