
const checkSafeBrowsing = async (url) => {
  const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;

  if (!apiKey) {
    return {
      status: "unavailable",
      message: "Google Safe Browsing API key is not configured.",
      threatTypes: [],
    };
  }

  try {
    const response = await fetch(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client: {
            clientId: "linkshield",
            clientVersion: "1.0.0",
          },
          threatInfo: {
            threatTypes: [
              "MALWARE",
              "SOCIAL_ENGINEERING",
              "UNWANTED_SOFTWARE",
            ],
            platformTypes: ["ANY_PLATFORM"],
            threatEntryTypes: ["URL"],
            threatEntries: [{ url }],
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      console.error("Safe Browsing API error:", errorData);

      return {
        status: "unavailable",
        message: "Google Safe Browsing check failed.",
        threatTypes: [],
      };
    }

    const data = await response.json();
    const matches = data.matches || [];

    if (matches.length > 0) {
      return {
        status: "unsafe",
        message: "Google Safe Browsing detected a known threat.",
        threatTypes: [...new Set(matches.map((match) => match.threatType))],
      };
    }

    return {
      status: "no_match",
      message: "No known threat was found in Google's database.",
      threatTypes: [],
    };
  } catch (error) {
    console.error("Safe Browsing request failed:", error.message);

    return {
      status: "unavailable",
      message: "Unable to contact Google Safe Browsing.",
      threatTypes: [],
    };
  }
};

module.exports = { checkSafeBrowsing };
