const basePath = process.env.BASE_PATH || undefined

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath
};

export default nextConfig;
