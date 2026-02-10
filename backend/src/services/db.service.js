const fs = require("fs");
const { DATA_FILE, DATA_DIR } = require("../config/constants");

// Initial DB State
const defaultDb = {
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

let db = { ...defaultDb };

// Socket Support
let io;
function setSocket(socketIo) { io = socketIo; }
function broadcastData() { if (io) io.emit("initial_data", db); }

function saveDB() {
    try {
        if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
        fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
        broadcastData();
    } catch (err) { console.error("Error saving DB:", err); }
}

function loadDB() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const data = fs.readFileSync(DATA_FILE, "utf-8");
            const loaded = JSON.parse(data);
            db = { ...db, ...loaded };
        } else {
            saveDB();
        }
    } catch (err) { console.error("Error loading DB:", err); }
}

// Initialize
loadDB();

module.exports = {
    getDb: () => db,
    saveDB,
    loadDB,
    updateDb: (newDb) => { db = newDb; saveDB(); },
    setSocket
};
