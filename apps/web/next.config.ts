import type { NextConfig } from "next";

function s3RemotePatterns(): NonNullable<
  NextConfig["images"]
>["remotePatterns"] {
  const publicBaseUrl =
    process.env.NEXT_PUBLIC_S3_PUBLIC_BASE_URL ??
    process.env.S3_PUBLIC_BASE_URL;
  if (!publicBaseUrl) return [];

  try {
    const url = new URL(publicBaseUrl);
    return [
      {
        protocol: url.protocol.replace(":", "") as "http" | "https",
        hostname: url.hostname,
        pathname: `${url.pathname.replace(/\/$/, "")}/**`,
      },
    ];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  transpilePackages: ["@cpa/shared"],
  images: {
    unoptimized: true,
    remotePatterns: s3RemotePatterns(),
  },
};

export default nextConfig;
