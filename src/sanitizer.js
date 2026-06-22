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

// Replacement keywords
const REPLACEMENTS = {
  review: "check",
  feedback: "response"
};

// URL detection
const URL_REGEX =
  /\bhttps?:\/\/[^\s]+|\bwww\.[^\s]+|\b[a-z0-9-]+\.(com|net|org|io|co|me|info)\b/gi;

// Insert "_" after first character
function sanitizeWord(word) {
  if (!word || word.length < 2) return word;
  if (word[1] === "_") return word;
  return `${word[0]}_${word.slice(1)}`;
}

export function sanitizeText(text) {
  if (!text) return text;

  let sanitized = text;
  const urls = [];

  // Remove URLs
  sanitized = sanitized.replace(URL_REGEX, (match) => {
    const placeholder = `__URL_${urls.length}__`;
    urls.push(match);
    return placeholder;
  });

  // Replace mapped keywords
  Object.keys(REPLACEMENTS).forEach((key) => {
    const regex = new RegExp(`\\b${key}\\b`, "gi");
    sanitized = sanitized.replace(regex, REPLACEMENTS[key]);
  });

  // Sanitize reserved keywords
  RESERVED_KEYWORDS.forEach((keyword) => {
    const regex = new RegExp(`\\b${keyword}\\b`, "gi");
    sanitized = sanitized.replace(regex, (match) =>
      sanitizeWord(match)
    );
  });

  // Restore URLs
  urls.forEach((url, index) => {
    sanitized = sanitized.replace(`__URL_${index}__`, url);
  });

  return sanitized;
}