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
    <div className="text-center py-2 compact-section">
      <p className="text-base text-zinc-300 text-center my-4 compact-section">{quote}</p>
    </div>
  );
}

