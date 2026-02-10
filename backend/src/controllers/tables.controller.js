const { getDb } = require("../services/db.service");

exports.getTables = async (req, reply) => {
    return getDb().tables;
};

exports.getZones = async (req, reply) => {
    return getDb().zones;
};
