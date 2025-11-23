import { useState, useEffect, useRef } from 'react';

interface LockScreenProps {
  requireSetup: boolean;
  onSubmitPin: (pin: string) => Promise<boolean>;
  onSubmitNewPin: (pin: string) => Promise<void>;
  error?: boolean;
  allowReset: boolean;
  onResetRequest: () => void;
}

export function LockScreen({
  requireSetup,
  onSubmitPin,
  onSubmitNewPin,
  error,
  allowReset,
  onResetRequest,
}: LockScreenProps) {
  const [pin, setPin] = useState('');
  const [initialPin, setInitialPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetInput, setResetInput] = useState('');
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleContainerClick() {
    inputRef.current?.focus();
  }

  useEffect(() => {
    inputRef.current?.focus();
  }, [isConfirming, showReset]);

  useEffect(() => {
    if (error) {
      setShake(true);
      setTimeout(() => {
        setShake(false);
        setPin('');
      }, 500);
    }
  }, [error]);

  useEffect(() => {
    if (requireSetup) {
      if (!isConfirming && pin.length === 4) {
        setInitialPin(pin);
        setIsConfirming(true);
        setPin('');
      } else if (isConfirming && confirmPin.length === 4) {
        if (initialPin === confirmPin) {
          onSubmitNewPin(confirmPin);
        } else {
          setShake(true);
          setTimeout(() => {
            setShake(false);
            setPin('');
            setConfirmPin('');
            setInitialPin('');
            setIsConfirming(false);
          }, 500);
        }
      }
    } else {
      if (pin.length === 4) {
        onSubmitPin(pin).then((success) => {
          if (!success) {
            setShake(true);
            setTimeout(() => {
              setShake(false);
              setPin('');
            }, 500);
          }
        });
      }
    }
  }, [pin, confirmPin, initialPin, requireSetup, isConfirming, onSubmitPin, onSubmitNewPin]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (isConfirming) {
      setConfirmPin(value);
    } else {
      setPin(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && pin.length === 0 && isConfirming) {
      setIsConfirming(false);
      setConfirmPin('');
    }
  };

  const displayPin = isConfirming ? confirmPin : pin;
  const title = requireSetup
    ? isConfirming
      ? 'Confirm PIN'
      : 'Set PIN'
    : 'Enter PIN';

  if (showReset) {
    return (
      <div className="fixed inset-0 bg-neutral-950 flex items-center justify-center z-[100]" onClick={handleContainerClick}>
        <div className="max-w-sm w-full px-4">
          <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
            <h2 className="text-lg font-semibold text-neutral-100 mb-4 text-center">
              Reset PIN
            </h2>
            <p className="text-sm text-neutral-400 mb-4 text-center">
              Type RESET to clear all data and reset your PIN
            </p>
            <input
              type="text"
              value={resetInput}
              onChange={(e) => setResetInput(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 text-center font-mono text-lg tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="RESET"
              autoFocus
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  setShowReset(false);
                  setResetInput('');
                }}
                className="flex-1 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (resetInput === 'RESET') {
                    onResetRequest();
                  }
                }}
                className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-neutral-950 flex items-center justify-center z-[100]" onClick={handleContainerClick}>
      <div className="max-w-sm w-full px-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-neutral-100 mb-2">BORRBOX</h1>
          <p className="text-sm text-neutral-400">{title}</p>
        </div>

        <div className={`flex justify-center gap-3 mb-8 ${shake ? 'animate-shake' : ''}`}>
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={`w-4 h-4 rounded-full border-2 transition-all ${
                index < displayPin.length
                  ? 'bg-indigo-600 border-indigo-600'
                  : 'border-neutral-700'
              }`}
            />
          ))}
        </div>

        <input
          ref={inputRef}
          type="password"
          inputMode="numeric"
          maxLength={4}
          autoComplete="one-time-code"
          className="absolute opacity-0 pointer-events-none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
          value={isConfirming ? confirmPin : pin}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          autoFocus
        />

        {allowReset && !requireSetup && (
          <div className="text-center mt-6">
            <button
              onClick={() => setShowReset(true)}
              className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              Forgot PIN?
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

