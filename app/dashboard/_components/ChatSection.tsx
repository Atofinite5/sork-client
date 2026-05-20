"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Bot, User, Loader2, Paperclip, Globe, Settings2,
  FileCode, X
} from "lucide-react";
import { apiPost } from "@/lib/api";
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
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Something went wrong. Please try again." }]);
    } finally { setLoading(false); }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }


  return (
    <div
      className={`rounded-2xl border overflow-hidden flex flex-col transition-colors ${dragging ? "border-accent" : "border-border"} bg-[#0d0d0d]`}
      style={{ minHeight: 480 }}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
    >
      {/* ── Header ── */}
      <div className="border-b border-border px-5 py-3 flex items-center gap-3 bg-[#0f0f0f]">
        <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
          <Bot className="w-4.5 h-4.5 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-tight">SORK Cloud</p>
          <p className="text-[11px] text-muted truncate">
            Security Pipeline&nbsp;•&nbsp;
            <span className="text-success">sork.ai handles everything</span>
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-muted hidden sm:block opacity-50">drag files here</span>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-[11px] text-muted">Live</span>
          </div>
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5" style={{ minHeight: 300, maxHeight: 400 }}>
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border mt-0.5 ${
                msg.role === "assistant" ? "border-accent/30 bg-accent/10" : "border-border bg-[#1e1e1e]"
              }`}>
                {msg.role === "assistant"
                  ? <Bot className="w-3.5 h-3.5 text-accent" />
                  : <User className="w-3.5 h-3.5 text-muted" />}
              </div>

              <div className={`flex flex-col gap-1 max-w-[82%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                {/* File chips */}
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {msg.attachments.map(a => (
                      <span key={a.name} className="inline-flex items-center gap-1 px-2 py-0.5 bg-accent/10 border border-accent/20 rounded-full text-[11px] text-accent">
                        <FileCode className="w-3 h-3" />@{a.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Bubble */}
                <div className={`rounded-2xl px-4 py-3 text-sm ${
                  msg.role === "assistant"
                    ? "bg-[#161616] border border-[#222] text-[#e8e8e8]"
                    : "bg-[#1e2a2e] border border-accent/15 text-fg"
                }`}>
                  {msg.role === "assistant" ? (
                    <div className="sork-chat-prose">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => <p className="mb-2.5 last:mb-0 leading-[1.7]">{children}</p>,
                          ul: ({ children }) => <ul className="my-2 space-y-1.5">{children}</ul>,
                          ol: ({ children }) => <ol className="my-2 space-y-1.5 list-decimal pl-5">{children}</ol>,
                          li: ({ children }) => (
                            <li className="flex gap-2 leading-[1.65]">
                              <span className="text-accent mt-[3px] flex-shrink-0 text-[10px]">●</span>
                              <span className="flex-1">{children}</span>
                            </li>
                          ),
                          strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                          em: ({ children }) => <em className="italic text-[#bbb]">{children}</em>,
                          code: ({ children, className }) =>
                            className ? (
                              <pre className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl p-3.5 overflow-x-auto my-2.5 text-[12px]">
                                <code className="text-[#a8d8a8] font-mono leading-relaxed">{children}</code>
                              </pre>
                            ) : (
                              <code className="bg-[#1a1a1a] border border-[#303030] rounded-md px-1.5 py-[2px] text-accent font-mono text-[0.8em]">{children}</code>
                            ),
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-2 border-accent/40 pl-3 my-2 text-muted italic">{children}</blockquote>
                          ),
                          h3: ({ children }) => <h3 className="font-semibold text-white text-sm mt-3 mb-1">{children}</h3>,
                        }}
                      >
                        {msg.content.replace(/\n\nAttached files:[\s\S]*/m, "")}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="leading-[1.65] text-sm">{msg.content.replace(/\n\nAttached files:[\s\S]*/m, "")}</p>
                  )}
                  {msg.byokIntent && (
                    <div className="mt-2.5 pt-2.5 border-t border-[#222] text-[11px] text-accent">
                      → Use the <strong>BYOK Manager</strong> below to add your API key
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 items-center">
            <div className="w-8 h-8 rounded-full border border-accent/30 bg-accent/10 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-accent" />
            </div>
            <div className="bg-[#161616] border border-[#222] rounded-2xl px-4 py-2.5 flex items-center gap-2.5">
              <div className="flex gap-1">
                {[0,1,2].map(i => (
                  <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-accent"
                    animate={{ opacity: [0.3,1,0.3], y: [0,-3,0] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
              <span className="text-xs text-muted">SORK is analyzing...</span>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Attachment chips ── */}
      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }} exit={{ opacity:0, height:0 }}
            className="px-5 pb-2 flex flex-wrap gap-1.5 border-t border-border/50 pt-2">
            {attachments.map(a => (
              <motion.span key={a.name} initial={{ scale:0.9 }} animate={{ scale:1 }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-accent/10 border border-accent/20 rounded-full text-[11px] text-accent">
                <FileCode className="w-3 h-3" />@{a.name}
                <span className="text-accent/40">{(a.size/1024).toFixed(1)}KB</span>
                <button onClick={() => setAttachments(p => p.filter(x => x.name !== a.name))} className="hover:text-danger ml-0.5">
                  <X className="w-2.5 h-2.5" />
                </button>
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Input bar ── */}
      <div className="border-t border-border bg-[#0f0f0f] px-4 py-3">
        <div className="flex items-end gap-2">
          {/* Left icon buttons */}
          <div className="flex gap-1 flex-shrink-0 pb-1">
            <button onClick={() => fileInputRef.current?.click()}
              className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:border-accent/40 hover:text-accent transition-colors text-muted"
              title="Attach file">
              <Paperclip className="w-3.5 h-3.5" />
            </button>
            <button className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:border-accent/40 hover:text-accent transition-colors text-muted"
              title="Search project files">
              <Globe className="w-3.5 h-3.5" />
            </button>
            <button className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:border-accent/40 hover:text-accent transition-colors text-muted"
              title="Settings">
              <Settings2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <input ref={fileInputRef} type="file" multiple accept={SUPPORTED_EXTS.join(",")} className="hidden"
            onChange={e => e.target.files && handleFiles(e.target.files)} />

          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={attachments.length > 0 ? "Ask SORK to scan the attached files..." : "Ask SORK • search project files..."}
            rows={1}
            className="flex-1 bg-[#141414] border border-border rounded-xl px-4 py-2.5 text-sm text-fg placeholder:text-muted/50 focus:outline-none focus:border-accent/40 resize-none transition-colors"
          />

          <button onClick={sendMessage} disabled={loading || !input.trim()}
            className="w-9 h-9 rounded-xl bg-accent disabled:opacity-30 flex items-center justify-center hover:bg-accent/90 transition-all flex-shrink-0 self-end glow-cyan">
            <Send className="w-3.5 h-3.5 text-bg" />
          </button>
        </div>

        {/* Footer tip */}
        <p className="text-[11px] text-muted/50 text-center mt-2.5 leading-relaxed">
          Tip: Run{" "}
          <code className="bg-[#1a1a1a] border border-[#2a2a2a] rounded px-1 text-accent/80 font-mono">sork send ./file.ts</code>
          {" "}from your terminal to send any file directly into this chat.
        </p>
      </div>
    </div>
  );
}
