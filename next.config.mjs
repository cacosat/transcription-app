/** @type {import('next').NextConfig} */
const nextConfig = {
experimental: {
        serverComponentsExternalPackages: ['sharp', 'onnxruntime-node'],
    },
    webpack(config) {
        config.experiments = { ...config.experiments, topLevelAwait: true }
        return config
    },
};

export default nextConfig;
