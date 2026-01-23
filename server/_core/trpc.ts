import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;
// Tornando procedimentos protegidos públicos para acesso livre sem login
export const protectedProcedure = t.procedure;
export const adminProcedure = t.procedure;
