import { useState, useEffect } from "react";
import { sanitizeText } from "./sanitizer";
import { getGrammarSuggestions } from "./grammarSuggestions";
import { getReservedWarnings } from "./utility/reservedWarnings";

export default function App() {
  const [input, setInput] = useState("");
  const [debouncedInput, setDebouncedInput] = useState("");

  const [grammarSuggestions, setGrammarSuggestions] = useState([]);
  const [reservedWarnings, setReservedWarnings] = useState([]);

  const [copied, setCopied] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  /* -------------------- DEBOUNCE -------------------- */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedInput(input);
    }, 400);
    return () => clearTimeout(timer);
  }, [input]);

  const normalizedInput = debouncedInput.trimStart();
  const hasRealText = normalizedInput.trim().length > 0;

  /* -------------------- SANITIZE -------------------- */
  const { text: sanitized, emailRemoved } = hasRealText
    ? sanitizeText(normalizedInput)
    : { text: "", emailRemoved: false };

  /* -------------------- COUNTERS -------------------- */
  const wordCount = hasRealText
    ? normalizedInput.trim().split(/\s+/).length
    : 0;

  const charCount = hasRealText ? normalizedInput.length : 0;

  /* -------------------- GRAMMAR -------------------- */
  useEffect(() => {
    if (!hasRealText) {
      setGrammarSuggestions([]);
      return;
    }
    setGrammarSuggestions(getGrammarSuggestions(normalizedInput));
  }, [debouncedInput]);

  /* -------------------- RESERVED WARNINGS -------------------- */
  useEffect(() => {
    if (!hasRealText) {
      setReservedWarnings([]);
      return;
    }
    setReservedWarnings(getReservedWarnings(normalizedInput));
  }, [debouncedInput]);

  /* -------------------- COPY -------------------- */
  const copyText = async () => {
    if (!hasRealText) return;
    await navigator.clipboard.writeText(sanitized);
    setCopied(true);
    setCopySuccess(true);
    setTimeout(() => {
      setCopied(false);
      setCopySuccess(false);
    }, 2000);
  };

  /* -------------------- HIGHLIGHT -------------------- */
  const highlightSanitized = (text) => {
    let html = text;

    // Highlight phone numbers
    html = html.replace(
      /\b\d(-\d)+\b/g,
      `<span class="phone-highlight">$&</span>`
    );

    // Highlight sanitized reserved keywords
    html = html.replace(
      /(\b\w_\w+\b)/g,
      `<span class="highlight">$1</span>`
    );

    return html;
  };

  /* -------------------- UI -------------------- */
  return (
    <div className="app-root">
      <div className="app-wrapper">
        <h1 className="headline-text">Fiverr Message Sanitizer</h1>

        <div className="editor-row">
          {/* INPUT */}
          <div className="editor-column">
            <label>Input Text</label>

            <textarea
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />

            <div className="counter">
              Words: {wordCount} | Characters: {charCount}
            </div>

            {/* COMPLIANCE WARNINGS */}
            {(reservedWarnings.length > 0 || emailRemoved) && (
              <div className="warning-box">
                <h3>Compliance Warnings</h3>

                {emailRemoved && (
                  <div className="warning-item">
                    <span className="warning-icon">⚠️</span>
                    <span>Email address was removed for compliance reasons.</span>
                  </div>
                )}

                {reservedWarnings.map((item, index) => (
                  <div key={index} className="warning-item">
                    <span className="warning-icon">⚠️</span>
                    <span>{item.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* PREVIEW */}
          <div className="editor-column">
            <label>Sanitized Preview</label>

            <button
              className={`copy-btn ${copied ? "copied" : ""}`}
              disabled={!hasRealText}
              onClick={copyText}
            >
              {copied ? "Copied!" : "Copy"}
            </button>

            <div
              className="preview-box"
              dangerouslySetInnerHTML={{
                __html: hasRealText
                  ? highlightSanitized(sanitized)
                  : "Nothing to preview yet..."
              }}
            />
          </div>
        </div>
      </div>

      {copySuccess && (
        <div className="copy-toast">✔ Text copied to clipboard</div>
      )}
    </div>
  );
}