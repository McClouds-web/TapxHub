import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, X, Mail, Phone, MapPin, FileText, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const clients = [
  { id: 1, name: "Bloom Studio", role: "Creative Director", department: "Branding", site: "bloomstudio.co", retainer: "P2,500/mo", startDate: "Jan 2025", status: "Active", email: "hello@bloom.co", phone: "+44 7700 123456", location: "London, UK" },
  { id: 2, name: "NovaTech", role: "CTO", department: "Technology", site: "novatech.io", retainer: "P4,200/mo", startDate: "Mar 2025", status: "Retainer", email: "tech@nova.io", phone: "+44 7700 234567", location: "Manchester, UK" },
  { id: 3, name: "Greenfield Corp", role: "Marketing Lead", department: "Agriculture", site: "greenfield.com", retainer: "P1,800", startDate: "Nov 2025", status: "One-off", email: "marketing@green.com", phone: "+44 7700 345678", location: "Bristol, UK" },
  { id: 4, name: "Luna Studio", role: "Founder", department: "Fashion", site: "lunastudio.co", retainer: "P3,000/mo", startDate: "Feb 2025", status: "Active", email: "hello@luna.co", phone: "+44 7700 456789", location: "Edinburgh, UK" },
  { id: 5, name: "Apex Digital", role: "Head of Growth", department: "SaaS", site: "apexdigital.io", retainer: "P5,500/mo", startDate: "Jun 2025", status: "Retainer", email: "growth@apex.io", phone: "+44 7700 567890", location: "London, UK" },
  { id: 6, name: "Wildflower Co", role: "Owner", department: "Wellness", site: "wildflower.co", retainer: "P2,200", startDate: "Sep 2025", status: "Completed", email: "info@wild.co", phone: "+44 7700 678901", location: "Bath, UK" },
];

const statusColors: Record<string, string> = {
  Active: "bg-success/10 text-success border-success/20",
  Retainer: "bg-accent/10 text-accent border-accent/20",
  "One-off": "bg-warning/10 text-warning border-warning/20",
  Completed: "bg-muted text-muted-foreground border-border",
};

export default function Clients() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const selectedClient = clients.find((c) => c.id === selectedId);
  const filtered = clients.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Clients</h1>
        <p className="text-sm text-muted-foreground">Manage your client relationships</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients..."
            className="w-full rounded-xl border border-border bg-card py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-accent/20"
          />
        </div>
        <button className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-sm text-muted-foreground hover:bg-secondary">
          <Filter className="h-4 w-4" /> Filters
        </button>
      </div>

      <div className="flex gap-6">
        {/* Table */}
        <div className="flex-1 overflow-x-auto">
          <div className="glass-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-secondary/30">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">Department</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground lg:table-cell">Retainer</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground sm:table-cell">Start Date</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((client) => (
                  <motion.tr
                    key={client.id}
                    onClick={() => setSelectedId(selectedId === client.id ? null : client.id)}
                    whileHover={{ backgroundColor: "hsl(210, 20%, 96%)" }}
                    className={cn(
                      "cursor-pointer border-b border-border/30 transition-colors",
                      selectedId === client.id && "bg-accent/5 ring-1 ring-accent/20"
                    )}
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-foreground">{client.name}</p>
                        <p className="text-xs text-muted-foreground">{client.role}</p>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{client.department}</td>
                    <td className="hidden px-4 py-3 font-medium text-foreground lg:table-cell">{client.retainer}</td>
                    <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">{client.startDate}</td>
                    <td className="px-4 py-3">
                      <span className={cn("status-pill border", statusColors[client.status])}>
                        {client.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Panel */}
        <AnimatePresence>
          {selectedClient && (
            <motion.div
              initial={{ opacity: 0, x: 20, width: 0 }}
              animate={{ opacity: 1, x: 0, width: 340 }}
              exit={{ opacity: 0, x: 20, width: 0 }}
              className="hidden shrink-0 lg:block"
            >
              <div className="glass-card p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">{selectedClient.name}</h3>
                  <button onClick={() => setSelectedId(null)} className="rounded-lg p-1 hover:bg-secondary">
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" /> {selectedClient.email}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" /> {selectedClient.phone}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" /> {selectedClient.location}
                  </div>
                </div>
                <div className="rounded-xl bg-secondary/50 p-4 space-y-2">
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground">Quick Stats</h4>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Projects</span>
                    <span className="font-semibold text-foreground">3</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Billed</span>
                    <span className="font-semibold text-foreground">P18,400</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Outstanding</span>
                    <span className="font-semibold text-warning">P2,400</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground">Documents</h4>
                  <div className="flex items-center gap-2 rounded-lg bg-secondary/30 p-2 text-sm">
                    <FileText className="h-4 w-4 text-accent" />
                    <span className="text-foreground">Service Agreement.pdf</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-secondary/30 p-2 text-sm">
                    <BarChart3 className="h-4 w-4 text-accent" />
                    <span className="text-foreground">Q4 Report.pdf</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
