import { motion } from "framer-motion";
import { User, Bell, Shield, Palette, Database, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const sections = [
  { icon: User, label: "Profile", description: "Update your name, email, and avatar" },
  { icon: Bell, label: "Notifications", description: "Manage email and push notification preferences" },
  { icon: Shield, label: "Security", description: "Password, two-factor authentication, and sessions" },
  { icon: Palette, label: "Appearance", description: "Theme, colors, and display preferences" },
  { icon: Database, label: "Data & Privacy", description: "Export data, manage connected services" },
];

export default function Settings() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
      </div>

      <div className="space-y-3">
        {sections.map((section, i) => (
          <motion.div
            key={section.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ x: 4 }}
            className="glass-card flex cursor-pointer items-center gap-4 p-5"
          >
            <div className="rounded-xl bg-accent/10 p-3">
              <section.icon className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{section.label}</p>
              <p className="text-xs text-muted-foreground">{section.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <button className="flex items-center gap-2 text-sm font-medium text-destructive hover:underline">
        <LogOut className="h-4 w-4" /> Sign out
      </button>
    </motion.div>
  );
}
