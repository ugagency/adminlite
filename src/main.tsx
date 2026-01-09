import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Log environment variables for troubleshooting
console.log("VITE_SUPABASE_URL:", import.meta.env.VITE_SUPABASE_URL ? "Set" : "Not Set");
console.log("VITE_SUPABASE_PUBLISHABLE_KEY:", import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? "Set" : "Not Set");

// Health check for Render Deploy
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
    console.error("ERRO CRÍTICO: Variáveis de ambiente do Supabase não encontradas no Render!");
    document.body.innerHTML = `
    <div style="font-family: sans-serif; padding: 20px; text-align: center;">
      <h1 style="color: #6366f1;">Lite Fitness - Painel Administrativo</h1>
      <p style="color: red;">⚠️ Erro de Configuração Detectado</p>
      <div style="background: #fdf2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 8px; display: inline-block; margin-top: 20px;">
        As chaves do Supabase não foram configuradas no painel do Render.<br/>
        Por favor, adicione <strong>VITE_SUPABASE_URL</strong> e <strong>VITE_SUPABASE_PUBLISHABLE_KEY</strong> nas configurações do Render.
      </div>
    </div>
  `;
} else {
    createRoot(document.getElementById("root")!).render(<App />);
}
