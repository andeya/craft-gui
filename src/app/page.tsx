"use client";

import Copyright from "@/components/Copyright";
import { Greet } from "@/components/Greet";
import ProTip from "@/components/ProTip";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import NextLink from "next/link";

export default function Home() {
  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          my: 4,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" component="h1" sx={{ mb: 12 }}>
          Craft UI
        </Typography>
        <Greet />
        <Link
          href="/about"
          color="secondary"
          component={NextLink}
          sx={{ mt: 18 }}
        >
          Go to the about page
        </Link>
        <ProTip />
        <Copyright />
      </Box>
    </Container>
  );
}
