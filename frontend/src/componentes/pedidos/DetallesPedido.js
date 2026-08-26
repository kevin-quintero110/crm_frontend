import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import clienteAxios from '../../config/axios';
import { formatearPrecio } from '../../helpers/formatearPrecio'; 

export default function DetallesPedido({ pedido, eliminarPedido }) {
  const [loading, setLoading] = useState(false);
  const [clienteData, setClienteData] = useState(null);
  const [cargandoCliente, setCargandoCliente] = useState(false);

  useEffect(() => {
    const obtenerCliente = async () => {
      if (pedido.cliente && typeof pedido.cliente === 'object' && pedido.cliente.nombre) {
        setClienteData(pedido.cliente);
        return;
      }

      if (pedido.cliente_id && typeof pedido.cliente_id === 'number') {
        try {
          setCargandoCliente(true);
          const token = localStorage.getItem('token');

          if (!token) {
            setClienteData({ nombre: 'Cliente sin autenticación', apellido: '' });
            return;
          }

          const response = await clienteAxios.get(`/clientes/${pedido.cliente_id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          console.log('Respuesta completa de la API:', response.data);

          // Extraemos el cliente correctamente
          if (response.data) {
            // Si la respuesta tiene una propiedad "cliente"
            if (response.data.cliente) {
              setClienteData(response.data.cliente);
            } 
            // Si la respuesta ES el cliente directamente
            else if (response.data._id || response.data.nombre) {
              setClienteData(response.data);
            } 
            else {
              setClienteData({ nombre: 'Cliente sin datos', apellido: '' });
            }
          } else {
            setClienteData({ nombre: 'Cliente sin datos', apellido: '' });
          }
        } catch (error) {
          console.error('Error al obtener los datos del cliente:', error);
          
          let nombreError = 'Cliente no disponible';
          if (error.response?.status === 404) {
            nombreError = 'Cliente no encontrado';
          } else if (error.response?.status === 403) {
            nombreError = 'Sin permiso para ver el cliente';
          } else if (error.response?.status === 401) {
            nombreError = 'Sesión expirada';
          }
          
          setClienteData({ nombre: nombreError, apellido: '' });
        } finally {
          setCargandoCliente(false);
        }
        return;
      }

      setClienteData({ nombre: 'Pedido sin cliente', apellido: '' });
    };

    obtenerCliente();
  }, [pedido.cliente_id]);

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

  const obtenerNombreCliente = () => {
    if (clienteData) {
      return `${clienteData.nombre || ''} ${clienteData.apellido || ''}`.trim() || 'Cliente sin nombre';
    }
    
    if (pedido.cliente && typeof pedido.cliente === 'object' && pedido.cliente.nombre) {
      return `${pedido.cliente.nombre || ''} ${pedido.cliente.apellido || ''}`.trim() || 'Cliente sin nombre';
    }
    
    if (cargandoCliente) {
      return 'Cargando cliente...';
    }
    
    return 'Cliente no disponible';
  };

  return (
    <li className="pedido">
      <div className="info-pedido">
        <p className="id">ID: {pedido._id}</p>
        <p className="nombre">
          Cliente: {obtenerNombreCliente()}
        </p>
        
        {/*  ETIQUETA DE NOTIFICADO */}
        <p className="notificado" style={{ margin: '5px 0' }}>
          {pedido.notificado ? (
            <span style={{ 
              backgroundColor: '#d4edda', 
              color: '#155724', 
              padding: '4px 12px', 
              borderRadius: '20px',
              fontWeight: 'bold',
              display: 'inline-block',
              fontSize: '14px'
            }}>
              ☄️ Notificado y Confirmado
            </span>
          ) : (
            <span style={{ 
              backgroundColor: '#fff3cd', 
              color: '#856404', 
              padding: '4px 12px', 
              borderRadius: '20px',
              fontWeight: 'bold',
              display: 'inline-block',
              fontSize: '14px'
            }}>
              ⏳ Pendiente Confirmacion
            </span>
          )}
        </p>

        <div className="articulos-pedido">
          <p className="productos">Artículos del Pedido:</p>
          <ul>
            {pedido.items?.map((articulos, index) => (
              <li key={`${pedido._id}-${articulos.producto?._id || index}`}>
                <p>{articulos.producto?.nombre || 'Producto no disponible'}</p>
                <p>Precio: {formatearPrecio(articulos.producto?.precio)}</p>
                <p>Cantidad: {articulos.cantidad || '0'}</p>
              </li>
            ))}
          </ul>
        </div>
        <p className="total">Total: {formatearPrecio(pedido.total)}</p>
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