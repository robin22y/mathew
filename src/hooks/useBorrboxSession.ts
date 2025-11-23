import { useState, useEffect } from 'react';
import { LS_FIRST_SEEN_AT, LS_SESSION_COUNT } from '../config/adConfig';

export function useBorrboxSession() {
  const [firstSeenAt, setFirstSeenAt] = useState<number | null>(null);
  const [sessionCount, setSessionCount] = useState<number>(1);
  const [isReturningUser, setIsReturningUser] = useState<boolean>(false);

  useEffect(() => {
    // Check if first seen timestamp exists
    const firstSeen = localStorage.getItem(LS_FIRST_SEEN_AT);
    
    if (!firstSeen) {
      // First visit - set timestamp
      const now = Date.now();
      localStorage.setItem(LS_FIRST_SEEN_AT, now.toString());
      setFirstSeenAt(now);
      localStorage.setItem(LS_SESSION_COUNT, '1');
      setSessionCount(1);
      setIsReturningUser(false);
    } else {
      // Returning user - increment session count
      setFirstSeenAt(parseInt(firstSeen, 10));
      const currentCount = parseInt(localStorage.getItem(LS_SESSION_COUNT) || '1', 10);
      const newCount = currentCount + 1;
      localStorage.setItem(LS_SESSION_COUNT, newCount.toString());
      setSessionCount(newCount);
      setIsReturningUser(newCount >= 2);
    }
  }, []);

  return {
    firstSeenAt,
    sessionCount,
    isReturningUser,
  };
}

