/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Add any experimental features if needed
  },
  // Security headers (exclude _next so dev server can serve chunks)
  async headers() {
    return [
      {
        // Don't add headers to _next/* so dev server can serve JS/CSS chunks
        source: '/((?!_next).*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig
