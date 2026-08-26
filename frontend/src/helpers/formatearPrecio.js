// src/helpers/formatearPrecio.js

export const formatearPrecio = (precio) => {
    if (!precio && precio !== 0) return '$0.00';
    const numero = Number(precio);
    if (isNaN(numero)) return '$0.00';
    return `$${numero.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};