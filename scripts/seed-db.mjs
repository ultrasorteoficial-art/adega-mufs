import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { users, competitors } from "../drizzle/schema.js";

// Re-export types from schema
const schema = { users, competitors };

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is not set");
  process.exit(1);
}

async function seedDatabase() {
  try {
    const db = drizzle(DATABASE_URL);

    // Seed competitors - Fixed: Dinho, Adega Brasil, Franco, Diversos
    const competitorData = [
      { name: "Dinho", code: "DINHO" },
      { name: "Adega Brasil", code: "ADEGA_BRASIL" },
      { name: "Franco", code: "FRANCO" },
      { name: "Diversos", code: "DIVERSOS" },
    ];

    console.log("Seeding competitors...");
    for (const competitor of competitorData) {
      await db
        .insert(competitors)
        .values(competitor)
        .onDuplicateKeyUpdate({ set: competitor })
        .catch((err) => {
          if (err.code !== "ER_DUP_ENTRY") {
            console.error(`Error inserting competitor ${competitor.name}:`, err);
          }
        });
    }
    console.log("✓ Competitors seeded successfully");

    // Seed 5 users with email/password credentials
    // Note: In production, passwords should be hashed. For this demo, we'll use simple credentials.
    const userData = [
      {
        openId: "user1",
        name: "Usuário 1",
        email: "user1@adegamufs.com",
        loginMethod: "email",
        role: "user",
      },
      {
        openId: "user2",
        name: "Usuário 2",
        email: "user2@adegamufs.com",
        loginMethod: "email",
        role: "user",
      },
      {
        openId: "user3",
        name: "Usuário 3",
        email: "user3@adegamufs.com",
        loginMethod: "email",
        role: "user",
      },
      {
        openId: "user4",
        name: "Usuário 4",
        email: "user4@adegamufs.com",
        loginMethod: "email",
        role: "user",
      },
      {
        openId: "user5",
        name: "Usuário 5",
        email: "user5@adegamufs.com",
        loginMethod: "email",
        role: "admin",
      },
    ];

    console.log("Seeding users...");
    for (const user of userData) {
      await db
        .insert(users)
        .values(user)
        .onDuplicateKeyUpdate({ set: user })
        .catch((err) => {
          if (err.code !== "ER_DUP_ENTRY") {
            console.error(`Error inserting user ${user.email}:`, err);
          }
        });
    }
    console.log("✓ Users seeded successfully");

    console.log("\n✓ Database seeded successfully!");
    console.log("\nCredenciais dos usuários:");
    userData.forEach((user, index) => {
      console.log(`User ${index + 1}: ${user.email} (openId: ${user.openId})`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
