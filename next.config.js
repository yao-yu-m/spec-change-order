/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Disable client-side router cache so navigating back always gets fresh server data.
    // This is important for the in-memory store to reflect status changes correctly.
    staleTimes: {
      dynamic: 0,
      static: 0,
    },
  },
};

module.exports = nextConfig;
