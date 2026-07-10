import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TaskBuddy Admin Console",
  description: "Admin dashboard for TaskBuddy platform management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
