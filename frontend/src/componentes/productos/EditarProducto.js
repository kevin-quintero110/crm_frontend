import React, { useState, useEffect, useContext } from 'react';
import Swal from 'sweetalert2';
import clienteAxios from '../../config/axios';
import { useNavigate, useParams } from 'react-router-dom';
import { CRMContext } from '../../context/CRMContext';
import Spinner from '../layout/Spinner';

function EditarProducto() {
  const { id } = useParams();
  const [auth] = useContext(CRMContext);
  const [producto, guardarProducto] = useState({
    nombre: '',
    precio: '',
    imagen: ''
  });
  const [cargando, setCargando] = useState(true);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [imagenSeleccionada, setImagenSeleccionada] = useState(null);
  let navigate = useNavigate();

  // ✅ Configuración de Cloudinary (Usando variables de entorno)
  const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'bq5dbhkd';
  const uploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || 'crm_uploads';

  // Obtener datos del producto
  useEffect(() => {
    if (!auth.auth && !localStorage.getItem('token')) {
      navigate('/iniciar-sesion', { replace: true });
      return;
    }

    const consultarAPI = async () => {
      const token = localStorage.getItem('token');
      try {
        setCargando(true);
        const productoConsulta = await clienteAxios.get(`/productos/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (productoConsulta.data) {
          guardarProducto({
            nombre: productoConsulta.data.nombre || '',
            precio: productoConsulta.data.precio || '',
            imagen: productoConsulta.data.imagen || ''
          });
        }
      } catch (error) {
        console.error("Error al consultar producto:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error al obtener el producto',
          text: 'Por favor, intente nuevamente.'
        });
      } finally {
        setCargando(false);
      }
    };
    consultarAPI();
  }, [auth, id, navigate]);

  // ✅ Función para subir imagen a Cloudinary
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

  // ✅ Guardar cambios del producto
  const editarProducto = async e => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    
    if (!producto.nombre.trim() || !producto.precio) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Nombre y precio son obligatorios'
      });
      return;
    }

    try {
      const res = await clienteAxios.put(`/productos/${id}`, {
        nombre: producto.nombre,
        precio: producto.precio,
        imagen: producto.imagen
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.status === 200) {
        Swal.fire({
          icon: "success",
          title: "✅ Producto editado",
          timer: 1500,
          showConfirmButton: false
        });
        navigate('/productos', { replace: true });
      }
    } catch (error) {
      console.error('Error al editar:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.mensaje || 'Vuelva a intentarlo'
      });
    }
  };

  const leerInformacionProducto = e => {
    guardarProducto({
      ...producto,
      [e.target.name]: e.target.value
    });
  };

  // ✅ Manejar selección de archivo
  const leerArchivo = async e => {
    const archivo = e.target.files[0];
    if (archivo) {
      setImagenSeleccionada(archivo);
      await subirImagenACloudinary(archivo);
    }
  };

  const { nombre, precio, imagen } = producto;

  if (cargando) return <Spinner />;

  return (
    <>
      <h2>Actualizar Producto</h2>
      <form onSubmit={editarProducto}>
        <legend>Llena todos los campos</legend>

        <div className="campo">
          <label>Nombre:</label>
          <input
            type="text"
            placeholder="Nombre Producto"
            name="nombre"
            onChange={leerInformacionProducto}
            value={nombre || ''}
            required
          />
        </div>

        <div className="campo">
          <label>Precio:</label>
          <input
            type="number"
            name="precio"
            min="0.00"
            step="1"
            placeholder="Precio"
            onChange={leerInformacionProducto}
            value={precio || ''}
            required
          />
        </div>

        <div className="campo">
          <label>Imagen:</label>
          
          {imagen && (
            <div style={{ marginBottom: '10px' }}>
              <p>Imagen actual:</p>
              <img 
                src={imagen} 
                alt="Producto" 
                width="200"
                style={{ 
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  padding: '5px'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  const mensaje = document.createElement('p');
                  mensaje.style.color = 'red';
                  mensaje.textContent = '⚠️ Imagen no disponible';
                  e.target.parentElement.appendChild(mensaje);
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
          
          {imagenSeleccionada && !subiendoImagen && (
            <p style={{ color: '#28a745' }}>✅ Imagen seleccionada: {imagenSeleccionada.name}</p>
          )}
          
          <small>Selecciona una imagen para actualizar (JPEG, PNG, JPG o WebP)</small>
        </div>

        <div className="enviar">
          <input
            type="submit"
            className="btn btn-azul"
            value={subiendoImagen ? '⏳ Subiendo imagen...' : 'Actualizar Producto'}
            disabled={subiendoImagen}
          />
        </div>
      </form>
    </>
  );
}

export default EditarProducto;