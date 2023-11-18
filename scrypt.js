let listaEnMemoria; // Variable global para almacenar la lista de clases

function obtenerJerarquiaClases() {
    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                const respuesta = JSON.parse(xhr.responseText);
                generarListaJerarquia(respuesta);
                mostrarFormularioLista();
            } else {
                alert('Hubo un problema al obtener la jerarquía de clases.');
            }
        }
    };

    xhr.open('GET', 'http://localhost/personasFutbolitasProfesionales.php');
    xhr.send();
}

function generarListaJerarquia(respuesta) {
    const datos = respuesta;
    listaEnMemoria = datos.map(item => {
        if ('cantidadGoles' in item) {
            return new Futbolista(item.id, item.nombre, item.apellido, item.edad, item.equipo, item.posicion, item.cantidadGoles);
        } else if ('titulo' in item) {
            return new Profesional(item.id, item.nombre, item.apellido, item.edad, item.titulo, item.facultad, item.añoGraduacion);
        } else {
            return new Persona(item.id, item.nombre, item.apellido, item.edad);
        }
    });
    // Aquí podrías hacer más operaciones o manipulaciones con la listaEnMemoria si es necesario
}

function mostrarFormularioLista() {
    const filasTabla = document.getElementById('filas-tabla');

    listaEnMemoria.forEach(clase => {
        const fila = document.createElement('tr');
        const columnas = ['id', 'nombre', 'apellido', 'edad', 'equipo', 'posicion', 'cantidadGoles', 'titulo', 'facultad', 'añoGraduacion'];
        
        columnas.forEach(columna => {
            const celda = document.createElement('td');
            if (clase instanceof Futbolista && !['id', 'nombre', 'apellido', 'edad', 'equipo', 'posicion', 'cantidadGoles'].includes(columna)) {
                celda.textContent = 'N/A'; // Si es Futbolista, rellenar los campos no aplicables con 'N/A'
            } else if (clase instanceof Profesional && !['id', 'nombre', 'apellido', 'edad', 'titulo', 'facultad', 'añoGraduacion'].includes(columna)) {
                celda.textContent = 'N/A'; // Si es Profesional, rellenar los campos no aplicables con 'N/A'
            } else {
                celda.textContent = clase[columna]; // Si aplica, muestra el valor correspondiente
            }
            fila.appendChild(celda);
        });

        filasTabla.appendChild(fila);
    });
}


window.onload = function() {
    obtenerJerarquiaClases();
};


/******************************************** ABM *************************************************** */    

function abrirFormulario() {
    const formulario = document.getElementById('abm-form');
    const tabla = document.getElementById('contenedor-tabla');
    const tipoSeleccionado = document.getElementById('tipo-input').value;

    formulario.style.display = 'flex';
    tabla.style.display = 'none';

    mostrarCamposPorDefecto(); // Mostrar solo los campos de Persona al principio
}

function cancelarAccion() {
    const formularioABM = document.getElementById('abm-form');
    const formularioLista = document.getElementById('contenedor-tabla');

    formularioABM.style.display = 'none';
    formularioLista.style.display = 'block';
}

function mostrarCamposPorDefecto() {
    const camposPersona = document.querySelectorAll('.text-input[id^="nombre"], .text-input[id^="apellido"], .text-input[id^="edad"]');
    const camposFutbolista = document.querySelectorAll('.text-input[id^="equipo"], .text-input[id^="posicion"], .text-input[id^="cantidadGoles"]');
    const camposProfesional = document.querySelectorAll('.text-input[id^="titulo"], .text-input[id^="facultad"], .text-input[id^="añoGraduacion"]');

    camposPersona.forEach(campo => campo.style.display = 'block');
    camposFutbolista.forEach(campo => campo.style.display = 'none');
    camposProfesional.forEach(campo => campo.style.display = 'none');
}

function seleccionarTipoPersona() {
    const tipoSeleccionado = document.getElementById('tipo-input').value;
    const camposPersona = document.querySelectorAll('.text-input[id^="nombre"], .text-input[id^="apellido"], .text-input[id^="edad"]');
    const camposFutbolista = document.querySelectorAll('.text-input[id^="equipo"], .text-input[id^="posicion"], .text-input[id^="cantidadGoles"]');
    const camposProfesional = document.querySelectorAll('.text-input[id^="titulo"], .text-input[id^="facultad"], .text-input[id^="añoGraduacion"]');

    camposPersona.forEach(campo => campo.style.display = 'block');
    camposFutbolista.forEach(campo => campo.style.display = 'none');
    camposProfesional.forEach(campo => campo.style.display = 'none');

    if (tipoSeleccionado === '1') {
        camposFutbolista.forEach(campo => campo.style.display = 'block');
    } else if (tipoSeleccionado === '2') {
        camposProfesional.forEach(campo => campo.style.display = 'block');
    }
}

function aceptarAccion() {
    // Obtener los datos del formulario
    const tipoElemento = document.getElementById('tipo-input').value;
    const datosFormulario = obtenerDatosFormulario(tipoElemento);
    
    // Bloquear la pantalla con el spinner
    mostrarSpinner();

    // Hacer la solicitud PUT al servidor
    fetch('http://localhost/personasFutbolitasProfesionales.php', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosFormulario)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error en la solicitud');
        }
        return response.json(); // Devuelve los datos de respuesta en formato JSON
    })
    .then(data => {
        // Actualizar el ID con el provisto en la respuesta
        const nuevoId = datosFormulario.id; // Suponiendo que el ID está en la propiedad 'id' de la respuesta
        
        // Insertar el nuevo elemento en la lista
        const nuevoElemento = { ...datosFormulario, id: nuevoId };
        listaEnMemoria.push(nuevoElemento);
        
        // Ocultar el formulario ABM
        cancelarAccion();

        // Mostrar el formulario de lista reflejando los cambios
        mostrarFormularioLista();

        // Ocultar el spinner
        ocultarSpinner();
    })
    .catch(error => {
        console.error('Error:', error);
        // En caso de error, manejar la lógica correspondiente, por ejemplo, mostrar un mensaje de advertencia
        alert('No se pudo completar la operación');
        // Ocultar el spinner
        ocultarSpinner();
    });
}




function obtenerDatosFormulario(tipoElemento) {
    const nuevoElemento = {};

    nuevoElemento.nombre = document.getElementById('nombre-input').value;
    nuevoElemento.apellido = document.getElementById('apellido-input').value;
    nuevoElemento.edad = parseInt(document.getElementById('edad-input').value);

    if (tipoElemento === '1') { // Futbolista
        nuevoElemento.equipo = document.getElementById('equipo-input').value;
        nuevoElemento.posicion = document.getElementById('posicion-input').value;
        nuevoElemento.cantidadGoles = parseInt(document.getElementById('cantidadGoles-input').value);
    } else if (tipoElemento === '2') { // Profesional
        nuevoElemento.titulo = document.getElementById('titulo-input').value;
        nuevoElemento.facultad = document.getElementById('facultad-input').value;
        nuevoElemento.añoGraduacion = parseInt(document.getElementById('añoGraduacion-input').value);
    }

    return nuevoElemento;
}

function mostrarFormularioLista() {
    const filasTabla = document.getElementById('filas-tabla');
    // Limpiar el contenido actual de la tabla
    filasTabla.innerHTML = '';

    listaEnMemoria.forEach(clase => {
        const fila = document.createElement('tr');
        const columnas = ['id', 'nombre', 'apellido', 'edad', 'equipo', 'posicion', 'cantidadGoles', 'titulo', 'facultad', 'añoGraduacion'];
        
        columnas.forEach(columna => {
            const celda = document.createElement('td');
            if (clase instanceof Futbolista && !['id', 'nombre', 'apellido', 'edad', 'equipo', 'posicion', 'cantidadGoles'].includes(columna)) {
                celda.textContent = 'N/A';
            } else if (clase instanceof Profesional && !['id', 'nombre', 'apellido', 'edad', 'titulo', 'facultad', 'añoGraduacion'].includes(columna)) {
                celda.textContent = 'N/A';
            } else {
                celda.textContent = clase[columna];
            }
            fila.appendChild(celda);
        });

        filasTabla.appendChild(fila);
    });
}


/******************************************** SPINNER *************************************************** */    

// Mostrar el spinner
function mostrarSpinner() {
document.getElementById('spinner').style.display = 'flex';
}

// Ocultar el spinner
function ocultarSpinner() {
document.getElementById('spinner').style.display = 'none';
}
  
/******************************************************************************************************** */