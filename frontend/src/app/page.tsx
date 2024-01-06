"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useSocket } from "@/context/socket-provider";
import { useState } from "react";

const Home = () => {
  const { sendMessage, messages } = useSocket();
  const [message, setMessage] = useState("");

  const handleSubmit = (e: any) => {
    e.preventDefault();

    sendMessage(message);
    setMessage("");
  };

  return (
    <div>
      <form>
        <Input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Button type="submit" onClick={handleSubmit}>
          Send Message
        </Button>
      </form>

      <div>
        {messages.map((e, i) => (
          <li key={i}>{e}</li>
        ))}
      </div>
    </div>
  );
};

export default Home;
