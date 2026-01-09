import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingBag, Users, Activity } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabaseAdmin } from "@/integrations/supabase/client";

export default function Dashboard() {
    const { data: dashboardData, isLoading } = useQuery({
        queryKey: ["dashboard-stats"],
        queryFn: async () => {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth() - 5, 1);

            // Fetch Stats and Chart Data
            const { data: orders, error } = await supabaseAdmin
                .from("orders")
                .select("*")
                .order("created_at", { ascending: true });

            if (error) throw error;

            const { count: customersCount } = await supabaseAdmin
                .from("profiles")
                .select("*", { count: 'exact', head: true })
                .eq("role", "customer");

            // Calculate Totals
            const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
            const totalSales = orders.filter(o => o.status !== "cancelled").length;

            // Generate Chart Data (Last 6 Months)
            const monthsMap = new Map();
            for (let i = 0; i < 6; i++) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const key = d.toLocaleString('default', { month: 'short' });
                monthsMap.set(key, 0); // Init
            }

            // Populate Chart Data
            orders.forEach(order => {
                const d = new Date(order.created_at);
                const monthKey = d.toLocaleString('default', { month: 'short' });
                if (monthsMap.has(monthKey) && order.status !== 'cancelled') {
                    monthsMap.set(monthKey, monthsMap.get(monthKey) + Number(order.total));
                }
            });

            // Convert to Array and Reverse to show chronological order
            // Note: Map iteration order is insertion order, but we constructed it backwards (now -> past).
            // We want Past -> Now for the chart.
            const chartData = Array.from(monthsMap.entries()).map(([name, total]) => ({ name, total })).reverse();

            // Get Recent Sales (Last 5)
            // Since we ordered by ASC above for chart, we reverse a copy for recent sales
            const recentSales = [...orders].reverse().slice(0, 5);

            return {
                totalRevenue,
                totalSales,
                customersCount: customersCount || 0,
                chartData,
                recentSales
            };
        },
    });

    const kpiData = [
        {
            title: "Receita Total",
            value: new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(dashboardData?.totalRevenue || 0),
            label: "Total acumulado",
            icon: DollarSign,
        },
        {
            title: "Vendas",
            value: `+${dashboardData?.totalSales || 0}`,
            label: "Pedidos realizados",
            icon: ShoppingBag,
        },
        {
            title: "Clientes",
            value: `+${dashboardData?.customersCount || 0}`,
            label: "Base de usuários",
            icon: Users,
        },
        {
            title: "Conversão (Est.)",
            value: "3.2%",
            label: "Taxa média",
            icon: Activity,
        },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-display font-medium tracking-tight">Dashboard</h2>
                <p className="text-muted-foreground mt-1">Visão geral da sua loja</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {kpiData.map((kpi, i) => (
                    <Card key={i} className="rounded-xl border-none shadow-sm hover:shadow-md transition-all">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
                                {kpi.title}
                            </CardTitle>
                            <kpi.icon className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold font-display">
                                {isLoading ? "..." : kpi.value}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 rounded-xl border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="font-display font-medium">Visão Geral de Vendas</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-0">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={dashboardData?.chartData}>
                                    <defs>
                                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis
                                        dataKey="name"
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `R$${value}`}
                                    />
                                    <Tooltip
                                        formatter={(value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)}
                                        labelStyle={{ color: "#333" }}
                                    />
                                    <Area type="monotone" dataKey="total" stroke="#8884d8" fillOpacity={1} fill="url(#colorTotal)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3 rounded-xl border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="font-display font-medium">Vendas Recentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {isLoading ? (
                                <p className="text-sm">Carregando...</p>
                            ) : dashboardData?.recentSales.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Nenhuma venda encontrada.</p>
                            ) : (
                                dashboardData?.recentSales.map((sale: any) => (
                                    <div key={sale.id} className="flex items-center justify-between border-b last:border-0 pb-3 last:pb-0">
                                        <div className="flex flex-col gap-1">
                                            <span className="font-medium text-sm">{sale.customer_name || "Cliente Loja"}</span>
                                            <span className="text-xs text-muted-foreground">{sale.notes || sale.payment_method}</span>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="font-bold text-sm">
                                                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(sale.total)}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(sale.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
