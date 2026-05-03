import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import type { RestaurantMapItem } from "../../../shared/types";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface RestaurantMapProps {
  restaurants: RestaurantMapItem[];
}

export function RestaurantMap({ restaurants }: RestaurantMapProps) {
  return (
    <section className="map-panel" aria-label="Restaurant map">
      <MapContainer
        center={[45.5, 12]}
        zoom={3}
        minZoom={2}
        scrollWheelZoom={false}
        className="map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {restaurants.map((restaurant) => (
          <Marker
            icon={markerIcon}
            key={restaurant.id}
            position={[restaurant.latitude, restaurant.longitude]}
          >
            <Popup>
              <div className="map-popup">
                <strong>{restaurant.name}</strong>
                <span>{formatAward(restaurant.awardType)}</span>
                <span>
                  {restaurant.city ? `${restaurant.city}, ` : ""}
                  {restaurant.country}
                </span>
                {restaurant.previewDishes.length > 0 ? (
                  <ul>
                    {restaurant.previewDishes.map((dish) => (
                      <li key={dish.id}>{dish.name}</li>
                    ))}
                  </ul>
                ) : (
                  <small>No dishes loaded yet.</small>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </section>
  );
}

function formatAward(value: RestaurantMapItem["awardType"]): string {
  switch (value) {
    case "3-star":
      return "Michelin 3-star";
    case "2-star":
      return "Michelin 2-star";
    case "1-star":
      return "Michelin 1-star";
    case "bib-gourmand":
      return "Bib Gourmand";
    case "recommended":
      return "Recommended";
  }
}
