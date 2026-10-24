import { useState } from "react";
import { useApp } from "../../context/AppContext";
import "./Navbar.css";
import { Avatar, AvatarBadge, AvatarFallback } from "../ui/avatar";

export default function Navbar({ onNavigate }) {
  const { currentUser, logout, showFlash } = useApp();
  const [open, setOpen] = useState(false);

  const go = (page, id) => {
    onNavigate(page, id);
    setOpen(false);
  };

  const handleLogout = () => {
    logout();
    go("home");
  };

  const ini = (n) => n?.[0]?.toUpperCase() ?? "?";

  return (
    <header className="navbar">
      <div className="navbar__inner">
        {/* Logo */}
        <button className="navbar__logo" onClick={() => go("home")}>
          {/* <span className="navbar__logo-pin">⌂</span> */}
          Nestly
        </button>

        {/* Centre links */}
        <nav className="navbar__links">
          <button className="navbar__link" onClick={() => go("home")}>
            Explore
          </button>
          <button
            className="navbar__link navbar__link--accent"
            onClick={() => go("new")}
          >
            + List your space
          </button>
        </nav>

        {/* Right actions */}
        <div className="navbar__actions">
          {currentUser ? (
            <>
              <button className="navbar__user" onClick={() => go("profile")}>
                <Avatar className="navbar__avatar">
                  <AvatarFallback>{ini(currentUser.username)}</AvatarFallback>
                  <AvatarBadge />
                </Avatar>
                <span className="navbar__uname">{currentUser.username}</span>
              </button>
              <button
                className="navbar__link"
                onClick={() => go("bookings")}
              >
                My bookings
              </button>
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => go("login")}
              >
                Log in
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => go("signup")}
              >
                Sign up
              </button>
            </>
          )}
        </div>

        {/* Hamburger */}
        <button
          className={`navbar__burger ${open ? "open" : ""}`}
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <nav className="navbar__drawer">
          <button className="navbar__drawer-link" onClick={() => go("home")}>
            🏠 Explore listings
          </button>
          {currentUser ? (
            <>
              <button className="navbar__drawer-link" onClick={() => go("new")}>
                + Add listing
              </button>
              <hr className="navbar__drawer-sep" />
              <button
                className="navbar__drawer-user"
                onClick={() => go("profile")}
              >
                <Avatar className="navbar__avatar navbar__avatar--sm">
                  <AvatarFallback>{ini(currentUser.username)}</AvatarFallback>
                  <AvatarBadge />
                </Avatar>
                {currentUser.username}
              </button>
              <button
                className="navbar__drawer-link"
                onClick={() => go("bookings")}
              >
                My bookings
              </button>
              <button
                className="navbar__drawer-link navbar__drawer-link--danger"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <hr className="navbar__drawer-sep" />
              <button
                className="navbar__drawer-link"
                onClick={() => go("login")}
              >
                Log in
              </button>
              <button
                className="navbar__drawer-link navbar__drawer-link--primary"
                onClick={() => go("signup")}
              >
                Sign up
              </button>
            </>
          )}
        </nav>
      )}
    </header>
  );
}
