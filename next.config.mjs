/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static HTML export for GitHub Pages: `next build` writes the site to out/.
  output: "export",
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
