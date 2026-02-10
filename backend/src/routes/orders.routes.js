const ordersController = require("../controllers/orders.controller");

async function orderRoutes(fastify, options) {
    fastify.get("/eltrinche/api/orders", ordersController.getOrders);
    fastify.post("/eltrinche/api/orders", ordersController.createOrder);
    fastify.post("/eltrinche/api/orders/:id/pay", ordersController.payOrder);
}

module.exports = orderRoutes;
