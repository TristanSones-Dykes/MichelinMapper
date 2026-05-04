import { useEffect, useState } from "react";
import { DishDetail } from "./components/DishDetail";
import { DishGallery } from "./components/DishGallery";
import { Filters } from "./components/Filters";
import { RestaurantMap } from "./components/RestaurantMap";
import { useDishDetail } from "./hooks/useDishDetail";
import { useMichelinMapper } from "./hooks/useMichelinMapper";

export function App() {
  const route = useCurrentRoute();
  const dishDetail = useDishDetail(route.dishId);

  if (route.dishId) {
    return <DishDetail dish={dishDetail.dish} error={dishDetail.error} isLoading={dishDetail.isLoading} />;
  }

  return <HomePage />;
}

function HomePage() {
  const state = useMichelinMapper();

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <p className="brand">MichelinMapper</p>
          <h1>Map the dishes behind Michelin-recognized dining.</h1>
          <p>
            A zero-cost Cloudflare pipeline that ingests restaurant data,
            classifies dish descriptions, and turns awards, cities, cuisines,
            and ingredients into searchable map intelligence.
          </p>
        </div>
        <div className="hero-stats" aria-label="Dataset summary">
          <span>{state.restaurants.length.toLocaleString()} restaurants</span>
          <span>{state.total.toLocaleString()} dishes</span>
          <span>{state.tags.length.toLocaleString()} tags</span>
        </div>
      </section>

      {state.error ? <div className="error-banner">{state.error}</div> : null}

      <RestaurantMap restaurants={state.restaurants} />

      <section className="explore-layout">
        <Filters
          awardType={state.awardType}
          clearFilters={state.clearFilters}
          search={state.search}
          selectedTags={state.selectedTags}
          setAwardType={state.setAwardType}
          setSearch={state.setSearch}
          setSort={state.setSort}
          sort={state.sort}
          tags={state.tags}
          toggleTag={state.toggleTag}
        />
        <DishGallery
          dishes={state.dishes}
          hasMore={state.hasMore}
          isLoading={state.isLoading}
          loadMore={state.loadMore}
          total={state.total}
        />
      </section>
    </main>
  );
}

function useCurrentRoute() {
  const [pathname, setPathname] = useState(window.location.pathname);

  useEffect(() => {
    function handleNavigation() {
      setPathname(window.location.pathname);
    }

    window.addEventListener("popstate", handleNavigation);
    return () => window.removeEventListener("popstate", handleNavigation);
  }, []);

  const match = pathname.match(/^\/dish\/(\d+)/);
  return {
    dishId: match ? Number.parseInt(match[1] ?? "", 10) : null
  };
}
