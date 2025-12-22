import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	output: "standalone",
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "avatars.githubusercontent.com", // GitHub avatars
			},
			{
				protocol: "https",
				hostname: "lh3.googleusercontent.com", // Google avatars
			},
		],
	},
};
export default nextConfig;
