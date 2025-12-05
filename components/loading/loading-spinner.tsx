"use client";

import Image from "next/image";

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <Image
        src="/images/algogi_big.svg"
        alt="AlgoGI"
        width={200}
        height={200}
        className="mb-8 animate-pulse"
        priority
      />
      <div className="spinner"></div>
    </div>
  );
}

