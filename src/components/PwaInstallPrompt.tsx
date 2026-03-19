import { useEffect, useMemo, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  const shouldShow = useMemo(() => !!deferredPrompt && !dismissed, [deferredPrompt, dismissed]);

  useEffect(() => {
    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const onAppInstalled = () => {
      setDeferredPrompt(null);
      setDismissed(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt as EventListener);
    window.addEventListener("appinstalled", onAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt as EventListener);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  if (!shouldShow) return null;

  const install = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    try {
      await deferredPrompt.userChoice;
    } finally {
      setDeferredPrompt(null);
      setDismissed(true);
    }
  };

  return (
    <div className="fixed left-0 right-0 bottom-[calc(72px+env(safe-area-inset-bottom))] z-50 px-4">
      <div className="max-w-lg mx-auto glass shadow-card rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-display">Install Purple Rain POS</div>
          <div className="text-xs text-muted-foreground truncate">Get faster access and offline support.</div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="px-3 py-2 rounded-xl bg-secondary/70 hover:bg-secondary text-secondary-foreground text-xs font-semibold transition-colors"
            aria-label="Dismiss install prompt"
            title="Dismiss"
          >
            Not now
          </button>
          <button
            type="button"
            onClick={install}
            className="px-3 py-2 rounded-xl text-primary-foreground gradient-purple glow-purple text-xs font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
            aria-label="Install app"
            title="Install app"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
}

