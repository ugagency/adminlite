import { Sidebar } from "@/components/admin/Sidebar";
import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function AdminLayout() {
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        async function checkAuth() {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                navigate("/admin/login");
                return;
            }

            const { data: profile } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", session.user.id)
                .single() as any;

            if (!profile || (profile.role !== "admin" && profile.role !== "editor" && profile.role !== "estoque")) {
                await supabase.auth.signOut();
                navigate("/admin/login");
                return;
            }

            setRole(profile.role);
            setLoading(false);
        }

        checkAuth();
    }, [navigate]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Carregando painel...</div>;
    }

    return (
        <div className="min-h-screen bg-secondary/30">
            <Sidebar userRole={role} />
            <main className="pl-64 min-h-screen">
                <div className="p-8 max-w-7xl mx-auto animate-fade-in">
                    <Outlet context={{ role }} />
                </div>
            </main>
        </div>
    );
}
