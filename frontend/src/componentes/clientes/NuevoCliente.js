import React, { useState, useContext, useEffect } from 'react';
import clienteAxios from '../../config/axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { CRMContext } from '../../context/CRMContext';

function NuevoCliente(props) {
  const [auth, guardarAuth] = useContext(CRMContext);
  let navigate = useNavigate();

  // Verificar si está autenticado
  useEffect(() => {
    if (!auth.auth && !localStorage.getItem('token')) {
      navigate('/iniciar-sesion', { replace: true });
    }
  }, [auth, navigate]);


  const [cliente, guardarCliente] = useState({
    nombre: '',
    empresa: '',
    email: '',
    telefono: ''
  });

  const actualizarState = (e) => {
    guardarCliente({
      ...cliente,
      [e.target.name]: e.target.value
    });
  };

  const agregarCliente = (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');

   
    const datosParaEnviar = {
      nombre: cliente.nombre,
      email: cliente.email,
      telefono: cliente.telefono,
      empresa: cliente.empresa
    };

    clienteAxios
      .post('/clientes', datosParaEnviar, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })
      .then((res) => {
        if (res.data.code === 11000) {
          Swal.fire({
            icon: 'error',
            title: 'Ya existe este cliente!',
            text: 'El email ya está registrado',
            showConfirmButton: false,
            timer: 1500
          });
        } else {
          Swal.fire({
            position: 'center',
            icon: 'success',
            title: 'Se agregó el cliente',
            showConfirmButton: false,
            timer: 1500
          });
          navigate('/', { replace: true });
        }
      })
      .catch((error) => {
        console.error('Error al agregar cliente:', error);
        
        let mensajeError = 'No se pudo agregar el cliente. Por favor, intente nuevamente.';
        if (error.response?.data?.mensaje) {
          mensajeError = error.response.data.mensaje;
        }
        
        Swal.fire({
          icon: 'error',
          title: 'Error al agregar cliente',
          text: mensajeError,
        });
      });
  };


  const validarCliente = () => {
    const { nombre, email, empresa, telefono } = cliente;
    return !nombre?.length || !email?.length || !empresa?.length || !telefono?.length;
  };

  return (
    <>
      <h2>Nuevo cliente</h2>
      <form onSubmit={agregarCliente}>
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
            value="Agregar Cliente" 
            disabled={validarCliente()} 
          />
        </div>
      </form>
    </>
  );
}

export default NuevoCliente;