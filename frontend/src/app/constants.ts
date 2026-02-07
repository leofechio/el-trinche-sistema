export const CATEGORIES = [
    { id: "menu", name: "MENÚ DEL DÍA", color: "bg-pink-600" },
    { id: "hamburguesas", name: "HAMBURGUESAS Y TALLARINES", color: "bg-emerald-600" },
    { id: "carta", name: "A LA CARTA", color: "bg-indigo-600" },
    { id: "arroces", name: "ARROCES Y FIDEUA", color: "bg-orange-500" },
    { id: "raciones", name: "RACIONES", color: "bg-purple-600" },
    { id: "tortillas", name: "TORTILLAS (POR ENCARGO)", color: "bg-sky-500" },
    { id: "postre", name: "POSTRE", color: "bg-fuchsia-500" },
    { id: "bebidas", name: "BEBIDAS", color: "bg-lime-500" },
    { id: "chuches", name: "CHUCHES", color: "bg-rose-200" },
    { id: "cubiertos", name: "CUBIERTOS", color: "bg-teal-600" },
    { id: "bono", name: "BONO", color: "bg-violet-300" },
];

export const PRODUCTS = {
    menu: [
        { id: 101, name: "Medio Menu", price: 8.50 },
        { id: 102, name: "Menu Lunes", price: 12.00 },
        { id: 103, name: "Menu Martes", price: 12.00 },
        { id: 104, name: "Menu Miércoles", price: 12.00 },
        { id: 105, name: "Menu Jueves", price: 12.00 },
        { id: 106, name: "Menu Viernes", price: 12.00 },
    ],
    hamburguesas: [
        { id: 201, name: "Hamburguesa Buey", price: 10.50 },
        { id: 202, name: "Hamburguesa Pollo", price: 9.50 },
        { id: 203, name: "Tallarines Boloñesa", price: 8.50 },
        { id: 204, name: "Tallarines Carbonara", price: 8.50 },
    ],
    bebidas: [
        { id: 801, name: "Agua 500ml", price: 1.50 },
        { id: 802, name: "Coca Cola", price: 2.20 },
        { id: 803, name: "Cerveza Caña", price: 2.00 },
        { id: 804, name: "Cerveza Copa", price: 3.00 },
        { id: 805, name: "Vino Copa", price: 3.50 },
    ],
    raciones: [
        { id: 501, name: "Patatas Bravas", price: 6.00 },
        { id: 502, name: "Calamares Romana", price: 9.50 },
        { id: 503, name: "Croquetas Jamón", price: 8.00 },
        { id: 504, name: "Ensaladilla Rusa", price: 6.50 },
    ],
    // ... rest of products as needed
};
