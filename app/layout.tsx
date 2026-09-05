import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mewrin — Hackathon Mentor",
  description:
    "A calm, sharp AI mentor for hackathon teams. Paste a problem, get structured guidance: problem, users, ideas, MVP, tech, validation, demo and jury pitch.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
