import { useEffect, useRef, useState } from "react";

interface LockScreenProps {
  requireSetup: boolean;
  onSubmitPin: (pin: string) => Promise<boolean>;
  onSubmitNewPin: (pin: string) => Promise<void>;
  error?: boolean;
  allowReset: boolean;
  onResetRequest: () => void;
}

type Mode = "setup" | "confirm" | "unlock";

export function LockScreen({
  requireSetup,
  onSubmitPin,
  onSubmitNewPin,
  error,
  allowReset,
  onResetRequest,
}: LockScreenProps) {
  const [mode, setMode] = useState<Mode>(requireSetup ? "setup" : "unlock");
  const [pin, setPin] = useState("");
  const [firstPin, setFirstPin] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const hiddenInputRef = useRef<HTMLInputElement | null>(null);

  // Detect keyboard visibility
  useEffect(() => {
    const handleResize = () => {
      const vh = window.visualViewport?.height || window.innerHeight;
      const screenHeight = window.innerHeight;
      const kb = vh < screenHeight * 0.75; // if viewport shrinks by ~25%
      setKeyboardOpen(kb);
    };

    window.visualViewport?.addEventListener("resize", handleResize);
    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.visualViewport?.removeEventListener("resize", handleResize);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Sync with parent
  useEffect(() => {
    setMode(requireSetup ? "setup" : "unlock");
    setPin("");
    setFirstPin(null);
    setLocalError(null);
  }, [requireSetup]);

  // Auto-focus hidden input
  useEffect(() => {
    hiddenInputRef.current?.focus();
  }, [mode]);

  useEffect(() => {
    if (error) triggerError("Incorrect PIN");
  }, [error]);

  function triggerError(msg: string) {
    setLocalError(msg);
    setPin("");
    if (hiddenInputRef.current) hiddenInputRef.current.value = "";
  }

  async function handleComplete(p: string) {
    if (mode === "setup") {
      setFirstPin(p);
      setPin("");
      hiddenInputRef.current!.value = "";
      setMode("confirm");
      return;
    }

    if (mode === "confirm") {
      if (p !== firstPin) {
        triggerError("PINs do not match");
        setFirstPin(null);
        setMode("setup");
        return;
      }

      try {
        await onSubmitNewPin(p);
      } catch {
        triggerError("Could not save PIN");
      }
      return;
    }

    if (mode === "unlock") {
      const ok = await onSubmitPin(p);
      if (!ok) triggerError("Incorrect PIN");
      return;
    }
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    setPin(raw);
    if (raw.length === 4) setTimeout(() => handleComplete(raw), 10);
  }

  function onBackspace(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && pin.length > 0) {
      setPin(pin.slice(0, -1));
    }
  }

  const title =
    mode === "setup"
      ? "Set a 4-digit PIN"
      : mode === "confirm"
      ? "Confirm your PIN"
      : "Enter your PIN";

  const compact = keyboardOpen; // collapse layout when keyboard is open

  return (
    <div
      className="fixed inset-0 z-50 bg-neutral-950 flex flex-col items-center justify-center px-5"
      style={{
        height: "100dvh", // real safe mobile height (iOS + Android)
      }}
    >
      {/* Hidden input */}
      <input
        ref={hiddenInputRef}
        type="tel"
        inputMode="numeric"
        autoFocus
        onChange={onChange}
        onKeyDown={onBackspace}
        className="absolute w-[1px] h-[1px] -left-[9999px] opacity-0"
      />

      {/* Card */}
      <div className="w-full max-w-xs bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex flex-col items-center">
        {/* Title */}
        <h2 className="text-lg font-semibold text-neutral-50 mb-6 text-center">
          {title}
        </h2>

        {/* PIN dots */}
        <div className="flex gap-4 mb-6">
          {[0, 1, 2, 3].map((i) => {
            const filled = i < pin.length;
            return (
              <div
                key={i}
                className={
                  "w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold border " +
                  (filled
                    ? "bg-neutral-100 text-neutral-900 border-neutral-100"
                    : "bg-neutral-800 text-neutral-600 border-neutral-700")
                }
                onClick={() => hiddenInputRef.current?.focus()}
              >
                {filled ? "•" : ""}
              </div>
            );
          })}
        </div>

        {/* ERROR message */}
        {!compact && localError && (
          <p className="text-red-400 text-sm text-center mb-4">{localError}</p>
        )}

        {/* Reset link */}
        {!compact && allowReset && mode === "unlock" && (
          <button
            className="text-neutral-400 text-xs underline underline-offset-2"
            onClick={onResetRequest}
          >
            Forgot PIN? Clear all data
          </button>
        )}
      </div>
    </div>
  );
}
