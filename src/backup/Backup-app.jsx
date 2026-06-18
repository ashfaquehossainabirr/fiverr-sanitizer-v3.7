import { useState } from "react";
import { sanitizeText } from "../sanitizer";

export default function App() {
  const [translatedText, setTranslatedText] = useState("");
  const [isTranslated, setIsTranslated] = useState(false);

  const [input, setInput] = useState("");

  const sanitized = sanitizeText(input);

  const normalizedInput = input.trimStart();

  const wordCount = normalizedInput
  ? normalizedInput
      .trim()
      .split(/\s+/)
      .filter(Boolean).length
  : 0;

  const charCount = normalizedInput.length;

  const copyText = () => {
    if (!input.trim()) return;

    navigator.clipboard.writeText(sanitized);
    alert("Sanitized text copied!");
  };

  const highlightSanitized = (text) => {
    return text.replace(/(\w_\w+)/g, `<span class="highlight">$1</span>`);
  };

  const clearText = () => {
    setInput("");
    setIsTranslated(false);
    setTranslatedText("");
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

      const translated = data[0]
        .map(item => item[0])
        .join("");

      setTranslatedText(translated);
      setIsTranslated(true);
    } catch (error) {
      alert("Translation failed. Please try again.");
    }
  };

  return (
    <div className="app-root">
      <div className="app-wrapper">
        <h1>Text Sanitizer & Grammar Helper</h1>

        <div className="editor-row">
          {/* INPUT */}
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
              // onChange={(e) => setInput(e.target.value)}
              onChange={(e) => {
                setInput(e.target.value);
                setIsTranslated(false);
                setTranslatedText("");
              }}
            />
            <div className="counter">
              Words: {wordCount} | Characters: {charCount}
            </div>
          </div>

          {/* PREVIEW */}
          <div className="editor-column">
            <div className="preview-header">
              <label>Sanitized Preview</label>

              <div className="preview-actions">
                <button
                  type="button"
                  className="translate-btn"
                  disabled={!input.trim()}
                  onClick={translateToBengali}
                >
                  Translate to Bengali
                </button>
                <button onClick={copyText} disabled={!input.trim()}>Copy</button>
              </div>
            </div>

            {/* <div
              className="preview-box"
              dangerouslySetInnerHTML={{
                __html: sanitized
                  ? highlightSanitized(sanitized)
                  : "Nothing to preview yet..."
              }}
            /> */}

            <div
              className="preview-box"
              dangerouslySetInnerHTML={{
                __html: isTranslated
                  ? translatedText
                  : sanitized
                  ? highlightSanitized(sanitized)
                  : "Nothing to preview yet..."
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}