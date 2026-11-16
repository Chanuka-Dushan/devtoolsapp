"use client";

import { CaptionStudio } from "@/components/tools/caption-studio/CaptionStudio";
import { useRouter } from "next/navigation";

export default function StudioPage() {
  const router = useRouter();

  return (
    <div className="w-full min-h-screen bg-slate-950 flex flex-col">
      <CaptionStudio
        isFullTab={true}
        onBackToLanding={() => router.push("/tools/video-caption-generator")}
      />
    </div>
  );
}
