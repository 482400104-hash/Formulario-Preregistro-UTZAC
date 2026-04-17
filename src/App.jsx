import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    escuela: '',
    carrera: '',
    tipo: 'estudiante'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [apiBase, setApiBase] = useState('');
  const [registros, setRegistros] = useState([]);

  // Detectar si estamos en localhost o en Vercel
  useEffect(() => {
    const detectEnvironment = () => {
      if (window.location.hostname === 'localhost') {
        setApiBase('http://localhost:3001');
      } else {
        setApiBase(window.location.origin);
      }
    };
    detectEnvironment();
    loadRegistros();
  }, [apiBase]);

  const loadRegistros = async () => {
    try {
      const endpoint = apiBase ? `${apiBase}/api/registros` : '';
      if (!endpoint) return;
      
      const response = await fetch(endpoint);
      const data = await response.json();
      if (data.success) {
        setRegistros(data.registros || []);
      }
    } catch (error) {
      console.log('Error cargando registros:', error.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!apiBase) {
      setMessage('❌ Error: No se pudo detectar la API');
      return;
    }

    if (!formData.nombre || !formData.email) {
      setMessage('❌ Nombre y email son requeridos');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${apiBase}/api/registrar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`✓ Registro exitoso! ID: ${data.id}`);
        setFormData({
          nombre: '',
          email: '',
          telefono: '',
          escuela: '',
          carrera: '',
          tipo: 'estudiante'
        });
        // Recargar registros
        await new Promise(resolve => setTimeout(resolve, 500));
        loadRegistros();
      } else {
        setMessage(`❌ Error: ${data.error || 'Error desconocido'}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <div className="container">
        <h1>📝 Formulario de Pre-Registro UTZAC</h1>
        <p className="subtitle">Conectado a: {apiBase || 'Detectando...'}</p>

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label>Nombre *</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Tu nombre completo"
              required
            />
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Teléfono</label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              placeholder="+502 1234 5678"
            />
          </div>

          <div className="form-group">
            <label>Escuela</label>
            <input
              type="text"
              name="escuela"
              value={formData.escuela}
              onChange={handleChange}
              placeholder="Nombre de la escuela"
            />
          </div>

          <div className="form-group">
            <label>Carrera</label>
            <input
              type="text"
              name="carrera"
              value={formData.carrera}
              onChange={handleChange}
              placeholder="Carrera que deseas estudiar"
            />
          </div>

          <div className="form-group">
            <label>Tipo</label>
            <select name="tipo" value={formData.tipo} onChange={handleChange}>
              <option value="estudiante">Estudiante</option>
              <option value="profesor">Profesor</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Guardando...' : 'Registrar'}
          </button>
        </form>

        {message && (
          <div className={`message ${message.includes('✓') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <div className="registros">
          <h2>📊 Registros Guardados ({registros.length})</h2>
          {registros.length === 0 ? (
            <p>No hay registros aún</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {registros.map(reg => (
                  <tr key={reg.id}>
                    <td>{reg.id}</td>
                    <td>{reg.nombre}</td>
                    <td>{reg.email}</td>
                    <td>{new Date(reg.fecha_registro).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
