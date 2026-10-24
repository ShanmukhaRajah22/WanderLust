import { useState } from "react";
import { api } from "../../utils/api";
import "./AiAssistant.css";

const suggestions = [
  "Find stays in Bali",
  "Show places under ₹2000",
  "Find beach stays",
];

function ResultCard({ listing, onSelect }) {
  return (
    <button
      type="button"
      className="ai-result"
      onClick={() => onSelect(listing.id || listing._id)}
    >
      <div className="ai-result__image">
        {listing.image?.url ? (
          <img src={listing.image.url} alt="" />
        ) : (
          "🏠"
        )}
      </div>
      <span>
        <strong>{listing.title}</strong>
        <small>
          {listing.location}, {listing.country} · ₹{" "}
          {Number(listing.price).toLocaleString("en-IN")} / night
        </small>
      </span>
    </button>
  );
}

export default function AiAssistant({ onSelectListing }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (event) => {
    event?.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userMessage = { role: "user", content: text };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await api.aiChat(nextMessages);
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: response.message,
          listings: response.listings || [],
          availability: response.availability,
        },
      ]);
    } catch (error) {
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: error.message || "AI search is unavailable right now.",
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="ai-assistant">
      <div className="container">
        <div className="ai-assistant__header">
          <div>
            <span className="ai-assistant__eyebrow">✦ WanderLust AI</span>
            <h2>Find a stay by asking</h2>
            <p>Try a place, price, or type of getaway in plain English.</p>
          </div>
          <span className="ai-assistant__sparkle">✧</span>
        </div>

        <div className="ai-assistant__chat">
          {messages.length === 0 && (
            <div className="ai-assistant__welcome">
              <span>👋</span>
              <p>
                Hi! I can search the real WanderLust listings for you.
              </p>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              className={`ai-message ai-message--${message.role}`}
              key={`${message.role}-${index}`}
            >
              <p className={message.error ? "ai-message__error" : ""}>
                {message.content}
              </p>
              {message.listings?.length > 0 && (
                <div className="ai-results">
                  {message.listings.map((listing) => (
                    <ResultCard
                      key={listing._id || listing.id}
                      listing={listing}
                      onSelect={onSelectListing}
                    />
                  ))}
                </div>
              )}
              {message.availability && (
                <div className="ai-availability">
                  {message.availability.message}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="ai-message ai-message--assistant">
              <p>Searching stays…</p>
            </div>
          )}
        </div>

        <div className="ai-assistant__suggestions">
          {suggestions.map((suggestion) => (
            <button
              type="button"
              key={suggestion}
              onClick={() => {
                setInput(suggestion);
              }}
            >
              {suggestion}
            </button>
          ))}
        </div>

        <form className="ai-assistant__form" onSubmit={sendMessage}>
          <input
            value={input}
            maxLength={1000}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about stays, places, or prices…"
            aria-label="Ask WanderLust AI"
          />
          <button className="btn btn-dark" disabled={loading || !input.trim()}>
            {loading ? "Searching…" : "Ask AI"}
          </button>
        </form>
      </div>
    </section>
  );
}
