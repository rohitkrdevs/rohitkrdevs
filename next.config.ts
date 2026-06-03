/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "cdn-images-*.medium.com",
			},
			{
				protocol: "https",
				hostname: "miro.medium.com",
			},
			{
				protocol: "https",
				hostname: "*.medium.com",
			},
		],
	},
};

export default nextConfig;
