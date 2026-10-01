import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

/**
 * React Router keeps the scroll position between pages. Every link click without a #
 * starts the new page at the top:
 *  - another page → jump to the top instantly
 *  - same page again (e.g. clicking "Destinos" while on /destinos) → smooth scroll to the top
 * Links with a hash (/#calendario, /conocenos#filosofia) are handled by useScrollToHash.
 * Back/forward (POP) is left alone so the browser can return to where you were.
 */
export default function ScrollToTop() {
  const loc = useLocation();
  const navType = useNavigationType();
  const prevPath = useRef(loc.pathname);

  useEffect(() => {
    const samePage = prevPath.current === loc.pathname;
    prevPath.current = loc.pathname;
    if (navType === "POP" || loc.hash) return;
    if (!samePage) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      return;
    }
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    // Lazy images loading during a long smooth scroll can make it stop a few px short
    // (the browser keeps the visible content anchored). Finish the last bit when it ends,
    // unless the visitor has already scrolled away on purpose.
    const finish = () => {
      window.removeEventListener("scrollend", finish);
      if (window.scrollY > 0 && window.scrollY < 150) window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    };
    window.addEventListener("scrollend", finish);
    const fallback = setTimeout(finish, 1500); // browsers without "scrollend"
    return () => { clearTimeout(fallback); window.removeEventListener("scrollend", finish); };
  }, [loc.pathname, loc.hash, loc.key, navType]);

  return null;
}
