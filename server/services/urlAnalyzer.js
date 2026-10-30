
function analyzeUrl(input) {
  if (typeof input !== "string" || !input.trim()) {
    throw new Error("Please provide a URL.");
  }

  if (input.length > 2048) {
    throw new Error("URL is too long.");
  }

  const value = input.trim();
  const candidate = /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(value)
    ? value
    : `https://${value}`;

  let parsed;

  try {
    parsed = new URL(candidate);
  } catch {
    throw new Error("Please enter a valid URL.");
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Only HTTP and HTTPS URLs are supported.");
  }

  if (!parsed.hostname || parsed.hostname.includes(" ")) {
    throw new Error("The URL must contain a valid hostname.");
  }

  const hostname = parsed.hostname.toLowerCase();
  const warnings = [];

  if (parsed.protocol !== "https:") {
    warnings.push({
      code: "NO_HTTPS",
      message: "The URL does not use HTTPS.",
    });
  }

  if (parsed.username || parsed.password) {
    warnings.push({
      code: "EMBEDDED_CREDENTIALS",
      message: "The URL contains embedded login credentials.",
    });
  }

  if (hostname.split(".").some(part => part.startsWith("xn--"))) {
    warnings.push({
      code: "PUNYCODE_HOST",
      message: "The hostname contains encoded international characters.",
    });
  }

  if (hostname.split(".").length > 4) {
    warnings.push({
      code: "MANY_SUBDOMAINS",
      message: "The hostname contains many subdomains.",
    });
  }

  const weights = {
    NO_HTTPS: 15,
    EMBEDDED_CREDENTIALS: 35,
    PUNYCODE_HOST: 25,
    MANY_SUBDOMAINS: 15,
  };

  const score = Math.min(
    100,
    warnings.reduce((total, warning) => total + weights[warning.code], 0)
  );

  let assessment = "No basic warning indicators";

  if (score >= 50) {
    assessment = "Elevated risk indicators";
  } else if (score > 0) {
    assessment = "Some warning indicators";
  }

  return {
    url: parsed.href,
    hostname,
    score,
    assessment,
    warnings,
    scannedAt: new Date().toISOString(),
    disclaimer:
      "This is a preliminary URL analysis, not a confirmed phishing verdict. A clean result does not prove safety.",
  };
}

module.exports = { analyzeUrl };
