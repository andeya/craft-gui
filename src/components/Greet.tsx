"use client";

import { invoke } from "@tauri-apps/api/core";
import { useCallback, useState } from "react";
import { RoundedButton } from "./RoundedButton";

export function Greet(props: { className: string }) {
  const [greeted, setGreeted] = useState<string | null>(null);
  const greet = useCallback((): void => {
    invoke<string>("greet")
      .then((s) => {
        setGreeted(s);
      })
      .catch((err: unknown) => {
        console.error(err);
      });
  }, []);

  return (
    <div className={props.className}>
      <RoundedButton
        onClick={greet}
        title={
          <span>
            Call <span className="text-yellow-600">fn-greet</span> from Rust
          </span>
        }
      />
      <p className="break-words w-md">
        {greeted ?? "Click to invoke the Rust function."}
      </p>
    </div>
  );
}
