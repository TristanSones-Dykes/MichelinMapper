import type { AwardType } from "../../../shared/types";
import type { DishFilters, TagFilter } from "../api";

interface FiltersProps {
  awardType?: AwardType;
  clearFilters: () => void;
  search: string;
  selectedTags: string[];
  setAwardType: (awardType: AwardType | undefined) => void;
  setSearch: (value: string) => void;
  setSort: (sort: DishFilters["sort"]) => void;
  sort: DishFilters["sort"];
  tags: TagFilter[];
  toggleTag: (slug: string) => void;
}

const AWARDS: Array<{ label: string; value: AwardType }> = [
  { label: "3-star", value: "3-star" },
  { label: "2-star", value: "2-star" },
  { label: "1-star", value: "1-star" },
  { label: "Bib Gourmand", value: "bib-gourmand" },
  { label: "Recommended", value: "recommended" }
];

export function Filters({
  awardType,
  clearFilters,
  search,
  selectedTags,
  setAwardType,
  setSearch,
  setSort,
  sort,
  tags,
  toggleTag
}: FiltersProps) {
  const visibleTags = tags.filter((tag) => tag.type !== "award").slice(0, 36);

  return (
    <aside className="filters" aria-label="Dish filters">
      <div className="filter-group">
        <label htmlFor="dish-search">Search</label>
        <input
          id="dish-search"
          type="search"
          placeholder="Try turbot, yuzu, Paris..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="filter-grid">
        <div className="filter-group">
          <label htmlFor="award-filter">Award</label>
          <select
            id="award-filter"
            value={awardType ?? ""}
            onChange={(event) => setAwardType(event.target.value as AwardType || undefined)}
          >
            <option value="">All awards</option>
            {AWARDS.map((award) => (
              <option key={award.value} value={award.value}>
                {award.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="sort-filter">Sort</label>
          <select
            id="sort-filter"
            value={sort}
            onChange={(event) => setSort(event.target.value as DishFilters["sort"])}
          >
            <option value="newest">Newest classified</option>
            <option value="name">Dish name</option>
            <option value="restaurant">Restaurant</option>
          </select>
        </div>
      </div>

      <div className="tag-cloud" aria-label="Tags">
        {visibleTags.map((tag) => {
          const checked = selectedTags.includes(tag.slug);
          return (
            <button
              className={checked ? "tag-button selected" : "tag-button"}
              key={tag.slug}
              type="button"
              onClick={() => toggleTag(tag.slug)}
              aria-pressed={checked}
            >
              {tag.name}
              <span>{tag.dishCount}</span>
            </button>
          );
        })}
      </div>

      <button className="clear-button" type="button" onClick={clearFilters}>
        Reset filters
      </button>
    </aside>
  );
}
