"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BotIcon, UserIcon, SendIcon, ArrowLeftIcon, MoreVerticalIcon } from "lucide-react"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
}

interface ChatInterfaceProps {
  user: {
    id: string
    email: string
    name: string
  }
  onBack: () => void
}

export function ChatInterface({ user, onBack }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: `Hello ${user.name}! I'm Merlin, your AI assistant. How can I help you today?`,
      sender: "ai",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages, isTyping])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    // Simulate AI response
    setTimeout(
      () => {
        const aiResponses = [
          "I understand your question. Let me help you with that.",
          "That's an interesting point. Here's what I think about it...",
          "I can definitely assist you with that. Let me break it down for you.",
          "Great question! Based on my knowledge, here's what I can tell you:",
          "I'm here to help! Let me provide you with some insights on that topic.",
          "That's a thoughtful question. Here's my perspective on it:",
          "I'd be happy to help you explore that further. Here's what I know:",
          "Excellent question! Let me share some relevant information with you.",
        ]

        const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)]

        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: randomResponse,
          sender: "ai",
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, aiMessage])
        setIsTyping(false)
      },
      1000 + Math.random() * 2000,
    ) // Random delay between 1-3 seconds
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Chat Header */}
      <header className="border-b border-border bg-card px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
              <ArrowLeftIcon className="w-4 h-4" />
            </Button>
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <BotIcon className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">Merlin AI</h1>
              <p className="text-xs text-muted-foreground">Always here to help</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="p-2">
            <MoreVerticalIcon className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea ref={scrollAreaRef} className="h-full px-4 py-4">
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.sender === "ai" && (
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <BotIcon className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}

                <div className={`max-w-[70%] ${message.sender === "user" ? "order-first" : ""}`}>
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      message.sender === "user"
                        ? "bg-primary text-primary-foreground ml-auto"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                  <p
                    className={`text-xs text-muted-foreground mt-1 ${
                      message.sender === "user" ? "text-right" : "text-left"
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </p>
                </div>

                {message.sender === "user" && (
                  <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <UserIcon className="w-4 h-4 text-secondary-foreground" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <BotIcon className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="max-w-[70%]">
                  <div className="bg-muted rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <div
                        className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <div
                        className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <div
                        className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-card px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                className="pr-12 py-3 text-sm"
                disabled={isTyping}
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                disabled={!inputValue.trim() || isTyping}
              >
                <SendIcon className="w-4 h-4" />
              </Button>
            </div>
          </form>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Merlin can make mistakes. Consider checking important information.
          </p>
        </div>
      </div>
    </div>
  )
}
