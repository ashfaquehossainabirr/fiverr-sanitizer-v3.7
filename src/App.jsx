/* -------------------- Modules -------------------- */
import { useState, useEffect } from "react";
import { sanitizeText } from "./sanitizer";
import { getGrammarSuggestions } from "./grammarSuggestions";
import { getReservedWarnings } from "./utility/reservedWarnings.js";

const URL_REGEX = /\bhttps?:\/\/[^\s]+/gi;

export default function App() {

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [utterance, setUtterance] = useState(null);

  const [input, setInput] = useState("");
  const [debouncedInput, setDebouncedInput] = useState("");

  const [translatedText, setTranslatedText] = useState("");
  const [isTranslated, setIsTranslated] = useState(false);

  const [grammarSuggestions, setGrammarSuggestions] = useState([]);

  /* -------------------- DEBOUNCE -------------------- */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedInput(input);
    }, 400);

    return () => clearTimeout(timer);
  }, [input]);

  /* -------------------- NORMALIZATION -------------------- */
  const normalizedInput = debouncedInput.trimStart();
  const hasRealText = normalizedInput.trim().length > 0;

  /* -------------------- SANITIZE -------------------- */

  const { text: sanitized, emailRemoved } = hasRealText
  ? sanitizeText(normalizedInput)
  : { text: "", emailRemoved: false };

  /* -------------------- COUNTERS -------------------- */

  const hasRealCharacter = /[a-zA-Z0-9]/.test(input);
  const charCount = hasRealCharacter ? input.length : 0;

  const wordCount = hasRealCharacter
    ? input
        .trim()
        .split(/\s+/)
        .filter(Boolean).length
    : 0;

  const CHAR_LIMIT = 2500;
  const isLimitExceeded = charCount > CHAR_LIMIT;

  /* -------------------- GRAMMAR SUGGESTIONS -------------------- */
  useEffect(() => {
    if (!hasRealText) {
      setGrammarSuggestions([]);
      return;
    }

    const suggestions = getGrammarSuggestions(normalizedInput);
    setGrammarSuggestions(suggestions);
  }, [debouncedInput]);

  const applyGrammarFix = (fixedText) => {
    setInput(fixedText);
    setDebouncedInput(fixedText);
    setGrammarSuggestions([]);
    setIsTranslated(false);
    setTranslatedText("");
  };

  /* -------------------- ACTIONS -------------------- */
  const clearText = () => {
    setInput("");
    setDebouncedInput("");
    setGrammarSuggestions([]);
    setIsTranslated(false);
    setTranslatedText("");
  };

  const [copySuccess, setCopySuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyText = async () => {
    if (!hasRealText) return;

    await navigator.clipboard.writeText(sanitized);

    // Button animation
    setCopied(true);

    // Toast animation
    setCopySuccess(true);

    setTimeout(() => {
      setCopied(false);
      setCopySuccess(false);
    }, 2000);
  };

  const translateToBengali = async () => {
    if (!sanitized.trim()) return;

    try {
      const res = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=bn&dt=t&q=${encodeURIComponent(
          sanitized
        )}`
      );

      const data = await res.json();
      const translated = data[0].map((item) => item[0]).join("");

      setTranslatedText(translated);
      setIsTranslated(true);
    } catch {
      alert("Translation failed. Please try again.");
    }
  };

  const startReading = () => {
    if (!sanitized.trim()) return;

    // Stop anything already speaking
    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(sanitized);
    speech.lang = "en-US";
    speech.rate = 1;
    speech.pitch = 1;

    speech.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    setUtterance(speech);
    setIsSpeaking(true);
    setIsPaused(false);

    window.speechSynthesis.speak(speech);
  };

  const pauseReading = () => {
    window.speechSynthesis.pause();
    setIsPaused(true);
  };

  const resumeReading = () => {
    window.speechSynthesis.resume();
    setIsPaused(false);
  };

  const stopReading = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [sanitized]);

  /* -------------------- HIGHLIGHT -------------------- */
  // const highlightSanitized = (text) =>
  //   text.replace(/(\b\w_\w+\b)/g, `<span class="highlight">$1</span>`);

  const highlightSanitized = (text) => {
    let highlightedText = text;

    // Highlight spelling issues
    grammarSuggestions.forEach((item) => {
      if (item.type === "spelling" && item.incorrect) {
        const regex = new RegExp(`\\b(${item.incorrect})\\b`, "gi");
        highlightedText = highlightedText.replace(
          regex,
          `<span class="spell-error">$1</span>`
        );
      }
    });

    // Highlight phone numbers (already sanitized with dashes)
    highlightedText = highlightedText.replace(
      /\b\d(-\d)+\b/g,
      `<span class="phone-highlight">$&</span>`
    );

    // Highlight sanitized reserved words
    highlightedText = highlightedText.replace(
      /(\b\w_\w+\b)/g,
      `<span class="highlight">$1</span>`
    );

    return highlightedText;
  };

  const [reservedWarnings, setReservedWarnings] = useState([]);

  useEffect(() => {
    if (!hasRealText) {
      setReservedWarnings([]);
      return;
    }

    // Remove URLs before checking reserved keywords
    const textWithoutUrls = normalizedInput.replace(URL_REGEX, "");

    const warnings = getReservedWarnings(textWithoutUrls);
    setReservedWarnings(warnings);
  }, [debouncedInput]);

  // Date/Time Functionality
  const [now, setNow] = useState(new Date());

  useEffect(() => {
      const timer = setInterval(() => {
      setNow(new Date());
      }, 1000);

      return () => clearInterval(timer);
  });

  /* -------------------- UI -------------------- */
  return (
    <>
      {/* Time Component */}
      <div className='time-comp'>
        <p className='time-box'>Time: <span>{ now.toLocaleTimeString() }</span></p>
        <p className='date-box'>Date: <span>{ now.toLocaleDateString() }</span></p>
      </div>

      <div className="app-root">
        <div className="app-wrapper">
          <h1 className="headline-text">Fiverr Message Sanitizer</h1>
          {/* Credit */}
            <p className="subtitle">
              Developed By <a href="https://bd.linkedin.com/in/ashfaque-hossain-abir-91151723b">Ashfaque Hossain Abir</a>
          </p>

          <div className="editor-row">
            {/* INPUT COLUMN */}
            <div className="editor-column">
              <div className="input-header">
                <label>Input Text</label>

                {input && (
                  <button
                    type="button"
                    className="clear-btn"
                    onClick={clearText}
                  >
                    Clear
                  </button>
                )}
              </div>

              <textarea
                placeholder="Type your text here..."
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setIsTranslated(false);
                  setTranslatedText("");
                }}
              />

              <div className={`counter ${isLimitExceeded ? "counter-error" : ""}`}>
                Words: {wordCount} | Characters: {charCount}
              </div>

              {/* RESERVED KEYWORD WARNINGS */}
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

            {/* PREVIEW COLUMN */}
            <div className="editor-column">
              <div className="preview-header">
                <label>Sanitized Preview</label>

                <div className="preview-actions">
                  <button
                    className="translate-btn"
                    disabled={!hasRealText}
                    onClick={translateToBengali}
                  >
                    Translate to Bengali
                  </button>

                  <button
                    className={`read-btn ${isSpeaking ? "speaking" : ""}`}
                    disabled={!hasRealText}
                    onClick={() => {
                      if (!isSpeaking) startReading();
                      else if (isPaused) resumeReading();
                      else pauseReading();
                    }}
                  >
                    {!isSpeaking && "Read"}
                    {isSpeaking && !isPaused && "Pause"}
                    {isSpeaking && isPaused && "Resume"}
                  </button>

                  {isSpeaking && (
                    <button className="stop-btn" onClick={stopReading}>
                      Stop
                    </button>
                  )}

                  <button
                    className={`copy-btn ${copied ? "copied" : ""}`}
                    disabled={!hasRealText}
                    onClick={copyText}
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              <div
                className="preview-box"
                dangerouslySetInnerHTML={{
                  __html: isTranslated
                    ? translatedText
                    : hasRealText
                    ? highlightSanitized(sanitized)
                    : "Nothing to preview yet..."
                }}
              />
            </div>
          </div>

          {/* GRAMMAR SUGGESTIONS */}
          {grammarSuggestions.length > 0 && (
            <div className="grammar-box">
              <h3>Grammar Suggestions</h3>

              {grammarSuggestions.map((item, index) => (
                <div key={index} className="grammar-item">
                  <span>{item.message}</span>

                  <button className="apply-btn" onClick={() => applyGrammarFix(item.fixedText)}>
                    Apply
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {copySuccess && (
          <div className="copy-toast">
            ✔ Text copied to clipboard
          </div>
        )}
      </div>
    </>
  );
}