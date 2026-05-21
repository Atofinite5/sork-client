import SiteNav from "@/components/SiteNav";
import Link from "next/link";

export const metadata = { title: "Docs — SORK Cloud" };

const T = {
  bg:      "#070708",
  bgLow:   "#0e0e0f",
  card:    "#101112",
  b1:      "#1B1C1E",
  b2:      "#232426",
  b3:      "#454655",
  text:    "#e5e2e3",
  textSub: "#c6c5d8",
  muted:   "#9A9DA3",
  brand:   "#5E6BFF",
  cyan:    "#50d8e9",
  violet:  "#bec2ff",
  amber:   "#ffb689",
  green:   "#92f1ff",
  error:   "#ffb4ab",
};

const FONT_H = "'Manrope', sans-serif";
const FONT_M = "'Inter', monospace";

export default function DocsPage() {
  return (
    <div style={{ background: T.bg, color: T.text, minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <SiteNav />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 32px 120px", display: "grid", gridTemplateColumns: "220px 1fr", gap: 56, alignItems: "start" }}>

        {/* ── Sidebar TOC ── */}
        <nav style={{ position: "sticky", top: 100 }}>
          <div style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, marginBottom: 16, fontFamily: FONT_M }}>On this page</div>
          {[
            ["Overview",          "#overview"],
            ["Architecture",      "#architecture"],
            ["Pipeline",          "#pipeline"],
            ["Agents",            "#agents"],
            ["Hybrid Memory",     "#memory"],
            ["BYOK",              "#byok"],
            ["CLI Reference",     "#cli"],
            ["Security Model",    "#security"],
            ["Glossary",          "#glossary"],
          ].map(([label, href]) => (
            <a key={href as string} href={href as string}
              style={{ display: "block", fontSize: 13, color: T.muted, textDecoration: "none", padding: "5px 0", borderLeft: "2px solid transparent", paddingLeft: 12, transition: "color .15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = T.violet; (e.currentTarget as HTMLAnchorElement).style.borderLeftColor = T.violet; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = T.muted; (e.currentTarget as HTMLAnchorElement).style.borderLeftColor = "transparent"; }}>
              {label as string}
            </a>
          ))}
        </nav>

        {/* ── Main content ── */}
        <article style={{ maxWidth: 760 }}>

          {/* Header */}
          <div style={{ marginBottom: 56 }}>
            <div style={{ fontSize: 12, color: T.cyan, fontFamily: FONT_M, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Documentation</div>
            <h1 style={{ fontFamily: FONT_H, fontSize: 44, fontWeight: 700, letterSpacing: "-0.055em", lineHeight: 1.05, marginBottom: 16 }}>
              SORK Cloud — System Architecture
            </h1>
            <p style={{ fontSize: 16, color: T.muted, lineHeight: 1.7 }}>
              A full-stack security pipeline that scans, patches, and verifies vulnerabilities in your codebase — from a single CLI command to a verified, deploy-ready fix.
            </p>
          </div>

          <Divider />

          {/* Overview */}
          <Section id="overview" title="Overview">
            <p>SORK Cloud is a multi-agent AI security system. One <Code>sork scan</Code> command triggers a four-stage pipeline: content safety screening → triage → patch generation → verification. The entire flow runs against your codebase in under 10 seconds for most files.</p>
            <p style={{ marginTop: 12 }}>SORK has three surfaces:</p>
            <ul>
              <Li><strong>sork-cli</strong> — npm global package. Runs in your terminal, CI, or VS Code tasks.</Li>
              <Li><strong>sork-client</strong> — Next.js web dashboard at <a href="https://sorkcloud.space" target="_blank" rel="noreferrer" style={{ color: T.cyan }}>sorkcloud.space</a>. Browse scans, apply fixes, manage keys, view reports.</Li>
              <Li><strong>sork-back</strong> — Hono TypeScript API on Render. Handles all pipeline logic, DB, BYOK, and analytics.</Li>
            </ul>
          </Section>

          {/* Architecture */}
          <Section id="architecture" title="System Architecture">
            <ArchDiagram />
            <p style={{ marginTop: 20, fontSize: 13, color: T.muted }}>Every request flows through the same pipeline regardless of whether it originates from the CLI, the web dashboard, or a VS Code send.</p>

            <H3>Stack</H3>
            <Table rows={[
              ["Layer",       "Technology"],
              ["Inference",   "Groq — llama-3.3-70b-versatile (default)"],
              ["Safety gate", "NVIDIA Nemotron-3 content safety"],
              ["Memory",      "Cohere embed-english-v3.0 (hybrid semantic + recency)"],
              ["API",         "Hono TypeScript on Render (Node 20)"],
              ["Database",    "Neon PostgreSQL + Drizzle ORM"],
              ["Auth",        "Clerk — JWT-signed requests"],
              ["Frontend",    "Next.js 15 App Router on Vercel"],
              ["CLI",         "Node.js npm package (sork-cli)"],
            ]} />
          </Section>

          {/* Pipeline */}
          <Section id="pipeline" title="The Four-Stage Pipeline">
            <p>Every scan request follows this exact sequence. No stage is skipped. Each stage can fail independently and returns structured JSON.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 24 }}>
              {[
                {
                  n: "01", label: "Safety Gate",
                  color: T.amber,
                  desc: "The request is first screened by NVIDIA Nemotron-3. If the content is flagged as unsafe (prompt injection, jailbreak attempts, harmful payloads), the pipeline halts immediately. No API key is consumed. A safety score 0–100 is logged.",
                  code: `POST /api/scan\n{ "code": "...", "licenseKey": "..." }\n\n→ Nemotron check: score 0–100\n→ threshold < 30 → BLOCKED`,
                },
                {
                  n: "02", label: "Triage Agent",
                  color: T.cyan,
                  desc: "Static analysis + LLM-powered triage runs over the submitted code. 40+ language-specific patterns detect CWE-classified vulnerabilities (SQL injection, null dereference, secrets, torn code, race conditions). Each finding gets a confidence score and a severity level (CRITICAL / HIGH / MEDIUM / LOW).",
                  code: `→ 40+ patterns across TS, JS, Py, Rust, Go, Java\n→ CWE ID, confidence %, severity, fix hint\n→ Returns: { issues: [...] }`,
                },
                {
                  n: "03", label: "Fix Agent",
                  color: T.green,
                  desc: "For each issue found in Stage 2, the Fix Agent generates a minimal unified diff using Groq llama-3.3-70b-versatile. Only the specific vulnerable lines change — no refactoring, no unrelated edits. Hybrid memory (Cohere) provides codebase context so repeated patterns stay consistent.",
                  code: `→ Groq llama-3.3-70b generates patch\n→ Minimal diff: only vulnerable lines\n→ Cohere memory: past fixes for this repo\n→ Returns: { patch, originalLines, fixedLines }`,
                },
                {
                  n: "04", label: "Verify Agent",
                  color: T.violet,
                  desc: "The patched code is re-scanned. The Verify Agent checks that (a) the original vulnerability is gone, (b) no new vulnerabilities were introduced, and (c) the logic is semantically equivalent. Returns a score 0–100. Anything below 80 is flagged for human review.",
                  code: `→ Re-scan patched code\n→ Original issue resolved? ✓/✗\n→ New issues introduced? ✓/✗\n→ Score 0–100 → threshold 80 = approved`,
                },
              ].map(stage => (
                <div key={stage.n} style={{ border: `1px solid ${T.b2}`, borderRadius: 8, overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", borderBottom: `1px solid ${T.b1}`, background: T.card }}>
                    <span style={{ fontFamily: FONT_M, fontSize: 11, color: T.muted }}>STAGE {stage.n}</span>
                    <span style={{ fontFamily: FONT_H, fontSize: 16, fontWeight: 700, color: stage.color }}>{stage.label}</span>
                  </div>
                  <div style={{ padding: "16px 20px", background: T.bgLow }}>
                    <p style={{ fontSize: 14, color: T.textSub, lineHeight: 1.7, marginBottom: 12 }}>{stage.desc}</p>
                    <pre style={{ background: "#070708", border: `1px solid ${T.b1}`, borderRadius: 4, padding: "12px 14px", fontSize: 12, color: T.muted, fontFamily: FONT_M, overflowX: "auto", margin: 0 }}>{stage.code}</pre>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Agents */}
          <Section id="agents" title="Agent System">
            <p>Each pipeline stage is an independent agent. Agents are stateless functions that receive structured input and return structured JSON. They communicate through the sork-back API, not peer-to-peer.</p>
            <H3>Agent Interface</H3>
            <CodeBlock>{`interface AgentInput {
  code: string;           // source code to analyse
  language: string;       // detected language
  issues?: Issue[];       // from previous stage (Fix + Verify)
  memoryContext?: string; // from Cohere (Fix stage only)
}

interface AgentOutput {
  stage: "triage" | "fix" | "verify";
  issues?: Issue[];
  patches?: Patch[];
  verifyScore?: number;
  safetyScore?: number;
  blocked?: boolean;
}`}</CodeBlock>

            <H3>Default Inference Engine</H3>
            <p>All agents use <strong>Groq — llama-3.3-70b-versatile</strong> by default. Response times average 1.8s at p95. Users can override to any BYOK endpoint (OpenAI-compatible, Claude, NVIDIA NIM, Cohere Command) — the agent system routes through the same interface regardless of provider.</p>
          </Section>

          {/* Hybrid Memory */}
          <Section id="memory" title="Hybrid Memory">
            <p>SORK maintains a persistent memory of your codebase using Cohere embed-english-v3.0. This means fix quality improves over time — SORK knows your coding patterns, your existing mitigations, and the history of past issues.</p>

            <H3>How it works</H3>
            <Table rows={[
              ["Operation",      "Cohere input_type",    "What's stored/retrieved"],
              ["Store fix",      "search_document",      "Fixed code snippet + metadata"],
              ["Retrieve context","search_query",        "Top-3 semantically similar past fixes"],
              ["Recency weight", "—",                    "Recent fixes score higher than old ones"],
              ["Scope",          "—",                    "Per user · per repository path"],
            ]} />

            <H3>Memory fields</H3>
            <CodeBlock>{`{
  userId: string,
  filePath: string,
  cweId: string,
  originalCode: string,
  fixedCode: string,
  embedding: number[],   // 1024-dim Cohere vector
  createdAt: Date,
  score: number          // verify score at time of storage
}`}</CodeBlock>
          </Section>

          {/* BYOK */}
          <Section id="byok" title="BYOK — Bring Your Own Key">
            <p>Pro and Pro Plus users can add their own API keys from any supported provider. SORK uses your key when your BYOK entry is active, bypassing the shared quota.</p>

            <H3>Supported providers</H3>
            <ul>
              <Li><strong>Groq</strong> — default inference (llama-3.3-70b)</Li>
              <Li><strong>NVIDIA NIM</strong> — Nemotron variants, custom models</Li>
              <Li><strong>Cohere</strong> — override embed + Command R</Li>
              <Li><strong>OpenAI-compatible</strong> — any OpenAI-spec endpoint (OpenAI, Together, Perplexity, local Ollama)</Li>
            </ul>

            <H3>Security</H3>
            <p>Keys are encrypted at rest using <strong>AES-256-GCM</strong> before being written to the database. The encryption key is never logged or exposed in API responses. Only the last 6 characters are shown in the dashboard.</p>

            <H3>Live status</H3>
            <p>The dashboard shows real-time key health by issuing a minimal 1-token probe request when you open the API Keys view. Status values: <span style={{ color: T.green }}>ok</span> / <span style={{ color: T.amber }}>limited</span> / <span style={{ color: T.error }}>error</span> / <span style={{ color: T.muted }}>inactive</span>.</p>
          </Section>

          {/* CLI */}
          <Section id="cli" title="CLI Reference">
            <p>Install once globally. All commands communicate with sork-back via your license key.</p>
            <CodeBlock>{`npm install -g sork-cli`}</CodeBlock>

            <H3>Commands</H3>
            <Table rows={[
              ["Command",                         "Description"],
              ["sork config set-key <key>",        "Store your SORK Cloud license key locally"],
              ["sork scan [--path ./src]",          "Scan all files in path. Defaults to current dir"],
              ["sork scan --file ./auth.ts",        "Scan a single file"],
              ["sork fix [--issue <id>]",           "Apply all pending fixes, or one specific issue"],
              ["sork verify [--issue <id>]",        "Re-run verify stage on a fix"],
              ["sork guard [--path ./src]",         "Watch mode — re-scans on every file save"],
              ["sork doctor",                       "Project health report 0–100 with language breakdown"],
              ["sork review ./auth.ts",             "Inline AI review with sork.ai commentary"],
              ["sork send ./auth.ts",               "Send file to dashboard for full pipeline run"],
              ["sork config show",                  "Show current config (key masked)"],
            ]} />

            <H3>sork-ignore</H3>
            <p>To suppress a false positive on a specific line, add an inline annotation:</p>
            <CodeBlock>{`const query = "SELECT * FROM " + table; // sork-ignore: CWE-89`}</CodeBlock>
            <p>Or suppress an entire file via <Code>.sorkignore</Code> (same format as <Code>.gitignore</Code>).</p>
          </Section>

          {/* Security model */}
          <Section id="security" title="Security Model">
            <H3>Request authentication</H3>
            <p>CLI requests use a <strong>license key</strong> (SORK-prefixed JWT signed with <Code>JWT_SECRET</Code>). Dashboard requests use Clerk JWTs. Both are validated on every API route in sork-back.</p>

            <H3>Data handling</H3>
            <ul>
              <Li>Code submitted for scanning is <strong>never persisted</strong> beyond the pipeline run. Only metadata (file path, CWE IDs, severity, scores) is stored.</Li>
              <Li>BYOK keys are stored encrypted (AES-256-GCM). The plaintext key is decrypted only during the pipeline call and never logged.</Li>
              <Li>Cohere memory embeddings store <em>code snippets</em> of patched lines for context retrieval, not full files.</Li>
            </ul>

            <H3>Rate limiting</H3>
            <Table rows={[
              ["Plan",      "Scan requests",         "Concurrent pipelines"],
              ["Free",      "14 lifetime",           "1"],
              ["Pro",       "Unlimited",             "3"],
              ["Pro Plus",  "Unlimited",             "10"],
            ]} />
          </Section>

          {/* Glossary */}
          <Section id="glossary" title="Glossary">
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {[
                ["Agent",           "A stateless LLM function. Takes structured input, returns structured JSON. Four agents: Safety, Triage, Fix, Verify."],
                ["BYOK",            "Bring Your Own Key. User-supplied API credentials for Groq, Cohere, NVIDIA, or OpenAI-compatible providers. Stored AES-256-GCM encrypted."],
                ["CWE",             "Common Weakness Enumeration. A community-developed list of software security weaknesses. SORK reports CWE IDs for every finding (e.g. CWE-89 = SQL Injection)."],
                ["Hybrid memory",   "Combination of semantic vector search (Cohere) and recency weighting. Gives recent fixes higher retrieval priority."],
                ["License key",     "A JWT signed by sork-back that authenticates CLI requests. Issued from the dashboard → API Keys tab."],
                ["Nemotron",        "NVIDIA Nemotron-3 content safety model. Screens every incoming scan request for harmful content before any LLM call."],
                ["Pipeline",        "The four-stage sequence: Safety → Triage → Fix → Verify. Every scan runs the full pipeline."],
                ["sork-ignore",     "Inline annotation (// sork-ignore: CWE-ID) that suppresses a specific finding on that line."],
                ["Torn code",       "AI-generated code fragments that were cut off or malformed mid-generation. SORK's stability scanner detects these."],
                ["Verify score",    "A 0–100 score returned by the Verify Agent. Measures fix completeness and absence of new vulnerabilities. Threshold for auto-approval: 80."],
              ].map(([term, def]) => (
                <div key={term as string} style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 16, padding: "14px 0", borderBottom: `1px solid ${T.b1}` }}>
                  <dt style={{ fontFamily: FONT_M, fontSize: 13, color: T.cyan, fontWeight: 600 }}>{term as string}</dt>
                  <dd style={{ fontSize: 13, color: T.textSub, lineHeight: 1.6 }}>{def as string}</dd>
                </div>
              ))}
            </div>
          </Section>

          {/* Footer CTA */}
          <div style={{ marginTop: 64, padding: 32, background: T.card, border: `1px solid ${T.b2}`, borderRadius: 8, textAlign: "center" }}>
            <p style={{ fontFamily: FONT_H, fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Ready to scan your codebase?</p>
            <p style={{ color: T.muted, fontSize: 14, marginBottom: 20 }}>14 free scans. No credit card. Start in 30 seconds.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <Link href="/sign-up" style={{ background: T.brand, color: "#fff", padding: "10px 24px", borderRadius: 6, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>Get started free</Link>
              <Link href="/pricing" style={{ background: "transparent", border: `1px solid ${T.b2}`, color: T.text, padding: "10px 24px", borderRadius: 6, fontSize: 14, textDecoration: "none" }}>View pricing</Link>
            </div>
          </div>

        </article>
      </div>

      <footer style={{ borderTop: `1px solid ${T.b1}`, padding: "24px 32px", display: "flex", justifyContent: "space-between", fontSize: 12, color: T.muted, fontFamily: FONT_M, maxWidth: 1100, margin: "0 auto" }}>
        <span>Powered by Groq</span>
        <span>© {new Date().getFullYear()} Sork Inc.</span>
      </footer>
    </div>
  );
}

/* ── Reusable doc components ── */

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} style={{ marginBottom: 56 }}>
      <h2 style={{ fontFamily: FONT_H, fontSize: 28, fontWeight: 700, letterSpacing: "-0.04em", marginBottom: 20, scrollMarginTop: 100 }}>{title}</h2>
      <div style={{ fontSize: 14, color: T.textSub, lineHeight: 1.75 }}>{children}</div>
      <Divider />
    </section>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 style={{ fontFamily: FONT_H, fontSize: 16, fontWeight: 700, color: T.text, marginTop: 24, marginBottom: 10 }}>{children}</h3>;
}

function Code({ children }: { children: React.ReactNode }) {
  return <code style={{ background: "rgba(80,216,233,0.08)", color: T.cyan, border: `1px solid rgba(80,216,233,0.15)`, padding: "1px 6px", borderRadius: 3, fontSize: 12, fontFamily: FONT_M }}>{children}</code>;
}

function CodeBlock({ children }: { children: React.ReactNode }) {
  return (
    <pre style={{ background: T.bgLow, border: `1px solid ${T.b2}`, borderRadius: 6, padding: "16px 18px", fontSize: 12, color: T.muted, fontFamily: FONT_M, overflowX: "auto", margin: "12px 0", lineHeight: 1.6 }}>
      {children}
    </pre>
  );
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 6 }}>
      <span style={{ color: T.cyan, marginTop: 2, flexShrink: 0 }}>→</span>
      <span>{children}</span>
    </li>
  );
}

function Table({ rows }: { rows: string[][] }) {
  const [header, ...body] = rows;
  return (
    <div style={{ overflowX: "auto", margin: "14px 0" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: FONT_M }}>
        <thead>
          <tr style={{ background: T.card, borderBottom: `1px solid ${T.b2}` }}>
            {header.map(h => (
              <th key={h} style={{ padding: "8px 14px", textAlign: "left", color: T.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, i) => (
            <tr key={i} style={{ borderBottom: `1px solid ${T.b1}`, background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: "10px 14px", color: j === 0 ? T.text : T.textSub, fontWeight: j === 0 ? 500 : 400 }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: T.b1, margin: "40px 0" }} />;
}

function ArchDiagram() {
  const nodes = [
    { label: "sork-cli",          sub: "npm · your terminal",    color: T.cyan,   x: 0 },
    { label: "sork-client",       sub: "Next.js · Vercel",       color: T.violet, x: 1 },
    { label: "VS Code Send",      sub: "sork send ./file.ts",     color: T.amber,  x: 2 },
  ];
  const pipeline = [
    { label: "Safety Gate",   color: T.amber  },
    { label: "Triage Agent",  color: T.cyan   },
    { label: "Fix Agent",     color: T.green  },
    { label: "Verify Agent",  color: T.violet },
  ];
  return (
    <div style={{ background: T.bgLow, border: `1px solid ${T.b2}`, borderRadius: 8, padding: 24, fontFamily: FONT_M, fontSize: 12 }}>
      {/* Inputs */}
      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        {nodes.map(n => (
          <div key={n.label} style={{ flex: 1, background: T.card, border: `1px solid ${T.b2}`, borderRadius: 6, padding: "10px 14px", textAlign: "center" }}>
            <div style={{ color: n.color, fontWeight: 700, marginBottom: 4 }}>{n.label}</div>
            <div style={{ color: T.muted, fontSize: 11 }}>{n.sub}</div>
          </div>
        ))}
      </div>
      {/* Arrow down */}
      <div style={{ textAlign: "center", color: T.muted, marginBottom: 12, fontSize: 18 }}>↓</div>
      {/* sork-back */}
      <div style={{ background: "#0a0a0b", border: `1px solid ${T.brand}33`, borderRadius: 6, padding: "12px 16px", marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: T.brand, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>sork-back — Hono API · Render</div>
        <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
          {pipeline.map((p, i) => (
            <div key={p.label} style={{ display: "flex", alignItems: "center", flex: 1 }}>
              <div style={{ flex: 1, background: T.card, border: `1px solid ${T.b1}`, borderRadius: 4, padding: "8px 10px", textAlign: "center" }}>
                <div style={{ color: p.color, fontWeight: 700, fontSize: 11 }}>{p.label}</div>
              </div>
              {i < pipeline.length - 1 && <span style={{ color: T.muted, margin: "0 6px", fontSize: 14 }}>→</span>}
            </div>
          ))}
        </div>
      </div>
      {/* Arrow down */}
      <div style={{ textAlign: "center", color: T.muted, marginBottom: 12, fontSize: 18 }}>↓</div>
      {/* Storage */}
      <div style={{ display: "flex", gap: 12 }}>
        {[
          { label: "Neon PostgreSQL",   sub: "Drizzle ORM",              color: T.cyan   },
          { label: "Cohere Memory",     sub: "embed-english-v3.0",       color: T.violet },
          { label: "Groq Inference",    sub: "llama-3.3-70b-versatile",  color: T.green  },
        ].map(n => (
          <div key={n.label} style={{ flex: 1, background: T.card, border: `1px solid ${T.b1}`, borderRadius: 6, padding: "10px 14px", textAlign: "center" }}>
            <div style={{ color: n.color, fontWeight: 700, fontSize: 11, marginBottom: 2 }}>{n.label}</div>
            <div style={{ color: T.muted, fontSize: 10 }}>{n.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
