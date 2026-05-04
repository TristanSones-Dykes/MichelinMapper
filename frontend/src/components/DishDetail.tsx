import type { ReactNode } from "react";
import type { DishDetailItem, DishOntologyTag } from "../../../shared/types";

interface DishDetailProps {
  dish: DishDetailItem | null;
  error: string | null;
  isLoading: boolean;
}

const ONTOLOGY_ORDER: Array<keyof DishDetailItem["ontology"]["tags"]> = [
  "gastronomic",
  "cuisine",
  "geographic",
  "dietary",
  "award",
  "other"
];

export function DishDetail({ dish, error, isLoading }: DishDetailProps) {
  if (isLoading) {
    return (
      <main className="app-shell dish-detail-shell">
        <a className="back-link" href="/">Back to map</a>
        <div className="detail-loading">Loading dish ontology...</div>
      </main>
    );
  }

  if (error || !dish) {
    return (
      <main className="app-shell dish-detail-shell">
        <a className="back-link" href="/">Back to map</a>
        <div className="empty-state">
          <strong>Dish unavailable.</strong>
          <span>{error ?? "This dish could not be loaded."}</span>
        </div>
      </main>
    );
  }

  const leadImage = dish.images[0] ?? (dish.imageUrl ? {
    id: dish.id,
    url: dish.imageUrl,
    alt: dish.imageAlt,
    credit: dish.imageCredit,
    source: dish.source,
    sourceUrl: dish.sourceUrl,
    isPrimary: true
  } : null);

  return (
    <main className="app-shell dish-detail-shell">
      <a className="back-link" href="/">Back to map</a>

      <section className="dish-hero-detail">
        <div className="dish-hero-copy">
          <p className="brand">Dish ontology</p>
          <h1>{dish.name}</h1>
          <p>{dish.description ?? "No full dish description has been gathered yet."}</p>
          <div className="detail-meta-row">
            <span>{formatAward(dish.restaurant.awardType)}</span>
            <span>{dish.restaurant.name}</span>
            <span>
              {dish.restaurant.city ? `${dish.restaurant.city}, ` : ""}
              {dish.restaurant.country}
            </span>
            {dish.priceText ? <span>{dish.priceText}</span> : null}
          </div>
        </div>
        <div className="dish-hero-media">
          {leadImage ? (
            <>
              <img src={leadImage.url} alt={leadImage.alt ?? dish.name} />
              {leadImage.credit ? <small>{leadImage.credit}</small> : null}
            </>
          ) : (
            <div className="image-fallback">No image</div>
          )}
        </div>
      </section>

      <section className="detail-section">
        <div className="section-heading">
          <h2>Images</h2>
          <p>{dish.images.length.toLocaleString()} collected source image{dish.images.length === 1 ? "" : "s"}</p>
        </div>
        <div className="image-strip">
          {dish.images.length > 0 ? dish.images.map((image) => (
            <figure key={image.id}>
              <img src={image.url} alt={image.alt ?? dish.name} loading="lazy" />
              <figcaption>
                {image.credit ?? image.source}
                {image.sourceUrl ? <a href={image.sourceUrl}>Source</a> : null}
              </figcaption>
            </figure>
          )) : <div className="image-fallback">No source images gathered yet</div>}
        </div>
      </section>

      <section className="ontology-panel" aria-label="Dish data ontology">
        <div className="section-heading">
          <h2>Data ontology</h2>
          <p>Identity, classification, geography, media, and source provenance for this dish.</p>
        </div>

        <div className="ontology-grid">
          <OntologyBlock title="Identity">
            <OntologyRow label="Type" value={dish.ontology.identity.type} />
            <OntologyRow label="Canonical label" value={dish.ontology.identity.label} />
            <OntologyRow label="Slug" value={dish.ontology.identity.slug} />
          </OntologyBlock>

          <OntologyBlock title="Restaurant context">
            <OntologyRow label="Award" value={formatAward(dish.restaurant.awardType)} />
            <OntologyRow label="Cuisine" value={dish.restaurant.cuisine ?? "Unknown"} />
            <OntologyRow label="Place" value={[dish.restaurant.city, dish.restaurant.region, dish.restaurant.country].filter(Boolean).join(", ")} />
          </OntologyBlock>

          <OntologyBlock title="Provenance">
            <OntologyRow label="Source" value={dish.ontology.provenance.source} />
            <OntologyRow label="Source ID" value={dish.ontology.provenance.sourceId} />
            {dish.ontology.provenance.sourceUrl ? (
              <a className="source-link" href={dish.ontology.provenance.sourceUrl}>Open original source</a>
            ) : null}
          </OntologyBlock>
        </div>

        <div className="ontology-tags">
          {ONTOLOGY_ORDER.map((type) => (
            <OntologyTagGroup key={type} title={type} tags={dish.ontology.tags[type]} />
          ))}
        </div>
      </section>
    </main>
  );
}

function OntologyBlock({ children, title }: { children: ReactNode; title: string }) {
  return (
    <div className="ontology-block">
      <h3>{title}</h3>
      {children}
    </div>
  );
}

function OntologyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="ontology-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function OntologyTagGroup({ tags, title }: { tags: DishOntologyTag[]; title: string }) {
  return (
    <div className="ontology-tag-group">
      <h3>{title}</h3>
      {tags.length > 0 ? (
        <div className="card-tags">
          {tags.map((tag) => (
            <span key={tag.slug} title={`${Math.round(tag.confidence * 100)}% via ${tag.source}`}>
              {tag.name}
            </span>
          ))}
        </div>
      ) : (
        <p>No terms classified yet.</p>
      )}
    </div>
  );
}

function formatAward(value: DishDetailItem["restaurant"]["awardType"]): string {
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
