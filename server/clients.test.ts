import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";

describe("Clients Router", () => {
  it("should create or get a client", async () => {
    const caller = appRouter.createCaller({} as any);

    const result = await caller.clients.getOrCreate({
      code: "TEST001",
      name: "Test Client",
    });

    expect(result.success).toBe(true);
    expect(result.client).toBeDefined();
    expect(result.client.code).toBe("TEST001");
    expect(result.client.name).toBe("Test Client");
  });

  it("should return existing client when code matches", async () => {
    const caller = appRouter.createCaller({} as any);

    // Create first client
    const result1 = await caller.clients.getOrCreate({
      code: "TEST002",
      name: "Test Client 2",
    });

    // Get same client again
    const result2 = await caller.clients.getOrCreate({
      code: "TEST002",
      name: "Test Client 2 Updated",
    });

    expect(result1.client.id).toBe(result2.client.id);
  });

  it("should list all clients", async () => {
    const caller = appRouter.createCaller({} as any);

    const clients = await caller.clients.list();

    expect(Array.isArray(clients)).toBe(true);
  });
});

describe("SKUs Router", () => {
  it("should create a SKU", async () => {
    const caller = appRouter.createCaller({} as any);

    // Create client first
    const clientResult = await caller.clients.getOrCreate({
      code: "SKU_TEST_001",
      name: "SKU Test Client",
    });

    // Create SKU
    const skuResult = await caller.skus.create({
      clientId: clientResult.client.id,
      code: "SKU001",
      name: "Test SKU",
      order: 1,
    });

    expect(skuResult.success).toBe(true);
  });

  it("should list SKUs by client", async () => {
    const caller = appRouter.createCaller({} as any);

    // Create client
    const clientResult = await caller.clients.getOrCreate({
      code: "SKU_TEST_002",
      name: "SKU Test Client 2",
    });

    // Create multiple SKUs
    await caller.skus.create({
      clientId: clientResult.client.id,
      code: "SKU001",
      name: "Test SKU 1",
      order: 1,
    });

    await caller.skus.create({
      clientId: clientResult.client.id,
      code: "SKU002",
      name: "Test SKU 2",
      order: 2,
    });

    // List SKUs
    const skus = await caller.skus.listByClient({
      clientId: clientResult.client.id,
    });

    expect(Array.isArray(skus)).toBe(true);
    expect(skus.length).toBeGreaterThanOrEqual(2);
  });
});

describe("Evidence Router", () => {
  it("should upload evidence", async () => {
    const caller = appRouter.createCaller({} as any);

    // Create client
    const clientResult = await caller.clients.getOrCreate({
      code: "EVIDENCE_TEST_001",
      name: "Evidence Test Client",
    });

    // Upload evidence
    const result = await caller.evidence.upload({
      clientId: clientResult.client.id,
      fileUrl: "https://example.com/photo.jpg",
      fileName: "photo.jpg",
      fileType: "image/jpeg",
      fileSize: 1024,
      description: "Test evidence",
    });

    expect(result.success).toBe(true);
  });

  it("should list evidence by client", async () => {
    const caller = appRouter.createCaller({} as any);

    // Create client
    const clientResult = await caller.clients.getOrCreate({
      code: "EVIDENCE_TEST_002",
      name: "Evidence Test Client 2",
    });

    // Upload evidence
    await caller.evidence.upload({
      clientId: clientResult.client.id,
      fileUrl: "https://example.com/photo1.jpg",
      fileName: "photo1.jpg",
      fileType: "image/jpeg",
      fileSize: 1024,
    });

    // List evidence
    const evidence = await caller.evidence.listByClient({
      clientId: clientResult.client.id,
    });

    expect(Array.isArray(evidence)).toBe(true);
  });
});
