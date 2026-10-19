import { useEffect } from "react";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./ListingMap.css";

const DEFAULT_CENTER = [20, 0];

function FitMarkers({ listings }) {
  const map = useMap();

  useEffect(() => {
    const points = listings
      .filter((listing) => listing.geometry?.coordinates?.length === 2)
      .map((listing) => [
        listing.geometry.coordinates[1],
        listing.geometry.coordinates[0],
      ]);

    if (points.length === 1) {
      map.setView(points[0], 10);
    } else if (points.length > 1) {
      map.fitBounds(points, { padding: [32, 32] });
    }
  }, [listings, map]);

  return null;
}

export default function ListingMap({
  listings,
  onSelectListing,
  title = "Explore stays on the map",
}) {
  const mappedListings = listings.filter(
    (listing) => listing.geometry?.coordinates?.length === 2,
  );

  return (
    <section className="listing-map-section">
      <div className="container">
        <div className="listing-map-section__heading">
          <h2 className="listing-map-section__title">{title}</h2>
          <span>OpenStreetMap</span>
        </div>
        <MapContainer
          className="listing-map"
          center={DEFAULT_CENTER}
          zoom={2}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitMarkers listings={mappedListings} />
          {mappedListings.map((listing) => (
            <CircleMarker
              key={listing._id}
              center={[
                listing.geometry.coordinates[1],
                listing.geometry.coordinates[0],
              ]}
              pathOptions={{ color: "#c0522a", fillColor: "#c0522a" }}
              radius={8}
              eventHandlers={{
                click: () => onSelectListing?.(listing._id),
              }}
            >
              <Popup>
                <strong>{listing.title}</strong>
                <br />
                {listing.location}, {listing.country}
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </section>
  );
}
