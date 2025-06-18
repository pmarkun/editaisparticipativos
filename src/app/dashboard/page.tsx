"use client";
import { useAuth } from "@/lib/auth";
import ProponentDashboard from "@/components/dashboard/ProponentDashboard";
import AdminDashboard from "@/components/dashboard/AdminDashboard";

export default function DashboardPage() {
  const { isAdmin } = useAuth();
  return isAdmin ? <AdminDashboard /> : <ProponentDashboard />;
}
