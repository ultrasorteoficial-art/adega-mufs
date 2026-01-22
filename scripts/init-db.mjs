import mysql from "mysql2/promise";
import "dotenv/config";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is not set");
  process.exit(1);
}

async function initDatabase() {
  let connection;
  try {
    console.log("Connecting to database to create tables...");
    connection = await mysql.createConnection({
      uri: DATABASE_URL,
      ssl: {
        rejectUnauthorized: true,
      },
    });

    console.log("Connected! Creating tables if they don't exist...");

    // Tabela de Usuários
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        openId VARCHAR(64) NOT NULL UNIQUE,
        name TEXT,
        email VARCHAR(320) UNIQUE,
        password TEXT,
        loginMethod VARCHAR(64),
        role ENUM('user', 'admin') DEFAULT 'user' NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
        lastSignedIn TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        INDEX email_idx (email),
        INDEX openId_idx (openId)
      )
    `);

    // Tabela de Produtos
    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        category VARCHAR(100),
        createdBy INT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
        INDEX product_name_idx (name),
        INDEX product_category_idx (category)
      )
    `);

    // Tabela de Concorrentes
    await connection.query(`
      CREATE TABLE IF NOT EXISTS competitors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        code VARCHAR(20) NOT NULL UNIQUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);

    // Tabela de Preços
    await connection.query(`
      CREATE TABLE IF NOT EXISTS prices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        productId INT NOT NULL,
        competitorId INT NOT NULL,
        value DECIMAL(10, 2) NOT NULL,
        registeredBy INT NOT NULL,
        registeredAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
        INDEX product_competitor_idx (productId, competitorId),
        INDEX price_product_idx (productId),
        INDEX price_competitor_idx (competitorId)
      )
    `);

    // Tabela de Histórico de Preços
    await connection.query(`
      CREATE TABLE IF NOT EXISTS priceHistory (
        id INT AUTO_INCREMENT PRIMARY KEY,
        productId INT NOT NULL,
        competitorId INT NOT NULL,
        previousValue DECIMAL(10, 2),
        newValue DECIMAL(10, 2) NOT NULL,
        changedBy INT NOT NULL,
        changeType ENUM('created', 'updated', 'deleted') NOT NULL,
        changedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        INDEX history_product_idx (productId),
        INDEX history_competitor_idx (competitorId),
        INDEX history_changed_at_idx (changedAt)
      )
    `);

    // Tabela de Clientes
    await connection.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
        INDEX client_code_idx (code),
        INDEX client_name_idx (name)
      )
    `);

    // Tabela de SKUs
    await connection.query(`
      CREATE TABLE IF NOT EXISTS skus (
        id INT AUTO_INCREMENT PRIMARY KEY,
        clientId INT NOT NULL,
        code VARCHAR(100) NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        \`order\` INT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
        INDEX sku_client_idx (clientId),
        INDEX sku_code_idx (code)
      )
    `);

    // Tabela de Evidências
    await connection.query(`
      CREATE TABLE IF NOT EXISTS evidence (
        id INT AUTO_INCREMENT PRIMARY KEY,
        clientId INT NOT NULL,
        fileUrl TEXT NOT NULL,
        fileName VARCHAR(255) NOT NULL,
        fileType VARCHAR(50) NOT NULL,
        fileSize INT NOT NULL,
        description TEXT,
        uploadedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        INDEX evidence_client_idx (clientId),
        INDEX evidence_uploaded_at_idx (uploadedAt)
      )
    `);

    console.log("✓ All tables created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error initializing database:", error);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

initDatabase();
