let editingPosition = false; // Bandera para saber si estamos editando la posición
let editingRotation = false; // Bandera para saber si estamos editando la rotación
let editingScale = false; // Bandera para saber si estamos editando la escala

// Función para actualizar las propiedades cuando se modifica el nombre
function putName() {
  if (objetoSeleccionado) {
    const nuevoNombre = document.getElementById('object-name').value.trim();
    if (nuevoNombre && nuevoNombre !== objetoSeleccionado.name) {
      objetoSeleccionado.name = nuevoNombre;
      console.log('Nuevo nombre del objeto:', objetoSeleccionado.name);
    }
  }
}

// Función para actualizar las propiedades del objeto seleccionado
function actualizarPropiedades() {
  if (objetoSeleccionado) {
    // Solo actualizar la posición cuando no se está editando
    if (!editingPosition) {
      document.getElementById('object-position-x').value = objetoSeleccionado.position.x.toFixed(3);
      document.getElementById('object-position-y').value = objetoSeleccionado.position.y.toFixed(3);
      document.getElementById('object-position-z').value = objetoSeleccionado.position.z.toFixed(3);
    }

    // Solo actualizar la rotación cuando no se está editando
    if (!editingRotation) {
      document.getElementById('object-rotation-x').value = objetoSeleccionado.rotation.x.toFixed(3);
      document.getElementById('object-rotation-y').value = objetoSeleccionado.rotation.y.toFixed(3);
      document.getElementById('object-rotation-z').value = objetoSeleccionado.rotation.z.toFixed(3);
    }

    // Solo actualizar la escala cuando no se está editando
    if (!editingScale) {
      document.getElementById('object-scale-x').value = objetoSeleccionado.scale.x.toFixed(3);
      document.getElementById('object-scale-y').value = objetoSeleccionado.scale.y.toFixed(3);
      document.getElementById('object-scale-z').value = objetoSeleccionado.scale.z.toFixed(3);
    }
  }
}

// Función para manejar el cambio de las propiedades
function manejarCambioPropiedad(event) {
  if (!objetoSeleccionado) return;

  const propiedad = event.target.id;
  const valor = parseFloat(event.target.value);

  if (isNaN(valor)) return; // Evitar valores no numéricos

  if (propiedad.includes('position')) {
    // Actualizar la posición
    if (propiedad === 'object-position-x') objetoSeleccionado.position.x = valor;
    if (propiedad === 'object-position-y') objetoSeleccionado.position.y = valor;
    if (propiedad === 'object-position-z') objetoSeleccionado.position.z = valor;
  }

  if (propiedad.includes('rotation')) {
    // Actualizar la rotación
    if (propiedad === 'object-rotation-x') objetoSeleccionado.rotation.x = valor;
    if (propiedad === 'object-rotation-y') objetoSeleccionado.rotation.y = valor;
    if (propiedad === 'object-rotation-z') objetoSeleccionado.rotation.z = valor;
  }

  if (propiedad.includes('scale')) {
    // Actualizar la escala
    if (propiedad === 'object-scale-x') objetoSeleccionado.scale.x = valor;
    if (propiedad === 'object-scale-y') objetoSeleccionado.scale.y = valor;
    if (propiedad === 'object-scale-z') objetoSeleccionado.scale.z = valor;
  }

  // Sincronizar las propiedades en el div
  actualizarPropiedades();
}

// Añadir escuchadores de eventos a los campos de entrada
document.getElementById('object-name').addEventListener('focus', () => {
  editingName = true; // Estamos editando el nombre
});

document.getElementById('object-name').addEventListener('blur', () => {
  editingName = false; // Dejamos de editar el nombre
  putName(); // Guardamos el nuevo nombre cuando se deja de editar
});

document.getElementById('object-position-x').addEventListener('focus', () => {
  editingPosition = true; // Estamos editando la posición
});

document.getElementById('object-position-y').addEventListener('focus', () => {
  editingPosition = true; // Estamos editando la posición
});

document.getElementById('object-position-z').addEventListener('focus', () => {
  editingPosition = true; // Estamos editando la posición
});

document.getElementById('object-rotation-x').addEventListener('focus', () => {
  editingRotation = true; // Estamos editando la rotación
});

document.getElementById('object-rotation-y').addEventListener('focus', () => {
  editingRotation = true; // Estamos editando la rotación
});

document.getElementById('object-rotation-z').addEventListener('focus', () => {
  editingRotation = true; // Estamos editando la rotación
});

document.getElementById('object-scale-x').addEventListener('focus', () => {
  editingScale = true; // Estamos editando la escala
});

document.getElementById('object-scale-y').addEventListener('focus', () => {
  editingScale = true; // Estamos editando la escala
});

document.getElementById('object-scale-z').addEventListener('focus', () => {
  editingScale = true; // Estamos editando la escala
});

// Dejar de editar y actualizar la propiedad cuando el campo pierde el foco
document.getElementById('object-position-x').addEventListener('blur', () => {
  editingPosition = false;
  manejarCambioPropiedad({ target: document.getElementById('object-position-x') });
});

document.getElementById('object-position-y').addEventListener('blur', () => {
  editingPosition = false;
  manejarCambioPropiedad({ target: document.getElementById('object-position-y') });
});

document.getElementById('object-position-z').addEventListener('blur', () => {
  editingPosition = false;
  manejarCambioPropiedad({ target: document.getElementById('object-position-z') });
});

document.getElementById('object-rotation-x').addEventListener('blur', () => {
  editingRotation = false;
  manejarCambioPropiedad({ target: document.getElementById('object-rotation-x') });
});

document.getElementById('object-rotation-y').addEventListener('blur', () => {
  editingRotation = false;
  manejarCambioPropiedad({ target: document.getElementById('object-rotation-y') });
});

document.getElementById('object-rotation-z').addEventListener('blur', () => {
  editingRotation = false;
  manejarCambioPropiedad({ target: document.getElementById('object-rotation-z') });
});

document.getElementById('object-scale-x').addEventListener('blur', () => {
  editingScale = false;
  manejarCambioPropiedad({ target: document.getElementById('object-scale-x') });
});

document.getElementById('object-scale-y').addEventListener('blur', () => {
  editingScale = false;
  manejarCambioPropiedad({ target: document.getElementById('object-scale-y') });
});

document.getElementById('object-scale-z').addEventListener('blur', () => {
  editingScale = false;
  manejarCambioPropiedad({ target: document.getElementById('object-scale-z') });
});


function actualizarNombre() {
  if (objetoSeleccionado) {
    document.getElementById('object-name').value = objetoSeleccionado.name || '';
  }
}