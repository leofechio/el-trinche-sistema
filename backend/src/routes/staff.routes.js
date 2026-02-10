const staffController = require("../controllers/staff.controller");

async function staffRoutes(fastify, options) {
    fastify.get("/eltrinche/api/staff", staffController.getStaff);
    fastify.post("/eltrinche/api/staff", staffController.createStaff);
    fastify.post("/eltrinche/api/login", staffController.login);
}

module.exports = staffRoutes;
