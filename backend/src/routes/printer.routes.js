const printerController = require("../controllers/printer.controller");

async function printerRoutes(fastify, options) {
    fastify.get("/eltrinche/api/printers", printerController.getPrinters);
    fastify.post("/eltrinche/api/printers", printerController.createPrinter);
    fastify.post("/eltrinche/api/print", printerController.print);
}

module.exports = printerRoutes;
