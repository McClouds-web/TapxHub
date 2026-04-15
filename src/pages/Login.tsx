import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, ArrowRight, UserPlus, Loader2, Sparkles, KeyRound, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function Login() {
    const [isSignUp, setIsSignUp] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    
    const { signIn, signUp, verifyEmail, user, isLoading: authLoading } = useAuth();
    const navigate = useNavigate();

    // If user is already logged in, redirect them
    useEffect(() => {
        if (!authLoading && user) {
            const isClient = user.role === "client" || user.role === "retainer";
            navigate(isClient ? "/client-portal" : "/dashboard");
        }
    }, [user, authLoading, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (isVerifying) {
                const success = await verifyEmail(email, verificationCode);
                if (success) {
                    setIsVerifying(false);
                    setIsSignUp(false);
                }
            } else if (isSignUp) {
                const success = await signUp(email, password, fullName || "New User");
                if (success) {
                    setIsVerifying(true);
                    setPassword(""); // Clear password field for safety
                }
            } else {
                const success = await signIn(email, password);
                if (success) {
                    // Auth state change handles redirect via useEffect above
                }
            }
        } catch (error: any) {
            toast.error(error.message || "Authentication failed");
        } finally {
            setIsLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="w-8 h-8 text-[#1E3A8A] animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-white p-3">
            {/* Ambient Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-50/50 blur-[120px]" />
                <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-indigo-50/50 blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-md relative"
            >
                <div className="mb-4 flex flex-col items-center text-center">
                    <img src="/logo.png" alt="TapxMedia" className="w-[280px] md:w-[340px] h-auto object-contain transform -translate-y-2" />
                    <p className="mt-4 text-[#0F1E3D]/40 text-[10px] font-black uppercase tracking-[0.2em] relative z-10">
                        Agency Operating System
                    </p>
                </div>

                <div className="mt-5 flex w-full max-w-md bg-[#F8FAFC] p-1 rounded-xl border border-[#0F1E3D]/5 mb-4 shadow-inner">
                    <button
                        type="button"
                        onClick={() => { setIsSignUp(false); setIsVerifying(false); setEmail(""); setPassword(""); setFullName(""); setVerificationCode(""); }}
                        className={`flex-1 rounded-xl py-2.5 text-[10px] font-black uppercase tracking-widest transition-all ${!isSignUp && !isVerifying ? 'bg-white text-[#0F1E3D] shadow-sm ring-1 ring-[#0F1E3D]/5' : 'text-[#0F1E3D]/30 hover:text-[#0F1E3D]/60'}`}
                    >
                        Sign In
                    </button>
                    <button
                        type="button"
                        onClick={() => { setIsSignUp(true); setIsVerifying(false); setEmail(""); setPassword(""); setFullName(""); setVerificationCode(""); }}
                        className={`flex-1 rounded-xl py-2.5 text-[10px] font-black uppercase tracking-widest transition-all ${isSignUp && !isVerifying ? 'bg-white text-[#0F1E3D] shadow-sm ring-1 ring-[#0F1E3D]/5' : 'text-[#0F1E3D]/30 hover:text-[#0F1E3D]/60'}`}
                    >
                        Register
                    </button>
                </div>

                <Card className="border-[#0F1E3D]/5 bg-white/90 shadow-2xl shadow-[#0F1E3D]/5 backdrop-blur-xl rounded-[2rem] overflow-hidden mt-4 flex flex-col items-center">
                    <CardHeader className="space-y-1 pb-6 w-full bg-[#F8FAFC]/50 border-b border-[#0F1E3D]/5">
                        <CardTitle className="text-[11px] font-extrabold text-[#0F1E3D] flex items-center gap-2">
                           <Sparkles className="w-4 h-4 text-blue-500" />
                           {isVerifying ? "Enter Verification Code" : isSignUp ? "Generate Access" : "Welcome Back"}
                        </CardTitle>
                        <CardDescription className="text-[#0F1E3D]/40 text-[10px] font-bold uppercase tracking-widest mt-2 block">
                            {isVerifying ? "Check your email for the 6-digit code" : isSignUp ? "Create a secure account for your business" : "Access your workspace and reports"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-8 w-full p-3">
                            <motion.form 
                                key="auth-form"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                onSubmit={handleSubmit} 
                                className="space-y-5"
                            >
                                <AnimatePresence mode="popLayout">
                                    {isSignUp && !isVerifying && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="space-y-2 border-b border-[#0F1E3D]/5 pb-6 mb-2"
                                        >
                                            <Label htmlFor="fullName" className="text-[10px] uppercase font-black tracking-widest text-[#0F1E3D]/60 ml-2">Full Business Name</Label>
                                            <div className="relative">
                                                <UserPlus className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1E3A8A]/30" />
                                                <Input
                                                    id="fullName"
                                                    type="text"
                                                    placeholder="e.g. Luna Studio"
                                                    required={isSignUp}
                                                    value={fullName}
                                                    onChange={(e) => setFullName(e.target.value)}
                                                    className="pl-11 h-12 rounded-xl border-[#0F1E3D]/10 bg-[#F8FAFC] focus-visible:ring-[#1E3A8A] font-bold placeholder:text-[#0F1E3D]/20"
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {!isVerifying && (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-[10px] uppercase font-black tracking-widest text-[#0F1E3D]/60 ml-2">Email Address</Label>
                                            <div className="relative">
                                                <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1E3A8A]/30" />
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="your@email.com"
                                                    required
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="pl-11 h-12 rounded-xl border-[#0F1E3D]/10 bg-[#F8FAFC] focus-visible:ring-[#1E3A8A] font-bold placeholder:text-[#0F1E3D]/20"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="password" className="text-[10px] uppercase font-black tracking-widest text-[#0F1E3D]/60 ml-2">Password</Label>
                                            <div className="relative">
                                                <KeyRound className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1E3A8A]/30" />
                                                <Input
                                                    id="password"
                                                    type="password"
                                                    placeholder="••••••••"
                                                    required
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="pl-11 h-12 rounded-xl border-[#0F1E3D]/10 bg-[#F8FAFC] focus-visible:ring-[#1E3A8A] font-bold placeholder:text-[#0F1E3D]/20"
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {isVerifying && (
                                    <div className="space-y-2">
                                        <Label htmlFor="code" className="text-[10px] uppercase font-black tracking-widest text-[#0F1E3D]/60 ml-2">8-Digit Code</Label>
                                        <div className="relative">
                                            <KeyRound className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1E3A8A]/30" />
                                            <Input
                                                id="code"
                                                type="text"
                                                placeholder="12345678"
                                                required
                                                value={verificationCode}
                                                onChange={(e) => setVerificationCode(e.target.value)}
                                                className="pl-11 h-12 rounded-xl border-[#0F1E3D]/10 bg-[#F8FAFC] focus-visible:ring-[#1E3A8A] font-bold tracking-widest text-center text-[11px] placeholder:text-[#0F1E3D]/20 placeholder:tracking-normal"
                                                maxLength={8}
                                            />
                                        </div>
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-14 bg-[#0F1E3D] hover:bg-[#1E3A8A] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl shadow-xl shadow-[#0F1E3D]/10 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 mt-4"
                                >
                                    {isLoading ? (
                                       <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            {isVerifying ? "Verify Code" : isSignUp ? "Generate Account" : "Access Workspace"} {isVerifying || isSignUp ? <ArrowRight className="ml-2 h-4 w-4" /> : <CheckCircle2 className="ml-2 h-4 w-4" />}
                                        </>
                                    )}
                                </Button>
                            </motion.form>
                    </CardContent>
                </Card>

                <p className="mt-5 text-center text-[10px] font-black uppercase tracking-widest text-[#0F1E3D]/20 leading-loose">
                    This is a secure gateway. Unauthorized access is monitored <br/> and reported. Powered by TapxMedia OS.
                </p>
            </motion.div>
        </div>
    );
}
