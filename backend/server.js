const fastify = require("fastify")({ logger: { transport: { target: "pino-pretty" } } });
const cors = require("@fastify/cors");
const socketio = require("socket.io");
const fs = require("fs");
const path = require("path");
const escpos = require('escpos');
escpos.Network = require('escpos-network');

fastify.register(cors);

const DATA_FILE = "/app/data/db.json";
const DATA_DIR = "/app/data";

// --- Default Data ---
const defaultData = {
  staff: [
    { id: 1, name: "Admin", apellidos: "Juan", phone: "684165307", pin: "1111", role: "Administrador", active: true },
    { id: 2, name: "Maria", apellidos: "Camarera", phone: "600500400", pin: "2222", role: "Camarero", active: true },
  ],
  orders: [],
  categories: [],
  products: [],
  printers: [],
  zones: [],
  tables: [],
  settings: {
    restaurant: { name: "El Trinche", phone: "600752593" }
  }
};

let db = { ...defaultData };

function loadDB() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DATA_FILE)) {
        try {
            const fileData = fs.readFileSync(DATA_FILE, "utf8");
            const parsed = JSON.parse(fileData);
            db = { ...defaultData, ...parsed }; 
        } catch (err) {
            console.error("Error loading DB:", err);
        }
    } else {
        saveDB();
    }
}

function saveDB() {
    try {
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
        }
        fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
    } catch (err) {
        console.error("Error saving DB:", err);
    }
}

loadDB();

let io;

function broadcastInitialData() {
  if (io) io.emit("initial_data", db);
}

// Staff API
fastify.get("/api/staff", async () => db.staff);

fastify.post("/api/staff", async (request) => {
  const newUser = { id: Date.now(), active: true, ...request.body };
  db.staff.push(newUser);
  saveDB();
  broadcastInitialData();
  return newUser;
});

fastify.put("/api/staff/:id", async (request) => {
  const { id } = request.params;
  db.staff = db.staff.map(s => s.id == id ? { ...s, ...request.body } : s);
  saveDB();
  broadcastInitialData();
  return db.staff.find(s => s.id == id);
});

fastify.delete("/api/staff/:id", async (request) => {
  const { id } = request.params;
  db.staff = db.staff.filter(s => s.id != id);
  saveDB();
  broadcastInitialData();
  return { success: true };
});

// Printers API
fastify.get("/api/printers", async () => db.printers || []);
fastify.post("/api/printers", async (request) => {
    const newPrinter = { id: Date.now(), ...request.body };
    if (!db.printers) db.printers = [];
    db.printers.push(newPrinter);
    saveDB();
    broadcastInitialData();
    return newPrinter;
});
fastify.delete("/api/printers/:id", async (request) => {
    const { id } = request.params;
    db.printers = db.printers.filter(p => p.id != id);
    saveDB();
    broadcastInitialData();
    return { success: true };
});

// Other APIs
fastify.get("/api/orders", async () => db.orders);
fastify.get("/api/categories", async () => db.categories);
fastify.get("/api/products", async () => db.products);
fastify.get("/api/tables", async () => db.tables);
fastify.get("/api/zones", async () => db.zones);
fastify.get("/api/settings", async () => db.settings);

// Real Print Implementation
fastify.post("/api/print", async (request, reply) => {
    const { printerIp, content } = request.body;
    console.log("Attempting to print to:", printerIp);
    
    if (!printerIp) {
        return reply.status(400).send({ success: false, error: "Printer IP is required" });
    }

    return new Promise((resolve) => {
        try {
            const device = new escpos.Network(printerIp);
            const printer = new escpos.Printer(device);

            device.open((error) => {
                if (error) {
                    console.error("Printer connection error:", error);
                    resolve({ success: false, error: "No se pudo conectar con la impresora: " + error.message });
                    return;
                }
                
                printer
                    .font('a')
                    .align('ct')
                    .size(1, 1)
                    .text(content)
                    .feed(3)
                    .cut()
                    .close(() => {
                        console.log("Print job completed successfully");
                        resolve({ success: true });
                    });
            });
        } catch (err) {
            console.error("Print logic error:", err);
            resolve({ success: false, error: err.message });
        }
    });
});

const start = async () => {
  try {
    const port = process.env.PORT || 4000;
    await fastify.listen({ port, host: "0.0.0.0" });
    io = socketio(fastify.server, { cors: { origin: "*" } });
    io.on("connection", (socket) => {
      socket.emit("initial_data", db);
    });
    fastify.log.info(`Backend listening on ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
