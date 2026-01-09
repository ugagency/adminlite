import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function Login() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                navigate("/admin/dashboard");
            }
        };
        checkSession();
    }, [navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            // Check if user has admin/editor/estoque role
            const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", data.user.id)
                .single() as any;

            if (profileError || !profile || (profile.role !== "admin" && profile.role !== "estoque")) {
                await supabase.auth.signOut();
                toast.error("Acesso restrito. Sua conta não possui permissão de acesso ao painel.");
                return;
            }

            toast.success(`Bem-vindo, ${profile.role}!`);
            navigate("/admin/dashboard");
        } catch (error: any) {
            toast.error(error.message || "Senha ou e-mail inválidos");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-secondary/30 px-4">
            <Card className="w-full max-w-md border-border shadow-lg">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-6">
                        <img src="/logo.png" alt="Lite Fitness Beach" className="h-16 w-auto object-contain" />
                    </div>
                    <CardTitle className="text-2xl font-display font-medium tracking-tight">
                        Painel Administrativo
                    </CardTitle>
                    <CardDescription>
                        Acesso restrito a usuários autorizados
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@lite.com"
                                required
                                className="bg-white"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Senha</Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                className="bg-white"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button
                            className="w-full btn-primary"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "Entrando..." : "Entrar"}
                        </Button>
                    </CardFooter>
                </form>
                <div className="pb-6 text-center text-sm text-muted-foreground">
                    <p>Lite Fitness Beach &copy; {new Date().getFullYear()}</p>
                </div>
            </Card>
        </div>
    );
}
