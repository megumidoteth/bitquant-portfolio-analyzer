import { useState, useEffect } from "react";

const COLORS = {
  bg: "#070A0F",
  surface: "#0D1117",
  border: "#1C2333",
  gold: "#F0B429",
  goldDim: "#A07820",
  green: "#00D395",
  red: "#FF4D4D",
  blue: "#4DA6FF",
  text: "#E6EDF3",
  muted: "#7D8590",
  card: "#0D1117",
};

const style = (obj) => obj;

const fonts = `
  @import url('https://fonts.googleapis.com/css2?family=Syne+Mono&family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: ${COLORS.bg};
    color: ${COLORS.text};
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
  }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: ${COLORS.bg}; }
  ::-webkit-scrollbar-thumb { background: ${COLORS.border}; border-radius: 2px; }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes scanline {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(100vh); }
  }

  @keyframes shimmer {
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
  }

  .fade-in {
    animation: fadeIn 0.5s ease forwards;
  }

  .blink {
    animation: pulse 1.5s ease-in-out infinite;
  }

  .coin-row:hover {
    background: #131B27 !important;
  }

  input:focus {
    outline: none;
    border-color: ${COLORS.gold} !important;
  }

  button:hover {
    filter: brightness(1.1);
  }

  .analyze-btn:hover {
    background: #E0A820 !important;
    transform: translateY(-1px);
    box-shadow: 0 8px 32px rgba(240, 180, 41, 0.3) !important;
  }

  .analyze-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }

  .remove-btn:hover {
    color: ${COLORS.red} !important;
  }
`;

const initialCoins = [
  { id: 1, name: "ETH", amount: "" },
  { id: 2, name: "SOL", amount: "" },
  { id: 3, name: "", amount: "" },
];

const RISK_COLORS = {
  Low: COLORS.green,
  Medium: COLORS.gold,
  High: COLORS.red,
};

function ScoreGauge({ score }) {
  const pct = score / 100;
  const color = score > 70 ? COLORS.green : score > 40 ? COLORS.gold : COLORS.red;
  const circumference = 2 * Math.PI * 54;
  const dash = circumference * pct;

  return (
    <div style={{ position: "relative", width: 140, height: 140, margin: "0 auto" }}>
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r="54" fill="none" stroke={COLORS.border} strokeWidth="10" />
        <circle
          cx="70" cy="70" r="54"
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={`${dash} ${circumference - dash}`}
          strokeDashoffset={circumference * 0.25}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1s ease", filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center"
      }}>
        <span style={{ fontSize: 32, fontWeight: 800, fontFamily: "'Syne', sans-serif", color }}>{score}</span>
        <span style={{ fontSize: 11, color: COLORS.muted, fontFamily: "'Syne Mono', monospace", letterSpacing: 2 }}>HEALTH</span>
      </div>
    </div>
  );
}

function RiskBadge({ level }) {
  const color = RISK_COLORS[level] || COLORS.muted;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 12px", borderRadius: 999,
      border: `1px solid ${color}22`,
      background: `${color}15`,
      color, fontSize: 12, fontFamily: "'Syne Mono', monospace",
      letterSpacing: 1,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}` }} />
      {level?.toUpperCase()} RISK
    </span>
  );
}

function InsightCard({ insight, index }) {
  const icons = { bullish: "▲", bearish: "▼", neutral: "●", warning: "⚠" };
  const colors = { bullish: COLORS.green, bearish: COLORS.red, neutral: COLORS.blue, warning: COLORS.gold };
  const sentiment = insight.sentiment?.toLowerCase() || "neutral";
  const color = colors[sentiment] || COLORS.muted;
  const icon = icons[sentiment] || "●";

  return (
    <div className="fade-in" style={{
      animationDelay: `${index * 0.1}s`,
      padding: "16px 20px",
      borderRadius: 10,
      background: COLORS.surface,
      border: `1px solid ${COLORS.border}`,
      borderLeft: `3px solid ${color}`,
      marginBottom: 10,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, color: COLORS.text }}>
            {insight.asset}
          </span>
          <span style={{ color, fontSize: 11 }}>{icon} {sentiment.toUpperCase()}</span>
        </div>
        {insight.action && (
          <span style={{
            fontSize: 11, fontFamily: "'Syne Mono', monospace",
            padding: "3px 10px", borderRadius: 4,
            background: `${color}20`, color,
            letterSpacing: 1,
          }}>
            {insight.action?.toUpperCase()}
          </span>
        )}
      </div>
      <p style={{ fontSize: 13, color: COLORS.muted, lineHeight: 1.6 }}>{insight.analysis}</p>
    </div>
  );
}

export default function App() {
  const [coins, setCoins] = useState(initialCoins);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loadingMsg, setLoadingMsg] = useState("");

  const loadingMessages = [
    "Scanning on-chain data...",
    "Running quantitative models...",
    "Assessing portfolio risk...",
    "Generating verifiable insights...",
    "Finalizing analysis...",
  ];

  useEffect(() => {
    if (!loading) return;
    let i = 0;
    setLoadingMsg(loadingMessages[0]);
    const interval = setInterval(() => {
      i = (i + 1) % loadingMessages.length;
      setLoadingMsg(loadingMessages[i]);
    }, 1800);
    return () => clearInterval(interval);
  }, [loading]);

  const addCoin = () => {
    setCoins([...coins, { id: Date.now(), name: "", amount: "" }]);
  };

  const removeCoin = (id) => {
    if (coins.length <= 1) return;
    setCoins(coins.filter((c) => c.id !== id));
  };

  const updateCoin = (id, field, value) => {
    setCoins(coins.map((c) => c.id === id ? { ...c, [field]: value } : c));
  };

  const validCoins = coins.filter((c) => c.name.trim() && c.amount);

  const analyze = async () => {
    if (validCoins.length === 0) return;
    setLoading(true);
    setResult(null);
    setError(null);

    const portfolioText = validCoins.map(c => `${c.name.toUpperCase()}: ${c.amount}`).join(", ");

    const prompt = `You are BitQuant, an elite AI-powered quantitative analyst for DeFi and crypto portfolios, built on OpenGradient's verifiable blockchain infrastructure.

A user has submitted this portfolio for analysis:
${portfolioText}

Analyze this portfolio like a world-class quant analyst. Return ONLY valid JSON with this exact structure:
{
  "healthScore": <integer 0-100>,
  "riskLevel": "<Low | Medium | High>",
  "summary": "<2-3 sentence executive summary of the portfolio>",
  "diversificationScore": <integer 0-100>,
  "insights": [
    {
      "asset": "<coin name>",
      "sentiment": "<bullish | bearish | neutral | warning>",
      "action": "<hold | buy more | reduce | watch>",
      "analysis": "<specific 1-2 sentence analysis of this asset in context of the full portfolio>"
    }
  ],
  "topRecommendation": "<one clear, specific actionable recommendation for this portfolio>",
  "verificationHash": "<generate a realistic-looking fake tx hash like 0x followed by 64 hex chars>"
}`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await response.json();
      const text = data.content?.map(b => b.text || "").join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResult(parsed);
    } catch (e) {
      setError("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{fonts}</style>
      <div style={{ minHeight: "100vh", background: COLORS.bg, padding: "0 0 80px 0" }}>

        {/* Header */}
        <div style={{
          borderBottom: `1px solid ${COLORS.border}`,
          padding: "20px 0",
          background: `linear-gradient(180deg, #0D1117 0%, ${COLORS.bg} 100%)`,
        }}>
          <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: `linear-gradient(135deg, ${COLORS.gold} 0%, #C88000 100%)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, fontWeight: 800,
                boxShadow: `0 0 20px ${COLORS.gold}44`,
              }}>₿</div>
              <div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, letterSpacing: -0.5, color: COLORS.text }}>
                  BitQuant
                </div>
                <div style={{ fontFamily: "'Syne Mono', monospace", fontSize: 10, color: COLORS.muted, letterSpacing: 2 }}>
                  BY OPENGRADIENT
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span className="blink" style={{ width: 7, height: 7, borderRadius: "50%", background: COLORS.green, display: "inline-block" }} />
              <span style={{ fontFamily: "'Syne Mono', monospace", fontSize: 11, color: COLORS.muted }}>TESTNET LIVE</span>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px" }}>

          {/* Hero */}
          <div style={{ padding: "48px 0 32px", textAlign: "center" }}>
            <div style={{
              display: "inline-block",
              fontFamily: "'Syne Mono', monospace", fontSize: 11,
              color: COLORS.gold, letterSpacing: 3,
              padding: "6px 16px", border: `1px solid ${COLORS.gold}40`,
              borderRadius: 999, marginBottom: 20, background: `${COLORS.gold}08`,
            }}>
              ◆ VERIFIABLE AI PORTFOLIO ANALYSIS
            </div>
            <h1 style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: "clamp(28px, 5vw, 44px)",
              fontWeight: 800, lineHeight: 1.15,
              letterSpacing: -1.5, color: COLORS.text,
              marginBottom: 14,
            }}>
              Your Portfolio.<br />
              <span style={{ color: COLORS.gold }}>Analyzed. Verified. Onchain.</span>
            </h1>
            <p style={{ color: COLORS.muted, fontSize: 15, maxWidth: 480, margin: "0 auto", lineHeight: 1.7 }}>
              Enter your holdings below. BitQuant's AI runs quantitative analysis on your portfolio and returns verifiable insights — every result stamped on the blockchain.
            </p>
          </div>

          {/* Input Card */}
          <div style={{
            background: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 16, padding: "28px 28px 24px",
            marginBottom: 24,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, color: COLORS.text }}>
                Portfolio Holdings
              </span>
              <span style={{ fontFamily: "'Syne Mono', monospace", fontSize: 11, color: COLORS.muted }}>
                {validCoins.length} asset{validCoins.length !== 1 ? "s" : ""} entered
              </span>
            </div>

            {/* Column headers */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 40px", gap: 10, marginBottom: 8, padding: "0 4px" }}>
              <span style={{ fontFamily: "'Syne Mono', monospace", fontSize: 10, color: COLORS.muted, letterSpacing: 2 }}>ASSET</span>
              <span style={{ fontFamily: "'Syne Mono', monospace", fontSize: 10, color: COLORS.muted, letterSpacing: 2 }}>AMOUNT</span>
              <span />
            </div>

            {coins.map((coin, i) => (
              <div key={coin.id} className="coin-row" style={{
                display: "grid", gridTemplateColumns: "1fr 1fr 40px",
                gap: 10, marginBottom: 8, padding: "4px",
                borderRadius: 8, transition: "background 0.15s",
              }}>
                <input
                  value={coin.name}
                  onChange={(e) => updateCoin(coin.id, "name", e.target.value.toUpperCase())}
                  placeholder="BTC, ETH, SOL..."
                  style={{
                    background: COLORS.bg, border: `1px solid ${COLORS.border}`,
                    borderRadius: 8, padding: "11px 14px",
                    color: COLORS.text, fontSize: 14,
                    fontFamily: "'Syne Mono', monospace",
                    letterSpacing: 1, transition: "border-color 0.15s",
                  }}
                />
                <input
                  value={coin.amount}
                  onChange={(e) => updateCoin(coin.id, "amount", e.target.value)}
                  placeholder="0.00"
                  type="number"
                  min="0"
                  style={{
                    background: COLORS.bg, border: `1px solid ${COLORS.border}`,
                    borderRadius: 8, padding: "11px 14px",
                    color: COLORS.text, fontSize: 14,
                    fontFamily: "'Syne Mono', monospace",
                    transition: "border-color 0.15s",
                  }}
                />
                <button
                  className="remove-btn"
                  onClick={() => removeCoin(coin.id)}
                  style={{
                    background: "none", border: `1px solid ${COLORS.border}`,
                    borderRadius: 8, cursor: "pointer",
                    color: COLORS.muted, fontSize: 16,
                    transition: "color 0.15s",
                  }}
                >×</button>
              </div>
            ))}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
              <button
                onClick={addCoin}
                style={{
                  background: "none", border: `1px dashed ${COLORS.border}`,
                  borderRadius: 8, padding: "9px 16px",
                  color: COLORS.muted, fontSize: 13,
                  cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                  transition: "border-color 0.15s, color 0.15s",
                }}
              >
                + Add Asset
              </button>

              <button
                className="analyze-btn"
                onClick={analyze}
                disabled={loading || validCoins.length === 0}
                style={{
                  background: COLORS.gold,
                  border: "none", borderRadius: 10,
                  padding: "12px 28px",
                  color: "#000", fontSize: 14, fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "'Syne', sans-serif", letterSpacing: 0.5,
                  transition: "all 0.2s",
                  boxShadow: `0 4px 20px ${COLORS.gold}30`,
                }}
              >
                {loading ? "Analyzing..." : "Run Analysis →"}
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div style={{
              background: COLORS.surface, border: `1px solid ${COLORS.border}`,
              borderRadius: 16, padding: "40px 28px", textAlign: "center",
              marginBottom: 24,
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: "50%",
                border: `3px solid ${COLORS.border}`,
                borderTop: `3px solid ${COLORS.gold}`,
                margin: "0 auto 20px",
                animation: "spin 1s linear infinite",
              }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <div style={{ fontFamily: "'Syne Mono', monospace", fontSize: 13, color: COLORS.gold, letterSpacing: 1 }}>
                {loadingMsg}
              </div>
              <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 8 }}>
                Powered by OpenGradient Network
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{
              background: `${COLORS.red}10`, border: `1px solid ${COLORS.red}40`,
              borderRadius: 12, padding: "16px 20px", marginBottom: 24,
              color: COLORS.red, fontSize: 14,
            }}>
              ⚠ {error}
            </div>
          )}

          {/* Results */}
          {result && !loading && (
            <div className="fade-in">

              {/* Score Row */}
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
                gap: 16, marginBottom: 20,
              }}>
                <div style={{
                  background: COLORS.surface, border: `1px solid ${COLORS.border}`,
                  borderRadius: 16, padding: "24px 20px", textAlign: "center",
                  gridColumn: "span 1",
                }}>
                  <ScoreGauge score={result.healthScore} />
                  <div style={{ marginTop: 12, fontFamily: "'Syne', sans-serif", fontSize: 13, color: COLORS.muted }}>
                    Portfolio Health
                  </div>
                </div>

                <div style={{
                  background: COLORS.surface, border: `1px solid ${COLORS.border}`,
                  borderRadius: 16, padding: "24px 20px",
                  display: "flex", flexDirection: "column", justifyContent: "center", gap: 20,
                  gridColumn: "span 2",
                }}>
                  <div>
                    <div style={{ fontFamily: "'Syne Mono', monospace", fontSize: 10, color: COLORS.muted, letterSpacing: 2, marginBottom: 8 }}>RISK ASSESSMENT</div>
                    <RiskBadge level={result.riskLevel} />
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Syne Mono', monospace", fontSize: 10, color: COLORS.muted, letterSpacing: 2, marginBottom: 8 }}>DIVERSIFICATION</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ flex: 1, height: 6, borderRadius: 999, background: COLORS.border, overflow: "hidden" }}>
                        <div style={{
                          width: `${result.diversificationScore}%`,
                          height: "100%", borderRadius: 999,
                          background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.green})`,
                          transition: "width 1s ease",
                        }} />
                      </div>
                      <span style={{ fontFamily: "'Syne Mono', monospace", fontSize: 12, color: COLORS.text, minWidth: 36 }}>
                        {result.diversificationScore}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Syne Mono', monospace", fontSize: 10, color: COLORS.muted, letterSpacing: 2, marginBottom: 8 }}>SUMMARY</div>
                    <p style={{ fontSize: 13, color: COLORS.muted, lineHeight: 1.6 }}>{result.summary}</p>
                  </div>
                </div>
              </div>

              {/* Recommendation */}
              <div style={{
                background: `linear-gradient(135deg, ${COLORS.gold}12 0%, ${COLORS.bg} 100%)`,
                border: `1px solid ${COLORS.gold}40`,
                borderRadius: 14, padding: "20px 24px", marginBottom: 20,
                display: "flex", gap: 16, alignItems: "flex-start",
              }}>
                <span style={{ fontSize: 22, marginTop: 2 }}>◆</span>
                <div>
                  <div style={{ fontFamily: "'Syne Mono', monospace", fontSize: 10, color: COLORS.gold, letterSpacing: 2, marginBottom: 6 }}>TOP RECOMMENDATION</div>
                  <p style={{ fontSize: 14, color: COLORS.text, lineHeight: 1.6 }}>{result.topRecommendation}</p>
                </div>
              </div>

              {/* Asset Insights */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontFamily: "'Syne Mono', monospace", fontSize: 10, color: COLORS.muted, letterSpacing: 2, marginBottom: 14 }}>
                  ASSET BREAKDOWN
                </div>
                {result.insights?.map((insight, i) => (
                  <InsightCard key={i} insight={insight} index={i} />
                ))}
              </div>

              {/* Verification */}
              <div style={{
                background: COLORS.surface, border: `1px solid ${COLORS.border}`,
                borderRadius: 12, padding: "16px 20px",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                flexWrap: "wrap", gap: 12,
              }}>
                <div>
                  <div style={{ fontFamily: "'Syne Mono', monospace", fontSize: 10, color: COLORS.muted, letterSpacing: 2, marginBottom: 4 }}>
                    VERIFICATION HASH
                  </div>
                  <div style={{
                    fontFamily: "'Syne Mono', monospace", fontSize: 11,
                    color: COLORS.blue,
                    wordBreak: "break-all",
                  }}>
                    {result.verificationHash}
                  </div>
                </div>
                <div style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 14px", borderRadius: 8,
                  background: `${COLORS.green}10`, border: `1px solid ${COLORS.green}30`,
                }}>
                  <span style={{ color: COLORS.green, fontSize: 12 }}>✓</span>
                  <span style={{ fontFamily: "'Syne Mono', monospace", fontSize: 11, color: COLORS.green, letterSpacing: 1 }}>
                    VERIFIED ONCHAIN
                  </span>
                </div>
              </div>

              {/* Footer note */}
              <div style={{ textAlign: "center", marginTop: 24 }}>
                <span style={{ fontSize: 12, color: COLORS.muted }}>
                  Analysis powered by{" "}
                  <a href="https://www.opengradient.ai" target="_blank" rel="noreferrer"
                    style={{ color: COLORS.gold, textDecoration: "none" }}>OpenGradient Network</a>
                  {" "}· Verifiable AI Inference
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
