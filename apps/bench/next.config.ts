import type { NextConfig } from "next";
import TerserPlugin from 'terser-webpack-plugin';

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.minimizer = [
        new TerserPlugin({
          terserOptions: {
            keep_classnames: true,
            keep_fnames: true,
          },
        }),
      ];
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      };
    }
    return config;
  },
};

export default nextConfig;
