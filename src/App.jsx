import { useEffect, useMemo, useState } from "react";
import { sanitizeText } from "./sanitizer";
import { getReservedWarnings } from "./warnings";
import useDebounce from "./useDebounce";
import "./App.css";

/* ===============================
   REGEX
================================ */
const URL_REGEX = /\bhttps?:\/\/[^\s]+/gi;

export default function App() {
  const [input, setInput] = useState("");
  const [sanitized, setSanitized] = useState("");
  const [emailRemoved, setEmailRemoved] = useState(false);
  const [warnings, setWarnings] = useState([]);
  const [copied, setCopied] = useState(false);

  const debouncedInput = useDebounce(input, 300);

  const hasRealText = debouncedInput.trim().length > 0;

  /* ===============================
     SANITIZATION
  ================================ */
  useEffect(() => {
    const { text, emailRemoved } = sanitizeText(debouncedInput);
    setSanitized(text);
    setEmailRemoved(emailRemoved);
  }, [debouncedInput]);

  /* ===============================
     RESERVED WARNINGS (IGNORE URLS)
  ================================ */
  useEffect(() => {
    if (!hasRealText) {
      setWarnings([]);
      return;
    }

    // Remove URLs before scanning for reserved keywords
    const inputWithoutUrls = debouncedInput.replace(URL_REGEX, "");

    const detectedWarnings = getReservedWarnings(inputWithoutUrls);
    setWarnings(detectedWarnings);
  }, [debouncedInput, hasRealText]);

  /* ===============================
     PROGRESS BAR (FIVERR STYLE)
  ================================ */
  const progress = useMemo(() => {
    if (!hasRealText) return 0;
    if (warnings.length > 0 || emailRemoved) return 70;
    return 100;
  }, [warnings, emailRemoved, hasRealText]);

  /* ===============================
     COPY HANDLER
  ================================ */
  const handleCopy = async () => {
    await navigator.clipboard.writeText(sanitized);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="app">
      <h1>Text Sanitizer</h1>

      <textarea
        className="input"
        placeholder="Type your text here..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      {/* PROGRESS BAR */}
      <div className="progress-wrapper">
        <div
          className="progress-bar"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* WARNINGS */}
      {emailRemoved && (
        <div className="warning">
          ⚠️ Email addresses are not allowed and were removed.
        </div>
      )}

      {warnings.length > 0 && (
        <div className="warning-box">
          <strong>Compliance Warnings:</strong>
          <ul>
            {warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* OUTPUT */}
      <pre className="output">{sanitized}</pre>

      {/* COPY BUTTON */}
      <button
        className={`copy-btn ${copied ? "copied" : ""}`}
        onClick={handleCopy}
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}