"use client";

import { useAuth } from "@/context/AuthContext";
import { Loader2Icon, SendIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Messages } from "@/components/Messages";
import { ClientMessage } from "@/types/message";

export default function Dashboard() {
  const { user, isLoading, secureFetch } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<ClientMessage[]>([]);
  const [isMessageLoading, setIsMessageLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.push("/login");
    } else {
      fetchMessages();
    }
  }, [user, isLoading, router]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMessages = async () => {
    setIsMessageLoading(true);
    const response = await secureFetch("/api/v1/messages", {
      method: "GET",
    });
    const data = await response.json();

    if (data.success) {
      setMessages(data.messages);
    } else {
      toast.error("Failed to fetch messages", {
        description: data.error || "Unknown error",
      });
    }

    setIsMessageLoading(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    setIsSending(true);
    try {
      const response = await secureFetch("/api/v1/messages", {
        method: "POST",
        body: JSON.stringify({
          content: newMessage,
          timestamp: Date.now(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error("Failed to send message", {
          description: data.error || "Unknown error",
        });
      } else {
        fetchMessages();
      }

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <Loader2Icon className="animate-spin h-6 w-6" />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full p-4 space-y-4">
      <div className="flex justify-between items-center mb-4 w-full sm:max-w-2/3 md:max-w-1/2 mx-auto">
        <h2 className="text-xl font-bold">Chat Room</h2>
        <Button 
          variant="outline" 
          size="sm"
          onClick={fetchMessages}
          disabled={isMessageLoading}
        >
          {isMessageLoading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2Icon className="h-4 w-4 animate-spin" />
              Reloading...
            </span>
          ) : (
            <span>Reload</span>
          )}
        </Button>
      </div>

      <form onSubmit={handleSendMessage} className="flex gap-2 mt-4 w-full sm:max-w-2/3 md:max-w-1/2 mx-auto">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={isSending}
          className="flex-1"
        />
        <Button type="submit" size="icon" disabled={isSending}>
          {isSending ? (
            <Loader2Icon className="h-4 w-4 animate-spin" />
          ) : (
            <SendIcon className="h-4 w-4" />
          )}
        </Button>
      </form>

      <ScrollArea className="flex-1 pr-4">
        <Messages
          messages={messages}
          messagesEndRef={messagesEndRef}
          isMessageLoading={isMessageLoading}
        />
      </ScrollArea>
    </div>
  );
}
