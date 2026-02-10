const buildApp = require("./app");
const { PORT } = require("./config/constants");
const socketio = require("socket.io");
const { setSocket, getDb } = require("./services/db.service");

const start = async () => {
    const app = buildApp();
    try {
        await app.listen({ port: PORT, host: "0.0.0.0" });

        // Socket.IO Setup
        const io = socketio(app.server, {
            path: "/eltrinche/socket.io",
            cors: { origin: "*" }
        });

        setSocket(io);

        io.on("connection", (socket) => {
            socket.emit("initial_data", getDb());
        });

        console.log(`Master Server listening on ${PORT}`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();
