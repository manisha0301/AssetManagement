const app = require("./app");
const pool = require("./config/db");
const { initializeDatabase } = require("./db/init");

require("dotenv").config();

const PORT = process.env.PORT || 5001;

async function startServer() {
  try {
    await initializeDatabase();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    await pool.end().catch(() => {});
    process.exit(1);
  }
}

startServer();
