const fastify = require("fastify");
const cors = require("@fastify/cors");
const fastifyStatic = require("@fastify/static");
const { UPLOADS_DIR } = require("./config/constants");

// Import Routes
const staffRoutes = require("./routes/staff.routes");
const productRoutes = require("./routes/products.routes");
const cashierRoutes = require("./routes/cashier.routes");
const orderRoutes = require("./routes/orders.routes");
const printerRoutes = require("./routes/printer.routes");
const tableRoutes = require("./routes/tables.routes");
const uploadRoutes = require("./routes/upload.routes");

function buildApp() {
    const app = fastify({ logger: { transport: { target: "pino-pretty" } } });

    app.register(cors);

    app.register(require('@fastify/multipart'), {
        limits: { fileSize: 5 * 1024 * 1024 }
    });

    app.register(fastifyStatic, {
        root: UPLOADS_DIR,
        prefix: "/eltrinche/uploads/",
        decorateReply: false
    });

    // Register Routes
    app.register(staffRoutes);
    app.register(productRoutes);
    app.register(cashierRoutes);
    app.register(orderRoutes);
    app.register(printerRoutes);
    app.register(tableRoutes);
    app.register(uploadRoutes);

    // 404 Handler
    app.setNotFoundHandler((request, reply) => {
        if (request.url.startsWith("/eltrinche/api/")) {
            return reply.status(404).send({ error: "API route not found" });
        }
        return reply.status(404).send("Not found");
    });

    return app;
}

module.exports = buildApp;
