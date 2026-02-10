const { getDb, updateDb } = require("../services/db.service");

exports.getCurrentRegister = async (req, reply) => {
    const db = getDb();
    const open = db.cashRegisters.find(c => c.status === 'open');
    if (!open) return reply.status(404).send({ success: false, data: null });
    return { success: true, data: open };
};

exports.openRegister = async (req, reply) => {
    const db = getDb();
    const { userId, userName, initialAmount } = req.body;
    const newRegister = {
        id: Date.now(),
        userId,
        userName,
        openedAt: new Date().toISOString(),
        closedAt: null,
        initialAmount: parseFloat(initialAmount) || 0,
        finalAmount: null,
        sales: [],
        status: "open"
    };
    db.cashRegisters.push(newRegister);
    updateDb(db);
    return { success: true, register: newRegister };
};

exports.closeRegister = async (req, reply) => {
    const db = getDb();
    const { id, finalAmount } = req.body;
    const register = db.cashRegisters.find(c => c.id == id);
    if (!register) return { success: false, error: "Caixa não encontrado" };

    register.closedAt = new Date().toISOString();
    register.finalAmount = parseFloat(finalAmount) || 0;
    register.status = "closed";
    updateDb(db);
    return { success: true, register };
};

exports.listRegisters = async (req, reply) => {
    return getDb().cashRegisters;
};
