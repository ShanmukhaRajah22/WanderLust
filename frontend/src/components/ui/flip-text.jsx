import { useState } from "react";
import "./flip-text.css";

export function FlipText({ children, className = "" }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <span
      className={`flip-text ${flipped ? "is-flipped" : ""} ${className}`}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
      tabIndex={0}
      onFocus={() => setFlipped(true)}
      onBlur={() => setFlipped(false)}
    >
      <span className="flip-text__inner">{children}</span>
    </span>
  );
}
