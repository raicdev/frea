import { Loader2Icon } from "lucide-react";
import { Message } from "./Message";
import { ClientMessage } from "@/types/message";

export function Messages({
  isMessageLoading,
  messages,
  messagesEndRef,
}: {
  isMessageLoading: boolean;
  messages: ClientMessage[];
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="space-y-4">
      {isMessageLoading && (
        <div className="flex items-center justify-center w-full h-full">
          <Loader2Icon className="animate-spin h-6 w-6" />
        </div>
      )}
      {!isMessageLoading && messages.length === 0 && (
        <p className="text-center text-muted-foreground">
          No messages yet. Be the first to send a message!
        </p>
      )}
      {messages.map((message) => (
        <Message
          key={message.id}
          message={message}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
