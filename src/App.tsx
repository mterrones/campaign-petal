import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import AppLayout from "./components/AppLayout";
import RequireAuth from "./components/RequireAuth";
import Dashboard from "./pages/Dashboard";
import Campaigns from "./pages/Campaigns";
import CampaignNew from "./pages/CampaignNew";
import EmailEditor from "./pages/EmailEditor";
import Contacts from "./pages/Contacts";
import Reports from "./pages/Reports";
import ReportsApi from "./pages/ReportsApi";
import CampaignReport from "./pages/CampaignReport";
import DomainSettings from "./pages/DomainSettings";
import ApiKeys from "./pages/ApiKeys";
import Templates from "./pages/Templates";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<RequireAuth />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/campaigns" element={<Campaigns />} />
                <Route path="/campaigns/new" element={<EmailEditor />} />
                <Route path="/templates" element={<Templates />} />
                <Route path="/contacts" element={<Contacts />} />
                <Route path="/reports" element={<Navigate to="/reports/campaigns" replace />} />
                <Route path="/reports/campaigns" element={<Reports />} />
                <Route path="/reports/campaigns/:id" element={<CampaignReport />} />
                <Route path="/reports/api" element={<ReportsApi />} />
                <Route path="/settings" element={<DomainSettings />} />
                <Route path="/api-keys" element={<ApiKeys />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
