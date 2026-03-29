import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtext?: string; // kept for API compatibility but not rendered
  subtextAlt?: string;
  iconColor?: string;
}

export function KpiCard({ title, value, icon: Icon }: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, boxShadow: "0 20px 40px -12px rgba(15,30,61,0.08)" }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      style={{
        background: "var(--glass-bg)",
        backdropFilter: "var(--glass-blur)",
        border: "1px solid var(--glass-border)",
        borderRadius: "var(--radius-lg)",
      }}
      className="relative p-5 cursor-default overflow-hidden group h-full"
    >
      <div className="flex items-center justify-between">
        <div className="w-11 h-11 rounded-xl bg-[#F1F5F9] shadow-inner flex items-center justify-center shrink-0 border border-[#0F1E3D]/5 group-hover:bg-[#0F1E3D] group-hover:border-[#0F1E3D] transition-all duration-300">
          <Icon className="h-5 w-5 text-[var(--brand-primary)] group-hover:text-white transition-colors duration-300" />
        </div>
        <span className="text-3xl font-black text-[var(--brand-primary)] tracking-tight">
          {value}
        </span>
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--brand-primary)]/40 mt-4">
        {title}
      </p>
    </motion.div>
  );
}
