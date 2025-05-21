import { VerifiedIcon, MapPinIcon, GlobeIcon } from "lucide-react";
import React from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "./ui/card";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import { ChatProfileData } from "@/types/profile";
import { User } from "firebase/auth";
import Image from "next/image";
import { toast } from "sonner";

interface ProfileProps {
  userProfile: ChatProfileData;
  user: User;
  secureFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

const Profile: React.FC<ProfileProps> = ({
  userProfile,
  user,
  secureFetch,
}) => {
  const handleFollow = async () => {
    try {
      const response = await secureFetch(
        `/api/v1/chat/profile/${userProfile?.uid}/follow`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Followed successfully");
      } else {
        toast.error(data.error || "Failed to follow");
      }
    } catch (error) {
      console.error("Error following user:", error);
      toast.error("Failed to follow user");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Avatar className="w-16 h-16 rounded-full mb-4">
            <AvatarFallback>
              {userProfile?.displayName?.[0]?.toUpperCase() || "?"}
            </AvatarFallback>
            <AvatarImage
              alt="User Avatar"
              src={
                userProfile?.photoURL ||
                `https://avatar.vercel.sh/${userProfile?.uid}.png`
              }
            />
          </Avatar>
        </div>
        <CardTitle className="inline-flex items-center gap-2">
          {userProfile?.displayName}{" "}
          {userProfile?.verified && (
            <Popover>
              <PopoverTrigger>
                <VerifiedIcon className="w-4 h-4 text-green-500" />
              </PopoverTrigger>
              <PopoverContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <VerifiedIcon className="w-4 h-4 text-green-500" />

                  <h3 className="text-lg font-semibold">Verified User</h3>
                </div>

                <p>
                  This user is a Frea Developer or Sponsor, Media, or
                  Contributor.
                </p>
              </PopoverContent>
            </Popover>
          )}
        </CardTitle>
        <CardDescription>@{userProfile?.alias}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center mb-2">
          {userProfile?.location && (
            <p className="text-sm text-muted-foreground inline-flex items-center gap-1">
              <MapPinIcon className="w-4 h-4 text-muted-foreground" />
              {userProfile?.location}
            </p>
          )}

          {userProfile?.website && (
            <Link
              href={userProfile?.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-500 hover:underline inline-flex items-center gap-1"
            >
              <GlobeIcon className="w-4 h-4 text-muted-foreground" />
              {userProfile?.website.replace(/(^\w+:|^)\/\//, "")}
            </Link>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 mb-2">
          <Popover>
            <PopoverTrigger className="text-sm text-muted-foreground inline-flex items-center gap-1">
              <span className="font-semibold">Followers:</span>
              {userProfile?.followers?.length || 0}
            </PopoverTrigger>
            <PopoverContent className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">Followers</h3>
              </div>

              <p>
                {userProfile?.followers?.length
                  ? userProfile?.followers.join(", ")
                  : "No followers yet."}
              </p>
            </PopoverContent>
          </Popover>
          {" • "}
          <Popover>
            <PopoverTrigger className="text-sm text-muted-foreground inline-flex items-center gap-1">
              <span className="font-semibold">Following:</span>
              {userProfile?.following?.length || 0}
            </PopoverTrigger>
            <PopoverContent className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">Following</h3>
              </div>

              <p>
                {userProfile?.following?.length
                  ? userProfile?.following.join(", ")
                  : "Not following anyone."}
              </p>
            </PopoverContent>
          </Popover>
        </div>
        {userProfile?.bio && (
          <p className="text-sm text-muted-foreground mb-4">
            {userProfile?.bio.length > 200
              ? `${userProfile?.bio.slice(0, 200)}...`
              : userProfile?.bio}
          </p>
        )}

        {userProfile?.embeds && (
          <div className="flex flex-col gap-2 mb-4">
            {userProfile?.embeds.map((embed, index) => (
              <div key={index} className="mt-2 border rounded overflow-hidden">
                {embed.image && (
                  <div className="w-full h-40 relative">
                    <Image
                      src={embed.image}
                      alt={embed.title || "Embed preview"}
                      layout="fill"
                      objectFit="cover"
                      className="w-full"
                    />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold">{embed.title || embed.url}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {embed.type === "youtube"
                          ? "YouTube"
                          : embed.type === "spotify"
                          ? "Spotify"
                          : "Link"}
                      </p>
                    </div>
                  </div>
                  {embed.description && (
                    <p className="text-sm mt-2">{embed.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2 truncate">
                    {embed.url}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {userProfile?.uid === user?.uid && (
          <Button variant="outline" className="w-full" asChild>
            <Link href="/dashboard/profile">Edit Profile</Link>
          </Button>
        )}

        {userProfile?.uid !== user?.uid && (
          <Button variant="outline" className="w-full" onClick={handleFollow}>
            Follow
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default Profile;
