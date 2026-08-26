import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import clienteAxios from '../../config/axios';

export default function Producto({ producto, eliminarDeLista }) {
  const [loading, setLoading] = useState(false);

 
   const formatearPrecio = (precio) => {
    if (!precio && precio !== 0) return '$0.00';
    const numero = Number(precio);
    if (isNaN(numero)) return '$0.00';
    return `$${numero.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

 
  const getImagenUrl = (imagen) => {
    if (!imagen) return null;
    // Si ya es una URL completa (Cloudinary), la devuelve tal cual
    if (imagen.startsWith('http://') || imagen.startsWith('https://')) {
      return imagen;
    }
    // Si es un nombre de archivo local (para compatibilidad)
    return `http://localhost:5000/uploads/${imagen}`;
  };

  const eliminarProducto = (idProducto) => {
    const token = localStorage.getItem('token');

    if (!token) {
      Swal.fire({
        icon: 'error',
        title: 'No estás autenticado',
        text: 'Por favor, inicia sesión para realizar esta acción',
      });
      return;
    }

    Swal.fire({
      title: "¿Estás seguro?",
      text: "¡Esto es irreversible!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, borrar",
    }).then((result) => {
      if (result.isConfirmed) {
        setLoading(true);

        clienteAxios
          .delete(`/productos/${idProducto}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then((res) => {
            if (res.status === 200) {
              eliminarDeLista(idProducto);
              Swal.fire({
                title: "Producto eliminado",
                text: res.data.mensaje,
                icon: "success",
              });
            }
          })
          .catch((error) => {
            console.error("Error al eliminar el producto: ", error);
            Swal.fire({
              title: "Error",
              text: "Hubo un problema al eliminar el producto. Intenta nuevamente.",
              icon: "error",
            });
          })
          .finally(() => {
            setLoading(false);
          });
      }
    });
  };

  return (
    <li className="producto">
      <div className="info-producto">
        <p className="nombre">{producto.nombre}</p>
        <p className="precio">{formatearPrecio(producto.precio)}</p> {/*  Precio formateado */}
        {producto.imagen && (
          <img
            alt="imagen producto"
            src={getImagenUrl(producto.imagen)}
            style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'cover' }}
            onError={(e) => {
              e.target.style.display = 'none';
              const mensaje = document.createElement('p');
              mensaje.style.color = 'red';
              mensaje.textContent = '⚠️ Imagen no disponible';
              e.target.parentElement.appendChild(mensaje);
            }}
          />
        )}
      </div>
      <div className="acciones">
        <Link to={`/productos/editar/${producto._id}`} className="btn btn-azul">
          <i className="fas fa-pen-alt"></i>
          Editar Producto
        </Link>

        <button
          type="button"
          className="btn btn-rojo btn-eliminar"
          onClick={() => eliminarProducto(producto._id)}
          disabled={loading}
        >
          <i className="fas fa-times"></i>
          {loading ? "Eliminando..." : "Eliminar Producto"}
        </button>
      </div>
    </li>
  );
}