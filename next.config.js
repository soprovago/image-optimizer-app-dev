const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self';script-src 'self' 'unsafe-inline' 'unsafe-eval';style-src 'self' 'unsafe-inline';font-src 'self' data: https: http:;img-src 'self' data: blob:;connect-src 'self'"
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig

