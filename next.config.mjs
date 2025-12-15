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
  
  // Disable tracing to avoid permission issues
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
  
  // Configure webpack to handle TypeScript, JSX, and native modules
  webpack: (config, { isServer }) => {
    // Add TypeScript and JSX to the list of extensions to resolve
    config.resolve.extensions = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.json'];
    
    // No need to exclude swisseph anymore - using sweph-wasm
    
    // No longer need native node module handling
    
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
  
  // Enable server components and actions
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

export default nextConfig
