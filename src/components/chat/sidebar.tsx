"use client";

import { useAuth } from "@/context/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  BellIcon,
  ChartBarIcon,
  HomeIcon,
  Loader2Icon,
  SearchIcon,
  User2Icon,
} from "lucide-react";
import Image from "next/image";
import { Badge } from "../ui/badge";
import Link from "next/link";

export function ChatSidebar() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      // Redirect to login or handle unauthenticated state
      router.push("/login");
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <Sidebar>
        <SidebarContent className="flex items-center justify-center h-full">
          <Loader2Icon className="animate-spin h-6 w-6" />
        </SidebarContent>
      </Sidebar>
    );
  }

  const sidebarItems = {
    home: [
      {
        name: "Home",
        icon: <HomeIcon className="h-4 w-4" />,
        link: "/chat",
      },
      {
        name: "Notifications",
        icon: <BellIcon className="h-4 w-4" />,
        link: "/chat/notifications",
      },
      {
        name: "Search",
        icon: <SearchIcon className="h-4 w-4" />,
        link: "/chat/search",
      },
      {
        name: "Your Profile",
        icon: <User2Icon className="h-4 w-4" />,
        link: "/chat/profile",
      },
      {
        name: "Dashboard",
        icon: <ChartBarIcon className="h-4 w-4" />,
        link: "/dashboard",
      },
    ],
  };

  return (
    <Sidebar>
      <SidebarContent>
        <div className="flex items-center justify-between p-4 pb-0">
          <Link href="/chat">
            <Image
              src="/frea.svg"
              alt="Logo"
              width="40"
              height="40"
              className="h-10 w-10 rounded-full"
            />

            <h1 className="text-lg font-bold inline-flex items-center gap-2">
              Frea{" "}
              <Badge className="bg-yellow-400 text-black">Early Access</Badge>
            </h1>
          </Link>
        </div>
        <SidebarGroup>
          <SidebarGroupLabel>Home</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.home.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild isActive={item.link === pathname}>
                    <Link href={item.link}>
                      {item.icon}
                      {item.name}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="flex items-center gap-2 p-2">
              <Image
                src={user?.photoURL || "/default-avatar.png"}
                alt="User Avatar"
                width="40"
                height="40"
                className="h-10 w-10 rounded-full"
              />
              <div>
                <p className="font-semibold">{user?.displayName}</p>
                <p className="text-sm text-yellow-400">Early Access</p>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
