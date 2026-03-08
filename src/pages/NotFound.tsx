import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center pb-24" style={{ backgroundColor: '#080808' }}>
      <div className="text-center px-5">
        <h1 className="mb-4 text-4xl font-bold text-white">404</h1>
        <p className="mb-4 text-xl text-white/60">Oops! Page not found</p>
        <a href="/today" className="text-[var(--accent-color)] underline hover:opacity-90">
          Return to Today
        </a>
      </div>
    </div>
  );
};

export default NotFound;
