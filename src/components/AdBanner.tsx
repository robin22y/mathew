import { useEffect, useRef, useState } from "react";
import { adConfig, LS_ADS_DISABLED } from "../config/adConfig";

interface AdBannerProps {
  placement?: "top" | "bottom" | "main";
}

export function AdBanner({ placement = "top" }: AdBannerProps) {
  // Respect disable flag
  if (localStorage.getItem(LS_ADS_DISABLED) === "true") return null;
  if (!adConfig.bannerEnabled) return null;
  if (placement === "bottom" && !adConfig.bottomBannerEnabled) return null;

  const adRef = useRef<HTMLDivElement | null>(null);
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    // Load AdSense script once
    const existing = document.querySelector('script[src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]');
    if (!existing) {
      const script = document.createElement("script");
      script.src = "//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
      script.async = true;
      document.body.appendChild(script);
    }

    // Push ad once script is ready
    const interval = setInterval(() => {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        clearInterval(interval);
      } catch {
        // Script not ready yet — retry
      }
    }, 300);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!adRef.current) return;

    let observer: IntersectionObserver | null = null;

    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const ins = entry.target.querySelector("ins");
        if (ins && ins.innerHTML.trim() !== "") {
          // Google filled ad
          setAdLoaded(true);
        }
      });
    });

    observer.observe(adRef.current);

    return () => {
      if (observer) observer.disconnect();
    };
  }, []);

  return (
    <div className="w-full my-4" ref={adRef}>
      {/* REAL ADSENSE BLOCK */}
      <ins
        className="adsbygoogle block"
        style={{ display: "block", width: "100%", height: "auto" }}
        data-ad-client={adConfig.clientId}
        data-ad-slot={adConfig.slotMain}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />

      {/* PREMIUM FALLBACK PLACEHOLDER */}
      {!adLoaded && (
        <div className="mt-2">
          <div className="w-full h-[1px] bg-neutral-800 mb-2"></div>

          <div className="text-[11px] text-neutral-500 mb-1">
            Ad · Sponsored
          </div>

          <div className="text-neutral-400 text-xs leading-relaxed">
            Reborro Ad Slot — premium text ad
          </div>

          <div className="w-full h-[1px] bg-neutral-800 mt-3"></div>
        </div>
      )}
    </div>
  );
}
