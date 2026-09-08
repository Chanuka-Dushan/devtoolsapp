"use client";

import Script from "next/script";

interface GoogleAdSenseProps {
  clientId?: string;
}

export function GoogleAdSense({ clientId }: GoogleAdSenseProps) {
  // Use passed clientId or environment variable
  const pubId =
    clientId ||
    process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ||
    "";

  // If no ID is set or using placeholder, don't load live Google script
  if (!pubId || pubId === "ca-pub-placeholder") {
    return null;
  }

  return (
    <Script
      id="google-adsense-script"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${pubId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
