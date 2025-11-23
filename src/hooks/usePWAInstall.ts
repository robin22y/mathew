import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running as standalone PWA
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                      (navigator as any).standalone === true;
    setIsStandalone(standalone);

    if (standalone) {
      setCanInstall(false);
      setShowHint(false);
      return;
    }

    // iOS detection
    const ios = /iPhone|iPad|iPod/.test(navigator.userAgent);
    setIsIos(ios);

    if (ios) {
      // iOS: show hint only on first two sessions
      const seenCount = parseInt(localStorage.getItem("borrbox_ios_install_seen") || "0", 10);
      if (seenCount < 2) {
        setShowHint(true);
        localStorage.setItem("borrbox_ios_install_seen", (seenCount + 1).toString());
      }
      setCanInstall(false);
      return;
    }

    // Android/Desktop: check for beforeinstallprompt
    const dismissed = localStorage.getItem("borrbox_install_dismissed") === "true";
    
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
      if (!dismissed) {
        setShowHint(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const triggerInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;

    localStorage.setItem("borrbox_install_dismissed", "true");
    setDeferredPrompt(null);
    setCanInstall(false);
    setShowHint(false);

    return result;
  };

  const hideInstallHint = () => {
    localStorage.setItem("borrbox_install_dismissed", "true");
    setShowHint(false);
  };

  return { 
    canInstall, 
    showHint, 
    isIos, 
    isStandalone, 
    triggerInstall, 
    hideInstallHint 
  };
}
