import { createRoot } from 'react-dom/client'
import { useState } from 'react'

const verdeUtzac = "#064e3b";

function VideoPage({ video, regresar }) {
  return (
    <div className="container mt-4 text-center">
      <h2 className="fw-bold" style={{color: verdeUtzac}}>Recorrido Virtual</h2>
      <video width="80%" controls autoPlay className="shadow-lg rounded border border-success">
        <source src={video} type="video/mp4" />
      </video>
      <br />
      <button className="btn btn-secondary mt-3 rounded-pill px-4" onClick={regresar}>
        ← Volver 
      </button>
    </div>
  );
}

function MyForm() {
  const [vista, setVista] = useState("home");
  const [videoActual, setVideoActual] = useState("");
  const [tipo, setTipo] = useState("");

  if (vista === "video") {
    return <VideoPage video={videoActual} regresar={() => setVista("home")} />;
  }

  // Función para activar pantalla completa en el model-viewer
  const toggleFullScreen = (id) => {
    const viewer = document.getElementById(id);
    if (viewer) {
      if (viewer.requestFullscreen) {
        viewer.requestFullscreen();
      } else if (viewer.webkitRequestFullscreen) {
        viewer.webkitRequestFullscreen();
      }
    }
  };

  return (
    <>
      <style>{`
        .nav-utzac { background-color: ${verdeUtzac} !important; }
        .btn-utzac { background-color: ${verdeUtzac} !important; color: white !important; }
        .card-zona { transition: transform 0.3s; border: none !important; }
        .card-zona:hover { transform: scale(1.02); }
        model-viewer { width: 100%; height: 350px; background-color: #f8f9fa; border-radius: 8px; }
        .img-cartel { transition: transform 0.3s; cursor: zoom-in; }
        .img-cartel:hover { transform: scale(1.01); }
        footer { background-color: #f1f1f1; border-top: 4px solid ${verdeUtzac}; color: #333; }
        .btn-expand { position: relative; margin-top: -50px; margin-bottom: 20px; z-index: 10; }
      `}</style>

      {/* NAVBAR */}
      <nav className="navbar navbar-dark nav-utzac shadow mb-4">
        <div className="container-fluid d-flex justify-content-between align-items-center px-4">
          <div style={{ width: "45px" }}></div>
          <span className="navbar-brand mb-0 h1 fw-bold text-center">
            TRANSFORMACIÓN DIGITAL DE ESPACIOS UNIVERSITARIOS
          </span>
          <img src="/utzac.jpg" alt="UTZAC" style={{ height: "45px", borderRadius: "50%", border: "2px solid white" }} />
        </div>
      </nav>

      <div className="container">
        
        {/* INTRODUCCIÓN */}
        <div className="card p-4 mb-4 border-0 shadow-sm" style={{ borderLeft: `5px solid ${verdeUtzac}`, backgroundColor: "#fdfdfd" }}>
          <h2 className="fw-bold" style={{ color: verdeUtzac }}>Sobre este Proyecto</h2>
          <p>
            Este sistema interactivo forma parte de un proyecto integrador bajo el modelo de <strong>Smart Campus</strong>. 
            Utilizando metodologías ágiles (SCRUM), hemos desarrollado entornos de navegación autónoma de la <strong>Cafetería</strong> y el <strong>Gimnasio</strong> de la UTZAC.
          </p>
        </div>

        {/* REGISTRO */}
        <div className="card p-4 shadow-sm rounded-4 border-0 mb-5">
          <h2 className="text-center mb-4 fw-bold" style={{ color: verdeUtzac }}>Registro</h2>
          <div className="text-center mb-4">
            <button className={`btn ${tipo === 'visitante' ? 'btn-success' : 'btn-outline-success'} rounded-pill me-2 px-4`} onClick={() => setTipo("visitante")}>Visitante</button>
            <button className={`btn ${tipo === 'lince' ? 'btn-success' : 'btn-outline-success'} rounded-pill px-4`} onClick={() => setTipo("lince")}>Futuro Lince</button>
          </div>
          {tipo && (
            <form action="http://localhost/action_guardar_datos.php" method="POST" className="row g-3 was-validated">
              <input type="hidden" name="tipo" value={tipo} />
              <div className="col-md-6"><input type="text" className="form-control" name="name" placeholder="Nombre completo" required /></div>
              <div className="col-md-6"><input type="email" className="form-control" name="email" placeholder="Correo" required /></div>
              <div className="col-md-6"><input type="tel" className="form-control" name="telefono" placeholder="Teléfono (10 dígitos)" pattern="[0-9]{10}" maxLength="10" required /></div>
              {tipo === "lince" && (
                <>
                  <div className="col-md-6"><select className="form-select" name="escuela" required><option value="">Selecciona tu escuela</option><option>CETIS 113</option><option>CONALEP</option><option>CBT 188</option><option>UAZ</option></select></div>
                  <div className="col-md-12"><select className="form-select" name="carrera" required><option value="">Selecciona la carrera de interés</option><option>Tecnologías de la Información</option><option>Mecatrónica</option><option>Energías renovables</option><option>Terapia Física</option></select></div>
                </>
              )}
              <div className="col-12 mt-4"><button className="btn btn-utzac w-100 py-2 fw-bold rounded-3">Enviar Registro</button></div>
            </form>
          )}
        </div>

        {/* ENTORNOS 3D */}
        <h3 className="text-center fw-bold mb-2" style={{ color: verdeUtzac }}>Explora tus zonas</h3>
        <p className="text-center text-muted mb-4 small">Usa el ratón para girar y entrar a los edificios</p>
        
        <div className="row g-4 mb-5">
          {[
            { id: "viewer-cafe", t: "Cafetería", i: "/cafeteria.jpg", v: "/cafeteria.mp4", m: "/cafeteria.glb", orbit: "45deg 75deg 12m" },
            { id: "viewer-gym", t: "Gimnasio", i: "/gimnasio.jpg", v: "/gimnasio.mp4", m: "/gimnasio.glb", orbit: "45deg 75deg 20m" }
          ].map((z) => (
            <div className="col-md-6" key={z.t}>
              <div className="card card-zona h-100 shadow-sm overflow-hidden bg-white">
                <model-viewer 
                  id={z.id}
                  src={z.m} 
                  ar camera-controls interaction-prompt="none" 
                  camera-orbit={z.orbit} interpolation-decay="200"
                  min-camera-orbit="auto auto 2m" max-camera-orbit="auto auto 40m"
                  shadow-intensity="1" poster={z.i}>
                </model-viewer>
                
                {/* Botón de Expandir */}
                <div className="text-center btn-expand">
                  <button className="btn btn-dark btn-sm rounded-pill px-3" onClick={() => toggleFullScreen(z.id)}>
                    ⛶ Expandir 3D
                  </button>
                </div>

                <div className="card-body text-center">
                  <h5 className="fw-bold">{z.t}</h5>
                  <button className="btn btn-outline-success w-100 rounded-pill" onClick={() => { setVideoActual(z.v); setVista("video"); }}>
                    Ver Video Recorrido
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CARTEL CIENTÍFICO */}
        <div className="text-center mb-5 mt-5">
          <h3 className="fw-bold mb-2" style={{ color: verdeUtzac }}>Documentación Científica</h3>
          <p className="text-muted mb-4 small">Haz clic en la imagen para ver en pantalla completa</p>
          <a href="/cartel.jpg" target="_blank" rel="noopener noreferrer">
            <img 
              src="/cartel.jpg" 
              alt="Cartel" 
              className="img-fluid shadow rounded-3 img-cartel" 
              style={{ maxWidth: "100%", border: `2px solid ${verdeUtzac}` }} 
            />
          </a>
        </div>
      </div>

      {/* FOOTER PROFESIONAL */}
      <footer className="py-5 mt-5">
        <div className="container text-center">
          <div className="row align-items-center">
            <div className="col-md-4 mb-3 mb-md-0">
              <img src="/utzac.jpg" alt="UTZAC" style={{ height: "60px", marginBottom: "10px" }} />
              <p className="small mb-0 fw-bold">Universidad Tecnológica del Estado de Zacatecas</p>
            </div>
            <div className="col-md-4 mb-3 mb-md-0 border-start border-end border-secondary">
              <h6 className="fw-bold text-utzac">Equipo de Desarrollo</h6>
              <ul className="list-unstyled small mb-0">
                <li>Nava Ledezma Emily Aylin.</li>
                <li>Medrano Esquivel Ana Karen </li>
                <li>Valdez Chompa Jaziel Isai.</li>
              </ul>
            </div>
            <div className="col-md-4">
              
              <p className="small mb-0">Ingeniería en Tecnologías de la Información</p>
            </div>
          </div>
          <hr className="my-4" style={{ opacity: 0.1 }} />
          <p className="mb-0 small text-muted">© 2026 Proyecto Integrador - TRANSFORMACIÓN DIGITAL DE ESPACIOS UNIVERSITARIOS</p>
        </div>
      </footer>
    </>
  )
}

createRoot(document.getElementById('root')).render(<MyForm />)