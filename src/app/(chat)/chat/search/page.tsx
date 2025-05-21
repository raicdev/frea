"use client";

import { useAuth } from "@/context/AuthContext";
import { Loader2Icon, SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Messages } from "@/components/Messages";
import { ClientMessage } from "@/types/message";

export default function MessageSearch() {
    const { user, isLoading, secureFetch } = useAuth();
    const router = useRouter();
    const [messages, setMessages] = useState<ClientMessage[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isLoading) return;

        if (!user) {
            router.push("/login");
        }
    }, [user, isLoading, router]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim() || !user) return;

        setIsSearching(true);
        try {
            const response = await secureFetch(`/api/v1/messages/search?query=${encodeURIComponent(searchQuery)}&limit=25`, {
                method: "GET",
            });

            const data = await response.json();

            if (data.success) {
                setMessages(data.messages);
                if (data.messages.length === 0) {
                    toast.info("No messages found matching your search criteria");
                }
            } else {
                toast.error("Failed to search messages", {
                    description: data.error || "Unknown error",
                });
            }
        } catch (error) {
            console.error("Error searching messages:", error);
            toast.error("Failed to search messages");
        } finally {
            setIsSearching(false);
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
                <h2 className="text-xl font-bold">Search Messages</h2>
                <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push("/chat")}
                >
                    Back to Chat
                </Button>
            </div>

            <form onSubmit={handleSearch} className="flex gap-2 mt-4 w-full sm:max-w-2/3 md:max-w-1/2 mx-auto">
                <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search messages..."
                    disabled={isSearching}
                    className="flex-1"
                />
                <Button type="submit" size="icon" disabled={isSearching}>
                    {isSearching ? (
                        <Loader2Icon className="h-4 w-4 animate-spin" />
                    ) : (
                        <SearchIcon className="h-4 w-4" />
                    )}
                </Button>
            </form>

            <ScrollArea className="flex-1 pr-4">
                <Messages
                    messages={messages}
                    user={user}
                    messagesEndRef={messagesEndRef}
                    isMessageLoading={isSearching}
                />
            </ScrollArea>
        </div>
    );
}
