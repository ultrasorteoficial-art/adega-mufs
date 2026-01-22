export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  // Retornando a rota interna de login em vez de uma URL externa de OAuth
  return "/login";
};
