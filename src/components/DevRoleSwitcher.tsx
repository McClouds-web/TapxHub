import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

function DevRoleSwitcherInner() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const switchRole = async () => {
    if (user?.role === "admin") {
      await login("client@lunastudio.com", "client");
      navigate("/client-portal");
    } else {
      await login("tapiwa@tapxmedia.com", "admin");
      navigate("/dashboard");
    }
  };

  return (
    <button
      onClick={switchRole}
      className="fixed bottom-4 right-4 z-[999] text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg bg-white/80 border border-[#0F1E3D]/15 text-[#0F1E3D]/50 shadow-sm hover:bg-white hover:text-[#0F1E3D] hover:border-[#0F1E3D]/25 transition-all backdrop-blur-sm"
      title="Dev only — switches between admin and client view"
    >
      {user?.role === "admin" ? "→ Client View" : "→ Admin View"}
    </button>
  );
}

// Only mount in development — avoids conditional hook calls
export function DevRoleSwitcher() {
  if (!import.meta.env.DEV) return null;
  return <DevRoleSwitcherInner />;
}
