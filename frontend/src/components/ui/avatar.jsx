import "./avatar.css";

export function Avatar({ src, alt, children, className = "" }) {
  return (
    <span className={`ui-avatar ${className}`}>
      {src ? <img src={src} alt={alt || ""} /> : children}
    </span>
  );
}

export function AvatarFallback({ children }) {
  return <span className="ui-avatar__fallback">{children}</span>;
}

export function AvatarBadge({ children, className = "" }) {
  return (
    <span className={`ui-avatar__badge ${className}`} aria-hidden="true">
      {children}
    </span>
  );
}
