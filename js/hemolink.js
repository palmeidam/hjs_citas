
const CITAS_EJEMPLO = [
    {
        id: 1,
        fecha: '2025-11-15',
        hora: '09:00',
        medico: 'Dr. Carlos Martínez',
        especialidad: 'Oncología',
        tipo: 'Primera Consulta',
        estado: 'pendiente',
        consultorio: '501-A'
    },
    {
        id: 2,
        fecha: '2025-11-22',
        hora: '14:30',
        medico: 'Dra. Ana Rodríguez',
        especialidad: 'Hematología',
        tipo: 'Control',
        estado: 'confirmada',
        consultorio: '502-B'
    }
];

const CITAS_DISPONIBLES = [
    {
        id: 101,
        fecha: '2025-11-08',
        hora: '10:00',
        medico: 'Dr. Luis Gómez',
        especialidad: 'Oncología',
        consultorio: '503-A'
    }
];

let citasUsuario = [];
let usuarioActual = null;


const formatearFecha = (fecha) => {
    const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(fecha).toLocaleDateString('es-CO', opciones);
};

const formatearHora = (hora) => {
    const [h, m] = hora.split(':');
    const hNum = parseInt(h);
    const periodo = hNum >= 12 ? 'PM' : 'AM';
    const h12 = hNum > 12 ? hNum - 12 : (hNum === 0 ? 12 : hNum);
    return `${h12}:${m} ${periodo}`;
};

const calcularDiasRestantes = (fecha) => {
    const hoy = new Date();
    const fechaCita = new Date(fecha);
    const diferencia = fechaCita - hoy;
    return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
};


const esNumerico = (caracter) => caracter >= '0' && caracter <= '9';

const validarDocumento = (documento) => {
    if (!documento || documento === '') return false;
    if (documento.length < 6 || documento.length > 12) return false;
    
    return documento.split('').every(esNumerico);
};

const validarEmail = (email) => email && email.includes('@') && email.includes('.');

const validarCelular = (celular) => 
    celular.length === 10 && celular.split('').every(esNumerico);

const validarContacto = (contacto) => {
    if (!contacto || contacto === '') return false;
    
    return contacto.includes('@') 
        ? validarEmail(contacto)
        : validarCelular(contacto);
};


const ESTADOS_BADGE = {
    confirmada: 'badge-confirmada',
    pendiente: 'badge-pendiente',
    cancelada: 'badge-cancelada'
};

const ESTADOS_TEXTO = {
    confirmada: 'Confirmada',
    pendiente: 'Pendiente',
    cancelada: 'Cancelada'
};

const ESTADOS_CLASS = {
    confirmada: 'cita-confirmada',
    pendiente: 'cita-pendiente',
    cancelada: 'cita-cancelada'
};

const obtenerEstadoBadge = (estado) => ESTADOS_BADGE[estado] || 'badge-hsj';
const obtenerEstadoTexto = (estado) => ESTADOS_TEXTO[estado] || estado;
const obtenerEstadoClass = (estado) => ESTADOS_CLASS[estado] || 'cita-cancelada';


const crearCardCita = (cita) => {
    const diasRestantes = calcularDiasRestantes(cita.fecha);
    const estadoClass = obtenerEstadoClass(cita.estado);
    
    return `
        <div class="card mb-3 cita-card ${estadoClass}">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <h5 class="card-title mb-0">
                        <i class="bi bi-calendar-event text-primary"></i> ${formatearFecha(cita.fecha)}
                    </h5>
                    <span class="badge ${obtenerEstadoBadge(cita.estado)}">${obtenerEstadoTexto(cita.estado)}</span>
                </div>
                
                <p class="mb-2"><strong><i class="bi bi-clock"></i> Hora:</strong> ${formatearHora(cita.hora)}</p>
                <p class="mb-2"><strong><i class="bi bi-person-badge"></i> Médico:</strong> ${cita.medico}</p>
                <p class="mb-2"><strong><i class="bi bi-heart-pulse"></i> Especialidad:</strong> ${cita.especialidad}</p>
                <p class="mb-2"><strong><i class="bi bi-clipboard-pulse"></i> Tipo:</strong> ${cita.tipo}</p>
                <p class="mb-2"><strong><i class="bi bi-door-open"></i> Consultorio:</strong> ${cita.consultorio}</p>
                
                ${diasRestantes > 0 ? `<p class="small text-muted mb-3"><i class="bi bi-hourglass-split"></i> Faltan ${diasRestantes} días</p>` : ''}
                
                ${cita.estado === 'pendiente' ? `
                    <div class="d-flex gap-2">
                        <button class="btn btn-success btn-sm" onclick="confirmarCita(${cita.id})">
                            <i class="bi bi-check-circle"></i> Confirmar
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="cancelarCita(${cita.id})">
                            <i class="bi bi-x-circle"></i> Cancelar
                        </button>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
};

const crearCardCitaDisponible = (cita) => `
    <div class="alert alert-success mb-2">
        <h6><i class="bi bi-calendar-plus"></i> Cita disponible</h6>
        <p class="mb-1"><strong>Fecha:</strong> ${formatearFecha(cita.fecha)} - ${formatearHora(cita.hora)}</p>
        <p class="mb-1"><strong>Médico:</strong> ${cita.medico}</p>
        <p class="mb-2"><strong>Especialidad:</strong> ${cita.especialidad}</p>
        <button class="btn btn-primary btn-sm" onclick="solicitarCitaDisponible(${cita.id})">
            <i class="bi bi-hand-index"></i> Solicitar esta cita
        </button>
    </div>
`;


const mostrarCitas = (citas) => {
    const container = document.getElementById('lista-citas');
    
    if (!citas || citas.length === 0) {
        container.innerHTML = '<div class="alert alert-info"><i class="bi bi-info-circle"></i> No tienes citas programadas.</div>';
        return;
    }
    
    const html = citas.map(crearCardCita).join('');
    container.innerHTML = html;
};

const mostrarCitasDisponibles = () => {
    const container = document.getElementById('citas-disponibles');
    
    if (CITAS_DISPONIBLES.length === 0) {
        container.innerHTML = '<div class="alert alert-info"><i class="bi bi-info-circle"></i> No hay citas disponibles en este momento.</div>';
        return;
    }
    
    const html = CITAS_DISPONIBLES.map(crearCardCitaDisponible).join('');
    container.innerHTML = html;
};


const confirmarCita = (idCita) => {
    const confirmar = confirm('¿Confirmas tu asistencia a esta cita?\n\nRecuerda revisar la Guía del Paciente para conocer los documentos necesarios.');
    
    if (confirmar) {
        citasUsuario = citasUsuario.map(cita => 
            cita.id === idCita ? { ...cita, estado: 'confirmada' } : cita
        );
        
        const citaEncontrada = citasUsuario.some(cita => cita.id === idCita);
        
        if (citaEncontrada) {
            alert('✅ Cita confirmada exitosamente.\n\nRecibirás recordatorios 72h, 24h y 2h antes de tu cita.');
            mostrarCitas(citasUsuario);
        }
    }
};

const cancelarCita = (idCita) => {
    const motivo = prompt('¿Por qué deseas cancelar tu cita?\n\nEsto nos ayuda a mejorar el servicio.');
    
    if (motivo !== null && motivo !== '') {
        const confirmar = confirm('¿Estás seguro de cancelar esta cita?\n\nEsta acción liberará el cupo para otros pacientes.');
        
        if (confirmar) {
            const citaCancelada = citasUsuario.find(cita => cita.id === idCita);
            
            citasUsuario = citasUsuario.map(cita => 
                cita.id === idCita ? { ...cita, estado: 'cancelada' } : cita
            );
            
            if (citaCancelada) {
                alert('✅ Cita cancelada.\n\nEl cupo ha sido liberado y notificaremos a pacientes en lista de espera.');
                mostrarCitas(citasUsuario);
                agregarCitaDisponible({ ...citaCancelada, estado: 'cancelada' });
            }
        }
    } else if (motivo !== null) {
        alert('⚠️ Debes indicar un motivo para cancelar la cita.');
    }
};

const agregarCitaDisponible = (cita) => {
    const container = document.getElementById('citas-disponibles');
    
    const html = `
        <div class="alert alert-success">
            <h6><i class="bi bi-calendar-plus"></i> Nueva cita disponible</h6>
            <p class="mb-1"><strong>Fecha:</strong> ${formatearFecha(cita.fecha)} - ${formatearHora(cita.hora)}</p>
            <p class="mb-1"><strong>Médico:</strong> ${cita.medico}</p>
            <p class="mb-2"><strong>Especialidad:</strong> ${cita.especialidad}</p>
            <button class="btn btn-primary btn-sm" onclick="solicitarCitaDisponible(${cita.id})">
                <i class="bi bi-hand-index"></i> Solicitar esta cita
            </button>
        </div>
    `;
    
    container.innerHTML = html;
};

const solicitarCitaDisponible = (idCita) => {
    const confirmar = confirm('¿Deseas tomar esta cita disponible?\n\nSe te asignará inmediatamente si la aceptas.');
    
    if (confirmar) {
        alert('✅ ¡Cita asignada exitosamente!\n\nRecibirás una confirmación por correo y SMS.');
        document.getElementById('citas-disponibles').innerHTML = '<div class="alert alert-info"><i class="bi bi-info-circle"></i> No hay citas disponibles en este momento.</div>';
    }
};


const validacionesLogin = [
    { 
        campo: 'documento', 
        validar: validarDocumento, 
        mensaje: 'El documento debe tener entre 6 y 12 dígitos numéricos' 
    },
    { 
        campo: 'contacto', 
        validar: validarContacto, 
        mensaje: 'Ingresa un correo válido o un celular de 10 dígitos' 
    }
];

const procesarLogin = (evento) => {
    evento.preventDefault();
    
    const documento = document.getElementById('documento').value;
    const contacto = document.getElementById('contacto').value;
    const valores = { documento, contacto };
    
    const errores = validacionesLogin
        .filter(v => !v.validar(valores[v.campo]))
        .map(v => v.mensaje);
    
    if (errores.length > 0) {
        const mensajeError = '❌ ERRORES:\n\n' + 
            errores.map((error, i) => `${i + 1}. ${error}`).join('\n');
        
        alert(mensajeError);
        return false;
    }
    
    usuarioActual = { documento, contacto };
    citasUsuario = [...CITAS_EJEMPLO];
    
    alert(`✅ Acceso exitoso\n\nBienvenido al sistema HemoLink HSJ.\nDocumento: ${documento}`);
    
    document.getElementById('citas-container').classList.remove('d-none');
    mostrarCitas(citasUsuario);
    mostrarCitasDisponibles();
    
    return false;
};

const validacionesContacto = [
    { 
        campo: 'nombre-contacto', 
        validar: (v) => v && v.length >= 3, 
        mensaje: 'El nombre debe tener al menos 3 caracteres' 
    },
    { 
        campo: 'email-contacto', 
        validar: (v) => v && v.includes('@') && v.includes('.'), 
        mensaje: 'Ingresa un correo electrónico válido' 
    },
    { 
        campo: 'motivo', 
        validar: (v) => v !== '', 
        mensaje: 'Selecciona un motivo de contacto' 
    },
    { 
        campo: 'mensaje-contacto', 
        validar: (v) => v && v.length >= 10, 
        mensaje: 'El mensaje debe tener al menos 10 caracteres' 
    }
];

const procesarContacto = (evento) => {
    evento.preventDefault();
    
    const valores = {
        'nombre-contacto': document.getElementById('nombre-contacto').value,
        'email-contacto': document.getElementById('email-contacto').value,
        'telefono-contacto': document.getElementById('telefono-contacto').value,
        'motivo': document.getElementById('motivo').value,
        'mensaje-contacto': document.getElementById('mensaje-contacto').value
    };
    
    const errores = validacionesContacto
        .filter(v => !v.validar(valores[v.campo]))
        .map(v => v.mensaje);
    
    if (errores.length > 0) {
        const mensajeError = '❌ ERRORES EN EL FORMULARIO:\n\n' + 
            errores.slice(0, 5).map((error, i) => `${i + 1}. ${error}`).join('\n') +
            (errores.length > 5 ? '\n\n... y más errores' : '');
        
        alert(mensajeError);
        return false;
    }
    
    const mensajeConfirmacion = [
        '✅ MENSAJE ENVIADO\n',
        `Nombre: ${valores['nombre-contacto']}`,
        `Email: ${valores['email-contacto']}`,
        valores['telefono-contacto'] ? `Teléfono: ${valores['telefono-contacto']}` : null,
        '\nNos pondremos en contacto contigo pronto.'
    ].filter(Boolean).join('\n');
    
    alert(mensajeConfirmacion);
    document.getElementById('form-contacto').reset();
    
    return false;
};


const scrollToSection = (seccionId) => {
    const seccion = document.getElementById(seccionId);
    if (seccion) {
        seccion.scrollIntoView({ behavior: 'smooth' });
    }
};


const inicializar = () => {
    window.scrollTo(0, 0);
    
    console.log('✅ Sistema HemoLink HSJ inicializado (Versión Funcional)');
    
    const formLogin = document.getElementById('form-login');
    if (formLogin) {
        formLogin.addEventListener('submit', procesarLogin);
    }
    
    const formContacto = document.getElementById('form-contacto');
    if (formContacto) {
        formContacto.addEventListener('submit', procesarContacto);
    }
    
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    mostrarCitasDisponibles();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializar);
} else {
    inicializar();
}
