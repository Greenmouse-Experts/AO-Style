import { useState, useEffect } from "react";

export function useTriggerResend(delaySeconds = 300) {
  const [canResend, setCanResend] = useState(true);
  const [countdown, setCountdown] = useState(0);

  const triggerResend = () => {
    if (!canResend) return;

    setCanResend(false);
    setCountdown(delaySeconds);
  };

  useEffect(() => {
    let timer;
    if (!canResend && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0 && !canResend) {
      setCanResend(true);
    }

    return () => clearInterval(timer);
  }, [canResend, countdown]);

  return {
    canResend,
    countdown,
    triggerResend,
  };
}
