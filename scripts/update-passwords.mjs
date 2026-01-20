import bcryptjs from "bcryptjs";
import { createConnection } from "mysql2/promise";

// Parse DATABASE_URL
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

const url = new URL(dbUrl);
const connection = await createConnection({
  host: url.hostname,
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1),
  port: url.port ? parseInt(url.port) : 3306,
  ssl: {},
});

const users = [
  { email: "user1@adegamufs.com", password: "123456" },
  { email: "user2@adegamufs.com", password: "123456" },
  { email: "user3@adegamufs.com", password: "123456" },
  { email: "user4@adegamufs.com", password: "123456" },
  { email: "user5@adegamufs.com", password: "123456" },
];

console.log("Atualizando senhas dos usuários...\n");

for (const user of users) {
  const hashedPassword = await bcryptjs.hash(user.password, 10);
  await connection.execute(
    "UPDATE users SET password = ? WHERE email = ?",
    [hashedPassword, user.email]
  );
  console.log(`✓ Senha atualizada para ${user.email}`);
}

console.log("\n✓ Todas as senhas foram atualizadas com sucesso!");
console.log("\nCredenciais de teste:");
users.forEach((user) => {
  console.log(`  Email: ${user.email}`);
  console.log(`  Senha: ${user.password}`);
});

await connection.end();
