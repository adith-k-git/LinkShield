
import { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  Search,
  AlertTriangle,
  CheckCircle,
  LoaderCircle,
  Info,
  History,
  RefreshCw,
  Trash2,
} from "lucide-react";
import "./App.css";

const API_BASE = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api`;

function App() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");
  const [clearingHistory, setClearingHistory] = useState(false);

  // Load recent scans from MongoDB
  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryError("");

    try {
      const response = await fetch(`${API_BASE}/scans`);

      if (!response.ok) {
        throw new Error("Unable to load scan history.");
      }

      const data = await response.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch (error) {
      setHistoryError(error.message);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  async function clearHistory() {
    const confirmed = window.confirm(
      "Are you sure you want to delete all scan history? This action cannot be undone."
    );

    if (!confirmed || clearingHistory) return;

    setClearingHistory(true);
    setHistoryError("");

    try {
      const response = await fetch(`${API_BASE}/scans`, { method: "DELETE" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to clear scan history.");
      }

      setHistory([]);
    } catch (error) {
      setHistoryError(
        error.message || "Could not connect to LinkShield to clear history."
      );
    } finally {
      setClearingHistory(false);
    }
  }

  // Load history when dashboard opens
  useEffect(() => {
    let ignore = false;

    async function loadInitialHistory() {
      try {
        const response = await fetch(`${API_BASE}/scans`);

        if (!response.ok) {
          throw new Error("Unable to load scan history.");
        }

        const data = await response.json();

        if (!ignore) {
          setHistory(Array.isArray(data) ? data : []);
          setHistoryError("");
        }
      } catch (error) {
        if (!ignore) {
          setHistoryError(error.message);
        }
      } finally {
        if (!ignore) {
          setHistoryLoading(false);
        }
      }
    }

    loadInitialHistory();

    return () => {
      ignore = true;
    };
  }, []);

  // Analyze URL
  async function analyzeUrl(event) {
    event.preventDefault();

    const input = url.trim();

    if (!input || loading) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE}/scan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: input }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to analyze this URL.");
      }

      setResult({
        success: true,
        url: data.url,
        hostname: data.hostname,
        score: data.score,
        assessment: data.assessment,
        warnings: Array.isArray(data.warnings) ? data.warnings : [],
        scannedAt: data.scannedAt,
        disclaimer: data.disclaimer,
        threatCheck: data.threatCheck || {
          status: "unavailable",
          message: "Google Safe Browsing result was not received.",
          threatTypes: [],
        },
      });

      // Refresh history after successful scan
      await fetchHistory();
    } catch (error) {
      setResult({
        success: false,
        message:
          error.message ||
          "Could not connect to LinkShield. Check that the backend is running.",
      });
    } finally {
      setLoading(false);
    }
  }

  function clearScan() {
    setUrl("");
    setResult(null);
  }

  function getRiskColor(score) {
    if (score >= 50) return "#fb7185";
    if (score > 0) return "#fbbf24";
    return "#5ee6b0";
  }

  function formatDate(date) {
    if (!date) return "Unknown date";

    return new Date(date).toLocaleString();
  }

  function getThreatStatus(status) {
    switch (status) {
      case "unsafe":
        return {
          title: "Known threat detected",
          color: "#fb7185",
          icon: <AlertTriangle size={22} />,
        };

      case "no_match":
        return {
          title: "No known threat found",
          color: "#5ee6b0",
          icon: <CheckCircle size={22} />,
        };

      default:
        return {
          title: "Threat check unavailable",
          color: "#fbbf24",
          icon: <Info size={22} />,
        };
    }
  }

  return (
    <main className="app">
      <nav className="navbar">
        <a className="brand" href="/">
          <ShieldCheck size={28} />
          <span>LinkShield</span>
        </a>

        <span className="nav-label">URL SECURITY ANALYZER</span>
      </nav>

      <section className="hero">
        <div className="eyebrow">
          <span className="status-dot" />
          FREE SECURITY TOOL
        </div>

        <h1>
          Think before
          <br />
          you <span>click.</span>
        </h1>

        <p className="subtitle">
          Inspect suspicious links and understand potential warning signs
          before opening them.
        </p>

        <form className="scan-form" onSubmit={analyzeUrl}>
          <Search size={21} />

          <input
            type="text"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="Enter a URL to inspect..."
            aria-label="URL to inspect"
            autoComplete="url"
            disabled={loading}
          />

          <button type="submit" disabled={loading || !url.trim()}>
            {loading ? (
              <>
                <LoaderCircle size={17} className="spinner" />
                Analyzing
              </>
            ) : (
              "Analyze URL"
            )}
          </button>
        </form>

        <p className="privacy-note">
          <ShieldCheck size={15} />
          Free analysis · Google threat intelligence
        </p>
      </section>

      {/* Scan result */}
      {result && (
        <section className="result-card" aria-live="polite">
          {!result.success ? (
            <div className="result-heading">
              <AlertTriangle size={26} color="#fb7185" />

              <div>
                <h2>Scan failed</h2>
                <p>{result.message}</p>
                <p>
                  Make sure your Express backend is running on port 5000.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="result-heading">
                {result.score > 0 ? (
                  <AlertTriangle
                    size={26}
                    color={getRiskColor(result.score)}
                  />
                ) : (
                  <CheckCircle size={26} color={getRiskColor(0)} />
                )}

                <div>
                  <h2>{result.assessment}</h2>
                  <p>{result.hostname}</p>
                </div>
              </div>

              <div className="score-section">
                <div className="score-header">
                  <span>Risk score</span>

                  <strong style={{ color: getRiskColor(result.score) }}>
                    {result.score}/100
                  </strong>
                </div>

                <div
                  className="score-track"
                  role="progressbar"
                  aria-label="Risk score"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={result.score}
                >
                  <div
                    className="score-fill"
                    style={{
                      width: `${result.score}%`,
                      background: getRiskColor(result.score),
                    }}
                  />
                </div>
              </div>

              {/* Google Safe Browsing result */}
              <div className="threat-check-section">
                <h3>Google Safe Browsing Check</h3>

                {(() => {
                  const threat = getThreatStatus(
                    result.threatCheck?.status
                  );

                  return (
                    <div className="threat-status">
                      <div style={{ color: threat.color }}>
                        {threat.icon}
                      </div>

                      <div>
                        <strong style={{ color: threat.color }}>
                          {threat.title}
                        </strong>

                        <p>{result.threatCheck?.message}</p>
                      </div>
                    </div>
                  );
                })()}

                {result.threatCheck?.threatTypes?.length > 0 && (
                  <div className="threat-types">
                    <strong>Detected threat types:</strong>

                    <ul>
                      {result.threatCheck.threatTypes.map((type) => (
                        <li key={type}>{type.replaceAll("_", " ")}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <h3>Inspection findings</h3>

              {result.warnings.length > 0 ? (
                <ul className="warning-list">
                  {result.warnings.map((warning, index) => (
                    <li key={warning.code || index}>
                      <AlertTriangle size={17} />
                      <span>{warning.message}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="clean-result">
                  <CheckCircle size={18} />
                  No basic warning indicators were detected.
                </p>
              )}

              <div className="result-note">
                <Info size={17} />
                <p>
                  {result.disclaimer ||
                    "This preliminary analysis does not prove that a website is safe."}
                  {" "}A Google no-match result also does not guarantee safety.
                </p>
              </div>

              <p className="scanned-url">
                <strong>Scanned URL:</strong> {result.url}
              </p>

              {result.scannedAt && (
                <p className="scan-time">
                  Scanned at: {formatDate(result.scannedAt)}
                </p>
              )}
            </>
          )}

          <button
            type="button"
            className="clear-button"
            onClick={clearScan}
          >
            Scan another URL
          </button>
        </section>
      )}

      {/* Recent scan history */}
      <section className="history-section">
        <div className="history-header">
          <div className="history-title">
            <History size={23} />
            <div>
              <h2>Recent Scan History</h2>
              <p>Your latest URL analysis records</p>
            </div>
          </div>

          <div className="history-actions">
            <button
              type="button"
              className="refresh-button"
              onClick={fetchHistory}
              disabled={historyLoading || clearingHistory}
            >
              <RefreshCw
                size={16}
                className={historyLoading ? "spinner" : ""}
              />
              Refresh
            </button>
            <button
              type="button"
              className="clear-history-button"
              onClick={clearHistory}
              disabled={clearingHistory || historyLoading || history.length === 0}
            >
              {clearingHistory ? (
                <LoaderCircle size={16} className="spinner" />
              ) : (
                <Trash2 size={16} />
              )}
              {clearingHistory ? "Clearing…" : "Clear History"}
            </button>
          </div>
        </div>

        {historyError && (
          <div className="history-message history-error" role="alert">
            <AlertTriangle size={22} />
            <p>{historyError}</p>
          </div>
        )}

        {historyLoading ? (
          <div className="history-message">
            <LoaderCircle size={22} className="spinner" />
            <p>Loading scan history...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="history-message">
            <History size={30} />
            <p>No scans yet. Analyze your first URL!</p>
          </div>
        ) : (
          <div className="history-list">
            {history.map((scan) => (
              <article className="history-item" key={scan._id}>
                <div className="history-item-main">
                  <div className="history-url">
                    <ShieldCheck size={18} />
                    <div>
                      <strong>{scan.hostname}</strong>
                      <p>{scan.url}</p>
                    </div>
                  </div>

                  <div className="history-meta">
                    <span
                      className="history-score"
                      style={{ color: getRiskColor(scan.score) }}
                    >
                      {scan.score}/100
                    </span>

                    <span className="history-assessment">
                      {scan.assessment}
                    </span>
                  </div>
                </div>

                <div className="history-footer">
                  <span>{formatDate(scan.createdAt)}</span>
                  <span>
                    {scan.warnings?.length || 0} warning(s)
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="features">
        <article>
          <ShieldCheck size={25} />
          <h3>Inspect links</h3>
          <p>Analyze URL structure for selected warning signs.</p>
        </article>

        <article>
          <Search size={25} />
          <h3>Understand findings</h3>
          <p>See which patterns triggered security warnings.</p>
        </article>

        <article>
          <CheckCircle size={25} />
          <h3>Make informed decisions</h3>
          <p>A clean result is not proof that a site is trustworthy.</p>
        </article>
      </section>

      <footer>
        LinkShield · Educational security project · Not a guarantee of safety
      </footer>
    </main>
  );
}

export default App;
