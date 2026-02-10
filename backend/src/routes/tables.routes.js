const tablesController = require("../controllers/tables.controller");

async function tableRoutes(fastify, options) {
    fastify.get("/eltrinche/api/tables", tablesController.getTables);
    fastify.get("/eltrinche/api/zones", tablesController.getZones);
}

module.exports = tableRoutes;
