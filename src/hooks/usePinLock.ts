import { useState, useEffect, useCallback, useRef } from 'react';

const PIN_STORAGE_KEY = 'borrbox-pin';
const INACTIVITY_TIMEOUT = 10 * 60 * 1000;

async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function getStoredPinHash(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(PIN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function usePinLock() {
  const [locked, setLocked] = useState(true);
  const [requireSetup, setRequireSetup] = useState(false);
  const [hasPin, setHasPin] = useState(false);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const existing = localStorage.getItem("borrbox-pin");
    if (existing) setHasPin(true);
  }, []);

  useEffect(() => {
    const storedHash = getStoredPinHash();
    if (!storedHash) {
      setRequireSetup(true);
      setLocked(true);
    } else {
      setRequireSetup(false);
      setLocked(true);
    }
  }, []);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    if (!locked) {
      inactivityTimerRef.current = setTimeout(() => {
        setLocked(true);
      }, INACTIVITY_TIMEOUT);
    }
  }, [locked]);

  useEffect(() => {
    if (!locked) {
      resetInactivityTimer();
      const events = ['keydown', 'mousemove', 'touchstart'];
      events.forEach(event => {
        window.addEventListener(event, resetInactivityTimer);
      });
      return () => {
        events.forEach(event => {
          window.removeEventListener(event, resetInactivityTimer);
        });
        if (inactivityTimerRef.current) {
          clearTimeout(inactivityTimerRef.current);
        }
      };
    }
  }, [locked, resetInactivityTimer]);

  const verifyPin = useCallback(async (pin: string): Promise<boolean> => {
    const storedHash = getStoredPinHash();
    if (!storedHash) return false;
    const inputHash = await hashPin(pin);
    return inputHash === storedHash;
  }, []);

  const setNewPin = useCallback(async (pin: string): Promise<void> => {
    const hash = await hashPin(pin);
    localStorage.setItem(PIN_STORAGE_KEY, hash);
    setHasPin(true);
    setRequireSetup(false);
    setLocked(false);
  }, []);

  const requestUnlock = useCallback(async (pin: string): Promise<boolean> => {
    const isValid = await verifyPin(pin);
    if (isValid) {
      setLocked(false);
      return true;
    }
    return false;
  }, [verifyPin]);

  const lockNow = useCallback(() => {
    setLocked(true);
  }, []);

  const disablePin = useCallback(() => {
    localStorage.removeItem(PIN_STORAGE_KEY);
    setHasPin(false);
    setLocked(false);
    setRequireSetup(false);
  }, []);

  const resetAllData = useCallback(() => {
    localStorage.removeItem(PIN_STORAGE_KEY);
    localStorage.removeItem('borrbox-items');
    window.location.reload();
  }, []);

  return {
    locked,
    hasPin,
    requireSetup,
    requestUnlock,
    verifyPin,
    setNewPin,
    lockNow,
    disablePin,
    resetAllData,
  };
}

