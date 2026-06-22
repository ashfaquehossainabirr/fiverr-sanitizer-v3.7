/* ===============================
   RESERVED KEYWORDS
================================ */
export const RESERVED_KEYWORDS = [
  "contact",
  "paid",
  "pay",
  "payment",
  "email",
  "whatsapp",
  "telegram",
  "skype",
  "zoom",
  "discord",
  "wechat",
  "signal",
  "instagram",
  "facebook",
  "linkedin",
  "twitter",
  "tiktok",
  "price",
  "money",
  "youtube",
  "gmail",
  "google",
  "call",
  "paypal",
  "payoneer",
  "bank",
  "upwork",
  "freelancer",
  "service",
  "services",
  "mail",
  "phone"
];

/* ===============================
   REPLACEMENT WORDS
================================ */
const REPLACEMENTS = {
  review: "check",
  feedback: "response"
};

/* ===============================
   REGEX PATTERNS
================================ */
const EMAIL_REGEX =
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;

const URL_REGEX =
  /\bhttps?:\/\/[^\s]+|\bwww\.[^\s]+|\b[a-z0-9-]+\.(com|net|org|io|co|me|info)\b/gi;

/* ===============================
   HELPERS
================================ */

// Inserts "_" after first character
function sanitizeWord(word) {
  if (!word || word.length < 2) return word;
  if (word[1] === "_") return word;
  return `${word[0]}_${word.slice(1)}`;
}

// Turns email into a-b-c-@-g-m-a-i-l-.-c-o-m
function sanitizeEmail(email) {
  return email.split("").join("-");
}

/* ===============================
   MAIN SANITIZER
================================ */
export function sanitizeText(text) {
  if (!text) return text;

  let sanitized = text;

  const emails = [];
  const urls = [];

  /* REMOVE EMAILS FIRST */
  sanitized = sanitized.replace(EMAIL_REGEX, (match) => {
    const placeholder = `__EMAIL_${emails.length}__`;
    emails.push(match);
    return placeholder;
  });

  /* REMOVE URLs */
  sanitized = sanitized.replace(URL_REGEX, (match) => {
    const placeholder = `__URL_${urls.length}__`;
    urls.push(match);
    return placeholder;
  });

  /* REPLACE SAFE WORDS */
  Object.keys(REPLACEMENTS).forEach((key) => {
    const regex = new RegExp(`\\b${key}\\b`, "gi");
    sanitized = sanitized.replace(regex, REPLACEMENTS[key]);
  });

  /* SANITIZE RESERVED KEYWORDS */
  RESERVED_KEYWORDS.forEach((keyword) => {
    const regex = new RegExp(`\\b${keyword}\\b`, "gi");
    sanitized = sanitized.replace(regex, (match) =>
      sanitizeWord(match)
    );
  });

  /* RESTORE EMAILS (SANITIZED) */
  emails.forEach((email, index) => {
    sanitized = sanitized.replace(
      `__EMAIL_${index}__`,
      sanitizeEmail(email)
    );
  });

  /* RESTORE URLs (UNCHANGED) */
  urls.forEach((url, index) => {
    sanitized = sanitized.replace(`__URL_${index}__`, url);
  });

  return sanitized;
}