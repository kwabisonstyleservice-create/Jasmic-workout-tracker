import type { Metadata, Viewport } from "next";
import { PwaRegister } from "@/components/tracker/pwa-register";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "JASMIC Workout Tracker",
    template: "%s · JASMIC Workout Tracker",
  },
  description: "Track workouts, body measurements, personal records and customised training plans.",
  applicationName: "JASMIC Workout Tracker",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "JASMIC",
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
