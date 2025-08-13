"use client";
import React, { useEffect, useState } from "react";

const TypingText = ({ lines }: { lines: string[] }) => {
  const [displayedText, setDisplayedText] = useState("");

  const cleanLines = React.useMemo(() =>
    lines.filter((line) => typeof line === "string" && line.trim() !== "")
         .map((line) => line.trim())
  , [lines]);

  const fullText = React.useMemo(() => cleanLines.map((d) => `- ${d}`).join("\n"), [cleanLines]);

  const speed = 30;

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + fullText[index]);
      index++;
      if (index >= fullText.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [fullText]);

  return (
    <pre className="whitespace-pre-wrap text-xl text-white mt-2 font-mono">
      {displayedText}
    </pre>
  );
};


export default TypingText;
