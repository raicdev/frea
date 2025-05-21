import { ChatSidebar } from "@/components/chat/sidebar";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { Sidebar, SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from "@/context/AuthContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <SidebarProvider>
        <ChatSidebar />
        {children}
      </SidebarProvider>
    </AuthProvider>
  );
}
