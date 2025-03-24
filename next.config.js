const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "font-src 'self' data: 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "img-src 'self' data: blob:",
              "connect-src 'self'",
            ].join('; ')
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig

