export const CATEGORIES = [
    { id: 'principales', name: 'Platos Principales', color: 'bg-emerald-600' },
    { id: 'entrantes', name: 'Entrantes', color: 'bg-blue-600' },
    { id: 'bebidas', name: 'Bebidas', color: 'bg-amber-600' },
    { id: 'postres', name: 'Postres', color: 'bg-rose-600' },
    { id: 'cafes', name: 'Cafés', color: 'bg-stone-600' },
];

export const PRODUCTS = {
    principales: [
        { id: 101, name: 'Menu Lunes', price: 12.00, category: 'principales' },
        { id: 102, name: 'Paella Valenciana', price: 15.50, category: 'principales' },
        { id: 103, name: 'Entrecot de Ternera', price: 18.00, category: 'principales' },
    ],
    entrantes: [
        { id: 201, name: 'Ensalada César', price: 8.50, category: 'entrantes' },
        { id: 202, name: 'Bravas El Trinche', price: 6.00, category: 'entrantes' },
        { id: 203, name: 'Croquetas de Jamón', price: 7.00, category: 'entrantes' },
    ],
    bebidas: [
        { id: 301, name: 'Caña de Cerveza', price: 2.50, category: 'bebidas' },
        { id: 302, name: 'Copa de Vino', price: 3.50, category: 'bebidas' },
        { id: 303, name: 'Refresco', price: 2.20, category: 'bebidas' },
        { id: 304, name: 'Agua 500ml', price: 1.50, category: 'bebidas' },
    ],
    postres: [
        { id: 401, name: 'Flan Casero', price: 4.50, category: 'postres' },
        { id: 402, name: 'Tarta de Queso', price: 5.50, category: 'postres' },
        { id: 403, name: 'Fruta del Tiempo', price: 3.50, category: 'postres' },
    ],
    cafes: [
        { id: 501, name: 'Café Solo', price: 1.20, category: 'cafes' },
        { id: 502, name: 'Café con Leche', price: 1.50, category: 'cafes' },
        { id: 503, name: 'Cortado', price: 1.30, category: 'cafes' },
    ],
};
