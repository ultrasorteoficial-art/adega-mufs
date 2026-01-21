export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Usar a rota de login interna em vez de um portal externo
export const getLoginUrl = () => {
  return "/login";
};
