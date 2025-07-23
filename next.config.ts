import withPWAInit from "@ducanh2912/next-pwa";
import type { NextConfig } from "next";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  // disable: process.env.NODE_ENV === "development",
  disable: false,
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default withPWA(nextConfig);
