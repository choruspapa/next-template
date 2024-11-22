'use client';

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="p-4 md:p-6">
      <div className="mb-8 space-y-4">
        <h1 className="font-semibold text-lg md:text-2xl">
          Woops, you got an error!!
        </h1>
        <p>
          {error.message}
        </p>
        <Button onClick={() => reset()}>Retry</Button>
      </div>
    </main>
  );
}
