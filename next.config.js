const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              font-src 'self' data: 'unsafe-inline';
              style-src 'self' 'unsafe-inline';
            `
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig

