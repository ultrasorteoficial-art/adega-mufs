import { eq, desc, and, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, products, competitors, prices, priceHistory, clients, skus, evidence } from "../drizzle/schema";
import { InsertClient, InsertSKU, InsertEvidence } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ PRODUCTS ============

export async function getAllProducts() {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(products)
    .orderBy(products.name);
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1);
  
  return result[0];
}

export async function createProduct(name: string, description: string | null, category: string | null, createdBy: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(products).values({
    name,
    description,
    category,
    createdBy,
  });
  
  return result;
}

export async function updateProduct(id: number, name: string, description: string | null, category: string | null) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db
    .update(products)
    .set({ name, description, category })
    .where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.delete(products).where(eq(products.id, id));
}

// ============ COMPETITORS ============

export async function getAllCompetitors() {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(competitors)
    .orderBy(competitors.name);
}

// ============ PRICES ============

export async function getPricesByProduct(productId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select({
      id: prices.id,
      productId: prices.productId,
      competitorId: prices.competitorId,
      competitorName: competitors.name,
      value: prices.value,
      registeredBy: prices.registeredBy,
      registeredAt: prices.registeredAt,
      updatedAt: prices.updatedAt,
    })
    .from(prices)
    .innerJoin(competitors, eq(prices.competitorId, competitors.id))
    .where(eq(prices.productId, productId))
    .orderBy(competitors.name);
}

export async function getAllPricesWithDetails() {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select({
      id: prices.id,
      productId: prices.productId,
      productName: products.name,
      competitorId: prices.competitorId,
      competitorName: competitors.name,
      value: prices.value,
      registeredBy: prices.registeredBy,
      registeredAt: prices.registeredAt,
      updatedAt: prices.updatedAt,
    })
    .from(prices)
    .innerJoin(products, eq(prices.productId, products.id))
    .innerJoin(competitors, eq(prices.competitorId, competitors.id))
    .orderBy(products.name, competitors.name);
}

export async function registerPrice(productId: number, competitorId: number, value: string, registeredBy: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if price already exists
  const existing = await db
    .select()
    .from(prices)
    .where(and(eq(prices.productId, productId), eq(prices.competitorId, competitorId)))
    .limit(1);
  
  if (existing.length > 0) {
    // Update existing price
    const oldPrice = existing[0];
    
    // Record in history
    await db.insert(priceHistory).values({
      productId,
      competitorId,
      previousValue: oldPrice.value,
      newValue: value,
      changedBy: registeredBy,
      changeType: "updated",
    });
    
    // Update price
    return await db
      .update(prices)
      .set({ value, registeredBy, updatedAt: new Date() })
      .where(eq(prices.id, oldPrice.id));
  } else {
    // Create new price
    const result = await db.insert(prices).values({
      productId,
      competitorId,
      value,
      registeredBy,
    });
    
    // Record in history
    await db.insert(priceHistory).values({
      productId,
      competitorId,
      previousValue: undefined,
      newValue: value,
      changedBy: registeredBy,
      changeType: "created",
    });
    
    return result;
  }
}

export async function deletePrice(priceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Get price details for history
  const priceList = await db
    .select()
    .from(prices)
    .where(eq(prices.id, priceId))
    .limit(1);
  
  if (priceList.length === 0) throw new Error("Price not found");
  
  const p = priceList[0];
  
  // Record deletion in history
  await db.insert(priceHistory).values({
    productId: p.productId,
    competitorId: p.competitorId,
    previousValue: p.value,
    newValue: "0",
    changedBy: p.registeredBy,
    changeType: "deleted",
  });
  
  // Delete price
  return await db.delete(prices).where(eq(prices.id, priceId));
}

// ============ PRICE HISTORY ============

export async function getPriceHistory(productId?: number, competitorId?: number, days?: number) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db
    .select({
      id: priceHistory.id,
      productId: priceHistory.productId,
      productName: products.name,
      competitorId: priceHistory.competitorId,
      competitorName: competitors.name,
      previousValue: priceHistory.previousValue,
      newValue: priceHistory.newValue,
      changedBy: priceHistory.changedBy,
      changeType: priceHistory.changeType,
      changedAt: priceHistory.changedAt,
    })
    .from(priceHistory)
    .innerJoin(products, eq(priceHistory.productId, products.id))
    .innerJoin(competitors, eq(priceHistory.competitorId, competitors.id));
  
  const conditions = [];
  
  if (productId) {
    conditions.push(eq(priceHistory.productId, productId));
  }
  
  if (competitorId) {
    conditions.push(eq(priceHistory.competitorId, competitorId));
  }
  
  if (days) {
    const dateLimit = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    conditions.push(gte(priceHistory.changedAt, dateLimit));
  }
  
  if (conditions.length > 0) {
    return await query.where(and(...conditions)).orderBy(desc(priceHistory.changedAt));
  }
  
  return await query.orderBy(desc(priceHistory.changedAt));
}

// ============ ANALYTICS ============

export async function calculateAveragePriceByProduct(productId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const priceList = await getPricesByProduct(productId);
  
  if (priceList.length === 0) return null;
  
  const sum = priceList.reduce((acc, p) => acc + parseFloat(p.value as any), 0);
  return (sum / priceList.length).toFixed(2);
}

export async function getPriceComparisonMatrix() {
  const db = await getDb();
  if (!db) return [];
  
  const allProducts = await getAllProducts();
  const allCompetitors = await getAllCompetitors();
  const allPrices = await getAllPricesWithDetails();
  
  return allProducts.map(product => {
    const productPrices = allPrices.filter(p => p.productId === product.id);
    
    const competitorPrices: Record<string, any> = {};
    allCompetitors.forEach(competitor => {
      const price = productPrices.find(p => p.competitorId === competitor.id);
      competitorPrices[competitor.name] = price ? {
        value: price.value,
        updatedAt: price.updatedAt,
      } : null;
    });
    
    // Calculate average
    const values = productPrices
      .map(p => parseFloat(p.value as any))
      .filter(v => !isNaN(v));
    
    const average = values.length > 0 
      ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)
      : null;
    
    return {
      id: product.id,
      name: product.name,
      category: product.category,
      competitorPrices,
      average,
      lastUpdated: productPrices.length > 0 
        ? new Date(Math.max(...productPrices.map(p => p.updatedAt?.getTime() || 0)))
        : null,
    };
  });
}

// ============ CLIENTS ============

export async function getOrCreateClient(code: string, name: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Try to find existing client
  const existing = await db
    .select()
    .from(clients)
    .where(eq(clients.code, code))
    .limit(1);
  
  if (existing.length > 0) {
    return existing[0];
  }
  
  // Create new client
  await db.insert(clients).values({
    code,
    name,
  });
  
  const newClient = await db
    .select()
    .from(clients)
    .where(eq(clients.code, code))
    .limit(1);
  
  return newClient[0];
}

export async function getAllClients() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(clients).orderBy(clients.name);
}

// ============ SKUs ============

export async function createSKU(clientId: number, code: string, name: string, order: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(skus).values({
    clientId,
    code,
    name,
    order,
  });
}

export async function getSKUsByClient(clientId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(skus)
    .where(eq(skus.clientId, clientId))
    .orderBy(skus.order);
}

export async function deleteSKU(skuId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.delete(skus).where(eq(skus.id, skuId));
}

// ============ EVIDENCE ============

export async function uploadEvidence(clientId: number, fileUrl: string, fileName: string, fileType: string, fileSize: number, description?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(evidence).values({
    clientId,
    fileUrl,
    fileName,
    fileType,
    fileSize,
    description: description || null,
  });
}

export async function getEvidenceByClient(clientId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(evidence)
    .where(eq(evidence.clientId, clientId))
    .orderBy(desc(evidence.uploadedAt));
}

export async function deleteEvidence(evidenceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.delete(evidence).where(eq(evidence.id, evidenceId));
}
