import React, { useState, useContext, useEffect } from 'react';
import Swal from 'sweetalert2';
import clienteAxios from '../../config/axios';
import { useNavigate } from 'react-router-dom';
import { CRMContext } from '../../context/CRMContext';

function NuevoProducto() {
  const [auth, guardarAuth] = useContext(CRMContext);
  let navigate = useNavigate();

  // Verificar si está autenticado
  useEffect(() => {
    if (!auth.auth || !auth.token) {
      Swal.fire({
        icon: 'error',
        title: 'No autenticado',
        text: 'Debes iniciar sesión para agregar productos.',
      });
      navigate('/iniciar-sesion', { replace: true });
    }
  }, [auth, navigate]);

  const [producto, guardarProducto] = useState({
    nombre: '',
    precio: '',
    imagen: ''
  });

  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [imagenSeleccionada, setImagenSeleccionada] = useState(null);

  const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'bq5dbhkd';
  const uploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || 'crm_uploads';

  const subirImagenACloudinary = async (archivo) => {
    if (!archivo) return null;
    
    setSubiendoImagen(true);
    
    const formData = new FormData();
    formData.append('file', archivo);
    formData.append('upload_preset', uploadPreset);

    try {
      const respuesta = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData
      });

      const datos = await respuesta.json();
      
      if (datos.secure_url) {
        guardarProducto(prev => ({
          ...prev,
          imagen: datos.secure_url
        }));
        
        Swal.fire({
          icon: 'success',
          title: '✅ Imagen subida',
          timer: 1000,
          showConfirmButton: false
        });
        
        return datos.secure_url;
      } else {
        throw new Error(datos.error?.message || 'No se pudo subir la imagen');
      }
    } catch (error) {
      console.error('Error al subir imagen:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error al subir imagen',
        text: error.message || 'Intenta nuevamente'
      });
      return null;
    } finally {
      setSubiendoImagen(false);
    }
  };

  const actualizarState = (e) => {
    guardarProducto({
      ...producto,
      [e.target.name]: e.target.value,
    });
  };

  const leerArchivo = async (e) => {
    const archivo = e.target.files[0];
    if (archivo) {
      setImagenSeleccionada(archivo);
      await subirImagenACloudinary(archivo);
    }
  };

  const agregarProducto = async (e) => {
    e.preventDefault();

    if (!producto.imagen) {
      Swal.fire({
        icon: 'error',
        title: 'Imagen requerida',
        text: 'Debes seleccionar y esperar que la imagen se suba correctamente.',
      });
      return;
    }

    try {
      const res = await clienteAxios.post('/productos', {
        nombre: producto.nombre,
        precio: Number(producto.precio),
        imagen: producto.imagen
      }, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });

      if (res.status === 200) {
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Se agregó correctamente',
          showConfirmButton: false,
          timer: 1500,
        });
      }

      navigate('/productos', { replace: true });
    } catch (error) {
      console.error('Error al agregar producto:', error);
      Swal.fire({
        icon: 'error',
        title: 'Hubo un error',
        text: error.response?.data?.mensaje || 'Vuelve a intentarlo',
      });
    }
  };

  const validarProducto = () => {
    return !producto.nombre.trim() || 
           !producto.precio || 
           !producto.imagen || 
           subiendoImagen;
  };

  return (
    <>
      <h2>Nuevo Producto</h2>

      <form onSubmit={agregarProducto}>
        <legend>Llena todos los campos</legend>

        <div className="campo">
          <label>Nombre:</label>
          <input
            type="text"
            placeholder="Nombre Producto"
            name="nombre"
            onChange={actualizarState}
            value={producto.nombre || ''}
            required
          />
        </div>

        <div className="campo">
          <label>Precio:</label>
          <input
            type="number"
            name="precio"
            min="0.00"
            step="0.01" 
            placeholder="Precio"
            onChange={actualizarState}
            value={producto.precio || ''}
            required
          />
        </div>

        <div className="campo">
          <label>Imagen:</label>
          
          {producto.imagen && (
            <div style={{ marginBottom: '10px' }}>
              <p>Imagen seleccionada:</p>
              <img 
                src={producto.imagen} 
                alt="Producto" 
                width="200"
                style={{ 
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  padding: '5px'
                }}
              />
            </div>
          )}

          <input
            type="file"
            name="imagen"
            onChange={leerArchivo}
            accept="image/jpeg,image/png,image/jpg,image/webp"
            disabled={subiendoImagen}
          />
          
          {subiendoImagen && (
            <p style={{ color: '#007bff' }}>⏳ Subiendo imagen a Cloudinary...</p>
          )}
          
          {imagenSeleccionada && !subiendoImagen && producto.imagen && (
            <p style={{ color: '#28a745' }}>☄️ Imagen subida correctamente</p>
          )}
          
          <small>Selecciona una imagen (JPEG, PNG, JPG o WebP)</small>
        </div>

        <div className="enviar">
          <input
            type="submit"
            className="btn btn-azul"
            value={subiendoImagen ? '⏳ Subiendo imagen...' : 'Agregar Producto'}
            disabled={validarProducto()}
          />
        </div>
      </form>
    </>
  );
}

export default NuevoProducto;