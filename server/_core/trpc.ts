import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

// Alterado para ser igual ao publicProcedure para permitir acesso aberto
// Isso remove a necessidade de autenticação em todas as rotas que usam protectedProcedure
export const protectedProcedure = t.procedure;

// Mantendo adminProcedure como está, ou você pode torná-lo público também se desejar
export const adminProcedure = t.procedure;
