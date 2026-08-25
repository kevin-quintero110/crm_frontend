import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import clienteAxios from '../../config/axios';

export default function DetallesPedido({ pedido, eliminarPedido }) {
  const [loading, setLoading] = useState(false);
  const [clienteData, setClienteData] = useState(null);
  const [cargandoCliente, setCargandoCliente] = useState(false);

  // Obtener datos del cliente si solo tenemos el ID
  useEffect(() => {
    const obtenerCliente = async () => {
      // Si ya tenemos los datos del cliente en el pedido, no hacemos nada
      if (pedido.cliente && typeof pedido.cliente === 'object' && pedido.cliente.nombre) {
        setClienteData(pedido.cliente);
        return;
      }

      // Si solo tenemos el ID del cliente, lo obtenemos de la API
      if (pedido.cliente && typeof pedido.cliente === 'string') {
        try {
          setCargandoCliente(true);
          const token = localStorage.getItem('token');
          
          if (!token) {
            console.error('No hay token disponible');
            return;
          }

          const response = await clienteAxios.get(`/clientes/${pedido.cliente}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.data && response.data.cliente) {
            setClienteData(response.data.cliente);
          }
        } catch (error) {
          console.error('Error al obtener los datos del cliente:', error);
          // Mostrar un mensaje amigable en la UI
          setClienteData({ 
            nombre: 'Cliente no disponible', 
            apellido: '' 
          });
        } finally {
          setCargandoCliente(false);
        }
      }
    };

    obtenerCliente();
  }, [pedido.cliente]);

  const eliminarPedidoAPI = (idPedido) => {
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
      title: '¿Estás seguro?',
      text: '¡Esto eliminará el pedido de forma permanente!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, borrar',
    }).then((result) => {
      if (result.isConfirmed) {
        setLoading(true);

        clienteAxios
          .delete(`/pedidos/${idPedido}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then((res) => {
            if (res.status === 200) {
              eliminarPedido(idPedido);
              Swal.fire({
                title: 'Pedido eliminado',
                text: res.data.mensaje || 'El pedido ha sido eliminado correctamente',
                icon: 'success',
              });
            }
          })
          .catch((error) => {
            console.error('Error al eliminar el pedido:', error);
            
            // Manejar errores específicos
            let mensajeError = 'Hubo un problema al eliminar el pedido. Intenta nuevamente.';
            if (error.response && error.response.status === 404) {
              mensajeError = 'El pedido que intentas eliminar ya no existe.';
            } else if (error.response && error.response.status === 403) {
              mensajeError = 'No tienes permiso para eliminar este pedido.';
            }
            
            Swal.fire({
              title: 'Error',
              text: mensajeError,
              icon: 'error',
            });
          })
          .finally(() => {
            setLoading(false);
          });
      }
    });
  };

  // Función para obtener el nombre completo del cliente
  const obtenerNombreCliente = () => {
    // Si tenemos los datos del cliente (ya sea del pedido o de la API)
    if (clienteData) {
      return `${clienteData.nombre || ''} ${clienteData.apellido || ''}`.trim() || 'Cliente sin nombre';
    }
    
    // Si el pedido ya tiene los datos del cliente
    if (pedido.cliente && typeof pedido.cliente === 'object' && pedido.cliente.nombre) {
      return `${pedido.cliente.nombre || ''} ${pedido.cliente.apellido || ''}`.trim() || 'Cliente sin nombre';
    }
    
    // Si está cargando
    if (cargandoCliente) {
      return 'Cargando cliente...';
    }
    
    // Si no hay datos
    return 'Cliente no disponible';
  };

  return (
    <li className="pedido">
      <div className="info-pedido">
        <p className="id">ID: {pedido._id}</p>
        <p className="nombre">
          Cliente: {obtenerNombreCliente()}
        </p>
        <div className="articulos-pedido">
          <p className="productos">Artículos del Pedido:</p>
          <ul>
            {pedido.items?.map((articulos, index) => (
              <li key={`${pedido._id}-${articulos.producto?._id || index}`}>
                <p>{articulos.producto?.nombre || 'Producto no disponible'}</p>
                <p>Precio: ${articulos.producto?.precio || '0'}</p>
                <p>Cantidad: {articulos.cantidad || '0'}</p>
              </li>
            ))}
          </ul>
        </div>
        <p className="total">Total: ${pedido.total || 'Total no disponible'}</p>
      </div>
      <div className="acciones">
        <button
          type="button"
          className="btn btn-rojo btn-eliminar"
          onClick={() => eliminarPedidoAPI(pedido._id)}
          disabled={loading}
        >
          <i className="fas fa-times"></i>
          {loading ? 'Eliminando...' : 'Eliminar Pedido'}
        </button>
      </div>
    </li>
  );
}