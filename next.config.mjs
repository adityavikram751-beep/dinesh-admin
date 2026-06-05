/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "coudinary.com",
        port: "",
        pathname: "/**"
      }
    ]
  },
  turbopack: {
    root: process.cwd()
  }
};

export default nextConfig;
