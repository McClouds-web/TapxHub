import { motion, AnimatePresence } from "framer-motion";
import { Image as ImageIcon, File, Video, MoreVertical, Download, Search, UploadCloud, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const initialFiles = [
    { name: "Brand Guidelines.pdf", size: "2.4 MB", type: "document", date: "Feb 24, 2024", client: "Tapx Client" },
    { name: "Website Mockup.png", size: "4.1 MB", type: "image", date: "Feb 25, 2024", client: "Tapx Client" },
    { name: "Promotional Video.mp4", size: "125.8 MB", type: "video", date: "Feb 26, 2024", client: "Tapx Client" },
    { name: "Logo Pack.zip", size: "15.2 MB", type: "document", date: "Feb 27, 2024", client: "Luna Studio" },
    { name: "Campaign Assets.fig", size: "8.4 MB", type: "document", date: "Feb 28, 2024", client: "Apex Digital" },
    { name: "Product Catalog.pdf", size: "5.1 MB", type: "document", date: "Mar 1, 2024", client: "Greenfield Corp" },
];

export default function Media() {
    const { user } = useAuth();
    const isAdmin = user?.role === "admin";
    const filteredFiles = initialFiles.filter(f => isAdmin || f.client === user?.name);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.08 }
        }
    };

    const item = {
        hidden: { opacity: 0, scale: 0.9, y: 20 },
        show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as any } }
    };

    return (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 pb-12">
            <motion.div variants={item} className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground lg:text-4xl text-gradient">
                        Media & Assets
                    </h1>
                    <p className="text-base text-muted-foreground/80 font-medium">
                        Secure access to your high-resolution brand assets and deliverables.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="glass-card hidden border-white/20 px-4 md:flex">
                        <Search className="h-4 w-4" />
                    </Button>
                    <Button className="bg-accent hover:bg-accent/90 px-6 rounded-full shadow-lg shadow-accent/20 font-bold gap-2 transition-all hover:scale-105 active:scale-95">
                        <UploadCloud className="h-4 w-4" />
                        Upload
                    </Button>
                </div>
            </motion.div>

            <motion.div variants={container} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <AnimatePresence>
                    {filteredFiles.map((file, i) => (
                        <motion.div
                            key={file.name}
                            variants={item}
                            whileHover={{ y: -8, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="glass-card group flex flex-col p-5 relative overflow-hidden transition-all duration-500 hover:bg-white/60"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent/0 via-accent/40 to-accent/0 opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="mb-6 flex flex-1 items-center justify-center rounded-[1.5rem] bg-white/20 p-10 transition-all duration-500 group-hover:bg-white/40 group-hover:rotate-2 border border-white/40 shadow-inner">
                                {file.type === "image" && <ImageIcon className="h-12 w-12 text-accent" />}
                                {file.type === "video" && <Video className="h-12 w-12 text-accent" />}
                                {file.type === "document" && <File className="h-12 w-12 text-accent" />}
                            </div>

                            <div className="flex items-start justify-between gap-2 px-1">
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-bold text-foreground leading-tight group-hover:text-accent transition-colors">
                                        {file.name}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-wider px-2 py-0.5 bg-white/30 rounded-md border border-white/40">
                                            {file.size}
                                        </span>
                                        <span className="text-[10px] font-bold text-muted-foreground/60">
                                            {file.date}
                                        </span>
                                    </div>
                                    {isAdmin && (
                                        <p className="text-[10px] font-bold text-accent/70 mt-2 uppercase tracking-tight">
                                            Client: {file.client}
                                        </p>
                                    )}
                                </div>
                                <div className="flex gap-1">
                                    <button className="rounded-xl p-2.5 text-muted-foreground/40 hover:bg-accent/10 hover:text-accent transition-colors shadow-none hover:shadow-sm">
                                        <Download className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {/* Add New Placeholder */}
                    <motion.div
                        variants={item}
                        whileHover={{ scale: 1.02 }}
                        className="glass-card group flex flex-col items-center justify-center p-8 border-dashed border-2 border-white/60 bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
                    >
                        <div className="h-16 w-16 bg-white/40 rounded-full flex items-center justify-center border border-white/60 group-hover:scale-110 transition-transform">
                            <Plus className="h-8 w-8 text-muted-foreground/60" />
                        </div>
                        <p className="mt-4 text-sm font-bold text-muted-foreground/60 uppercase tracking-widest">Add Asset</p>
                    </motion.div>
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
}
