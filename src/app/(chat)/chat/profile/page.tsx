"use client";

import { useAuth } from "@/context/AuthContext";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ChatProfileData } from "@/types/profile";
import Profile from "@/components/Profile";

export default function ProfilePage() {
  const { user, isLoading, secureFetch } = useAuth();
  const router = useRouter();
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [userProfile, setUserProfile] = useState<ChatProfileData | null>(null);

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.push("/login");
    } else {
      fetchUserProfile();
    }
  }, [user, isLoading, router]);

  const fetchUserProfile = async () => {
    try {
      const response = await secureFetch("/api/v1/chat/profile", {
        method: "GET",
      });
      const data = await response.json();

      if (data.success) {
        setUserProfile(data.profile);
      } else {
        toast.error("Failed to fetch profile", {
          description: data.error || "Unknown error",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile data");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  if (isLoading || isLoadingProfile) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <Loader2Icon className="animate-spin h-6 w-6" />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto p-4 space-y-6">
      <h2 className="text-2xl font-bold">My Profile</h2>

      {userProfile && user && (
        <Profile userProfile={userProfile} user={user} secureFetch={secureFetch} />
      )}
    </div>
  );
}
