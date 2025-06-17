import { useCallback, useEffect, useRef, useState } from "react";

// Lightweight activity tracker
export function useActivityTracker(content: string, delay: number = 1500) {
  const [shouldGenerate, setShouldGenerate] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastContentRef = useRef(content);

  useEffect(() => {
    if (content !== lastContentRef.current) {
      lastContentRef.current = content;
      setIsActive(true);
      setShouldGenerate(false);
      setIsPaused(false);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setIsActive(false);
        setShouldGenerate(true);
      }, delay);
    }
  }, [content, delay]);

  const pauseGeneration = useCallback(() => {
    setIsPaused(true);
    setShouldGenerate(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const resumeGeneration = useCallback(() => {
    setIsPaused(false);
    if (!isActive) {
      setShouldGenerate(true);
    }
  }, [isActive]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    shouldGenerate,
    isActive,
    isPaused,
    pauseGeneration,
    resumeGeneration,
    resetGeneration: () => setShouldGenerate(false),
  };
}
