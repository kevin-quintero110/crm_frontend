import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import clienteAxios from '../../config/axios';
import Swal from 'sweetalert2';
import { CRMContext } from '../../context/CRMContext';

function EditarCliente() {
  const { id } = useParams(); 
  const [auth, guardarAuth] = useContext(CRMContext);
  let navigate = useNavigate();

  const [cliente, datosCliente] = useState({
    id: '', 
    nombre: '',
    empresa: '',
    email: '',
    telefono: ''
  });

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!auth.auth && !localStorage.getItem('token')) {
      navigate('/iniciar-sesion', { replace: true });
      return;
    }

    const consultarAPI = async () => {
      const token = localStorage.getItem('token');
      try {
        setCargando(true);
        setError(null);
        
      
        const clienteConsulta = await clienteAxios.get(`clientes/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        console.log('Cliente obtenido:', clienteConsulta.data); 

        if (clienteConsulta.data) {
  
          datosCliente({
            id: clienteConsulta.data.id || id, 
            nombre: clienteConsulta.data.nombre || '',
            empresa: clienteConsulta.data.empresa || '',
            email: clienteConsulta.data.email || '',
            telefono: clienteConsulta.data.telefono || ''
          });
        }
      } catch (error) {
        console.error("Error al consultar el cliente:", error);
        setError('Error al cargar el cliente');
        Swal.fire({
          icon: 'error',
          title: 'Error al obtener el cliente',
          text: error.response?.data?.mensaje || 'Por favor, intente nuevamente.',
        });
        navigate('/');
      } finally {
        setCargando(false);
      }
    };
    
    if (id) {
      consultarAPI();
    } else {
      setError('ID de cliente no válido');
      setCargando(false);
    }
  }, [id, navigate, auth]);

  const actualizarState = e => {
    datosCliente({
      ...cliente,
      [e.target.name]: e.target.value
    });
  };

  const actualizarCliente = async e => {
    e.preventDefault();
    
   
    if (!cliente.id) {
      console.error('Cliente sin ID:', cliente); 
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se encontró el ID del cliente. Por favor, recarga la página.',
      });
      return;
    }

    const token = localStorage.getItem('token');
    
    try {
      const datosParaEnviar = {
        nombre: cliente.nombre,
        email: cliente.email,
        telefono: cliente.telefono,
        empresa: cliente.empresa
      };

      console.log('Enviando PUT a:', `/clientes/${cliente.id}`, datosParaEnviar);

      const res = await clienteAxios.put(`/clientes/${cliente.id}`, datosParaEnviar, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'Cliente actualizado correctamente',
        showConfirmButton: false,
        timer: 1500
      });
      
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error al actualizar:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error al actualizar el cliente',
        text: error.response?.data?.mensaje || 'No se pudo actualizar. Intente nuevamente.',
      });
    }
  };

  const validarCliente = () => {
    if (!cliente) return true;
    
    const nombre = cliente.nombre || '';
    const email = cliente.email || '';
    const empresa = cliente.empresa || '';
    const telefono = cliente.telefono || '';
    
    return nombre.trim() === '' || 
           email.trim() === '' || 
           empresa.trim() === '' || 
           telefono.trim() === '';
  };

  if (cargando) {
    return <div className="cargando">Cargando cliente...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <>
      <h2>Editar Cliente</h2>
      <form onSubmit={actualizarCliente}>
        <legend>Llena todos los campos</legend>

        <div className="campo">
          <label>Nombre:</label>
          <input
            type="text"
            placeholder="Nombre Cliente"
            name="nombre"
            onChange={actualizarState}
            value={cliente.nombre || ''}
          />
        </div>

        <div className="campo">
          <label>Empresa:</label>
          <input
            type="text"
            placeholder="Empresa Cliente"
            name="empresa"
            onChange={actualizarState}
            value={cliente.empresa || ''}
          />
        </div>

        <div className="campo">
          <label>Email:</label>
          <input
            type="email"
            placeholder="Email Cliente"
            name="email"
            onChange={actualizarState}
            value={cliente.email || ''}
          />
        </div>

        <div className="campo">
          <label>Teléfono:</label>
          <input
            type="tel"
            placeholder="Teléfono Cliente"
            name="telefono"
            onChange={actualizarState}
            value={cliente.telefono || ''}
          />
        </div>

        <div className="enviar">
          <input
            type="submit"
            className="btn btn-azul"
            value="Guardar cambios del Cliente"
            disabled={validarCliente()}
          />
        </div>
      </form>
    </>
  );
}

export default EditarCliente;