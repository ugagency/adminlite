import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, UserPlus, ShieldCheck, Trash2, XCircle, Package } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function AdminUsers() {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [invitePassword, setInvitePassword] = useState("");
    const [inviteRole, setInviteRole] = useState("estoque");

    // Fetch active staff (admins and estoque)
    const { data: users, isLoading: loadingUsers } = useQuery({
        queryKey: ["admin-users"],
        queryFn: async () => {
            const { data, error } = await (supabase as any)
                .from("profiles")
                .select("*")
                .in("role", ["admin", "estoque"])
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data as any[];
        },
    });

    // Fetch pending access requests
    const { data: invites, isLoading: loadingInvites } = useQuery({
        queryKey: ["admin-invites"],
        queryFn: async () => {
            const { data, error } = await (supabase as any)
                .from("admin_invites")
                .select("*")
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data as any[];
        },
    });

    // Mutation to give access
    const createInviteMutation = useMutation({
        mutationFn: async () => {
            // 1. First, insert the invite to pre-define the role
            const { error: inviteError } = await (supabase as any)
                .from("admin_invites")
                .insert([{ email: inviteEmail, role: inviteRole }]);

            if (inviteError) throw inviteError;

            // 2. Create the user in Auth WITHOUT logging out the current admin
            const { createClient } = await import("@supabase/supabase-js");
            const tempClient = createClient(
                import.meta.env.VITE_SUPABASE_URL || "",
                import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "",
                { auth: { persistSession: false } }
            );

            const { data, error: signUpError } = await tempClient.auth.signUp({
                email: inviteEmail,
                password: invitePassword,
                options: {
                    data: {
                        full_name: "Novo Membro",
                    },
                },
            });

            if (signUpError) throw signUpError;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-invites"] });
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
            toast.success("Usuário criado e autorizado com sucesso!");
            setIsInviteOpen(false);
            setInviteEmail("");
            setInvitePassword("");
        },
        onError: (error: any) => {
            toast.error(error.message || "Erro ao criar usuário.");
        },
    });

    // Mutation to remove access
    const removeAdminMutation = useMutation({
        mutationFn: async (userId: string) => {
            const { error } = await (supabase as any)
                .from("profiles")
                .update({ role: "customer" })
                .eq("id", userId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
            toast.success("Acesso removido.");
        },
        onError: (error: any) => toast.error(error.message),
    });

    // Mutation to delete request
    const deleteInviteMutation = useMutation({
        mutationFn: async (inviteId: string) => {
            const { error } = await (supabase as any)
                .from("admin_invites")
                .delete()
                .eq("id", inviteId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-invites"] });
            toast.success("Autorização cancelada");
        },
    });

    const filteredUsers = users?.filter(u =>
        u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-display font-medium tracking-tight">Gerenciar Acessos</h2>
                    <p className="text-muted-foreground mt-1">Configure administradores e equipe de estoque</p>
                </div>

                <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                    <DialogTrigger asChild>
                        <Button className="btn-primary">
                            <UserPlus className="w-4 h-4 mr-2" />
                            Adicionar Novo Acesso
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Criar Novo Perfil de Acesso</DialogTitle>
                            <DialogDescription>
                                Cadastre um novo membro da equipe definindo e-mail e senha de acesso.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-800">
                                <strong>Dica:</strong> Após autorizar o e-mail aqui, crie o usuário no Supabase com a senha desejada. O sistema reconhecerá o cargo automaticamente.
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">E-mail</label>
                                <Input
                                    placeholder="equipe@lite.com"
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Senha Inicial</label>
                                <Input
                                    placeholder="mínimo 6 caracteres"
                                    type="password"
                                    value={invitePassword}
                                    onChange={(e) => setInvitePassword(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Cargo / Função</label>
                                <Select value={inviteRole} onValueChange={setInviteRole}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Administrador (Acesso Total)</SelectItem>
                                        <SelectItem value="estoque">Controle de Estoque (Apenas Produtos/Pedidos)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsInviteOpen(false)}>Cancelar</Button>
                            <Button
                                onClick={() => createInviteMutation.mutate()}
                                disabled={createInviteMutation.isPending || !inviteEmail || invitePassword.length < 6}
                            >
                                {createInviteMutation.isPending ? "Criando..." : "Criar Usuário"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nome ou e-mail..."
                            className="pl-9 bg-secondary/50 border-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow className="bg-secondary/20 font-display">
                            <TableHead>Usuário</TableHead>
                            <TableHead>Cargo</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {/* Active Users */}
                        {filteredUsers?.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{user.full_name || "Membro da Equipe"}</span>
                                        <span className="text-xs text-muted-foreground">{user.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {user.role === "admin" ? (
                                            <ShieldCheck className="w-4 h-4 text-primary" />
                                        ) : (
                                            <Package className="w-4 h-4 text-muted-foreground" />
                                        )}
                                        <span className="capitalize">{user.role}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Ativo
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive hover:bg-destructive/10"
                                        onClick={() => { if (confirm("Remover acesso?")) removeAdminMutation.mutate(user.id) }}
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Remover
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}

                        {/* Pending Access */}
                        {invites?.map((invite) => (
                            <TableRow key={invite.id} className="opacity-70 bg-yellow-50/20">
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium italic">Aguardando login...</span>
                                        <span className="text-xs text-muted-foreground">{invite.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="capitalize">{invite.role}</TableCell>
                                <TableCell>
                                    <span className="text-xs text-muted-foreground">Pré-autorizado</span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive"
                                        onClick={() => deleteInviteMutation.mutate(invite.id)}
                                    >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Cancelar
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}

                        {(!users?.length && !invites?.length) && !loadingUsers && !loadingInvites && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-12 text-muted-foreground italic">
                                    Nenhum registro encontrado.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
