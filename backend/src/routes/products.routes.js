const productsController = require("../controllers/products.controller");

async function productRoutes(fastify, options) {
    fastify.get("/eltrinche/api/products", productsController.getProducts);
    fastify.post("/eltrinche/api/products", productsController.createProduct);

    fastify.get("/eltrinche/api/categories", productsController.getCategories);
    fastify.post("/eltrinche/api/categories", productsController.createCategory);
    fastify.delete("/eltrinche/api/categories/:id", productsController.deleteCategory);
}

module.exports = productRoutes;
