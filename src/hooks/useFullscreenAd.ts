import { useState, useEffect } from 'react';
import { adConfig, LS_LAST_FULLSCREEN_AD, LS_ADS_DISABLED } from '../config/adConfig';

interface SessionInfo {
  isReturningUser: boolean;
}

interface UseFullscreenAdProps {
  enabled: boolean;
  sessionInfo: SessionInfo;
}

export function useFullscreenAd({ enabled, sessionInfo }: UseFullscreenAdProps) {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    // If disabled in config, never show
    if (!enabled) return;

    // If ads are disabled by user (future Pro feature), never show
    if (localStorage.getItem(LS_ADS_DISABLED) === 'true') return;

    // If not a returning user, never show
    if (!sessionInfo.isReturningUser) return;

    // Check last shown timestamp
    const lastShown = localStorage.getItem(LS_LAST_FULLSCREEN_AD);
    if (lastShown) {
      const lastShownTime = parseInt(lastShown, 10);
      const now = Date.now();
      const gapMs = adConfig.fullscreenMinGapHours * 60 * 60 * 1000;
      
      // If shown within the gap period, don't show again
      if (now - lastShownTime < gapMs) {
        return;
      }
    }

    // Set timeout to show ad after delay
    const timer = setTimeout(() => {
      setShouldShow(true);
    }, adConfig.fullscreenDelayMs);

    return () => {
      clearTimeout(timer);
    };
  }, [enabled, sessionInfo.isReturningUser]);

  const handleAdClosed = () => {
    setShouldShow(false);
    localStorage.setItem(LS_LAST_FULLSCREEN_AD, Date.now().toString());
  };

  return {
    shouldShow,
    handleAdClosed,
  };
}

