import app from "./app";
import { initDb } from "./db";

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await initDb();
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Mini LiqPass Quote API listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to initialize DB:", err);
    process.exit(1);
  }
})();
