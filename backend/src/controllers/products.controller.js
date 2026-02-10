const { getDb, updateDb } = require("../services/db.service");

// Products
exports.getProducts = async (req, reply) => {
    return getDb().products || [];
};

exports.createProduct = async (req, reply) => {
    const db = getDb();
    const newProd = { id: Date.now(), ...req.body };
    db.products.push(newProd);
    updateDb(db);
    return newProd;
};

// Categories
exports.getCategories = async (req, reply) => {
    return getDb().categories || [];
};

exports.createCategory = async (req, reply) => {
    const db = getDb();
    const newCat = { id: Date.now().toString(), ...req.body };
    db.categories.push(newCat);
    updateDb(db);
    return newCat;
};

exports.deleteCategory = async (req, reply) => {
    const db = getDb();
    db.categories = db.categories.filter(c => c.id != req.params.id);
    updateDb(db);
    return { success: true };
};
