import { useState, useEffect, useRef } from "react";
import { useApp } from "../../context/AppContext";
import { api } from "../../utils/api";
import ListingCard from "../../components/includes/ListingCard";
import ListingMap from "../../components/includes/ListingMap";
import AiAssistant from "../../components/includes/AiAssistant";
import { FlipText } from "../../components/ui/flip-text";
import { KineticTextLoader } from "../../components/ui/kinetic-text-loader";
import "./ListingIndex.css";
import "../../context/ColdStartBanner.css";

export default function ListingIndex({ onNavigate, onSelectListing }) {
  const { currentUser } = useApp();
  const [listings, setListings] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [sort, setSort] = useState("priceAsc");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    country: "",
    location: "",
    maxPrice: "",
    amenity: "",
    roomType: "",
    mapOnly: false,
    checkIn: "",
    checkOut: "",
  });
  const [availableIds, setAvailableIds] = useState(null);
  const listingsSectionRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);
  useEffect(() => {
    api
      .getListings({
        page,
        limit: 12,
        search,
        location: filters.location,
        country: filters.country,
        maxPrice: filters.maxPrice,
        amenity: filters.amenity,
        roomType: filters.roomType,
        mapOnly: filters.mapOnly ? "true" : "",
        sort,
      })
      .then((data) => {
        setListings(data.listings || []);
        setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
      })
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, [page, search, filters.location, filters.country, filters.maxPrice, filters.amenity, filters.roomType, filters.mapOnly, sort]);

  useEffect(() => {
    if (!filters.checkIn || !filters.checkOut || filters.checkOut <= filters.checkIn) {
      return;
    }

    let active = true;
    Promise.all(
      listings.map((listing) =>
        api
          .getBookings(listing._id)
          .then((bookings) => {
            const roomTypes = listing.roomInventory?.length
              ? listing.roomInventory
              : [{ roomType: listing.roomType || "Private room", totalRooms: 1 }];
            const available = roomTypes.some((room) => {
              const overlapping = bookings.filter(
                (booking) =>
                  booking.roomType === room.roomType &&
                  new Date(booking.checkIn) < new Date(`${filters.checkOut}T00:00:00`) &&
                  new Date(booking.checkOut) > new Date(`${filters.checkIn}T00:00:00`),
              );
              return overlapping.length < room.totalRooms;
            });
            return available ? listing._id : null;
          })
          .catch(() => null),
      ),
    ).then((ids) => {
      if (active) setAvailableIds(new Set(ids.filter(Boolean)));
    });

    return () => {
      active = false;
    };
  }, [filters.checkIn, filters.checkOut, listings]);

  const scrollToListings = () => {
    listingsSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const submitTextFilter = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      scrollToListings();
    }
  };

  const setMapOnly = (event) => {
    setFilters((current) => ({
      ...current,
      mapOnly: event.target.checked,
    }));
    scrollToListings();
  };

  const datesAreValid =
    filters.checkIn &&
    filters.checkOut &&
    filters.checkOut > filters.checkIn;
  const filtered = listings.filter((l) =>
    [l.title, l.location, l.country].join(" ").toLowerCase().includes(search.toLowerCase()) &&
    (!filters.country || l.country === filters.country) &&
    (!filters.location || l.location.toLowerCase().includes(filters.location.toLowerCase())) &&
    (!filters.maxPrice || Number(l.price) <= Number(filters.maxPrice)) &&
    (!filters.amenity || l.amenities?.includes(filters.amenity)) &&
    (!filters.roomType || (l.roomType || "Private room") === filters.roomType) &&
    (!filters.mapOnly || l.geometry?.coordinates?.length === 2) &&
    (!datesAreValid || !availableIds || availableIds.has(l._id)),
  );

  const countries = [...new Set(listings.map((listing) => listing.country))].sort();
  const setFilter = (name) => (event) => {
    if (name === "checkIn" || name === "checkOut") {
      setAvailableIds(null);
    }
    setPage(1);
    setFilters((current) => ({ ...current, [name]: event.target.value }));
  };
  const clearFilters = () => {
    setSearch("");
    setPage(1);
    setSort("priceAsc");
    setFilters({
      country: "",
      location: "",
      maxPrice: "",
      amenity: "",
      roomType: "",
      mapOnly: false,
      checkIn: "",
      checkOut: "",
    });
  };

  return (
    <>
      {/* ── LANDING HERO ── */}
      <section className="idx-hero">
        <div className="idx-hero__content">
          <span className="idx-hero__eyebrow">Nestly / places to pause</span>
          <h1 className="idx-hero__title">
            Go somewhere
            <br />
            <em>worth remembering.</em>
          </h1>
          <p className="idx-hero__sub">
            Thoughtful stays for slow mornings, new perspectives, and the
            stories you bring home.
          </p>
          <FlipText className="idx-hero__flip">Stay curious.</FlipText>

          <div className="idx-hero__searchbar">
            <span className="idx-hero__search-icon" aria-hidden="true">⌕</span>
            <input
              className="idx-hero__search-input"
              placeholder="Search by city, country or name…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              onKeyDown={submitTextFilter}
            />
            {search && (
              <button
                className="idx-hero__search-clear"
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
              >
                ×
              </button>
            )}
          </div>
          <div className="idx-filters">
            <select
              value={sort}
              onChange={(event) => {
                setSort(event.target.value);
                setPage(1);
                scrollToListings();
              }}
            >
              <option value="priceAsc">Price: low to high</option>
              <option value="priceDesc">Price: high to low</option>
              <option value="newest">Newest first</option>
              <option value="title">Title: A to Z</option>
            </select>
            <input
              placeholder="Location"
              value={filters.location}
              onChange={setFilter("location")}
              onKeyDown={submitTextFilter}
              onBlur={scrollToListings}
            />
            <select
              value={filters.amenity}
              onChange={(event) => {
                setFilter("amenity")(event);
                scrollToListings();
              }}
            >
              <option value="">Any amenity</option>
              {["WiFi", "Pool", "Kitchen", "Air conditioning", "Free parking", "Pet friendly", "Workspace", "Hot tub", "Breakfast", "Washer"].map((amenity) => (
                <option key={amenity} value={amenity}>{amenity}</option>
              ))}
            </select>
            <select
              value={filters.roomType}
              onChange={(event) => {
                setFilter("roomType")(event);
                scrollToListings();
              }}
            >
              <option value="">Any room type</option>
              {["Private room", "Entire home", "Suite", "Deluxe room", "Shared room"].map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <select
              value={filters.country}
              onChange={(event) => {
                setFilter("country")(event);
                scrollToListings();
              }}
            >
              <option value="">All countries</option>
              {countries.map((country) => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
            <input
              type="number"
              min="0"
              placeholder="Max price"
              value={filters.maxPrice}
              onChange={setFilter("maxPrice")}
              onKeyDown={submitTextFilter}
              onBlur={scrollToListings}
            />
            <label>
              <input
                type="checkbox"
                checked={filters.mapOnly}
                onChange={setMapOnly}
              />
              Map locations only
            </label>
            <label>
              Check-in
              <input
                type="date"
                value={filters.checkIn}
                onChange={(event) => {
                  setFilter("checkIn")(event);
                  scrollToListings();
                }}
              />
            </label>
            <label>
              Check-out
              <input
                type="date"
                value={filters.checkOut}
                onChange={(event) => {
                  setFilter("checkOut")(event);
                  scrollToListings();
                }}
              />
            </label>
            <button type="button" className="btn btn-ghost btn-sm" onClick={clearFilters}>
              Clear filters
            </button>
          </div>
        </div>

      </section>

      <AiAssistant onSelectListing={onSelectListing} />

      {!loading && filtered.length > 0 && (
        <ListingMap listings={filtered} onSelectListing={onSelectListing} />
      )}

      {/* ── GRID ── */}
      <section className="idx-listings" ref={listingsSectionRef}>
        <div className="container">
          <div className="idx-listings__header">
            <h2 className="idx-listings__title">All Listings</h2>
            <span className="idx-listings__count">
              {loading
                ? "Loading…"
                : `${pagination.total} place${pagination.total !== 1 ? "s" : ""}`}
            </span>
          </div>
          {(search || filters.location || filters.country || filters.maxPrice) && (
            <p className="idx-listings__active-filter">
              Showing results for{" "}
              <strong>
                {search || filters.location || filters.country || `under ₹${filters.maxPrice}`}
              </strong>
            </p>
          )}

          {loading ? (
            <KineticTextLoader text="Finding stays" />
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon">🔍</div>
              <p className="empty-state__text">
                No listings found for "{search}"
              </p>
              <button className="btn btn-outline" onClick={() => setSearch("")}>
                Clear search
              </button>
            </div>
          ) : (
            <div className="idx-grid">
              {filtered.map((l, i) => (
                <ListingCard
                  key={l._id}
                  listing={l}
                  onClick={onSelectListing}
                  style={{ animationDelay: `${i * 0.05}s` }}
                />
              ))}
              {currentUser && (
                <button
                  className="idx-grid__add"
                  onClick={() => onNavigate("new")}
                >
                  <span className="idx-grid__add-icon">＋</span>
                  <span className="idx-grid__add-label">List your space</span>
                </button>
              )}
            </div>
          )}
          {!loading && pagination.pages > 1 && (
            <nav className="idx-pagination" aria-label="Listing pages">
              <button
                className="btn btn-outline btn-sm"
                disabled={page === 1}
                onClick={() => {
                  setPage((current) => current - 1);
                  scrollToListings();
                }}
              >
                Previous
              </button>
              {Array.from({ length: pagination.pages }, (_, index) => index + 1).map((number) => (
                <button
                  key={number}
                  className={`btn btn-sm ${number === page ? "btn-dark" : "btn-outline"}`}
                  onClick={() => {
                    setPage(number);
                    scrollToListings();
                  }}
                >
                  {number}
                </button>
              ))}
              <button
                className="btn btn-outline btn-sm"
                disabled={page === pagination.pages}
                onClick={() => {
                  setPage((current) => current + 1);
                  scrollToListings();
                }}
              >
                Next
              </button>
            </nav>
          )}
        </div>
      </section>
    </>
  );
}
