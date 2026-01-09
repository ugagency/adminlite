import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Phone, Shield, Loader2, Save, Lock, KeyRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

function PasswordSection() {
    const [passwordData, setPasswordData] = useState({
        newPassword: "",
        confirmPassword: ""
    });
    const [updatingPassword, setUpdatingPassword] = useState(false);

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("As senhas não coincidem");
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast.error("A senha deve ter pelo menos 6 caracteres");
            return;
        }

        setUpdatingPassword(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: passwordData.newPassword
            });

            if (error) throw error;

            toast.success("Senha atualizada com sucesso!");
            setPasswordData({ newPassword: "", confirmPassword: "" });
        } catch (error: any) {
            toast.error(error.message || "Erro ao atualizar senha");
        } finally {
            setUpdatingPassword(false);
        }
    };

    return (
        <Card className="border-border shadow-sm">
            <CardHeader>
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                        <KeyRound className="h-6 w-6" />
                    </div>
                    <div>
                        <CardTitle className="text-xl">Alterar Senha</CardTitle>
                        <CardDescription className="mt-1">
                            Atualize sua senha de acesso ao painel
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <form onSubmit={handlePasswordUpdate}>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">Nova Senha</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="newPassword"
                                    type="password"
                                    placeholder="••••••"
                                    className="pl-9"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="••••••"
                                    className="pl-9"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="bg-secondary/20 border-t border-border mt-6 flex justify-end">
                    <Button type="submit" className="btn-primary" disabled={updatingPassword}>
                        {updatingPassword ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Atualizando...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Atualizar Senha
                            </>
                        )}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}

export default function Profile() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [formData, setFormData] = useState({
        full_name: "",
        phone: "",
        cpf: "",
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            if (error) throw error;

            setProfile(data);
            setFormData({
                full_name: data.full_name || "",
                phone: data.phone || "",
                cpf: data.cpf || "",
            });
        } catch (error: any) {
            toast.error("Erro ao carregar perfil");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase
                .from("profiles")
                .update({
                    full_name: formData.full_name,
                    phone: formData.phone,
                    cpf: formData.cpf,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", user.id);

            if (error) throw error;

            toast.success("Perfil atualizado com sucesso!");
            fetchProfile();
        } catch (error: any) {
            toast.error(error.message || "Erro ao atualizar perfil");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h2 className="text-3xl font-display font-medium tracking-tight">Meu Perfil</h2>
                <p className="text-muted-foreground mt-1">Gerencie suas informações pessoais de acesso</p>
            </div>

            <Card className="border-border shadow-sm">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                            <User className="h-8 w-8" />
                        </div>
                        <div>
                            <CardTitle className="text-xl">{profile?.full_name || "Membro da Equipe"}</CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                                <Shield className="w-3.5 h-3.5" />
                                Cargo: <span className="capitalize font-medium text-foreground">{profile?.role}</span>
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <form onSubmit={handleUpdate}>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="email">E-mail (Apenas Leitura)</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        value={profile?.email || ""}
                                        disabled
                                        className="pl-9 bg-secondary/50 border-none italic"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="full_name">Nome Completo</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="full_name"
                                        placeholder="Seu nome"
                                        className="pl-9"
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Telefone / WhatsApp</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="phone"
                                        placeholder="(00) 00000-0000"
                                        className="pl-9"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cpf">CPF</Label>
                                <Input
                                    id="cpf"
                                    placeholder="000.000.000-00"
                                    value={formData.cpf}
                                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-secondary/20 border-t border-border mt-6 flex justify-end">
                        <Button type="submit" className="btn-primary" disabled={saving}>
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Salvar Alterações
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Card>

            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-sm text-blue-800 flex gap-3">
                <Shield className="w-5 h-5 flex-shrink-0" />
                <p>
                    As permissões do seu cargo são gerenciadas pelo administrador principal.
                    Caso precise de mais acessos, entre em contato com o responsável.
                </p>
            </div>

            <PasswordSection />
        </div>
    );
}
