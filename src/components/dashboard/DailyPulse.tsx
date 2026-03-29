import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function DailyPulse({ currentGreeting }: { currentGreeting?: string }) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const greeting = currentGreeting?.split(',')[0] || "Greetings";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-card relative overflow-hidden p-6"
    >
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-accent/5" />
      <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-accent/5" />
      <div className="relative">
        <div className="mb-4 flex items-center gap-2">
          <div className="rounded-lg bg-accent/10 p-2">
            <Sparkles className="h-4 w-4 text-accent" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">AI Daily Pulse</h3>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {isAdmin ? (
            <>
              {greeting}! You have <span className="font-semibold text-foreground">3 active projects</span> running
              smoothly. <span className="font-semibold text-warning">1 project</span> hasn't had activity in 36 hours — consider
              a check-in. <span className="font-semibold text-success">P8,200</span> in invoices were paid this week.
            </>
          ) : (
            <>
              {greeting}! Everything looks great. Your <span className="font-semibold text-foreground">Brand Rebrand</span> is currently in the review stage.
              We've uploaded <span className="font-semibold text-accent">3 new assets</span> for your approval.
              One invoice is ready for payment.
            </>
          )}
        </p>
        <button className="mt-4 text-xs font-medium text-accent hover:underline">
          View {isAdmin ? "full summary" : "project details"} →
        </button>
      </div>
    </motion.div>
  );
}

