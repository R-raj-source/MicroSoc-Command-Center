// index.js
import app from "./app.js";
import connectDB from "./config/db.js";
import dotenv from "dotenv";

import { startLogGenerator } from "./controllers/logGenerator.js";
import classifyLog  from "./controllers/threatEngine.js";

dotenv.config();

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    await connectDB();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

    // Start log generator (every 5 seconds)
    startLogGenerator(5000);

    // Start threat engine (every 3 seconds)
    classifyLog(3000);

  } catch (err) {
    console.error("Failed to start server:", err);
  }
};

startServer();
