import type { NextConfig } from "next";

function assetRemotePatterns(): NonNullable<
  NextConfig["images"]
>["remotePatterns"] {
  const publicBaseUrls = [
    process.env.NEXT_PUBLIC_S3_PUBLIC_BASE_URL,
    process.env.S3_PUBLIC_BASE_URL,
    process.env.NEXT_PUBLIC_LOCAL_ASSET_PUBLIC_BASE_URL,
    process.env.LOCAL_ASSET_PUBLIC_BASE_URL,
    process.env.NODE_ENV === "production"
      ? undefined
      : "http://localhost:3000/uploads",
  ].filter((value): value is string => Boolean(value));

  return Array.from(new Set(publicBaseUrls)).flatMap((publicBaseUrl) => {
    try {
      const url = new URL(publicBaseUrl);
      return {
        protocol: url.protocol.replace(":", "") as "http" | "https",
        hostname: url.hostname,
        port: url.port,
        pathname: `${url.pathname.replace(/\/$/, "")}/**`,
      };
    } catch {
      return [];
    }
  });
}

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  transpilePackages: ["@cpa/shared"],
  images: {
    unoptimized: true,
    remotePatterns: assetRemotePatterns(),
  },
};

export default nextConfig;
