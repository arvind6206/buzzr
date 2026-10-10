"use client";

import { useState, useEffect } from "react";

interface User {
  id: string;
  name: string;
  email: string;
}

interface SendNotificationProps {
  token: string | null;
}

export default function SendNotification({ token }: SendNotificationProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedReceiver, setSelectedReceiver] = useState("");
  const [type, setType] = useState("MESSAGE");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!token) return;

    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUsers(data.users);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (!selectedReceiver || !message) {
      setError("Please select a receiver and enter a message");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiverId: selectedReceiver,
          type,
          message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || "Failed to send notification");
      }

      setSuccess("Notification sent successfully!");
      setMessage("");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">
        Send Notification
      </h2>

      {error && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="receiver"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
          >
            Select Receiver
          </label>
          <select
            id="receiver"
            value={selectedReceiver}
            onChange={(e) => setSelectedReceiver(e.target.value)}
            className="block w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md shadow-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Choose a user...</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="type"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
          >
            Notification Type
          </label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="block w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md shadow-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="FOLLOW">Follow</option>
            <option value="LIKE">Like</option>
            <option value="COMMENT">Comment</option>
            <option value="MESSAGE">Message</option>
            <option value="FRIEND_REQUEST">Friend Request</option>
            <option value="SYSTEM">System</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="message"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
          >
            Message
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            maxLength={500}
            className="block w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md shadow-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your message..."
            required
          />
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {message.length}/500 characters
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Sending..." : "Send Notification"}
        </button>
      </form>
    </div>
  );
}
