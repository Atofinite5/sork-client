"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Plus, Loader2 } from "lucide-react";
import { apiPost } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
  byokIntent?: boolean;
}

interface ChatResponse {
  reply: string;
  sessionId: string;
  byokIntent?: boolean;
}

export default function ChatSection({ clerkId }: { clerkId: string }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hey! I'm SORK — your AI security assistant. Tell me what you'd like to do. You can say something like:\n\n• \"Add my Groq API key\"\n• \"Scan this code for vulnerabilities\"\n• \"Connect my Claude endpoint\"\n\nHow can I help?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    const msg = input.trim();
    if (!msg || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setLoading(true);

    try {
      const res = await apiPost<ChatResponse>("/api/chat", clerkId, {
        message: msg,
        sessionId,
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
  }

  return (
    <div className="rounded-2xl border border-border bg-[#0f0f0f] overflow-hidden">
      <div className="border-b border-border px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center">
          <Bot className="w-4 h-4 text-accent" />
        </div>
        <div>
          <h2 className="font-semibold text-sm">Chat with SORK</h2>
          <p className="text-muted text-xs">Add endpoints, configure agents, run scans</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          <span className="text-xs text-muted">Groq + Nemotron</span>
        </div>
      </div>

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
                  msg.role === "assistant"
                    ? "border-accent/30 bg-accent/10"
                    : "border-border bg-[#1a1a1a]"
                }`}
              >
                {msg.role === "assistant" ? (
                  <Bot className="w-3.5 h-3.5 text-accent" />
                ) : (
                  <User className="w-3.5 h-3.5 text-muted" />
                )}
              </div>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "assistant"
                    ? "bg-[#151515] border border-border text-fg"
                    : "bg-accent/10 border border-accent/20 text-fg"
                }`}
              >
                {msg.content}
                {msg.byokIntent && (
                  <div className="mt-2 pt-2 border-t border-border">
                    <p className="text-xs text-accent">
                      → Use the BYOK Manager below to add your API key
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3 items-center"
          >
            <div className="w-7 h-7 rounded-full border border-accent/30 bg-accent/10 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-accent" />
            </div>
            <div className="bg-[#151515] border border-border rounded-2xl px-4 py-2.5 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 text-accent animate-spin" />
              <span className="text-xs text-muted">SORK is thinking...</span>
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border px-6 py-4">
        <div className="flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask SORK to add an endpoint, scan code, or explain a finding..."
            rows={1}
            className="flex-1 bg-[#141414] border border-border rounded-xl px-4 py-2.5 text-sm text-fg placeholder:text-muted focus:outline-none focus:border-accent/50 resize-none"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="w-10 h-10 rounded-xl bg-accent disabled:opacity-40 flex items-center justify-center hover:bg-accent/90 transition-colors flex-shrink-0 self-end"
          >
            <Send className="w-4 h-4 text-bg" />
          </button>
        </div>
      </div>
    </div>
  );
}
