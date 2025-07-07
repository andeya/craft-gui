"use client";

import { invoke } from "@tauri-apps/api/core";
import { useCallback, useState } from "react";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

export function Greet() {
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
    <div>
      <Box display="flex" justifyContent="center" alignItems="center" mb={2}>
        <Button onClick={greet} variant="outlined">
          {"Call <greet-fn> from Rust"}
        </Button>
      </Box>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        component="section"
        sx={{ p: 2, border: "1px dashed grey" }}
        mb={2}
      >
        {greeted ?? "Click to invoke the Rust function."}
      </Box>
    </div>
  );
}
