/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static HTML export for GitHub Pages: `next build` writes the site to out/.
  output: "export",
  // Every page as <path>/index.html: GitHub Pages then serves /works/ (the list) beside /works/<id>/ (a preview),
  // and a link with or without the closing slash both open. Flat files (works.html beside works/) gave 404s.
  trailingSlash: true,
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
