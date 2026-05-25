"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, Pencil, Eye, Download, ChevronDown, ChevronRight } from "lucide-react";

interface DiffLine {
  type: "add" | "remove" | "context";
  content: string;
  lineNum: number;
}

interface Change {
  issueId: string;
  title: string;
  original: string;
  patched: string;
  explanation: string;
}

interface Props {
  originalCode: string;
  fixedCode: string;
  changes: Change[];
  explanation: string;
  score: number;
  recommendation: "approve" | "rework" | "escalate";
  onApply?: (code: string) => void;
}

function computeDiff(original: string, fixed: string): { lines: DiffLine[]; additions: number; deletions: number } {
  const origLines = original.split("\n");
  const fixedLines = fixed.split("\n");
  const result: DiffLine[] = [];
  let additions = 0;
  let deletions = 0;

  const maxLen = Math.max(origLines.length, fixedLines.length);
  let oi = 0;
  let fi = 0;

  while (oi < origLines.length || fi < fixedLines.length) {
    const origLine = oi < origLines.length ? origLines[oi] : undefined;
    const fixedLine = fi < fixedLines.length ? fixedLines[fi] : undefined;

    if (origLine === fixedLine) {
      result.push({ type: "context", content: origLine ?? "", lineNum: fi + 1 });
      oi++;
      fi++;
    } else if (origLine !== undefined && !fixedLines.includes(origLine)) {
      result.push({ type: "remove", content: origLine, lineNum: oi + 1 });
      deletions++;
      oi++;
    } else if (fixedLine !== undefined && !origLines.includes(fixedLine)) {
      result.push({ type: "add", content: fixedLine, lineNum: fi + 1 });
      additions++;
      fi++;
    } else {
      if (origLine !== undefined) {
        result.push({ type: "remove", content: origLine, lineNum: oi + 1 });
        deletions++;
        oi++;
      }
      if (fixedLine !== undefined) {
        result.push({ type: "add", content: fixedLine, lineNum: fi + 1 });
        additions++;
        fi++;
      }
    }

    if (result.length > maxLen * 3) break;
  }

  return { lines: result, additions, deletions };
}

export default function CodeDiffEditor({ originalCode, fixedCode, changes, explanation, score, recommendation, onApply }: Props) {
  const [mode, setMode] = useState<"diff" | "edit">("diff");
  const [editableCode, setEditableCode] = useState(fixedCode);
  const [copied, setCopied] = useState(false);
  const [expandedChanges, setExpandedChanges] = useState<Set<string>>(new Set());
  const [flashVisible, setFlashVisible] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { lines, additions, deletions } = computeDiff(originalCode, fixedCode);

  useEffect(() => {
    setFlashVisible(true);
    const t = setTimeout(() => setFlashVisible(false), 1500);
    return () => clearTimeout(t);
  }, []);

  function copyCode() {
    navigator.clipboard.writeText(mode === "edit" ? editableCode : fixedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function toggleChange(id: string) {
    setExpandedChanges(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  const scoreColor = score >= 90 ? "#a8e6cf" : score >= 70 ? "#92f1ff" : score >= 50 ? "#ffb689" : "#ffb4ab";
  const recColor = recommendation === "approve" ? "#a8e6cf" : recommendation === "rework" ? "#ffb689" : "#ffb4ab";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      style={{
        marginTop: 12,
        borderRadius: 4,
        border: "1px solid #232426",
        overflow: "hidden",
        background: "#0a0a0b",
      }}
    >
      {/* Flash overlay */}
      <AnimatePresence>
        {flashVisible && (
          <motion.div
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(135deg, rgba(94,107,255,0.15), rgba(146,241,255,0.08))",
              pointerEvents: "none",
              zIndex: 10,
              borderRadius: 4,
            }}
          />
        )}
      </AnimatePresence>

      {/* Header bar — like GitHub diff header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 14px",
        background: "#0e0e0f",
        borderBottom: "1px solid #1B1C1E",
        gap: 8,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Diff stats badge */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "3px 10px",
              background: "#1B1C1E",
              border: "1px solid #232426",
              borderRadius: 999,
              fontFamily: "'Inter', monospace",
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            <span style={{ color: "#a8e6cf" }}>+{additions}</span>
            <span style={{ color: "#ffb4ab" }}>-{deletions}</span>
          </motion.div>

          {/* Score badge */}
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: "3px 8px", borderRadius: 999,
            background: scoreColor + "12", border: `1px solid ${scoreColor}30`,
            fontSize: 10, fontFamily: "'Inter', monospace", color: scoreColor,
          }}>
            {score}/100
          </span>

          <span style={{
            fontSize: 10, fontFamily: "'Inter', monospace",
            color: recColor, textTransform: "uppercase", fontWeight: 700,
          }}>
            {recommendation}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {/* Mode toggle */}
          <button
            onClick={() => setMode("diff")}
            style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              padding: "4px 10px", borderRadius: 2, fontSize: 10,
              background: mode === "diff" ? "#5E6BFF18" : "transparent",
              border: `1px solid ${mode === "diff" ? "#5E6BFF30" : "#1B1C1E"}`,
              color: mode === "diff" ? "#bec2ff" : "#9A9DA3",
              cursor: "pointer", fontFamily: "'Inter', monospace",
            }}
          >
            <Eye style={{ width: 10, height: 10 }} /> Diff
          </button>
          <button
            onClick={() => { setMode("edit"); setTimeout(() => textareaRef.current?.focus(), 50); }}
            style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              padding: "4px 10px", borderRadius: 2, fontSize: 10,
              background: mode === "edit" ? "#5E6BFF18" : "transparent",
              border: `1px solid ${mode === "edit" ? "#5E6BFF30" : "#1B1C1E"}`,
              color: mode === "edit" ? "#bec2ff" : "#9A9DA3",
              cursor: "pointer", fontFamily: "'Inter', monospace",
            }}
          >
            <Pencil style={{ width: 10, height: 10 }} /> Edit
          </button>

          <div style={{ width: 1, height: 16, background: "#232426", margin: "0 4px" }} />

          <button onClick={copyCode}
            style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              padding: "4px 10px", borderRadius: 2, fontSize: 10,
              background: "transparent", border: "1px solid #1B1C1E",
              color: copied ? "#a8e6cf" : "#9A9DA3",
              cursor: "pointer", fontFamily: "'Inter', monospace",
            }}
          >
            {copied ? <Check style={{ width: 10, height: 10 }} /> : <Copy style={{ width: 10, height: 10 }} />}
            {copied ? "Copied" : "Copy"}
          </button>

          {onApply && (
            <button
              onClick={() => onApply(mode === "edit" ? editableCode : fixedCode)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                padding: "4px 12px", borderRadius: 2, fontSize: 10,
                background: "#5E6BFF", border: "none",
                color: "#070708", fontWeight: 700,
                cursor: "pointer", fontFamily: "'Inter', monospace",
              }}
            >
              <Download style={{ width: 10, height: 10 }} /> Apply
            </button>
          )}
        </div>
      </div>

      {/* Explanation */}
      <div style={{
        padding: "8px 14px",
        borderBottom: "1px solid #1B1C1E",
        fontSize: 11,
        color: "#c6c5d8",
        fontFamily: "'Inter', monospace",
        lineHeight: 1.5,
      }}>
        {explanation}
      </div>

      {/* Per-change accordion */}
      {changes.length > 0 && (
        <div style={{ borderBottom: "1px solid #1B1C1E" }}>
          {changes.map(change => (
            <div key={change.issueId}>
              <button
                onClick={() => toggleChange(change.issueId)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 8,
                  padding: "6px 14px", background: "transparent", border: "none",
                  borderBottom: "1px solid #1B1C1E08",
                  cursor: "pointer", textAlign: "left",
                }}
              >
                {expandedChanges.has(change.issueId)
                  ? <ChevronDown style={{ width: 10, height: 10, color: "#5E6BFF", flexShrink: 0 }} />
                  : <ChevronRight style={{ width: 10, height: 10, color: "#5E6BFF", flexShrink: 0 }} />
                }
                <span style={{ fontSize: 10, fontFamily: "'Inter', monospace", color: "#bec2ff", fontWeight: 600 }}>
                  [{change.issueId}]
                </span>
                <span style={{ fontSize: 10, fontFamily: "'Inter', monospace", color: "#e5e2e3", flex: 1 }}>
                  {change.title}
                </span>
              </button>
              <AnimatePresence>
                {expandedChanges.has(change.issueId) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    style={{ overflow: "hidden" }}
                  >
                    <div style={{ padding: "6px 14px 10px 32px", fontSize: 10, fontFamily: "'Inter', monospace", color: "#9A9DA3", lineHeight: 1.5 }}>
                      {change.explanation}
                    </div>
                    <div style={{ padding: "0 14px 8px 32px", display: "flex", flexDirection: "column", gap: 2 }}>
                      <div style={{ display: "flex", gap: 0 }}>
                        <span style={{
                          width: 20, textAlign: "center", fontSize: 10, color: "#ffb4ab", fontFamily: "'Inter', monospace",
                          background: "rgba(255,180,171,0.06)", padding: "2px 0", borderRadius: "2px 0 0 2px",
                        }}>-</span>
                        <code style={{
                          flex: 1, fontSize: 10, fontFamily: "'Inter', monospace", color: "#ffb4ab",
                          background: "rgba(255,180,171,0.06)", padding: "2px 8px", borderRadius: "0 2px 2px 0",
                          display: "block", whiteSpace: "pre-wrap", wordBreak: "break-all",
                        }}>{change.original}</code>
                      </div>
                      <div style={{ display: "flex", gap: 0 }}>
                        <span style={{
                          width: 20, textAlign: "center", fontSize: 10, color: "#a8e6cf", fontFamily: "'Inter', monospace",
                          background: "rgba(168,230,207,0.06)", padding: "2px 0", borderRadius: "2px 0 0 2px",
                        }}>+</span>
                        <code style={{
                          flex: 1, fontSize: 10, fontFamily: "'Inter', monospace", color: "#a8e6cf",
                          background: "rgba(168,230,207,0.06)", padding: "2px 8px", borderRadius: "0 2px 2px 0",
                          display: "block", whiteSpace: "pre-wrap", wordBreak: "break-all",
                        }}>{change.patched}</code>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}

      {/* Diff view */}
      {mode === "diff" && (
        <div style={{ maxHeight: 320, overflowY: "auto", overflowX: "auto" }}>
          {lines.map((line, i) => (
            <motion.div
              key={i}
              initial={line.type !== "context" ? { backgroundColor: line.type === "add" ? "rgba(168,230,207,0.2)" : "rgba(255,180,171,0.2)" } : {}}
              animate={{ backgroundColor: "transparent" }}
              transition={{ duration: 2, delay: i * 0.02 }}
              style={{
                display: "flex",
                fontFamily: "'Inter', monospace",
                fontSize: 11,
                lineHeight: "20px",
                background:
                  line.type === "add" ? "rgba(168,230,207,0.04)" :
                  line.type === "remove" ? "rgba(255,180,171,0.04)" :
                  "transparent",
                borderLeft:
                  line.type === "add" ? "2px solid #a8e6cf" :
                  line.type === "remove" ? "2px solid #ffb4ab" :
                  "2px solid transparent",
              }}
            >
              {/* Line number */}
              <span style={{
                width: 40, textAlign: "right", paddingRight: 8,
                color: "#454655", fontSize: 10, userSelect: "none", flexShrink: 0,
              }}>
                {line.lineNum}
              </span>
              {/* +/- indicator */}
              <span style={{
                width: 16, textAlign: "center", flexShrink: 0,
                color: line.type === "add" ? "#a8e6cf" : line.type === "remove" ? "#ffb4ab" : "transparent",
                fontWeight: 700, userSelect: "none",
              }}>
                {line.type === "add" ? "+" : line.type === "remove" ? "-" : " "}
              </span>
              {/* Code content */}
              <span style={{
                flex: 1, paddingRight: 14, whiteSpace: "pre",
                color:
                  line.type === "add" ? "#a8e6cf" :
                  line.type === "remove" ? "#ffb4ab" :
                  "#c6c5d8",
                textDecoration: line.type === "remove" ? "line-through" : "none",
                opacity: line.type === "remove" ? 0.7 : 1,
              }}>
                {line.content}
              </span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Edit mode */}
      {mode === "edit" && (
        <div style={{ position: "relative" }}>
          <div style={{
            padding: "6px 14px",
            background: "#0e0e0f",
            borderBottom: "1px solid #1B1C1E",
            fontSize: 10,
            fontFamily: "'Inter', monospace",
            color: "#5E6BFF",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}>
            <Pencil style={{ width: 10, height: 10 }} />
            Editing — modify the code below, then click Apply
          </div>
          <textarea
            ref={textareaRef}
            value={editableCode}
            onChange={e => setEditableCode(e.target.value)}
            spellCheck={false}
            style={{
              width: "100%",
              minHeight: 200,
              maxHeight: 400,
              padding: "12px 14px",
              background: "#070708",
              border: "none",
              color: "#92f1ff",
              fontFamily: "'Inter', monospace",
              fontSize: 11,
              lineHeight: 1.6,
              resize: "vertical",
              outline: "none",
              whiteSpace: "pre",
              overflowWrap: "normal",
              overflowX: "auto",
            }}
          />
        </div>
      )}
    </motion.div>
  );
}
