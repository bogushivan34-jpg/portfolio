/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static HTML export: `next build` writes the site to out/, which the Worker in worker/ serves (wrangler.jsonc).
  output: "export",
  // Every page as <path>/index.html, so /works/ (the list) sits beside /works/<id>/ (a preview), and a link with or
  // without the closing slash both open. Flat files (works.html beside works/) gave 404s.
  trailingSlash: true,
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
