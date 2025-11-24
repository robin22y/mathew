import { useEffect, useRef, useState } from "react";

interface LockScreenProps {
  requireSetup: boolean;
  onSubmitPin: (pin: string) => Promise<boolean>;
  onSubmitNewPin: (pin: string) => Promise<void>;
  error?: boolean;                // external error flag from parent (optional)
  allowReset: boolean;
  onResetRequest: () => void;     // should clear ALL local data + reload
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
  const [vh, setVh] = useState(window.innerHeight * 0.01);
  const [mode, setMode] = useState<Mode>(requireSetup ? "setup" : "unlock");
  const [currentPin, setCurrentPin] = useState("");   // what user is currently typing (0–4 digits)
  const [firstPin, setFirstPin] = useState<string | null>(null); // for setup → confirm
  const [localError, setLocalError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetInput, setResetInput] = useState("");

  const pinInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const updateVh = () => {
      setVh(window.innerHeight * 0.01);
    };
    window.addEventListener("resize", updateVh);
    window.visualViewport?.addEventListener("resize", updateVh);

    updateVh();

    return () => {
      window.removeEventListener("resize", updateVh);
      window.visualViewport?.removeEventListener("resize", updateVh);
    };
  }, []);

  // Keep mode in sync if parent toggles requireSetup at runtime
  useEffect(() => {
    setMode(requireSetup ? "setup" : "unlock");
    setCurrentPin("");
    setFirstPin(null);
    setLocalError(null);
  }, [requireSetup]);

  // Always focus the hidden input when the screen mounts / when mode changes
  useEffect(() => {
    pinInputRef.current?.focus();
  }, [mode]);

  // When external error flag toggles true (parent failed PIN), show error + shake
  useEffect(() => {
    if (error) {
      triggerError("Incorrect PIN");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  function triggerError(msg: string) {
    setLocalError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 300);
    setCurrentPin("");
    pinInputRef.current && (pinInputRef.current.value = "");
    pinInputRef.current?.focus();
  }

  async function handleComplete(pin: string) {
    if (mode === "setup") {
      // First entry of new PIN
      setFirstPin(pin);
      setCurrentPin("");
      pinInputRef.current && (pinInputRef.current.value = "");
      setLocalError(null);
      setMode("confirm");
      return;
    }

    if (mode === "confirm") {
      // Confirm new PIN
      if (!firstPin) {
        // Should not happen, but if it does, reset back to setup
        setMode("setup");
        setCurrentPin("");
        pinInputRef.current && (pinInputRef.current.value = "");
        setLocalError(null);
        return;
      }

      if (pin !== firstPin) {
        triggerError("PINs do not match. Try again.");
        // Reset whole flow
        setFirstPin(null);
        setMode("setup");
        return;
      }

      // PINs match → save via parent
      try {
        await onSubmitNewPin(pin);
        setLocalError(null);
        // parent will usually unmount this screen after success
      } catch (e) {
        triggerError("Could not save PIN. Try again.");
      }
      return;
    }

    if (mode === "unlock") {
      try {
        const ok = await onSubmitPin(pin);
        if (!ok) {
          triggerError("Incorrect PIN");
        } else {
          setLocalError(null);
          // parent should unmount on success
        }
      } catch (e) {
        triggerError("Error verifying PIN");
      }
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, ""); // digits only
    let next = raw.slice(0, 4);                   // max 4 digits
    setCurrentPin(next);

    if (next.length === 4) {
      // Slight timeout so UI updates before async
      setTimeout(() => {
        handleComplete(next);
      }, 10);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      if (!currentPin.length) return;
      const next = currentPin.slice(0, -1);
      setCurrentPin(next);
    }
  }

  const title =
    mode === "setup"
      ? "Set a 4-digit PIN"
      : mode === "confirm"
      ? "Confirm your PIN"
      : "Enter your PIN";

  const subtitle =
    mode === "setup"
      ? "This PIN will protect your items on this device."
      : mode === "confirm"
      ? "Type the same PIN again to confirm."
      : "Unlock Reborro on this device.";

  const effectiveError = localError;

  const canAskReset = allowReset && !requireSetup && mode === "unlock";

  return (
    <div
      className="flex flex-col items-center justify-center px-6 bg-neutral-950"
      style={{ height: `calc(${vh}px * 100)` }}
    >
      {/* Hidden input – real focus target */}
      <input
        ref={pinInputRef}
        autoFocus
        inputMode="numeric"
        type="tel"
        className="absolute opacity-0 w-[1px] h-[1px] -left-[9999px]"
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />

      <div className="w-full max-w-sm mx-auto bg-zinc-900 rounded-2xl p-6 shadow-2xl border border-zinc-800">
        <h2 className="text-lg font-semibold text-center text-neutral-50 mb-1">
          {title}
        </h2>
        <p className="text-sm text-neutral-400 text-center mb-6">
          {subtitle}
        </p>

        {/* PIN dots / boxes */}
        <div
          className={`flex justify-center gap-3 mb-4 transition-transform ${
            shake ? "-translate-x-1 animate-[shake_0.15s_3]" : ""
          }`}
        >
          {[0, 1, 2, 3].map((i) => {
            const filled = i < currentPin.length;
            return (
              <div
                key={i}
                className={`w-11 h-11 rounded-xl border text-center flex items-center justify-center text-xl font-semibold ${
                  filled
                    ? "bg-neutral-100 text-neutral-900 border-neutral-100"
                    : "bg-neutral-900 border-neutral-700 text-neutral-500"
                }`}
                onClick={() => pinInputRef.current?.focus()}
              >
                {filled ? "•" : ""}
              </div>
            );
          })}
        </div>

        <p className="text-xs text-neutral-500 text-center mb-4">
          Tap the boxes and type your 4-digit PIN.
        </p>

        {effectiveError && (
          <div className="text-xs text-red-400 text-center mb-3">
            {effectiveError}
          </div>
        )}

        {/* Reset / forgot PIN */}
        {canAskReset && (
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => setShowReset(true)}
              className="text-xs text-neutral-500 hover:text-neutral-300 underline underline-offset-2"
            >
              Forgot PIN? Clear everything.
            </button>
          </div>
        )}
      </div>

      {/* RESET MODAL */}
      {showReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div className="w-full max-w-sm bg-zinc-900 rounded-2xl p-5 shadow-2xl border border-zinc-800">
            <h3 className="text-base font-semibold text-neutral-50 mb-2 text-center">
              Reset &amp; Clear Data
            </h3>
            <p className="text-xs text-neutral-400 mb-4 text-center">
              Type <span className="font-mono text-neutral-100">RESET</span> to
              remove all items and PIN on this device.
            </p>
            <input
              value={resetInput}
              onChange={(e) => setResetInput(e.target.value.toUpperCase())}
              className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg text-neutral-100 text-center font-mono text-sm tracking-[0.3em]"
              placeholder="RESET"
            />
            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={() => setShowReset(false)}
                className="flex-1 px-4 py-2 text-sm rounded-lg bg-neutral-800 text-neutral-100 hover:bg-neutral-700"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={resetInput !== "RESET"}
                onClick={() => {
                  onResetRequest();
                  // parent should clear storage + reload; we just close
                  setShowReset(false);
                  setResetInput("");
                }}
                className={`flex-1 px-4 py-2 text-sm rounded-lg ${
                  resetInput === "RESET"
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-neutral-700 text-neutral-400 cursor-not-allowed"
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
