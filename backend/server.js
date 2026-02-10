const fastify = require("fastify")({ logger: { transport: { target: "pino-pretty" } } });
const cors = require("@fastify/cors");
const socketio = require("socket.io");
const fs = require("fs");
const path = require("path");
const fastifyStatic = require("@fastify/static");
const escpos = require('escpos');
escpos.Network = require('escpos-network');

fastify.register(cors);

// Serve Product Photos
const UPLOADS_DIR = path.join(__dirname, "data/uploads");
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

fastify.register(fastifyStatic, {
    root: UPLOADS_DIR,
    prefix: "/eltrinche/uploads/",
    decorateReply: false
});

const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "db.json");

let db = {
    staff: [
        { id: 1, name: "Admin", role: "admin", phone: "684165307", pin: "1111", active: true },
        { id: 2, name: "Garçom", role: "waiter", phone: "600500400", pin: "2222", active: true }
    ],
    orders: [],
    products: [
        { id: 101, name: 'Menu Lunes', price: 12.00, category: 'principales', visible: true, available: true },
        { id: 102, name: 'Paella Valenciana', price: 15.50, category: 'principales', visible: true, available: true },
        { id: 103, name: 'Cerveza Alhambra', price: 3.50, category: 'bebidas', visible: true, available: true }
    ],
    categories: [
        { id: 'principales', name: 'Platos Principales', color: 'bg-emerald-600' },
        { id: 'bebidas', name: 'Bebidas', color: 'bg-amber-600' }
    ],
    printers: [{ id: 1, name: "Cozinha", ip: "192.168.1.100", type: "thermal" }],
    zones: [{ id: 1, name: "Salão Principal" }],
    tables: [
        { id: 1, number: "1", zoneId: 1 },
        { id: 2, number: "2", zoneId: 1 },
        { id: 3, number: "3", zoneId: 1 },
        { id: 4, number: "4", zoneId: 1 }
    ],
    settings: { restaurantName: "El Trinche POS" },
    cashRegisters: []
};

function saveDB() {
    try {
        if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
        fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
    } catch (err) { console.error("Error saving DB:", err); }
}

function loadDB() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const data = fs.readFileSync(DATA_FILE, "utf-8");
            db = JSON.parse(data);
        } else {
            saveDB();
        }
    } catch (err) { console.error("Error loading DB:", err); }
}

loadDB();
let io;
function broadcastInitialData() { if (io) io.emit("initial_data", db); }

// ============ STAFF API ============
fastify.get("/eltrinche/api/staff", async () => db.staff);
fastify.post("/eltrinche/api/staff", async (request) => {
    const newUser = { id: Date.now(), active: true, ...request.body };
    db.staff.push(newUser);
    saveDB();
    broadcastInitialData();
    return newUser;
});

// ============ CATEGORIES ============
fastify.get("/eltrinche/api/categories", async () => db.categories || []);
fastify.post("/eltrinche/api/categories", async (request) => {
    const newCat = { id: Date.now().toString(), ...request.body };
    db.categories.push(newCat);
    saveDB();
    broadcastInitialData();
    return newCat;
});
fastify.delete("/eltrinche/api/categories/:id", async (request) => {
    db.categories = db.categories.filter(c => c.id != request.params.id);
    saveDB();
    broadcastInitialData();
    return { success: true };
});

// ============ PRODUCTS ============
fastify.get("/eltrinche/api/products", async () => db.products || []);
fastify.post("/eltrinche/api/products", async (request) => {
    const newProd = { id: Date.now(), ...request.body };
    db.products.push(newProd);
    saveDB();
    broadcastInitialData();
    return newProd;
});

// ============ LOGIN API ============
fastify.post("/eltrinche/api/login", async (request, reply) => {
    const { phone, pin } = request.body;
    const user = db.staff.find(s => s.phone === phone && s.pin === pin && s.active);
    if (!user) return reply.status(401).send({ success: false, error: "Credenciais inválidas" });
    return { success: true, user: { id: user.id, name: user.name, role: user.role } };
});

// ============ CASH REGISTER ============
fastify.get("/eltrinche/api/cash-registers/current", async (request, reply) => {
    const open = db.cashRegisters.find(c => c.status === 'open');
    if (!open) return reply.status(404).send({ success: false, data: null });
    return { success: true, data: open };
});

fastify.post("/eltrinche/api/cash-registers/open", async (request) => {
    const { userId, userName, initialAmount } = request.body;
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
    saveDB();
    broadcastInitialData();
    return { success: true, register: newRegister };
});

fastify.post("/eltrinche/api/cash-registers/close", async (request) => {
    const { id, finalAmount } = request.body;
    const register = db.cashRegisters.find(c => c.id == id);
    if (!register) return { success: false, error: "Caixa não encontrado" };

    register.closedAt = new Date().toISOString();
    register.finalAmount = parseFloat(finalAmount) || 0;
    register.status = "closed";
    saveDB();
    broadcastInitialData();
    return { success: true, register };
});

fastify.get("/eltrinche/api/cash-registers", async () => db.cashRegisters);

// ============ ORDERS API ============
fastify.get("/eltrinche/api/orders", async () => db.orders);

fastify.post("/eltrinche/api/orders", async (request) => {
    const newOrder = {
        id: Date.now(),
        createdAt: new Date().toISOString(),
        status: 'pendente',
        ...request.body
    };
    db.orders.push(newOrder);
    saveDB();
    broadcastInitialData();
    return newOrder;
});

fastify.post("/eltrinche/api/orders/:id/pay", async (request, reply) => {
    const { id } = request.params;
    const { paymentMethod, amount } = request.body;

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

    saveDB();
    broadcastInitialData();
    return { success: true };
});

// ============ PRINTING API ============
fastify.get("/eltrinche/api/printers", async () => db.printers || []);
fastify.post("/eltrinche/api/printers", async (request) => {
    const newPrinter = { id: Date.now(), ...request.body };
    db.printers.push(newPrinter);
    saveDB();
    broadcastInitialData();
    return newPrinter;
});

fastify.post("/eltrinche/api/print", async (request, reply) => {
    const { printerIp, content } = request.body;
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
});

// ============ TABLES & ZONES ============
fastify.get("/eltrinche/api/tables", async () => db.tables);
fastify.get("/eltrinche/api/zones", async () => db.zones);

// Fallback to 404 for API, everything else is handled by frontend proxy usually
fastify.setNotFoundHandler((request, reply) => {
    if (request.url.startsWith("/eltrinche/api/")) {
        return reply.status(404).send({ error: "API route not found" });
    }
    return reply.status(404).send("Not found");
});

const start = async () => {
    try {
        const port = process.env.PORT || 4000;
        await fastify.listen({ port, host: "0.0.0.0" });
        io = socketio(fastify.server, { path: "/eltrinche/socket.io", cors: { origin: "*" } });
        io.on("connection", (socket) => { socket.emit("initial_data", db); });
        console.log(`Master Server listening on ${port}`);
    } catch (err) { console.error(err); process.exit(1); }
};
start();
