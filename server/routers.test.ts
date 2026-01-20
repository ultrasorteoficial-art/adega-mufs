import { describe, expect, it, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "email",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as any,
  };

  return ctx;
}

describe("Products Router", () => {
  it("should list products", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // This will return an empty array initially
    const products = await caller.products.list();
    expect(Array.isArray(products)).toBe(true);
  });

  it("should create a product", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.products.create({
      name: "Test Product",
      category: "Test Category",
    });

    expect(result.success).toBe(true);
  });

  it("should reject product creation with empty name", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.products.create({
        name: "",
        category: "Test Category",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.code).toBe("BAD_REQUEST");
    }
  });
});

describe("Competitors Router", () => {
  it("should list competitors", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const competitors = await caller.competitors.list();
    expect(Array.isArray(competitors)).toBe(true);
    expect(competitors.length).toBe(4); // Should have 4 competitors
  });

  it("should have correct competitor names", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const competitors = await caller.competitors.list();
    const names = competitors.map(c => c.name);

    expect(names).toContain("Dinho");
    expect(names).toContain("Adega Brasil");
    expect(names).toContain("Franco");
    expect(names).toContain("Diversos");
  });
});

describe("Prices Router", () => {
  it("should list all prices", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const prices = await caller.prices.listAll();
    expect(Array.isArray(prices)).toBe(true);
  });

  it("should reject invalid price format", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.prices.register({
        productId: 1,
        competitorId: 1,
        value: "invalid",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.code).toBe("BAD_REQUEST");
    }
  });

  it("should accept valid price format", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // First create a product
    await caller.products.create({
      name: "Test Product for Price",
      category: "Test",
    });

    // Get the product
    const products = await caller.products.list();
    const product = products[products.length - 1];

    // Get competitors
    const competitors = await caller.competitors.list();
    const competitor = competitors[0];

    if (product && competitor) {
      const result = await caller.prices.register({
        productId: product.id,
        competitorId: competitor.id,
        value: "10.50",
      });

      expect(result.success).toBe(true);
    }
  });

  it("should get price comparison matrix", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const comparison = await caller.prices.getComparison();
    expect(Array.isArray(comparison)).toBe(true);
  });
});

describe("History Router", () => {
  it("should list price history", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const history = await caller.history.list({});
    expect(Array.isArray(history)).toBe(true);
  });

  it("should filter history by days", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const history = await caller.history.list({ days: 7 });
    expect(Array.isArray(history)).toBe(true);
  });
});

describe("Auth Router", () => {
  it("should get current user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const user = await caller.auth.me();
    expect(user).toBeDefined();
    expect(user?.email).toBe("test@example.com");
  });

  it("should logout successfully", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
  });
});
