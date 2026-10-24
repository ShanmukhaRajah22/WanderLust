import "./kinetic-text-loader.css";

export function KineticTextLoader({ text = "Finding your next stay" }) {
  return (
    <div className="kinetic-loader" role="status" aria-live="polite">
      <div className="kinetic-loader__mark" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <p className="kinetic-loader__text">{text}</p>
    </div>
  );
}
