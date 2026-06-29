"use client";

import { useEffect } from "react";

export default function ScrollToBottom() {
  useEffect(() => {
    const chatBox = document.getElementById("messages-scroll-box");

    if (chatBox) {
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  }, []);

  return null;
}