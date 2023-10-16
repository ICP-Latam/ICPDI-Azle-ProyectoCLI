import { Canister, query, text, update, Void } from 'azle';

class Producto {
    nombre: string;
    precio: number;
    cantidad: number;

    constructor(nombre: string, precio: number, cantidad: number = 20) {
        this.nombre = nombre;
        this.precio = precio;
        this.cantidad = cantidad;
    }
}

let inventario: Producto[] = [];
let carrito: Producto[] = [];

export default Canister({
    agregarProducto: update([text, text, text], Void, (nombre, precio, cantidad) => {
        let producto = new Producto(nombre, Number(precio), Number(cantidad));
        inventario.push(producto);
    }),
    comprarProducto: update([text, text], text, (nombre, cantidad) => {
        let producto = inventario.find(p => p.nombre === nombre);
        if (producto && producto.cantidad >= Number(cantidad)) {
            producto.cantidad -= Number(cantidad);
            let productoComprado = new Producto(producto.nombre, producto.precio, Number(cantidad));
            carrito.push(productoComprado);
            return "Producto agregado al carrito.";
        } else {
            return "El producto no está en existencia.";
        }
    }),
    finalizarCompra: update([], text, () => {
        let total = 0;
        let resumenCompra = '';
        carrito.forEach(producto => {
            resumenCompra += `Compraste ${producto.cantidad} ${producto.nombre} por $${producto.precio * producto.cantidad}\n`;
            total += producto.precio * producto.cantidad;
        });
        resumenCompra += `Total a pagar: $${total}`;
        carrito = []; // Vaciamos el carrito
        return resumenCompra;
    }),
    getInventario: query([], text, () => {
        return JSON.stringify(inventario);
    }),
    getCarrito: query([], text, () => {
        if (carrito.length === 0) {
            return "Ya no se encuentra en existencia.";
        } else {
            return JSON.stringify(carrito);
        }
    })
});
