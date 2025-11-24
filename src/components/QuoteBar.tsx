import { useState, useEffect } from "react";

const quotes = [
  "Return builds trust.",
  "People forget. You don't have to.",
  "Borrow with care.",
  "A gentle reminder helps everyone.",
  "Money doesn't walk back by itself.",
  "Forget less. Live more.",
  "Track it before you forget it.",
  "Small items matter too.",
  "Good returns keep friendships strong.",
  "Simple list, simple mind.",
];

export function QuoteBar() {
  const [quote, setQuote] = useState("");

  useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  return (
    <div className="text-xs text-zinc-500 text-center py-2">
      {quote}
    </div>
  );
}

