import { Loader2Icon, ReplyIcon, Trash2Icon, VerifiedIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { HeartIcon } from "lucide-react";
import { ClientMessage, MessageFavorite } from "@/types/message";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Input } from "./ui/input";
import { RefreshCcwIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import Link from "next/link";

export function Message({
  message,
  className,
  viewOnly = false,
}: {
  message: ClientMessage;
  viewOnly?: boolean;
  className?: string;
}) {
  const { user, secureFetch } = useAuth();
  const [isFavoriting, setIsFavoriting] = useState(false);
  const [isLoadingReply, setIsLoadingReply] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showReplying, setShowReplying] = useState(false);
  const [isActioning, setIsActioning] = useState(false);

  useEffect(() => {
    if (message.favorites) {
      const isFavorited = message.favorites.some(
        (favorite) => favorite.uid === user?.uid
      );
      setIsFavoriting(isFavorited);
    }
  }, [message]);

  const refreshThisMessage = async () => {
    const response = await secureFetch(`/api/v1/messages/${message.id}`, {
      method: "GET",
    });
    const data = await response.json();
    if (data.success) {
      message.replies = data.message.replies;
    } else {
      toast.error("Failed to fetch message", {
        description: data.error || "Unknown error",
      });
    }
  };

  const handleShowReply = () => {
    if (!showReplying) {
      getReplies();
    }
    setShowReplying(!showReplying);
  };

  const getReplies = async () => {
    setIsLoadingReply(true);
    const response = await secureFetch(`/api/v1/messages/${message.id}/reply`, {
      method: "GET",
    });
    const data = await response.json();
    if (data.success) {
      message.replies = data.messages;
    } else {
      toast.error("Failed to fetch replies", {
        description: data.error || "Unknown error",
      });
    }
    setIsLoadingReply(false);
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsActioning(true);

    if (!replyContent.trim()) {
      toast.error("Reply content cannot be empty");
      setIsActioning(false);
      return;
    }

    const response = await secureFetch(`/api/v1/messages/${message.id}/reply`, {
      method: "POST",
      body: JSON.stringify({
        content: replyContent,
        replyTo: message.id,
      }),
    });

    const data = await response.json();
    if (data.success) {
      await refreshThisMessage();
    } else {
      toast.error("Failed to reply to message", {
        description: data.error || "Unknown error",
      });
    }

    setReplyContent("");

    setIsActioning(false);
  };

  const handleDelete = async () => {
    if (!user) return;
    setIsActioning(true);

    const response = await secureFetch(
      `/api/v1/messages/${message.id}/delete`,
      {
        method: "POST",
      }
    );

    const data = await response.json();
    if (data.success) {
      toast.success("Message deleted successfully");
    } else {
      toast.error("Failed to delete message", {
        description: data.error || "Unknown error",
      });
    }

    setIsActioning(false);
  };

  const handleLike = async () => {
    if (!user) return;
    setIsActioning(true);

    const response = await secureFetch(`/api/v1/messages/${message.id}/like`, {
      method: "POST",
    });

    const data = await response.json();
    if (data.success) {
      if (!data.favorited) {
        // Remove the user from favorites
        message.favorites = message.favorites?.filter(
          (favorite) => favorite.uid !== user.uid
        );
      } else {
        const favoriteData = {
          uid: user.uid,
          timestamp: Date.now(),
        };
        if (!message.favorites) {
          message.favorites = [favoriteData];
        } else {
          message.favorites?.push({
            uid: user.uid,
            timestamp: Date.now(),
          } as MessageFavorite);
        }
      }

      setIsFavoriting(!isFavoriting);
    } else {
      toast.error("Failed to like message", {
        description: data.error || "Unknown error",
      });
    }

    setIsActioning(false);
  };

  return (
    <div
      key={message.id}
      className={`w-full sm:max-w-2/3 md:max-w-1/2 mx-auto bg-card rounded-2xl p-4 ${className}`}
    >
      <div className="flex items-center">
        <Link href={`/chat/profile/${message.uid}`}>
          <Avatar>
            <AvatarFallback>
              {message.user?.displayName?.[0]?.toUpperCase() || "?"}
            </AvatarFallback>
            <AvatarImage
              src={
                message.user?.photoURL ||
                `https://avatar.vercel.sh/${message.uid}.png`
              }
            />
          </Avatar>
        </Link>

        <div className="ml-2">
          <div className="flex items-center gap-2">
            <Link href={`/chat/profile/${message.uid}`}>
              <span className="text-sm font-semibold underline-offset-2 hover:underline">
                {message.user?.displayName}
              </span>
            </Link>
            {message.user?.verified && (
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
            <span className="text-sm text-muted-foreground">
              {new Date(message.timestamp).toLocaleString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <div>
            <p>{message.content}</p>
          </div>
        </div>
      </div>

      {/* like, reply, delete buttons */}
      <div
        className={cn(
          "flex items-center gap-4 mt-2 px-8",
          viewOnly && "hidden"
        )}
      >
        <Button
          size={"icon"}
          variant={showReplying ? "default" : "ghost"}
          onClick={handleShowReply}
        >
          <ReplyIcon />
        </Button>
        <Button variant="ghost" disabled={isActioning} onClick={handleLike}>
          <HeartIcon
            className={cn({ "fill-red-500 text-red-500": isFavoriting })}
          />
          {message.favorites?.length || 0}
        </Button>
        {user?.uid === message.uid && (
          <Popover>
            <PopoverTrigger asChild>
              <Button size={"icon"} variant="ghost">
                <Trash2Icon />
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <p className="mb-1 font-semibold">
                Are you sure you want to delete this message?
              </p>

              <p className="mb-2 text-red-500 text-sm">
                This action cannot be undone. Please confirm.
              </p>

              <div className="flex gap-2 mb-4">
                <Checkbox
                  id="confirm-delete"
                  checked={confirmDelete}
                  onCheckedChange={() => setConfirmDelete(!confirmDelete)}
                ></Checkbox>

                <Label htmlFor="confirm-delete">
                  I confirm I want to delete this message
                </Label>
              </div>

              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={!confirmDelete}
              >
                Delete
              </Button>
            </PopoverContent>
          </Popover>
        )}
      </div>

      {showReplying && (
        <form
          className="flex items-center gap-2 mt-4 mb-3"
          onSubmit={handleReply}
        >
          <Input
            type="text"
            placeholder="Type your reply..."
            className="flex-1 p-2 border rounded-md"
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            disabled={isActioning}
          />
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={() => getReplies()}
            disabled={isActioning}
          >
            <RefreshCcwIcon />
          </Button>
          <Button
            type="submit"
            size="icon"
            variant="outline"
            disabled={isActioning}
          >
            <ReplyIcon />
          </Button>
        </form>
      )}

      {showReplying && isLoadingReply && (
        <div className="flex items-center justify-center w-full h-full">
          <Loader2Icon className="animate-spin h-6 w-6" />
        </div>
      )}

      {showReplying &&
        (message.replies?.length === 0 || !message.replies) &&
        !isLoadingReply && (
          <p className="text-center text-muted-foreground">
            No replies yet. Be the first to reply!
          </p>
        )}

      {showReplying &&
        message.replies?.map((reply) => (
          <Message
            className="!max-w-full ml-4"
            key={reply.id}
            message={reply}
          />
        ))}
    </div>
  );
}
