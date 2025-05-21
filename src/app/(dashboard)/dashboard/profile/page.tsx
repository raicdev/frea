"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { Loader2Icon, SaveIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ProfileData, ServerProfileData, Embed } from "@/types/profile";

export default function Dashboard() {
  const { user, isLoading, secureFetch } = useAuth();
  const router = useRouter();
  const [profileData, setProfileData] = useState<ServerProfileData>({
    uid: "",
    alias: "",
    displayName: "",
    bio: "",
    location: "",
    website: "",
    phoneNumber: "",
    embeds: [], // Initialize as empty array
  });
  const [newEmbed, setNewEmbed] = useState<Embed>({
    url: "",
    title: "",
    description: "",
    image: "",
    type: "link",
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.push("/login");
    } else {
      // Fetch profile data
      fetchProfileData();
    }
  }, [isLoading, user]);

  useEffect(() => {
    console.log(profileData)
  }, [profileData]);

  const fetchProfileData = async () => {
    try {
      const response = await secureFetch("/api/v1/profile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Alias-Data": "true",
        },
      });

      const data = await response.json();

      console.log("Profile fetch response:", data);

      if (response.ok) {
        const profile = data.data as ProfileData;
        console.log("Profile data:", profile);

        setProfileData(profile);
      } else {
        // If no profile exists yet, initialize with user data
        toast.error("Profile fetch failed", {
          description: data.error || "Please check your input and try again.",
        });

        setProfileData({
          uid: user?.uid || "",
          displayName: user?.displayName || "",
          alias: "unknown",
          bio: "",
          location: "",
          website: "",
          phoneNumber: "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile data", {
        description:
          error instanceof Error ? error.message : "Please try again later.",
      });
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Handle new embed properties
    if (name.startsWith("embed.")) {
      const embedField = name.split(".")[1];
      setNewEmbed((prev) => ({
        ...prev,
        [embedField]: value,
      }));
    } else {
      setProfileData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const response = await secureFetch("/api/v1/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Profile updated successfully");
      } else {
        toast.error("Failed to update profile", {
          description: data.error || "Please check your input and try again.",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to load profile data", {
        description:
          error instanceof Error ? error.message : "Please try again later.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAliasSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const response = await secureFetch("/api/v1/profile/alias", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          alias: profileData.alias,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Alias updated successfully");
      } else {
        toast.error("Failed to update alias", {
          description: data.error || "Please check your input and try again.",
        });
      }
    } catch (error) {
      console.error("Error updating alias:", error);
      toast.error("Failed to load alias data", {
        description:
          error instanceof Error ? error.message : "Please try again later.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const addEmbed = () => {
    if (!newEmbed.url || !newEmbed.type) {
      toast.error("URL and type are required for embeds");
      return;
    }

    setProfileData((prev) => ({
      ...prev,
      embeds: [...(prev.embeds || []), newEmbed],
    }));

    // Reset new embed form
    setNewEmbed({
      url: "",
      title: "",
      description: "",
      image: "",
      type: "link",
    });

    toast.success("Embed added to profile");
  };

  const removeEmbed = (index: number) => {
    setProfileData((prev) => {
      const updatedEmbeds = [...(prev.embeds || [])];
      updatedEmbeds.splice(index, 1);

      return {
        ...prev,
        embeds: updatedEmbeds,
      };
    });

    toast.success("Embed removed from profile");
  };

  const check14Days = () => {
    if (profileData.__lastAliasChanged) {
      const lastAliasChanged = new Date(profileData.__lastAliasChanged);
      const currentDate = new Date();
      const timeDiff = currentDate.getTime() - lastAliasChanged.getTime();
      const daysDiff = timeDiff / (1000 * 3600 * 24);

      const responseData: {
        enabled: boolean;
        remainingDays?: number;
      } = {
        enabled: daysDiff > 14,
      };

      if (daysDiff < 14) {
        responseData.remainingDays = 14 - Math.floor(daysDiff);
      }

      return responseData;
    }

    return {
      enabled: true,
    };
  };

  const previewEmbed = (embed: Embed) => {
    if (!embed.url) return null;

    return (
      <div className="mt-2 border rounded overflow-hidden">
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
          {embed.description && <p className="text-sm mt-2">{embed.description}</p>}
          <p className="text-xs text-muted-foreground mt-2 truncate">{embed.url}</p>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <Loader2Icon className="animate-spin h-6 w-6" />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full p-8 space-y-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Profile</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col w-full h-full space-y-4">
        <div className="flex items-center space-x-4">
          <Image
            src={user?.photoURL || "/default-avatar.png"}
            alt="User Avatar"
            width={64}
            height={64}
            className="w-16 h-16 rounded-full"
          />
          <div>
            <h1 className="text-3xl font-bold">
              {user?.displayName || "User Profile"}
            </h1>
            <p className="text-muted-foreground">
              Manage your account settings and profile information
            </p>
          </div>
        </div>

        {isLoadingProfile ? (
          <div className="flex justify-center p-8">
            <Loader2Icon className="animate-spin h-6 w-6" />
          </div>
        ) : (
          <div className="flex flex-col space-y-4">
            <Card className="md:max-w-2xl">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      name="displayName"
                      value={profileData.displayName}
                      onChange={handleInputChange}
                      placeholder="Your display name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={profileData.bio}
                      onChange={handleInputChange}
                      placeholder="Tell us about yourself"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        name="location"
                        value={profileData.location}
                        onChange={handleInputChange}
                        placeholder="Your location"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        name="website"
                        value={profileData.website}
                        onChange={handleInputChange}
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      value={profileData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="Your phone number"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <>
                        <Loader2Icon className="h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <SaveIcon className="h-4 w-4" />
                        Save
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            
            <Card className="md:max-w-2xl">
              <CardHeader>
                <CardTitle>Profile Embeds</CardTitle>
                <CardDescription>
                  Add embeds to your profile to showcase your websites, music, videos, or social media content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Current embeds list */}
                  {profileData.embeds && profileData.embeds.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Your Embeds</h3>
                      <div className="space-y-3">
                        {profileData.embeds.map((embed, index) => (
                          <div key={index} className="border rounded p-3">
                            {previewEmbed(embed)}
                            <Button
                              variant="destructive"
                              size="sm"
                              className="w-full mt-2"
                              onClick={() => removeEmbed(index)}
                            >
                              Remove Embed
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add new embed form */}
                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-medium mb-3">Add New Embed</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="embed.url">URL*</Label>
                        <Input
                          id="embed.url"
                          name="embed.url"
                          value={newEmbed.url}
                          onChange={handleInputChange}
                          placeholder="https://example.com"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="embed.type">Type*</Label>
                        <select
                          id="embed.type"
                          name="embed.type"
                          value={newEmbed.type}
                          onChange={handleInputChange}
                          className="w-full p-2 border rounded"
                          required
                        >
                          <option value="link">Link</option>
                          <option value="spotify">Spotify</option>
                          <option value="youtube">YouTube</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="embed.title">Title</Label>
                        <Input
                          id="embed.title"
                          name="embed.title"
                          value={newEmbed.title}
                          onChange={handleInputChange}
                          placeholder="Title of your embed"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="embed.description">Description</Label>
                        <Textarea
                          id="embed.description"
                          name="embed.description"
                          value={newEmbed.description}
                          onChange={handleInputChange}
                          placeholder="Description of your embed"
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="embed.image">Image URL</Label>
                        <Input
                          id="embed.image"
                          name="embed.image"
                          value={newEmbed.image || ""}
                          onChange={handleInputChange}
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>

                      <div className="mt-4 border rounded p-4">
                        <h3 className="text-lg font-bold">Preview</h3>
                        {previewEmbed(newEmbed)}
                      </div>

                      <Button
                        type="button"
                        className="w-full"
                        onClick={addEmbed}
                        disabled={!newEmbed.url || !newEmbed.type}
                      >
                        <SaveIcon className="h-4 w-4 mr-2" />
                        Add Embed
                      </Button>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <p className="text-sm text-yellow-400 mb-4">
                      Remember to save your profile with all changes (including embeds) by clicking the &quot;Save&quot; button at the top.
                    </p>
                    <Button
                      type="button"
                      className="w-full"
                      onClick={handleSubmit}
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <>
                          <Loader2Icon className="h-4 w-4 animate-spin mr-2" />
                          Saving Profile...
                        </>
                      ) : (
                        <>
                          <SaveIcon className="h-4 w-4 mr-2" />
                          Save All Profile Changes
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:max-w-2xl">
              <CardHeader>
                <CardTitle>Alias</CardTitle>
                <CardDescription>
                  Alias is a unique identifier for your profile. It can be used
                  to mention you in chats and other places. Please choose
                  wisely.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAliasSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="alias">Alias</Label>
                    <Input
                      id="alias"
                      name="alias"
                      disabled={!check14Days().enabled}
                      value={profileData.alias}
                      onChange={handleInputChange}
                      placeholder="Your @alias"
                    />
                  </div>

                  {profileData.__lastAliasChanged &&
                    (() => {
                      const fourteenDaysCheck = check14Days();
                      if (!fourteenDaysCheck.enabled) {
                        return (
                          <p className="text-sm text-yellow-400">
                            You can change your alias in{" "}
                            {fourteenDaysCheck.remainingDays} days.
                          </p>
                        );
                      }

                      return (
                        <p className="text-sm text-muted-foreground">
                          Last alias change:{" "}
                          {new Date(
                            profileData.__lastAliasChanged as number
                          ).toLocaleString()}
                        </p>
                      );
                    })()}

                  <p className="text-sm text-red-400">
                    Note: After alias changed, it cannot be changed on 14 days.
                  </p>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isUpdating || !check14Days().enabled}
                  >
                    {isUpdating ? (
                      <>
                        <Loader2Icon className="h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <SaveIcon className="h-4 w-4" />
                        Save
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
