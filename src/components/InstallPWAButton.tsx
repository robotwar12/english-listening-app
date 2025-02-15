/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";

export default function InstallPWAButton() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () =>
      window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = () => {
    if (installPrompt) {
      installPrompt.prompt();
      installPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === "accepted") {
          console.log("사용자가 앱 설치");
        }
        setInstallPrompt(null);
      });
    }
  };

  // 설치 가능한 상태일 때만 버튼 표시
  if (!installPrompt) return null;

  return (
    <button
      onClick={handleInstallClick}
      className="bg-blue-500 text-white px-4 py-2 rounded"
    >
      앱 설치
    </button>
  );
}
