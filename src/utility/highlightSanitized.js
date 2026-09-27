// highlightSanitized.js

export function highlightSanitizedText(text) {
  if (!text) return "";

  /**
   * Highlight sanitized words containing "_" or "-"
   * Example: c_ontact, p_ayment, w_hatsapp, ma-il, em-ail
   */
  return text.replace(/\b\w+[_-]\w+\b/g, (match) => {
    return `<span class="highlight">${match}</span>`;
  });
}