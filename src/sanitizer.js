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
   SAFE WORD REPLACEMENTS
================================ */
const REPLACEMENTS = {
  review: "check",
  feedback: "response"
};

/* ===============================
   REGEX
================================ */
const EMAIL_REGEX =
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;

const PHONE_REGEX = /\b\d{10,15}\b/g;

/* ===============================
   HELPERS
================================ */
function sanitizeWord(word) {
  if (!word || word.length < 2) return word;
  if (word[1] === "_") return word;
  return `${word[0]}_${word.slice(1)}`;
}

function formatPhoneNumber(phone) {
  return phone.split("").join("-");
}

/* ===============================
   MAIN SANITIZER
================================ */
export function sanitizeText(text) {
  if (!text) {
    return { sanitizedText: text, warnings: [] };
  }

  let sanitized = text;
  const warnings = [];

  /* DETECT & REMOVE EMAILS */
  if (EMAIL_REGEX.test(sanitized)) {
    sanitized = sanitized.replace(EMAIL_REGEX, "");
    warnings.push("Email addresses are not allowed and were removed.");
  }

  /* FORMAT PHONE NUMBERS */
  sanitized = sanitized.replace(PHONE_REGEX, (match) =>
    formatPhoneNumber(match)
  );

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

  /* REMOVE UNSAFE SYMBOLS */
  sanitized = sanitized.replace(/[<>()[\]{}"'`;]/g, "");

  /* CLEAN EXTRA SPACES */
  sanitized = sanitized
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([.,!?])/g, "$1")
    .trim();

  return {
    sanitizedText: sanitized,
    warnings
  };
}