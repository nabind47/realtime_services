"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useSocket } from "@/context/socket-provider";
import { useState } from "react";

const Home = () => {
  const { sendMessage, messages } = useSocket();
  const [text, setText] = useState("");

  console.log(messages);

  const handleSubmit = (e: any) => {
    e.preventDefault();

    sendMessage(text);
    setText("");
  };

  return (
    <div>
      <form>
        <Input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <Button type="submit" onClick={handleSubmit}>
          Send Message
        </Button>
      </form>

      <div>
        {messages.length > 0 &&
          messages.map((e, i) => <li key={i}>{e?.text}</li>)}
      </div>
    </div>
  );
};

export default Home;
