/** @type {import('next').NextConfig} */
const nextConfig = {
  redirects: async () => {
    return [
      {
        source: "/",
        destination: "/globalchat",
        permanent: true,
      },
    ];
  }
};

export default nextConfig;
