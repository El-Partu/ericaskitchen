// 📁 components/shared/NewsletterForm.tsx

"use client";

import { post, ApiError } from "@/lib/api";
import { Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      await post("/newsletter/subscribe", { email: email.trim() });
      toast.success("You're subscribed!", {
        description: "You'll receive our specials and secret menu items.",
      });
      setEmail("");
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 409) {
        toast.info("You're already subscribed!");
      } else {
        toast.error("Failed to subscribe. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-4 flex gap-0">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email address"
        disabled={isLoading}
        className="h-[57px] flex-1 rounded-l-[10px] bg-white px-5 font-body text-base font-light text-black placeholder:text-black/50 focus:outline-none disabled:opacity-50"
        onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
      />
      <button
        onClick={handleSubscribe}
        disabled={isLoading}
        className="flex h-[57px] items-center gap-2 rounded-r-[10px] bg-primary-pink px-5 font-body text-xl text-white transition-colors hover:bg-primary-pink/80 disabled:opacity-50"
      >
        <Mail size={20} />
        {isLoading ? "Joining…" : "Join"}
      </button>
    </div>
  );
}
