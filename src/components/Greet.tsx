"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import { invoke } from "@tauri-apps/api/core";
import { useCallback, useState } from "react";

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
    <div style={{ width: "100%" }}>
      <Box display="flex" justifyContent="center" alignItems="center" mb={4}>
        <Button onClick={greet} variant="outlined">
          {"Call <greet-fn> from Rust"}
        </Button>
      </Box>
      <Paper elevation={3} sx={{ mb: 2, width: 440, mx: "auto", p: 4 }}>
        {greeted ?? "Click to invoke the Rust function."}
      </Paper>
    </div>
  );
}
