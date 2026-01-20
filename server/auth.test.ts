import { describe, expect, it } from "vitest";
import bcryptjs from "bcryptjs";

describe("Authentication", () => {
  it("should hash password correctly", async () => {
    const password = "123456";
    const hash = await bcryptjs.hash(password, 10);
    
    expect(hash).toBeDefined();
    expect(hash).not.toBe(password);
    
    const isValid = await bcryptjs.compare(password, hash);
    expect(isValid).toBe(true);
  });

  it("should reject invalid password", async () => {
    const password = "123456";
    const wrongPassword = "654321";
    const hash = await bcryptjs.hash(password, 10);
    
    const isValid = await bcryptjs.compare(wrongPassword, hash);
    expect(isValid).toBe(false);
  });

  it("should generate different hashes for same password", async () => {
    const password = "123456";
    const hash1 = await bcryptjs.hash(password, 10);
    const hash2 = await bcryptjs.hash(password, 10);
    
    expect(hash1).not.toBe(hash2);
    
    // But both should validate the same password
    const isValid1 = await bcryptjs.compare(password, hash1);
    const isValid2 = await bcryptjs.compare(password, hash2);
    
    expect(isValid1).toBe(true);
    expect(isValid2).toBe(true);
  });
});
