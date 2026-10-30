import path from 'path';
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      };
    }
    // raw-loader for sample .js files (regular JS code that uses the Quantum global)
    config.module.rules.push({
      test: /\.js$/,
      include: path.resolve(__dirname, 'src/samples'),
      use: 'raw-loader',
    });
    return config;
  },
};

export default nextConfig;
