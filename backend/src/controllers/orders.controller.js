const { getDb, updateDb } = require("../services/db.service");

exports.getOrders = async (req, reply) => {
    return getDb().orders;
};

exports.createOrder = async (req, reply) => {
    const db = getDb();
    const newOrder = {
        id: Date.now(),
        createdAt: new Date().toISOString(),
        status: 'pendente',
        ...req.body
    };
    db.orders.push(newOrder);
    updateDb(db);
    return newOrder;
};

exports.payOrder = async (req, reply) => {
    const db = getDb();
    const { id } = req.params;
    const { paymentMethod, amount } = req.body;

    const orderIndex = db.orders.findIndex(o => o.id == id);
    if (orderIndex === -1) return reply.status(404).send({ success: false, error: "Pedido não encontrado" });

    db.orders[orderIndex].status = "pago";
    db.orders[orderIndex].paymentMethod = paymentMethod;
    db.orders[orderIndex].paidAt = new Date().toISOString();

    // Add to current open cash register
    const openRegister = db.cashRegisters.find(c => c.status === 'open');
    if (openRegister) {
        if (!openRegister.sales) openRegister.sales = [];
        openRegister.sales.push({
            orderId: id,
            amount: amount,
            method: paymentMethod,
            timestamp: new Date().toISOString()
        });
    }

    updateDb(db);
    return { success: true };
};
