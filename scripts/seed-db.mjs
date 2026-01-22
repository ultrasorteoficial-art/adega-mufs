import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { users, competitors, products } from "../drizzle/schema.js";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is not set");
  process.exit(1);
}

async function seedDatabase() {
  let connection;
  try {
    console.log("Connecting to database for seeding...");
    connection = await mysql.createConnection({
      uri: DATABASE_URL,
      ssl: {
        rejectUnauthorized: true,
      },
    });
    const db = drizzle(connection);

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
        .onDuplicateKeyUpdate({ set: competitor });
    }
    console.log("✓ Competitors seeded successfully");

    // Seed specific products requested by user
    const productData = [
      { name: "Smirnoff 998", category: "Vodka", createdBy: 1 },
      { name: "Smirnoff 600", category: "Vodka", createdBy: 1 },
      { name: "Jack Daniels", category: "Whisky", createdBy: 1 },
      { name: "Cachaça 51", category: "Cachaça", createdBy: 1 },
      { name: "Smirnoff Ice", category: "RTD", createdBy: 1 },
      { name: "51 Ice", category: "RTD", createdBy: 1 },
      { name: "Vinho Campo Largo", category: "Vinho", createdBy: 1 },
    ];

    console.log("Seeding products...");
    for (const product of productData) {
      await db
        .insert(products)
        .values(product)
        .onDuplicateKeyUpdate({ set: product });
    }
    console.log("✓ Products seeded successfully");

    // Seed mock users
    const userData = [
      {
        openId: "admin-mock-id",
        name: "Administrador Adega Mufs",
        email: "admin@adegamufs.com",
        loginMethod: "local",
        role: "admin",
      }
    ];

    console.log("Seeding users...");
    for (const user of userData) {
      await db
        .insert(users)
        .values(user)
        .onDuplicateKeyUpdate({ set: user });
    }
    console.log("✓ Users seeded successfully");

    console.log("\n✓ Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

seedDatabase();
