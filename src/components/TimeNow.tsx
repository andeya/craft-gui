"use client";

import { invoke } from "@tauri-apps/api/core";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function TimeNow() {
  const [timeNowed, setTimeNowed] = useState<string | null>(null);
  const timeNow = useCallback((): void => {
    invoke<string>("time_now")
      .then((s) => {
        setTimeNowed(s);
      })
      .catch((err: unknown) => {
        // eslint-disable-next-line no-console
        console.error(err);
      });
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div className="mb-4">
        <Button variant="outline" onClick={timeNow}>
          Call &lt;time_now&gt; from Rust
        </Button>
      </div>
      <Card className="text-center w-96 mx-auto p-8 mb-2">
        {timeNowed ?? "Click to invoke the Rust function."}
      </Card>
    </div>
  );
}
