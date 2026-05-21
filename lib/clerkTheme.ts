// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const clerkAppearance: any = {
  variables: {
    // Core colors
    colorPrimary:          "#a0e8ef",
    colorBackground:       "#0d0d0d",
    colorInputBackground:  "#141414",
    colorInputText:        "#dce1e7",
    colorText:             "#dce1e7",
    colorTextSecondary:    "#8a9ba8",
    colorTextOnPrimaryBackground: "#0a0a0a",
    colorNeutral:          "#dce1e7",
    colorDanger:           "#ffadad",
    colorSuccess:          "#aadfb4",
    colorWarning:          "#ffcb8e",
    colorShimmer:          "#1e1e1e",

    // Shape
    borderRadius:          "12px",
    fontFamily:            "Inter, system-ui, sans-serif",
    fontSize:              "14px",
    fontWeight:            { normal: 400, medium: 500, bold: 600 },

    // Spacing
    spacingUnit:           "16px",
  },

  elements: {
    // ── Card ───────────────────────────────────────────────
    card: {
      background:   "#111111",
      border:       "1px solid #1e1e1e",
      borderRadius: "20px",
      boxShadow:    "0 0 0 1px #1e1e1e, 0 24px 48px rgba(0,0,0,0.5)",
      padding:      "32px",
    },

    // ── Header ─────────────────────────────────────────────
    headerTitle: {
      color:      "#dce1e7",
      fontSize:   "20px",
      fontWeight: "600",
      letterSpacing: "-0.01em",
    },
    headerSubtitle: {
      color:    "#5c6672",
      fontSize: "13px",
    },

    // ── Logo / Brand ────────────────────────────────────────
    logoBox: { display: "flex", justifyContent: "center", marginBottom: "8px" },
    logoImage: { height: "32px" },

    // ── Social buttons ──────────────────────────────────────
    socialButtonsBlockButton: {
      background:   "#1a1a1a",
      border:       "1px solid #262626",
      borderRadius: "10px",
      color:        "#b0b8c1",
      fontSize:     "13px",
      fontWeight:   "500",
      "&:hover": {
        background: "#1e1e1e",
        border:     "1px solid #333",
      },
    },
    socialButtonsBlockButtonText: {
      color: "#b0b8c1",
    },
    socialButtonsProviderIcon: { width: "16px", height: "16px" },

    // ── Divider ─────────────────────────────────────────────
    dividerLine: { background: "#1e1e1e" },
    dividerText: { color: "#3d444c", fontSize: "12px" },

    // ── Form fields ─────────────────────────────────────────
    formFieldLabel: {
      color:      "#8a9ba8",
      fontSize:   "12px",
      fontWeight: "500",
      textTransform: "uppercase",
      letterSpacing: "0.04em",
      marginBottom: "6px",
    },
    formFieldInput: {
      background:   "#141414",
      border:       "1px solid #262626",
      borderRadius: "10px",
      color:        "#dce1e7",
      fontSize:     "14px",
      padding:      "10px 14px",
      "&:focus": {
        border:    "1px solid #a0e8ef50",
        boxShadow: "0 0 0 3px #a0e8ef12",
        outline:   "none",
      },
      "&::placeholder": {
        color: "#3d444c",
      },
    },
    formFieldInputShowPasswordButton: { color: "#5c6672" },

    // ── Primary button ──────────────────────────────────────
    formButtonPrimary: {
      background:   "#a0e8ef",
      border:       "none",
      borderRadius: "10px",
      color:        "#0a0a0a",
      fontSize:     "14px",
      fontWeight:   "600",
      padding:      "10px 20px",
      letterSpacing: "0.01em",
      "&:hover": { background: "#8de0e8" },
      "&:active": { background: "#7dd8e0" },
    },

    // ── Footer / links ──────────────────────────────────────
    footerActionText: { color: "#5c6672", fontSize: "13px" },
    footerActionLink: {
      color:      "#a0e8ef",
      fontSize:   "13px",
      fontWeight: "500",
      "&:hover": { color: "#8de0e8", textDecoration: "underline" },
    },
    footer: { background: "transparent", borderTop: "1px solid #1a1a1a", marginTop: "4px" },

    // ── Internal nav / tabs ─────────────────────────────────
    navbarButton: {
      color: "#5c6672",
      "&:hover": { color: "#dce1e7" },
    },
    formFieldSuccessText:  { color: "#aadfb4" },
    formFieldErrorText:    { color: "#ffadad" },
    formFieldWarningText:  { color: "#ffcb8e" },
    identityPreviewText:   { color: "#b0b8c1" },
    identityPreviewEditButton: { color: "#a0e8ef" },

    // ── OTP input ───────────────────────────────────────────
    otpCodeFieldInput: {
      background:   "#141414",
      border:       "1px solid #262626",
      borderRadius: "10px",
      color:        "#dce1e7",
      fontSize:     "20px",
      fontWeight:   "600",
      "&:focus": {
        border:    "1px solid #a0e8ef60",
        boxShadow: "0 0 0 3px #a0e8ef12",
      },
    },

    // ── Alert ───────────────────────────────────────────────
    alert: {
      background:   "#1a1a1a",
      border:       "1px solid #262626",
      borderRadius: "10px",
    },
    alertText: { color: "#b0b8c1", fontSize: "13px" },

    // ── Badge ───────────────────────────────────────────────
    badge: {
      background: "#a0e8ef18",
      color:      "#a0e8ef",
      border:     "1px solid #a0e8ef30",
    },
  },
};
