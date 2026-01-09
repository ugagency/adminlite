import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Mail, UserPlus, MessageSquare, Tag, Trash2, Pencil } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { format } from "date-fns";
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

export default function Customers() {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<any>(null);

    // Form State
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        whatsapp: "",
    });

    const { data: customers, isLoading } = useQuery({
        queryKey: ["customers-list"],
        queryFn: async () => {
            const { data, error } = await (supabase as any)
                .from("customers")
                .select("*")
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data as any[];
        },
    });

    const saveCustomerMutation = useMutation({
        mutationFn: async () => {
            if (editingCustomer) {
                const { error } = await (supabase as any)
                    .from("customers")
                    .update(formData)
                    .eq("id", editingCustomer.id);
                if (error) throw error;
            } else {
                const { error } = await (supabase as any)
                    .from("customers")
                    .insert([formData]);
                if (error) throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["customers-list"] });
            toast.success(editingCustomer ? "Cadastro atualizado" : "Cliente cadastrado");
            setIsDialogOpen(false);
            resetForm();
        },
        onError: (error: any) => toast.error(error.message),
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await (supabase as any).from("customers").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["customers-list"] });
            toast.success("Cliente removido");
        },
    });

    const resetForm = () => {
        setFormData({ full_name: "", email: "", whatsapp: "" });
        setEditingCustomer(null);
    };

    const handleEdit = (customer: any) => {
        setEditingCustomer(customer);
        setFormData({
            full_name: customer.full_name,
            email: customer.email,
            whatsapp: customer.whatsapp || "",
        });
        setIsDialogOpen(true);
    };

    const filteredCustomers = customers?.filter(c =>
        c.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.whatsapp?.includes(searchTerm)
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-display font-medium tracking-tight">Lista de Clientes</h2>
                    <p className="text-muted-foreground mt-1">Sua base de dados independente para marketing e vendas</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) resetForm();
                }}>
                    <DialogTrigger asChild>
                        <Button className="btn-primary">
                            <UserPlus className="w-4 h-4 mr-2" />
                            Novo Cliente
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingCustomer ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
                            <DialogDescription>
                                Adicione as informações de contato do cliente.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nome Completo</label>
                                <Input value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">E-mail</label>
                                <Input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">WhatsApp</label>
                                <Input placeholder="Apenas números com DDD" value={formData.whatsapp} onChange={e => setFormData({ ...formData, whatsapp: e.target.value })} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                            <Button onClick={() => saveCustomerMutation.mutate()} disabled={saveCustomerMutation.isPending}>
                                {saveCustomerMutation.isPending ? "Salvando..." : "Salvar"}
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
                            placeholder="Buscar por nome, e-mail ou WhatsApp..."
                            className="pl-9 bg-secondary/50 border-none"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow className="bg-secondary/20 font-display">
                            <TableHead>Cliente</TableHead>
                            <TableHead>Contato</TableHead>
                            <TableHead>Gastos Totais</TableHead>
                            <TableHead>Data Cadastro</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={5} className="text-center py-12">Carregando...</TableCell></TableRow>
                        ) : filteredCustomers?.length === 0 ? (
                            <TableRow><TableCell colSpan={5} className="text-center py-12 italic text-muted-foreground">Nenhum cliente cadastrado.</TableCell></TableRow>
                        ) : (
                            filteredCustomers?.map((customer) => (
                                <TableRow key={customer.id} className="hover:bg-secondary/10 transition-colors">
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{customer.full_name}</span>
                                            {customer.tags?.length > 0 && (
                                                <div className="flex gap-1 mt-1">
                                                    {customer.tags.map((t: string) => <span key={t} className="text-[10px] bg-secondary px-1.5 rounded-full flex items-center gap-1"><Tag className="w-2 h-2" />{t}</span>)}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-sm text-green-700 font-medium">
                                                <MessageSquare className="w-3 h-3" />
                                                <span>{customer.whatsapp || "N/I"}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Mail className="w-3 h-3" />
                                                <span>{customer.email}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-semibold">
                                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(customer.total_spent || 0)}
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {format(new Date(customer.created_at), "dd/MM/yyyy HH:mm")}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            {customer.whatsapp && (
                                                <Button variant="ghost" size="icon" className="text-green-600" asChild>
                                                    <a href={`https://wa.me/55${customer.whatsapp.replace(/\D/g, "")}`} target="_blank">
                                                        <MessageSquare className="w-4 h-4" />
                                                    </a>
                                                </Button>
                                            )}
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(customer)}>
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => { if (confirm("Remover cliente?")) deleteMutation.mutate(customer.id) }}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
