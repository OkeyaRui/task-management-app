/** @type {import('next').NextConfig} */
const nextConfig = {
  // Docker用の設定
  output: 'standalone',
  // 画像最適化の設定
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
