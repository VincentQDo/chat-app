/** @type {import('next').NextConfig} */
const nextConfig = {
  redirects: async () => {
    return [
      {
        source: "/",
        destination: "/chat/global",
        permanent: true,
      },
      {
        source: "/globalchat",
        destination: "/chat/global",
        permanent: true,
      },
      {
        source: "/chat",
        destination: "/chat/global",
        permanent: true,
      },
    ];
  }
};

export default nextConfig;
