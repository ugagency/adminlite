import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter, Eye, Store, Globe } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export default function Orders() {
    const { data: orders, isLoading } = useQuery({
        queryKey: ["orders"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("orders")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data;
        },
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case "delivered": return "bg-green-100 text-green-800";
            case "shipped": return "bg-blue-100 text-blue-800";
            case "cancelled": return "bg-red-100 text-red-800";
            default: return "bg-yellow-100 text-yellow-800";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "delivered": return "Entregue";
            case "shipped": return "Enviado";
            case "cancelled": return "Cancelado";
            case "pending": return "Pendente";
            case "confirmed": return "Confirmado";
            case "preparing": return "Preparando";
            default: return status;
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-display font-medium tracking-tight">Pedidos</h2>
                    <p className="text-muted-foreground mt-1">Gerencie os pedidos da loja</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-border shadow-sm">
                <div className="p-4 border-b border-border flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input placeholder="Buscar pedidos..." className="pl-9 bg-secondary/50 border-none" />
                    </div>
                    <Button variant="outline" className="gap-2 text-muted-foreground">
                        <Filter className="w-4 h-4" />
                        Filtros
                    </Button>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Pedido</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Pagamento</TableHead>
                            <TableHead>Canal</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                    Carregando pedidos...
                                </TableCell>
                            </TableRow>
                        ) : orders?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                    Nenhum pedido encontrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            orders?.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">#{order.id.slice(0, 8)}</TableCell>
                                    <TableCell>{order.customer_name || "Cliente sem nome"}</TableCell>
                                    <TableCell>
                                        {format(new Date(order.created_at), "dd/MM/yyyy")}
                                    </TableCell>
                                    <TableCell>
                                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(order.total)}
                                    </TableCell>
                                    <TableCell className="capitalize">{order.payment_method?.replace("_", " ")}</TableCell>
                                    <TableCell>
                                        {order.notes === "Venda Loja Física" ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                                                <Store className="w-3 h-3" /> Loja Física
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                                <Globe className="w-3 h-3" /> Site
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                            {getStatusLabel(order.status)}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button size="icon" variant="ghost">
                                            <Eye className="w-4 h-4" />
                                        </Button>
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
