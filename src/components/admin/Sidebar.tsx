import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    UserCog,
    Settings,
    User,
    LogOut,
    Store
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface SidebarProps {
    userRole: string | null;
}

export function Sidebar({ userRole }: SidebarProps) {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/admin/login");
    };

    const menuItems = [
        { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
        { icon: Package, label: "Produtos", path: "/admin/products" },
        { icon: Store, label: "Venda Loja", path: "/admin/pos" },
        { icon: ShoppingCart, label: "Pedidos", path: "/admin/orders" },
        { icon: Users, label: "Clientes", path: "/admin/customers" },
        { icon: UserCog, label: "Usuários", path: "/admin/users", roles: ["admin"] },
        { icon: Settings, label: "Configurações", path: "/admin/settings" },
        { icon: User, label: "Meu Perfil", path: "/admin/profile" },
    ];

    const filteredItems = menuItems.filter(item => !item.roles || (userRole && item.roles.includes(userRole)));

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card shadow-lg flex flex-col transition-all duration-300">
            <div className="flex h-16 items-center justify-center border-b px-6">
                <div className="flex items-center justify-center p-2">
                    <img src="/logo.png" alt="Lite Fitness Beach" className="h-10 w-auto object-contain" />
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto py-6">
                <ul className="space-y-2 px-4">
                    {filteredItems.map((item) => (
                        <li key={item.path}>
                            <Link
                                to={item.path}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground group",
                                    location.pathname === item.path
                                        ? "bg-primary/10 text-primary hover:bg-primary/20"
                                        : "text-muted-foreground hover:translate-x-1"
                                )}
                            >
                                <item.icon className={cn(
                                    "h-5 w-5 transition-colors",
                                    location.pathname === item.path ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                                )} />
                                {item.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="p-4 border-t bg-card/50 backdrop-blur-sm">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={handleLogout}
                >
                    <LogOut className="h-4 w-4" />
                    Sair
                </Button>
            </div>
        </aside>
    );
}
