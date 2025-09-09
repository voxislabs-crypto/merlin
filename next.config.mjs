/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Enable React strict mode
  reactStrictMode: true,
  
  // Configure webpack to handle TypeScript, JSX, and native modules
  webpack: (config, { isServer }) => {
    // Add TypeScript and JSX to the list of extensions to resolve
    config.resolve.extensions = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.json'];
    
    // Exclude the native module from client-side bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'swisseph': false,
        'swisseph/eph': false
      };
    }
    
    // Handle native modules
    config.module.rules.push({
      test: /\.node$/,
      use: 'node-loader',
    });
    
    // Handle TypeScript files in the app directory
    config.module.rules.push({
      test: /\.(ts|tsx)$/,
      use: [
        {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            compilerOptions: {
              module: 'esnext',
              moduleResolution: 'node',
              esModuleInterop: true,
              allowSyntheticDefaultImports: true,
              resolveJsonModule: true,
              isolatedModules: true,
              noEmit: false,
              jsx: 'preserve',
              target: 'es5',
            },
          },
        },
      ],
      exclude: /node_modules/,
    });
    
    // Important: Return the modified config
    return config;
  },
  
  // Support for static exports
  output: 'standalone',
  
  // Disable server components external packages
  experimental: {
    serverComponentsExternalPackages: ['swisseph'],
  },
  
  // Enable server components and actions
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

export default nextConfig
