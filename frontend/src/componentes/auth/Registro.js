import React, { useState } from 'react';
import Swal from 'sweetalert2';
import clienteAxios from '../../config/axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Registro() {
  const navigate = useNavigate();
  const [usuario, guardarUsuario] = useState({
    nombre: '',
    email: '',
    password: ''
  });

  const leerDatos = (e) => {
    guardarUsuario({
      ...usuario,
      [e.target.name]: e.target.value
    });
  };

  const registrarUsuario = async (e) => {
    e.preventDefault();
    try {
      const respuesta = await clienteAxios.post('/crear-cuenta', usuario);
      
      Swal.fire({
        icon: 'success',
        title: 'Cuenta creada',
        text: respuesta.data.mensaje,
        timer: 2000
      });

      navigate('/');
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.mensaje || 'Error al crear cuenta'
      });
    }
  };

  return (
    <div className='login'>
      <h2>Crear Cuenta</h2>

      <div className="contenedor-formulario">
        <form onSubmit={registrarUsuario}>
          <div className="campo">
            <label htmlFor='nombre'>Nombre</label>
            <input
              type="text"
              name="nombre"
              id='nombre'
              placeholder="Tu nombre completo"
              required
              onChange={leerDatos}
            />
          </div>
          <div className="campo">
            <label htmlFor='email'>Email</label>
            <input
              type="email"
              name="email"
              id='email'
              placeholder="Email para registrarte"
              required
              onChange={leerDatos}
            />
          </div>
          <div className="campo">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id='password'
              name="password"
              placeholder="Mínimo 6 caracteres"
              required
              onChange={leerDatos}
            />
          </div>

          <input type="submit" value="Registrarse" className="btn btn-verde btn-block" />
        </form>
        <p className="text-center">
          ¿Ya tienes cuenta? <Link to="/">Inicia Sesión</Link>
        </p>
      </div>
    </div>
  );
}