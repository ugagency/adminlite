import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import Products from "./pages/admin/Products";
import Orders from "./pages/admin/Orders";
import Customers from "./pages/admin/Customers";
import AdminUsers from "./pages/admin/AdminUsers";
import Settings from "./pages/admin/Settings";
import Profile from "./pages/admin/Profile";
import POS from "./pages/admin/POS";

const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
        <TooltipProvider>
            <Toaster />
            <BrowserRouter>
                <Routes>
                    <Route path="/admin/login" element={<Login />} />
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<Navigate to="dashboard" replace />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="products" element={<Products />} />
                        <Route path="pos" element={<POS />} />
                        <Route path="orders" element={<Orders />} />
                        <Route path="customers" element={<Customers />} />
                        <Route path="users" element={<AdminUsers />} />
                        <Route path="settings" element={<Settings />} />
                        <Route path="profile" element={<Profile />} />
                    </Route>
                    <Route path="*" element={<Navigate to="/admin/login" replace />} />
                </Routes>
            </BrowserRouter>
        </TooltipProvider>
    </QueryClientProvider>
);

export default App;
