"use client";

import React from "react";
import Image from "next/image";
import { CaseStudy } from "@/types";

interface CaseVisualProps {
  caseStudy: CaseStudy;
  alt: string;
  sizes: string;
  priority?: boolean;
}

/*
 * The visual for a case inside a fixed-size frame: either one cover image,
 * or, when the case has phoneShots, the app's mobile screens side by side with rounded corners.
 */
export default function CaseVisual({ caseStudy, alt, sizes, priority }: CaseVisualProps) {
  const shots = caseStudy.phoneShots;

  if (!shots || shots.length === 0) {
    return <Image src={caseStudy.image} alt={alt} fill priority={priority} className="object-cover object-center" sizes={sizes} />;
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center gap-[3%] bg-[#f3efe9] px-[4%]">
      {shots.map((src, idx) => (
        <Image
          key={src}
          src={src}
          alt={`${alt} · ${idx + 1}`}
          width={780}
          height={1689}
          priority={priority}
          sizes="(max-width: 1024px) 30vw, 18vw"
          className="h-auto w-auto max-h-[84%] max-w-[30%] rounded-[clamp(8px,1.6vw,22px)] shadow-[0_10px_30px_rgba(62,61,58,0.14),0_0_0_1px_rgba(62,61,58,0.08)]"
        />
      ))}
    </div>
  );
}
