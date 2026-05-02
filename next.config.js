/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Игнорировать ошибки ESLint при сборке (билде)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Игнорировать ошибки TypeScript при сборке
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
