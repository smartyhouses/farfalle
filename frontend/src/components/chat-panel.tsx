"use client";
import { useEffect, useRef, useState } from "react";
import { AskInput } from "./ask-input";
import {
  AssistantMessage,
  ChatMessage,
  MessageType,
  UserMessage,
} from "@/types";
import { SearchResults, SearchResultsSkeleton } from "./search-results";
import RelatedQuestions from "./related-questions";
import { Separator } from "./ui/separator";
import { useChat } from "@/hooks/chat";
import { MessageComponent } from "./message";
import { useMessageStore } from "@/stores";
import { cn } from "@/lib/utils";
import {
  ListPlusIcon,
  SparkleIcon,
  StarIcon,
  TextSearchIcon,
} from "lucide-react";

import { motion } from "framer-motion";

const Section = ({
  title,
  children,
  animate = true,
  streaming = false,
}: {
  title: "Sources" | "Answer" | "Related";
  children: React.ReactNode;
  animate?: boolean;
  streaming?: boolean;
}) => {
  const iconMap = {
    Sources: TextSearchIcon,
    Answer: SparkleIcon,
    Related: ListPlusIcon,
  };

  const IconComponent = iconMap[title] || StarIcon;

  return (
    <div
      className={cn(
        "flex flex-col mb-8",
        animate ? "animate-in fade-in duration-1000 ease-out" : ""
      )}
    >
      <div className="flex items-center space-x-2">
        {title === "Answer" && streaming ? (
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          >
            <IconComponent size={22} />
          </motion.div>
        ) : (
          <IconComponent size={22} />
        )}
        <div className="text-lg font-medium">{title}</div>
      </div>
      <div className="pt-1">{children}</div>
    </div>
  );
};

const UserMessageContent = ({ message }: { message: UserMessage }) => {
  return (
    <div className="my-4">
      <span className="text-3xl">{message.content}</span>
    </div>
  );
};

const AssistantMessageContent = ({
  message,
  isStreaming = false,
}: {
  message: AssistantMessage;
  isStreaming?: boolean;
}) => {
  const { sources, content, relatedQuestions } = message;
  return (
    <div className="flex flex-col">
      <Section title="Sources" animate={isStreaming}>
        {!sources || sources.length === 0 ? (
          <SearchResultsSkeleton />
        ) : (
          <SearchResults results={sources} />
        )}
      </Section>
      <Section title="Answer" animate={isStreaming} streaming={isStreaming}>
        <MessageComponent message={content} isStreaming={isStreaming} />
      </Section>
      {relatedQuestions && relatedQuestions.length > 0 && (
        <Section title="Related" animate={isStreaming}>
          <RelatedQuestions questions={relatedQuestions} />
        </Section>
      )}
    </div>
  );
};

const Messages = ({
  messages,
  streamingMessage,
}: {
  messages: ChatMessage[];
  streamingMessage: AssistantMessage | null;
}) => {
  return (
    <div className="flex flex-col">
      {messages.map((message, index) =>
        message.role === MessageType.USER ? (
          <UserMessageContent key={index} message={message} />
        ) : (
          <AssistantMessageContent key={index} message={message} />
        )
      )}
      {streamingMessage && (
        <AssistantMessageContent
          message={streamingMessage}
          isStreaming={true}
        />
      )}
    </div>
  );
};

export const ChatPanel = () => {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { handleSend, streamingMessage } = useChat();
  const { messages, addMessage } = useMessageStore();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  if (messages.length > 0) {
    return (
      <div className="w-full">
        <Messages messages={messages} streamingMessage={streamingMessage} />
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSend({ query: input });
    setInput("");
  };

  return (
    <div className="w-full flex flex-col justify-center items-center">
      <div className="flex items-center justify-center mb-8">
        <span className="text-3xl">?</span>
      </div>
      <form className="w-full max-w-[80vw]" onSubmit={handleSubmit}>
        <AskInput input={input} setInput={setInput} inputRef={inputRef} />
      </form>
    </div>
  );
};