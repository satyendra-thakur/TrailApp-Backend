const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const { env } = require("./config/env");
const groupService = require("./services/group.service");

let ioInstance = null;

const initializeSocket = (httpServer) => {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: "*"
    }
  });

  ioInstance.use((socket, next) => {
    try {
      const authToken =
        socket.handshake.auth?.token || socket.handshake.headers?.authorization;
      const token = String(authToken || "").replace(/^Bearer\s+/i, "");

      if (!token) {
        return next(new Error("Unauthorized: missing token"));
      }

      const payload = jwt.verify(token, env.jwtSecret);
      socket.user = {
        id: payload.sub,
        email: payload.email
      };

      return next();
    } catch (error) {
      return next(new Error("Unauthorized: token verification failed"));
    }
  });

  ioInstance.on("connection", (socket) => {
    socket.on("group:join", async (groupId) => {
      try {
        const group = await groupService.getGroupById(groupId);
        if (!group.members.includes(socket.user.id)) {
          socket.emit("group:error", { message: "Not a group member" });
          return;
        }

        socket.join(`group:${group._id}`);
        socket.emit("group:joined", { groupId: String(group._id) });
      } catch (error) {
        socket.emit("group:error", {
          message: error.message || "Failed to join group room"
        });
      }
    });
  });

  return ioInstance;
};

const getIo = () => ioInstance;

module.exports = {
  initializeSocket,
  getIo
};
