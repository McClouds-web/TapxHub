import { motion, AnimatePresence } from "framer-motion";
import { Download, FileText, CreditCard, Clock, CheckCircle2, TrendingUp } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const monthlyData = [
  { month: "Oct", paid: 6200, unpaid: 1400 },
  { month: "Nov", paid: 7800, unpaid: 800 },
  { month: "Dec", paid: 9200, unpaid: 2200 },
  { month: "Jan", paid: 8400, unpaid: 1600 },
  { month: "Feb", paid: 10600, unpaid: 900 },
  { month: "Mar", paid: 7200, unpaid: 3200 },
];

const initialInvoices = [
  { id: "#1042", client: "Tapx Client", amount: "P3,200", date: "Mar 1", status: "Pending" },
  { id: "#1041", client: "Tapx Client", amount: "P5,500", date: "Feb 28", status: "Paid" },
  { id: "#1040", client: "Tapx Client", amount: "P2,500", date: "Feb 25", status: "Paid" },
  { id: "#1039", client: "NovaTech", amount: "P4,200", date: "Feb 20", status: "Paid" },
  { id: "#1038", client: "Luna Studio", amount: "P3,000", date: "Feb 15", status: "Overdue" },
  { id: "#1037", client: "Wildflower Co", amount: "P2,200", date: "Feb 10", status: "Paid" },
];

const statusColors: Record<string, string> = {
  Paid: "bg-success/10 text-success border-success/20",
  Pending: "bg-warning/10 text-warning border-warning/20",
  Overdue: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function Invoices() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const filteredInvoices = initialInvoices.filter(inv => isAdmin || inv.client === user?.name);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as any } }
  };

  const clientMonthlyData = [
    { month: "Oct", paid: 1200, unpaid: 0 },
    { month: "Nov", paid: 1500, unpaid: 0 },
    { month: "Dec", paid: 2200, unpaid: 500 },
    { month: "Jan", paid: 1800, unpaid: 0 },
    { month: "Feb", paid: 3100, unpaid: 400 },
    { month: "Mar", paid: 2500, unpaid: 800 },
  ];

  const chartData = isAdmin ? monthlyData : clientMonthlyData;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 pb-12">
      <motion.div variants={item} className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground lg:text-4xl text-gradient">
          {isAdmin ? "Invoices & Billing" : "My Billing"}
        </h1>
        <p className="text-base text-muted-foreground/80 font-medium">
          {isAdmin ? "Manage agency billing and track revenue trends." : "View your billing history and outstanding payments."}
        </p>
      </motion.div>

      {/* Revenue/Spend Chart */}
      <motion.div variants={item} className="glass-card p-8 group relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 text-accent/10 opacity-20 group-hover:scale-110 transition-transform duration-500">
          <TrendingUp size={120} />
        </div>
        <h3 className="mb-6 text-xl font-bold flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-accent" />
          {isAdmin ? "Revenue Analytics — Paid vs Outstanding" : "My Spend Trend — Paid vs Pending"}
        </h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "hsl(215, 14%, 46%)", fontSize: 12, fontWeight: 600 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(215, 14%, 46%)", fontSize: 12, fontWeight: 600 }} tickFormatter={(v) => `P${(v / 1000).toFixed(1)}k`} />
              <Tooltip
                cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                contentStyle={{ backgroundColor: "rgba(255,255,255,0.9)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.4)", borderRadius: "16px", boxShadow: "0 10px 40px rgba(0,0,0,0.05)" }}
                formatter={(value: number, name: string) => [`P${value.toLocaleString()}`, name === "paid" ? (isAdmin ? "Paid" : "Spent") : (isAdmin ? "Outstanding" : "Pending")]}
              />
              <Bar dataKey="paid" radius={[8, 8, 0, 0]} fill="hsl(var(--accent))" barSize={32} />
              <Bar dataKey="unpaid" radius={[8, 8, 0, 0]} fill="hsl(var(--warning))" barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>


      {/* Invoice List */}
      <motion.div variants={item} className="glass-card overflow-hidden">
        <div className="border-b border-white/20 p-6 bg-white/10 flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <FileText className="h-5 w-5 text-accent" />
            Recent Invoices
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/10 backdrop-blur-sm">
                <th className="px-6 py-4 text-left font-bold uppercase tracking-wider text-muted-foreground/70 text-[10px]">ID</th>
                <th className="px-6 py-4 text-left font-bold uppercase tracking-wider text-muted-foreground/70 text-[10px]">Recipient</th>
                <th className="hidden px-6 py-4 text-left font-bold uppercase tracking-wider text-muted-foreground/70 text-[10px] sm:table-cell">Amount</th>
                <th className="hidden px-6 py-4 text-left font-bold uppercase tracking-wider text-muted-foreground/70 text-[10px] md:table-cell">Issue Date</th>
                <th className="px-6 py-4 text-left font-bold uppercase tracking-wider text-muted-foreground/70 text-[10px]">Status</th>
                <th className="px-6 py-4 text-right font-bold uppercase tracking-wider text-muted-foreground/70 text-[10px]">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/20">
              <AnimatePresence>
                {filteredInvoices.map((inv, i) => (
                  <motion.tr
                    key={inv.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group hover:bg-white/20 transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-foreground">{inv.id}</td>
                    <td className="px-6 py-4 font-semibold text-foreground">{inv.client}</td>
                    <td className="hidden px-6 py-4 font-black text-foreground sm:table-cell">{inv.amount}</td>
                    <td className="hidden px-6 py-4 text-muted-foreground font-medium md:table-cell">{inv.date}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border",
                        statusColors[inv.status]
                      )}>
                        {inv.status === "Paid" ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="rounded-xl p-2.5 text-muted-foreground hover:bg-accent hover:text-white transition-all hover:scale-110 active:scale-95 shadow-sm">
                        <Download className="h-4 w-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        {filteredInvoices.length === 0 && (
          <div className="p-12 text-center text-muted-foreground font-medium bg-white/5">
            No invoices found.
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
