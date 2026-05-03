import type { DishListItem } from "../../../shared/types";

interface DishGalleryProps {
  dishes: DishListItem[];
  hasMore: boolean;
  isLoading: boolean;
  loadMore: () => void;
  total: number;
}

export function DishGallery({
  dishes,
  hasMore,
  isLoading,
  loadMore,
  total
}: DishGalleryProps) {
  return (
    <section className="gallery-section" aria-label="Dish gallery">
      <div className="section-heading">
        <h2>Classified dishes</h2>
        <p>
          {total.toLocaleString()} result{total === 1 ? "" : "s"}
        </p>
      </div>

      <div className="dish-grid">
        {dishes.map((dish) => (
          <DishCard dish={dish} key={dish.id} />
        ))}
      </div>

      {dishes.length === 0 && !isLoading ? (
        <div className="empty-state">
          <strong>No dishes match these filters.</strong>
          <span>Try removing a tag or widening the award filter.</span>
        </div>
      ) : null}

      {hasMore ? (
        <button className="load-more" type="button" onClick={loadMore} disabled={isLoading}>
          {isLoading ? "Loading..." : "Load more dishes"}
        </button>
      ) : null}
    </section>
  );
}

function DishCard({ dish }: { dish: DishListItem }) {
  return (
    <article className="dish-card">
      <ImageWithFallback src={dish.imageUrl} alt={dish.imageAlt ?? dish.name} />
      <div className="dish-card-body">
        <div className="award-line">
          <span>{formatAward(dish.restaurant.awardType)}</span>
          {dish.priceText ? <span>{dish.priceText}</span> : null}
        </div>
        <h3>{dish.name}</h3>
        <p>{dish.description ?? "No description available yet."}</p>
        <div className="restaurant-line">
          {dish.restaurant.name}
          <span>
            {dish.restaurant.city ? `${dish.restaurant.city}, ` : ""}
            {dish.restaurant.country}
          </span>
        </div>
        <div className="card-tags">
          {dish.tags.slice(0, 5).map((tag) => (
            <span key={tag.slug}>{tag.name}</span>
          ))}
        </div>
      </div>
    </article>
  );
}

function ImageWithFallback({ alt, src }: { alt: string; src: string | null }) {
  if (!src) {
    return <div className="image-fallback">No image</div>;
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={(event) => {
        event.currentTarget.replaceWith(createFallbackElement());
      }}
    />
  );
}

function createFallbackElement(): HTMLDivElement {
  const fallback = document.createElement("div");
  fallback.className = "image-fallback";
  fallback.textContent = "Image unavailable";
  return fallback;
}

function formatAward(value: DishListItem["restaurant"]["awardType"]): string {
  switch (value) {
    case "3-star":
      return "3-star";
    case "2-star":
      return "2-star";
    case "1-star":
      return "1-star";
    case "bib-gourmand":
      return "Bib Gourmand";
    case "recommended":
      return "Recommended";
  }
}
