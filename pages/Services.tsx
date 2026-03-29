import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Palette, Globe, Search, Share2, Mail, Target, Zap,
  TrendingUp, Bot, BarChart3, Layers, X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Service {
  id: number;
  title: string;
  description: string;
  detail: string;
  icon: React.ElementType;
}

const services: Service[] = [
  { id: 1, title: "Brand Strategy & Design", description: "Build a memorable, cohesive brand identity that resonates.", detail: "We craft brand strategies that define your voice, visual identity, and market positioning. From logo design to full brand guidelines, we ensure every touchpoint tells your story consistently.", icon: Palette },
  { id: 2, title: "Websites & E-commerce", description: "High-converting sites that look stunning and perform.", detail: "Custom-built websites and e-commerce stores optimised for speed, accessibility, and conversion. Every pixel is intentional, every interaction smooth.", icon: Globe },
  { id: 3, title: "SEO & Organic Growth", description: "Get found by the right people at the right time.", detail: "Technical SEO audits, content strategy, and ongoing optimisation to drive sustainable organic traffic. We focus on intent-driven keywords that convert.", icon: Search },
  { id: 4, title: "Social Media Marketing", description: "Engage your audience with content that matters.", detail: "Strategic content planning, creation, and community management across platforms. We build genuine connections that drive brand loyalty.", icon: Share2 },
  { id: 5, title: "Email Marketing", description: "Nurture leads and drive repeat business.", detail: "Automated email sequences, newsletter campaigns, and customer lifecycle communications designed to convert and retain.", icon: Mail },
  { id: 6, title: "Paid Media", description: "Maximise ROI on every Pula spent.", detail: "Data-driven campaigns across Google, Meta, LinkedIn, and TikTok. We optimise relentlessly for your most important metrics.", icon: Target },
  { id: 7, title: "Funnels & Lead Generation", description: "Turn visitors into qualified leads systematically.", detail: "Strategic funnel design with landing pages, lead magnets, and automated nurture sequences that guide prospects to purchase.", icon: Zap },
  { id: 8, title: "Conversion Rate Optimisation", description: "Make more from the traffic you already have.", detail: "A/B testing, UX analysis, and data-driven improvements to maximise conversion at every stage of your customer journey.", icon: TrendingUp },
  { id: 9, title: "Marketing Automation", description: "Scale your marketing without scaling your team.", detail: "End-to-end automation workflows that save time and increase consistency. From lead scoring to personalised campaigns at scale.", icon: Bot },
  { id: 10, title: "Chatbots & Integrations", description: "Automate customer interactions intelligently.", detail: "Custom chatbots and system integrations that streamline operations and improve customer experience 24/7.", icon: Layers },
  { id: 11, title: "Analytics & Reporting", description: "Make decisions based on real data, not guesses.", detail: "Custom dashboards, regular reporting, and actionable insights that connect marketing activity to business outcomes.", icon: BarChart3 },
];

export default function Services() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = services.find((s) => s.id === selectedId);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Services</h1>
        <p className="text-sm text-muted-foreground">What TapxMedia can do for you</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service, i) => (
          <motion.div
            key={service.id}
            layoutId={`service-${service.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -4 }}
            onClick={() => setSelectedId(service.id)}
            className="glass-card cursor-pointer p-6 group"
          >
            <div className="mb-4 inline-flex rounded-xl bg-accent/10 p-3 transition-colors group-hover:bg-accent/20">
              <service.icon className="h-6 w-6 text-accent" />
            </div>
            <h3 className="text-base font-semibold text-foreground">{service.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{service.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Expanded Service Modal */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedId(null)}
              className="fixed inset-0 z-50 bg-foreground/10 backdrop-blur-sm"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                layoutId={`service-${selected.id}`}
                className="glass-card w-full max-w-lg p-8"
              >
                <div className="flex items-start justify-between">
                  <div className="rounded-xl bg-accent/10 p-3">
                    <selected.icon className="h-8 w-8 text-accent" />
                  </div>
                  <button
                    onClick={() => setSelectedId(null)}
                    className="rounded-lg p-2 hover:bg-secondary"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
                <h2 className="mt-4 text-xl font-bold text-foreground">{selected.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{selected.detail}</p>
                <button className="mt-6 w-full rounded-xl bg-accent py-3 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90">
                  Add to Services
                </button>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
