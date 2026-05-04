"use client";

import Image from "next/image";
import { useState } from "react";

const sizeClasses = {
  sm: {
    frame: "h-10 w-16 rounded-md",
    text: "text-xs",
  },
  md: {
    frame: "h-24 w-full rounded-md",
    text: "text-base",
  },
  lg: {
    frame: "h-36 w-full rounded-md md:h-44",
    text: "text-2xl",
  },
};

export function CompanyLogo({
  name,
  logoUrl,
  size = "md",
}: {
  name: string;
  logoUrl: string | null;
  size?: keyof typeof sizeClasses;
}) {
  const [failed, setFailed] = useState(false);
  const classes = sizeClasses[size];

  if (!logoUrl || failed) {
    return (
      <div
        className={`${classes.frame} flex shrink-0 items-center justify-center border border-[var(--app-line)] bg-[#f7f7f2] font-semibold text-[var(--brand)]`}
      >
        <span className={classes.text}>{name.slice(0, 2)}</span>
      </div>
    );
  }

  return (
    <div
      className={`${classes.frame} relative shrink-0 overflow-hidden border border-[var(--app-line)] bg-white`}
    >
      <Image
        src={logoUrl}
        alt={`${name} 로고`}
        fill
        sizes={size === "sm" ? "64px" : "(max-width: 768px) 100vw, 320px"}
        className="object-contain"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
