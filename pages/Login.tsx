import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, User, Lock, ArrowRight } from "lucide-react";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<UserRole>("admin");
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulated network delay
        setTimeout(() => {
            login(email, role);
            toast.success(`Success! logged in as ${role}`);
            navigate("/");
            setIsLoading(false);
        }, 1000);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50/50 p-4 transition-colors duration-500">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-md"
            >
                <div className="mb-8 flex flex-col items-center text-center">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent shadow-xl shadow-accent/20 ring-1 ring-accent/30">
                        <Shield className="h-6 w-6 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        TapxHub
                    </h1>
                    <p className="mt-2 text-slate-500">
                        Securely access your agency dashboard
                    </p>
                </div>

                <Card className="border-none bg-white/80 shadow-2xl shadow-slate-200/50 backdrop-blur-xl">
                    <CardHeader className="space-y-1 pb-6">
                        <CardTitle className="text-xl">Welcome back</CardTitle>
                        <CardDescription>
                            Login to manage your business and clients.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email address</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@company.com"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10 focus-visible:ring-accent"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                    <button type="button" className="text-xs text-accent hover:underline">
                                        Forgot password?
                                    </button>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        id="password"
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 focus-visible:ring-accent"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setRole("admin")}
                                    className={`flex items-center justify-center gap-2 rounded-lg border p-3 text-sm font-medium transition-all ${role === "admin"
                                            ? "border-accent bg-accent/5 text-accent shadow-sm"
                                            : "border-slate-100 bg-white text-slate-500 hover:bg-slate-50"
                                        }`}
                                >
                                    <Shield className="h-4 w-4" /> Admin
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole("client")}
                                    className={`flex items-center justify-center gap-2 rounded-lg border p-3 text-sm font-medium transition-all ${role === "client"
                                            ? "border-accent bg-accent/5 text-accent shadow-sm"
                                            : "border-slate-100 bg-white text-slate-500 hover:bg-slate-50"
                                        }`}
                                >
                                    <User className="h-4 w-4" /> Client
                                </button>
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-accent hover:bg-accent/90"
                            >
                                {isLoading ? (
                                    "Signing in..."
                                ) : (
                                    <>
                                        Sign in <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <p className="mt-8 text-center text-sm text-slate-500">
                    Powered by <span className="font-semibold text-slate-900">TapxHub Enterprise</span>
                </p>
            </motion.div>
        </div>
    );
}
