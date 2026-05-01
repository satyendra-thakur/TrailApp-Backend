const app = require("./app");
const http = require("http");
const { env } = require("./config/env");
const { connectDatabase } = require("./config/database");
const { initializeSocket } = require("./socket");

const bootstrap = async () => {
  try {
    await connectDatabase();
    const server = http.createServer(app);
    initializeSocket(server);

    server.listen(env.port, () => {
      console.log(`Server running on port ${env.port} in ${env.nodeEnv} mode`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

bootstrap();
