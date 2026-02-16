import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Google profile images
      },
      {
        protocol: 'https',
        hostname: '*.githubusercontent.com', // GitHub images
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com', // Unsplash (common for placeholders)
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com', // Cloudinary CDN
      },
      {
        protocol: 'https',
        hostname: '*.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 's3.amazonaws.com', // AWS S3
      },
      {
        protocol: 'https',
        hostname: '*.s3.amazonaws.com',
      },
    ],
  },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
