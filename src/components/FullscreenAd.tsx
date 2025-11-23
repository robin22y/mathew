import { useState, useRef, useEffect } from "react";

interface FullscreenAdProps {
  open: boolean;
  onClose: () => void;
}

export function FullscreenAd({ open, onClose }: FullscreenAdProps) {
  if (!open) return null;

  const startY = useRef<number | null>(null);
  const currentY = useRef<number>(0);
  const [translateY, setTranslateY] = useState(0);
  const dragThreshold = 80; // px needed to close

  function handleTouchStart(e: React.TouchEvent) {
    startY.current = e.touches[0].clientY;
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (startY.current === null) return;

    const y = e.touches[0].clientY;
    currentY.current = y - startY.current;

    if (currentY.current > 0) {
      setTranslateY(currentY.current);
    }
  }

  function handleTouchEnd() {
    if (currentY.current > dragThreshold) {
      onClose();
    } else {
      setTranslateY(0);
    }

    startY.current = null;
    currentY.current = 0;
  }

  useEffect(() => {
    if (!open) {
      setTranslateY(0);
      return;
    }

    const timer = setTimeout(() => {
      onClose();
    }, 3000); // auto-close after 3 seconds

    return () => clearTimeout(timer);
  }, [open, onClose]);

  return (
    <div
      className="
        fixed inset-0 z-50
        bg-black/70 backdrop-blur-md
        flex items-center justify-center
        animate-fadeIn
      "
    >
      {/* Modal container */}
      <div
        className="
          w-[88%] max-w-sm
          rounded-2xl
          bg-neutral-900/60 backdrop-blur-xl
          shadow-[0_0_40px_-10px_rgba(0,0,0,0.8)]
          p-6
          animate-scaleIn
          flex flex-col items-center gap-4
          touch-none
        "
        style={{
          transform: `translateY(${translateY}px)`,
          transition: translateY === 0 ? "transform 0.15s ease-out" : "none",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Close button (top-right) */}
        <button
          onClick={onClose}
          className="
            absolute top-3 right-4
            text-neutral-400 hover:text-white
            text-xl font-light
          "
          aria-label="Close"
        >
          ×
        </button>

        {/* Small "Ad" label */}
        <div className="text-[11px] text-neutral-400 tracking-wide">
          Sponsored
        </div>

        {/* Ad content placeholder */}
        <div
          className="
            w-full h-40
            rounded-xl
            bg-neutral-800/40
            border border-neutral-700/40
            flex items-center justify-center
            text-neutral-400 text-sm
          "
        >
          Fullscreen Ad
          {/* Future: Google AdSense interstitial */}
        </div>

        {/* Bottom Close CTA */}
        <button
          onClick={onClose}
          className="
            w-full mt-2
            py-2.5
            rounded-xl
            bg-neutral-800/60
            hover:bg-neutral-800
            text-neutral-200
            transition
            text-sm font-medium
          "
        >
          Continue
        </button>
      </div>
    </div>
  );
}
