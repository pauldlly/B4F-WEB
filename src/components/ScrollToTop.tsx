import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      window.setTimeout(() => {
        document
          .querySelector(location.hash)
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
      }, 60);

      return;
    }

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto"
    });
  }, [location.hash, location.pathname]);

  return null;
}
