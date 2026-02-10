const { getDb, updateDb } = require("../services/db.service");

exports.getStaff = async (req, reply) => {
    return getDb().staff;
};

exports.createStaff = async (req, reply) => {
    const db = getDb();
    const newUser = { id: Date.now(), active: true, ...req.body };
    db.staff.push(newUser);
    updateDb(db);
    return newUser;
};

exports.login = async (req, reply) => {
    const { phone, pin } = req.body;
    const db = getDb();
    const user = db.staff.find(s => s.phone === phone && s.pin === pin && s.active);

    if (!user) {
        return reply.status(401).send({ success: false, error: "Credenciais inválidas" });
    }
    return { success: true, user: { id: user.id, name: user.name, role: user.role } };
};
