import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scrolls to the element whose id matches the URL hash (e.g. /conocenos#filosofia).
 * React Router doesn't do this by itself.
 *  - ready: pass false while content above the target is still loading (it changes the page height).
 *  - targetId: scroll here instead of the hash's own id (e.g. tabs that share one container).
 * Re-runs on loc.key, so clicking the same link again scrolls again.
 * Targets should have scroll-mt-20 so they aren't hidden under the sticky navbar.
 */
export default function useScrollToHash({ ready = true, targetId } = {}) {
  const loc = useLocation();
  useEffect(() => {
    if (!loc.hash || !ready) return;
    const id = targetId || decodeURIComponent(loc.hash.slice(1));
    requestAnimationFrame(() =>
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }, [loc.hash, loc.key, ready, targetId]);
}
