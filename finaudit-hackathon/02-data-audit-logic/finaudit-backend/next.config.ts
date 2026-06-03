import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Désactivé volontairement : la seule UI de ce backend est la page Swagger,
  // et `swagger-ui-react` utilise des cycles de vie React hérités
  // (UNSAFE_componentWillReceiveProps) qui déclenchent un avertissement bruyant
  // en Strict Mode. L'API elle-même n'est pas concernée.
  reactStrictMode: false,
};

export default nextConfig;
