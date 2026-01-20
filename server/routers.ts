import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllCompetitors,
  getPricesByProduct,
  getAllPricesWithDetails,
  registerPrice,
  deletePrice,
  getPriceHistory,
  getPriceComparisonMatrix,
  calculateAveragePriceByProduct,
  getOrCreateClient,
  getAllClients,
  createSKU,
  getSKUsByClient,
  deleteSKU,
  uploadEvidence,
  getEvidenceByClient,
  deleteEvidence,
} from "./db";
import { TRPCError } from "@trpc/server";
import { generateComparisonPDF, generateHistoryPDF } from "./export/pdf";
import { generateComparisonExcel, generateHistoryExcel } from "./export/excel";
import { createLocalSession } from "./auth";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),

    login: publicProcedure
      .input(
        z.object({
          email: z.string().email("Email inválido"),
          password: z.string().min(1, "Senha é obrigatória"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const user = await createLocalSession(input.email, input.password);
          if (!user) {
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message: "Email ou senha incorretos",
            });
          }
          return {
            success: true,
            user,
          };
        } catch (error: any) {
          if (error.code === "UNAUTHORIZED") {
            throw error;
          }
          console.error("Login error:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao fazer login",
          });
        }
      }),

    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============ PRODUCTS ============
  products: router({
    list: protectedProcedure.query(async () => {
      return await getAllProducts();
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const product = await getProductById(input.id);
        if (!product) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Product not found",
          });
        }
        return product;
      }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1, "Product name is required"),
          description: z.string().optional(),
          category: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User not authenticated",
          });
        }

        try {
          await createProduct(
            input.name,
            input.description || null,
            input.category || null,
            ctx.user.id
          );
          return { success: true };
        } catch (error: any) {
          if (error.code === "ER_DUP_ENTRY") {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Product with this name already exists",
            });
          }
          throw error;
        }
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1),
          description: z.string().optional(),
          category: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const product = await getProductById(input.id);
        if (!product) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Product not found",
          });
        }

        try {
          await updateProduct(
            input.id,
            input.name,
            input.description || null,
            input.category || null
          );
          return { success: true };
        } catch (error: any) {
          if (error.code === "ER_DUP_ENTRY") {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Product with this name already exists",
            });
          }
          throw error;
        }
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const product = await getProductById(input.id);
        if (!product) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Product not found",
          });
        }

        await deleteProduct(input.id);
        return { success: true };
      }),
  }),

  // ============ COMPETITORS ============
  competitors: router({
    list: protectedProcedure.query(async () => {
      return await getAllCompetitors();
    }),
  }),

  // ============ PRICES ============
  prices: router({
    listByProduct: protectedProcedure
      .input(z.object({ productId: z.number() }))
      .query(async ({ input }) => {
        return await getPricesByProduct(input.productId);
      }),

    listAll: protectedProcedure.query(async () => {
      return await getAllPricesWithDetails();
    }),

    register: protectedProcedure
      .input(
        z.object({
          productId: z.number(),
          competitorId: z.number(),
          value: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User not authenticated",
          });
        }

        const product = await getProductById(input.productId);
        if (!product) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Product not found",
          });
        }

        const competitors = await getAllCompetitors();
        const competitor = competitors.find(c => c.id === input.competitorId);
        if (!competitor) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Competitor not found",
          });
        }

        try {
          await registerPrice(
            input.productId,
            input.competitorId,
            input.value,
            ctx.user.id
          );
          return { success: true };
        } catch (error) {
          console.error("Error registering price:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to register price",
          });
        }
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        try {
          await deletePrice(input.id);
          return { success: true };
        } catch (error: any) {
          if (error.message === "Price not found") {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Price not found",
            });
          }
          throw error;
        }
      }),

    getComparison: protectedProcedure.query(async () => {
      return await getPriceComparisonMatrix();
    }),

    getAverage: protectedProcedure
      .input(z.object({ productId: z.number() }))
      .query(async ({ input }) => {
        return await calculateAveragePriceByProduct(input.productId);
      }),
  }),

  // ============ HISTORY ============
  history: router({
    list: protectedProcedure
      .input(
        z.object({
          productId: z.number().optional(),
          competitorId: z.number().optional(),
          days: z.number().optional(),
        })
      )
      .query(async ({ input }) => {
        return await getPriceHistory(input.productId, input.competitorId, input.days);
      }),
  }),

  // ============ EXPORT ============
  export: router({
    comparisonPDF: protectedProcedure.query(async () => {
      try {
        const comparison = await getPriceComparisonMatrix();
        const pdf = await generateComparisonPDF(comparison);
        return {
          success: true,
          data: pdf.toString("base64"),
          filename: `comparacao-precos-${new Date().toISOString().split("T")[0]}.pdf`,
        };
      } catch (error) {
        console.error("Error generating PDF:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate PDF",
        });
      }
    }),

    comparisonExcel: protectedProcedure.query(async () => {
      try {
        const comparison = await getPriceComparisonMatrix();
        const excel = generateComparisonExcel(comparison);
        return {
          success: true,
          data: excel.toString("base64"),
          filename: `comparacao-precos-${new Date().toISOString().split("T")[0]}.xlsx`,
        };
      } catch (error) {
        console.error("Error generating Excel:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate Excel",
        });
      }
    }),

    historyPDF: protectedProcedure
      .input(
        z.object({
          days: z.number().optional(),
        })
      )
      .query(async ({ input }) => {
        try {
          const history = await getPriceHistory(undefined, undefined, input.days);
          const pdf = await generateHistoryPDF(history);
          return {
            success: true,
            data: pdf.toString("base64"),
            filename: `historico-precos-${new Date().toISOString().split("T")[0]}.pdf`,
          };
        } catch (error) {
          console.error("Error generating PDF:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to generate PDF",
          });
        }
      }),

    historyExcel: protectedProcedure
      .input(
        z.object({
          days: z.number().optional(),
        })
      )
      .query(async ({ input }) => {
        try {
          const history = await getPriceHistory(undefined, undefined, input.days);
          const excel = generateHistoryExcel(history);
          return {
            success: true,
            data: excel.toString("base64"),
            filename: `historico-precos-${new Date().toISOString().split("T")[0]}.xlsx`,
          };
        } catch (error) {
          console.error("Error generating Excel:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to generate Excel",
          });
        }
      }),
  }),

  // ============ CLIENTS ============
  clients: router({
    list: publicProcedure.query(async () => {
      return await getAllClients();
    }),

    getOrCreate: publicProcedure
      .input(
        z.object({
          code: z.string().min(1, "Código do cliente é obrigatório"),
          name: z.string().min(1, "Nome do cliente é obrigatório"),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const client = await getOrCreateClient(input.code, input.name);
          return { success: true, client };
        } catch (error) {
          console.error("Error creating client:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao criar cliente",
          });
        }
      }),
  }),

  // ============ SKUs ============
  skus: router({
    listByClient: publicProcedure
      .input(z.object({ clientId: z.number() }))
      .query(async ({ input }) => {
        return await getSKUsByClient(input.clientId);
      }),

    create: publicProcedure
      .input(
        z.object({
          clientId: z.number(),
          code: z.string().min(1),
          name: z.string().min(1),
          order: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          await createSKU(input.clientId, input.code, input.name, input.order);
          return { success: true };
        } catch (error) {
          console.error("Error creating SKU:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao criar SKU",
          });
        }
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        try {
          await deleteSKU(input.id);
          return { success: true };
        } catch (error) {
          console.error("Error deleting SKU:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao deletar SKU",
          });
        }
      }),
  }),

  // ============ EVIDENCE ============
  evidence: router({
    listByClient: publicProcedure
      .input(z.object({ clientId: z.number() }))
      .query(async ({ input }) => {
        return await getEvidenceByClient(input.clientId);
      }),

    upload: publicProcedure
      .input(
        z.object({
          clientId: z.number(),
          fileUrl: z.string(),
          fileName: z.string(),
          fileType: z.string(),
          fileSize: z.number(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          await uploadEvidence(
            input.clientId,
            input.fileUrl,
            input.fileName,
            input.fileType,
            input.fileSize,
            input.description
          );
          return { success: true };
        } catch (error) {
          console.error("Error uploading evidence:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao fazer upload de evidência",
          });
        }
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        try {
          await deleteEvidence(input.id);
          return { success: true };
        } catch (error) {
          console.error("Error deleting evidence:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao deletar evidência",
          });
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
