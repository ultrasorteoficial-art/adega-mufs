import bcryptjs from "bcryptjs";
import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { users } from "../drizzle/schema";

export async function validateCredentials(email: string, password: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database connection failed");
  }

  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (user.length === 0) {
    return null;
  }

  const userRecord = user[0];
  if (!userRecord.password) {
    return null;
  }

  const isPasswordValid = await bcryptjs.compare(password, userRecord.password);
  if (!isPasswordValid) {
    return null;
  }

  return userRecord;
}

export async function createLocalSession(email: string, password: string) {
  const user = await validateCredentials(email, password);
  if (!user) {
    return null;
  }

  // Update last signed in
  const db = await getDb();
  if (db) {
    await db
      .update(users)
      .set({ lastSignedIn: new Date() })
      .where(eq(users.id, user.id));
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}
