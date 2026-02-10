const cashierController = require("../controllers/cashier.controller");

async function cashierRoutes(fastify, options) {
    fastify.get("/eltrinche/api/cash-registers/current", cashierController.getCurrentRegister);
    fastify.post("/eltrinche/api/cash-registers/open", cashierController.openRegister);
    fastify.post("/eltrinche/api/cash-registers/close", cashierController.closeRegister);
    fastify.get("/eltrinche/api/cash-registers", cashierController.listRegisters);
}

module.exports = cashierRoutes;
