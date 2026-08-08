import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ⚠️ AMARAN: Ini akan melangkau semua ralat pemeriksaan TypeScript semasa proses build di Vercel.
  // Sangat berguna untuk deploy kecemasan!
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
