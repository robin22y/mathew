import { useState, useEffect } from "react";

const quotes = [
  "Return builds trust.",
  "Borrow with care.",
  "People forget. Apps don't.",
  "Small amounts matter too.",
  "Return money, return respect.",
  "Good returns, good relationships.",
  "A reminder avoids a fight.",
  "Where's my stuff?",
  "Forget less. Live more.",
  "Borrow today, return tomorrow.",
  "Lending isn't losing.",
  "Simple list, simple mind.",
  "That ladder wants to come home.",
  "A gentle reminder solves things early.",
  "Borrowing is trust.",
  "Borrowed items are not souvenirs.",
  "Money doesn't walk back alone.",
  "A note saves a headache.",
  "Be the person who returns.",
  "Keep friendship strong.",
];

export function QuoteAdSlot() {
  const [quote, setQuote] = useState("");

  useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  return (
    <div className="w-full text-center py-2 text-[11px] text-zinc-500 border-t border-zinc-800">
      {quote}
    </div>
  );
}

