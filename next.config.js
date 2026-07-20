/** @type {import('next').NextConfig} */
const nextConfig = {
  // Aseguramos compatibilidad con navegadores antiguos mediante swc
  swcMinify: true,

  // Eliminamos rewrites para evitar conflictos con el manejo de cookies (Set-Cookie)
  // en el proxy. La comunicación debe ser directa al backend.
};

module.exports = nextConfig;
