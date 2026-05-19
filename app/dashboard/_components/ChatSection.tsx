"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Loader2, Paperclip, X, FileCode, FolderOpen, AtSign } from "lucide-react";
import { apiPost } from "@/lib/api";

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
}

const MAX_FILE_SIZE = 100_000; // 100KB per file
const SUPPORTED_EXTS = [".ts", ".tsx", ".js", ".jsx", ".py", ".go", ".rs", ".java", ".cs", ".rb", ".php", ".vue", ".svelte", ".json", ".yaml", ".yml", ".env", ".sh", ".md"];

interface Props {
  clerkId: string;
  preloadedFile?: { name: string; content: string };
}

export default function ChatSection({ clerkId, preloadedFile }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: preloadedFile
        ? `File received from VS Code: \`@${preloadedFile.name}\` (${(preloadedFile.content.length / 1024).toFixed(1)}KB)\n\nI've attached it below. Hit send to run the full security pipeline — Nemotron safety check → Triage → Fix → Verify.`
        : "Hey! I'm SORK. You can:\n\n• **Chat** — ask me to configure an API endpoint\n• **Attach files** — click 📎 or drag & drop code files\n• **@mention** — type @filename to reference attached files\n• **VS Code** — run `sork hook vscode` then use Tasks panel\n\nHow can I help?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [attachments, setAttachments] = useState<AttachedFile[]>(() =>
    preloadedFile
      ? [{ name: preloadedFile.name, content: preloadedFile.content, type: "file" as const, size: preloadedFile.content.length }]
      : []
  );
  const [dragging, setDragging] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const readFile = (file: File): Promise<AttachedFile> =>
    new Promise((resolve, reject) => {
      if (file.size > MAX_FILE_SIZE) {
        reject(new Error(`${file.name} is too large (max 100KB)`));
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) =>
        resolve({
          name: file.name,
          content: e.target?.result as string,
          type: "file",
          size: file.size,
        });
      reader.onerror = reject;
      reader.readAsText(file);
    });

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArr = Array.from(files).filter((f) => {
      const ext = "." + f.name.split(".").pop()?.toLowerCase();
      return SUPPORTED_EXTS.includes(ext) || f.name.includes(".");
    });

    const results = await Promise.allSettled(fileArr.map(readFile));
    const loaded: AttachedFile[] = [];
    results.forEach((r) => {
      if (r.status === "fulfilled") loaded.push(r.value);
    });
    setAttachments((prev) => [...prev, ...loaded]);

    // Auto-insert @mentions into input
    const mentions = loaded.map((f) => `@${f.name}`).join(" ");
    setInput((prev) => (prev ? `${prev} ${mentions}` : mentions).trim() + " ");
    textareaRef.current?.focus();
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  function removeAttachment(name: string) {
    setAttachments((prev) => prev.filter((a) => a.name !== name));
    setInput((prev) => prev.replace(`@${name}`, "").trim());
  }

  async function sendMessage() {
    const msg = input.trim();
    if (!msg || loading) return;

    setInput("");
    const currentAttachments = [...attachments];
    setAttachments([]);

    setMessages((prev) => [...prev, { role: "user", content: msg, attachments: currentAttachments }]);
    setLoading(true);

    try {
      // Build context from attachments
      const fileContext = currentAttachments.length > 0
        ? "\n\nAttached files:\n" + currentAttachments.map((f) =>
            `\`\`\`${f.name}\n${f.content.slice(0, 8000)}\n\`\`\``
          ).join("\n")
        : "";

      const res = await apiPost<ChatResponse>("/api/chat", clerkId, {
        message: msg + fileContext,
        sessionId,
        hasAttachments: currentAttachments.length > 0,
        attachedFiles: currentAttachments.map((f) => ({ name: f.name, size: f.size })),
      });
      setSessionId(res.sessionId);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.reply, byokIntent: res.byokIntent },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
    // @ autocomplete hint
    if (e.key === "@" && attachments.length === 0) {
      // nudge user to attach a file first
    }
  }

  return (
    <div
      className={`rounded-2xl border overflow-hidden transition-colors ${
        dragging ? "border-accent bg-accent/5" : "border-border bg-[#0f0f0f]"
      }`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
    >
      {/* Header */}
      <div className="border-b border-border px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center">
          <Bot className="w-4 h-4 text-accent" />
        </div>
        <div>
          <h2 className="font-semibold text-sm">Chat with SORK</h2>
          <p className="text-muted text-xs">Attach files · @mention · drag & drop</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-muted hidden sm:block">📎 drag files here</span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-xs text-muted">Groq + Nemotron</span>
          </div>
        </div>
      </div>

      {/* Drag overlay */}
      <AnimatePresence>
        {dragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex items-center justify-center bg-bg/80 backdrop-blur-sm rounded-2xl border-2 border-dashed border-accent"
          >
            <div className="text-center">
              <FolderOpen className="w-10 h-10 text-accent mx-auto mb-2" />
              <p className="text-accent font-semibold">Drop files to attach</p>
              <p className="text-muted text-xs mt-1">.ts .js .py .go and more</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="h-72 overflow-y-auto px-6 py-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center border ${
                  msg.role === "assistant" ? "border-accent/30 bg-accent/10" : "border-border bg-[#1a1a1a]"
                }`}
              >
                {msg.role === "assistant" ? (
                  <Bot className="w-3.5 h-3.5 text-accent" />
                ) : (
                  <User className="w-3.5 h-3.5 text-muted" />
                )}
              </div>
              <div className="max-w-[80%] space-y-1">
                {/* Attachment chips on user messages */}
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-1 justify-end">
                    {msg.attachments.map((a) => (
                      <span
                        key={a.name}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-accent/10 border border-accent/20 rounded-full text-xs text-accent"
                      >
                        <FileCode className="w-3 h-3" />
                        {a.name}
                      </span>
                    ))}
                  </div>
                )}
                <div
                  className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "assistant"
                      ? "bg-[#151515] border border-border text-fg"
                      : "bg-accent/10 border border-accent/20 text-fg"
                  }`}
                >
                  {msg.content.replace(/\n\nAttached files:[\s\S]*/m, "")}
                  {msg.byokIntent && (
                    <div className="mt-2 pt-2 border-t border-border">
                      <p className="text-xs text-accent">→ Use the BYOK Manager below to add your API key</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 items-center">
            <div className="w-7 h-7 rounded-full border border-accent/30 bg-accent/10 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-accent" />
            </div>
            <div className="bg-[#151515] border border-border rounded-2xl px-4 py-2.5 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 text-accent animate-spin" />
              <span className="text-xs text-muted">SORK is analyzing{attachments.length > 0 ? " your files" : ""}...</span>
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
            className="px-6 pb-2 flex flex-wrap gap-2"
          >
            {attachments.map((a) => (
              <motion.span
                key={a.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-accent/10 border border-accent/20 rounded-full text-xs text-accent"
              >
                <FileCode className="w-3 h-3" />
                @{a.name}
                <span className="text-accent/50">{(a.size / 1024).toFixed(1)}KB</span>
                <button onClick={() => removeAttachment(a.name)} className="hover:text-danger transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="border-t border-border px-6 py-4">
        <div className="flex gap-3">
          {/* File attach button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-10 h-10 rounded-xl border border-border flex items-center justify-center hover:border-accent/40 hover:text-accent transition-colors text-muted flex-shrink-0 self-end"
            title="Attach files"
          >
            <Paperclip className="w-4 h-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={SUPPORTED_EXTS.join(",")}
            className="hidden"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />

          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={attachments.length > 0 ? "Ask SORK to scan the attached files..." : "Ask SORK · attach files · @mention · drag & drop..."}
              rows={1}
              className="w-full bg-[#141414] border border-border rounded-xl px-4 py-2.5 text-sm text-fg placeholder:text-muted focus:outline-none focus:border-accent/50 resize-none pr-8"
            />
            {input.includes("@") && (
              <AtSign className="absolute right-3 top-2.5 w-4 h-4 text-accent/50" />
            )}
          </div>

          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="w-10 h-10 rounded-xl bg-accent disabled:opacity-40 flex items-center justify-center hover:bg-accent/90 transition-colors flex-shrink-0 self-end"
          >
            <Send className="w-4 h-4 text-bg" />
          </button>
        </div>

        {/* VS Code hint */}
        <p className="text-xs text-muted mt-2 text-center">
          💡 Install{" "}
          <a href="https://marketplace.visualstudio.com/items?itemName=sork.sork-vscode" className="text-accent/70 hover:text-accent" target="_blank" rel="noopener noreferrer">
            SORK VS Code extension
          </a>{" "}
          to send files directly from your editor
        </p>
      </div>
    </div>
  );
}
