const fastify = require("fastify")({ logger: { transport: { target: "pino-pretty" } } });
const cors = require("@fastify/cors");
const socketio = require("socket.io");
const fs = require("fs");
const path = require("path");

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
  categories: [
    { id: "menu", name: "MENÚ DEL DÍA", color: "bg-rose-500", visible: true, available: true, interactive: true, subcategories: [] },
    { id: "hamburguesas", name: "HAMBURGUESAS", color: "bg-emerald-500", visible: true, available: true, interactive: true, subcategories: [] },
  ],
  products: [
    { id: 1, category: "menu", name: "Medio Menu", internalName: "1/2 Menu", price: 9.5, visible: true, available: true, interactive: true, allergens: ["gluten"], supplements: [] },
  ],
  printers: [],
  zones: [{ id: "principal", name: "Principal" }],
  tables: [{ id: 1, name: "1", x: 100, y: 100, zoneId: "principal", status: "available", type: "square", capacity: 4 }],
  settings: { restaurant: { name: "El Trinche", phone: "600752593" } }
};

let db = { ...defaultData };

// --- Persistence ---
function loadDB() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DATA_FILE)) {
        try {
            const fileData = fs.readFileSync(DATA_FILE, "utf8");
            const parsed = JSON.parse(fileData);
            db = { ...defaultData, ...parsed }; 
            if (!Array.isArray(db.staff)) db.staff = defaultData.staff;
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

// HTTP Routes
fastify.get("/api/staff", async () => db.staff);

fastify.post("/api/staff", async (request, reply) => {
  const newUser = { 
    id: Date.now(), 
    name: request.body.name || "Novo", 
    apellidos: request.body.apellidos || "",
    phone: request.body.phone || "", 
    pin: request.body.pin || "0000",
    role: request.body.role || "Camarero",
    active: true 
  };
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

// Other APIs
fastify.get("/api/orders", async () => db.orders);
fastify.get("/api/categories", async () => db.categories);
fastify.get("/api/products", async () => db.products);
fastify.get("/api/tables", async () => db.tables);
fastify.get("/api/zones", async () => db.zones);
fastify.get("/api/settings", async () => db.settings);

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
