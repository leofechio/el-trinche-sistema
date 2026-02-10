const { getDb, updateDb } = require("../services/db.service");
const escpos = require('escpos');
escpos.Network = require('escpos-network');

exports.getPrinters = async (req, reply) => {
    return getDb().printers || [];
};

exports.createPrinter = async (req, reply) => {
    const db = getDb();
    const newPrinter = { id: Date.now(), ...req.body };
    db.printers.push(newPrinter);
    updateDb(db);
    return newPrinter;
};

exports.print = async (req, reply) => {
    const { printerIp, content } = req.body;
    if (!printerIp) return reply.status(400).send({ success: false, error: "IP da impressora é obrigatório" });

    return new Promise((resolve) => {
        try {
            const device = new escpos.Network(printerIp);
            const printer = new escpos.Printer(device);
            device.open((error) => {
                if (error) {
                    resolve({ success: false, error: "Erro de conexão: " + error.message });
                    return;
                }
                printer.font('a').align('ct').size(1, 1).text(content).feed(3).cut().close(() => {
                    resolve({ success: true });
                });
            });
        } catch (err) {
            resolve({ success: false, error: err.message });
        }
    });
};
