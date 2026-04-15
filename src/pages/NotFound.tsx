import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-3 text-center">
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-accent/10 border border-accent/20">
        <span className="text-4xl font-black text-accent tracking-tighter">!</span>
      </div>
      <h1 className="mb-4 text-6xl font-black tracking-tighter text-[#0F1E3D]">404</h1>
      <p className="mb-5 text-[12px] font-medium text-[#0F1E3D]/50 max-w-md">
        This page has drifted out of orbit. Let's get you back to the command center.
      </p>
      <a 
        href="/" 
        className="rounded-full bg-[#1E3A8A] px-6 py-3 text-[10px] font-black text-white shadow-xl shadow-[#1E3A8A]/20 transition-all hover:scale-[1.05] active:scale-[0.95]"
      >
        Return to Dashboard
      </a>
    </div>
  );
};

export default NotFound;
