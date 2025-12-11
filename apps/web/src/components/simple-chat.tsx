"use client";

import { useState } from "react";
import { useWebSocket } from "@/hooks/websocket-hook";

export default function SimpleChat() {
  const { isConnected, messages, sendMessage } = useWebSocket();
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input);
      setInput("");
    }
  };

  return (
    <div className="mx-auto max-w-md p-4">
      <div className="mb-4 rounded-lg bg-gray-800 p-2">
        <span
          className={`text-sm ${isConnected ? "text-green-400" : "text-red-400"}`}
        >
          {isConnected ? "● Connected" : "● Disconnected"}
        </span>
      </div>

      <div className="mb-4 h-64 overflow-y-auto rounded-lg border border-gray-600 bg-gray-900 p-2">
        {messages.length === 0 ? (
          <div className="text-gray-500 text-sm">No messages yet...</div>
        ) : (
          messages.map((msg, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            <div className="mb-2 text-sm" key={i}>
              {msg}
            </div>
          ))
        )}
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 rounded border border-gray-600 bg-gray-800 p-2 text-white"
          disabled={!isConnected}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
          type="text"
          value={input}
        />
        <button
          className="rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600 disabled:bg-gray-600"
          disabled={!(isConnected && input.trim())}
          onClick={handleSend}
        >
          Send
        </button>
      </div>
    </div>
  );
}
