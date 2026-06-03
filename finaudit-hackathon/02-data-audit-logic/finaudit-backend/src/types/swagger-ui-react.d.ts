/**
 * Déclaration de types minimale pour `swagger-ui-react`.
 * Le paquet ne fournit pas ses propres types ; on déclare ici juste ce dont la
 * page /api-docs a besoin (la prop `url` pointant vers la spec OpenAPI).
 */
declare module "swagger-ui-react" {
  import type { ComponentType } from "react";

  interface SwaggerUIProps {
    url?: string;
    spec?: object;
    docExpansion?: "list" | "full" | "none";
    [key: string]: unknown;
  }

  const SwaggerUI: ComponentType<SwaggerUIProps>;
  export default SwaggerUI;
}

declare module "swagger-ui-react/swagger-ui.css";
