"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function XPRedirectContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const upi = searchParams.get("upi");
    const amount = searchParams.get("amount");
    const note = searchParams.get("note") || "Support My PS5 Dream";

    let upiUrl = "upi://pay?pa=dreamps@axl&pn=DreamPS";

    if (amount) {
      upiUrl += `&am=${amount}`;
    }

    upiUrl += `&tn=${encodeURIComponent(note)}`;

    if (upi) {
      upiUrl = decodeURIComponent(upi);
    }

    window.location.href = upiUrl;
  }, [searchParams]);

  return (
    <div className="min-h-[100dvh] bg-[#0a0a0f] flex items-center justify-center">
      <div className="text-center px-4">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center animate-pulse">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Opening UPI App...</h1>
        <p className="text-zinc-400 mb-6">Redirecting you to complete the payment</p>
        <p className="text-sm text-zinc-500">
          If the app doesn&apos;t open,{" "}
          <a
            href="upi://pay?pa=dreamps@axl&pn=DreamPS&tn=Support%20My%20PS5%20Dream"
            className="text-purple-400 underline"
          >
            tap here
          </a>
        </p>
      </div>
    </div>
  );
}

export default function XPRedirectPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[100dvh] bg-[#0a0a0f] flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 animate-pulse" />
        </div>
      }
    >
      <XPRedirectContent />
    </Suspense>
  );
}
