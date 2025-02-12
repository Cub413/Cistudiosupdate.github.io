
// Obtener botones del DOM
const ttransformButton = document.getElementById('ttransformButton');
const okTransformButton = document.getElementById('okTransformButton');
const centerButton = document.getElementById('centerButton');

// Variables globales
let transformCube = null;
let savedStates = {};
let frame;
let isConfirmed = false; // Para saber si se ha confirmado el movimiento del cubo

// Crear el marco cuadrado 2D
function createFrame() {
  const geometry = new THREE.PlaneGeometry(10, 10); // Marco cuadrado
  const material = new THREE.LineBasicMaterial({ color: 0xff0000 }); // Rojo
  frame = new THREE.LineSegments(new THREE.EdgesGeometry(geometry), material);
  frame.position.set(0, 0, 0); // Fijar el marco en el origen de la escena
  frame.userData.isFrame = true; // Marcarlo como marco
  scene.add(frame);

  // Adjuntar TransformControls al marco para hacerlo seleccionable
  transformControls.attach(frame);
}

// Crear el cubo de aristas azul
function createTransformCube() {
  const geometry = new THREE.BoxGeometry(3, 3, 3); // Cubo 3D
  const edges = new THREE.EdgesGeometry(geometry);
  const material = new THREE.LineBasicMaterial({ color: 0x0000ff }); // Azul
  const cube = new THREE.LineSegments(edges, material);
  return cube;
}

// Botón `ttransform`: Crear el cubo de aristas y el marco
ttransformButton.addEventListener('click', () => {
  if (!transformControls.object) {
    alert('Por favor, selecciona un objeto primero.');
    return;
  }

  originalObject = transformControls.object;

  // Crear el cubo de transformación
  transformCube = createTransformCube();
  transformCube.position.copy(originalObject.position);
  scene.add(transformCube);

  // Adjuntar TransformControls al cubo de aristas
  transformControls.attach(transformCube);

  // Crear el marco
  createFrame();

  // Mostrar el botón OK
  okTransformButton.style.display = 'block';
});

// Botón `OK`: Confirmar la posición inicial del cubo
okTransformButton.addEventListener('click', () => {
  if (!transformCube) {
    alert('No hay un cubo de transformación creado.');
    return;
  }

  // Desconectar TransformControls del cubo
  transformControls.detach();
  okTransformButton.style.display = 'none';

  // Limitar el movimiento del cubo dentro del marco
  transformCube.userData.limited = true;

  // Hacer el cubo más 2D (aplastado)
  transformCube.scale.set(1, 1, 0.1); // Aplastar el cubo para hacerlo más 2D

  isConfirmed = true; // Confirmar que el cubo ya ha sido fijado

  alert('Cubo listo para interpolar.');
});

// Guardar la posición, rotación y escala para las esquinas del marco
function saveState(direction) {
  if (!originalObject) {
    alert('No hay un objeto seleccionado.');
    return;
  }

  const { position, rotation, scale } = originalObject;
  savedStates[direction] = {
    position: position.clone(),
    rotation: rotation.clone(),
    scale: scale.clone(),
  };
}

// Interpolar valores entre dos estados
function interpolateState(direction, t) {
  if (!savedStates[direction]) return;

  const { position, rotation, scale } = savedStates[direction];

  // Interpolación de posición
  originalObject.position.lerp(position, t);

  // Interpolación de rotación
  originalObject.rotation.x += (rotation.x - originalObject.rotation.x) * t;
  originalObject.rotation.y += (rotation.y - originalObject.rotation.y) * t;
  originalObject.rotation.z += (rotation.z - originalObject.rotation.z) * t;

  // Interpolación de escala
  originalObject.scale.lerp(scale, t);
}

// Configurar los botones para las 4 esquinas
document.getElementById('topRightButton').addEventListener('click', () => saveState('topRight'));
document.getElementById('topLeftButton').addEventListener('click', () => saveState('topLeft'));
document.getElementById('bottomRightButton').addEventListener('click', () => saveState('bottomRight'));
document.getElementById('bottomLeftButton').addEventListener('click', () => saveState('bottomLeft'));
centerButton.addEventListener('click', () => saveState('center'));

// Monitorear movimiento del cubo de transformación
setInterval(() => {
  if (!transformCube || !transformCube.userData.limited) return;

  // Limitar la posición del cubo dentro del marco 2D
  transformCube.position.x = THREE.MathUtils.clamp(transformCube.position.x, -5, 5);
  transformCube.position.y = THREE.MathUtils.clamp(transformCube.position.y, -10, 10);

  const t = THREE.MathUtils.clamp(transformCube.position.length() / 5, 0, 1);

  // Determinar la esquina donde se encuentra el cubo y aplicar interpolación
  if (transformCube.position.x > 0 && transformCube.position.y > 0) {
    interpolateState('topRight', t);
  } else if (transformCube.position.x < 0 && transformCube.position.y > 0) {
    interpolateState('topLeft', t);
  } else if (transformCube.position.x > 0 && transformCube.position.y < 0) {
    interpolateState('bottomRight', t);
  } else if (transformCube.position.x < 0 && transformCube.position.y < 0) {
    interpolateState('bottomLeft', t);
  } else {
    interpolateState('center', t);
  }
}, 100);

// Hacer que el cubo sea seleccionable para adjuntar TransformControls
renderer.domElement.addEventListener('click', (event) => {
  if (!isConfirmed) return; // Solo permitir seleccionar después de confirmar

  const rect = renderer.domElement.getBoundingClientRect();
  const mouse = new THREE.Vector2();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObject(transformCube);
  if (intersects.length > 0) {
    // Adjuntar TransformControls al cubo
    transformControls.attach(transformCube);
  }
});
// Obtener botones del DOM
const selectCubeButton = document.getElementById('selectCubeButton');
const selectFrameButton = document.getElementById('selectFrameButton');

// Botón para seleccionar el cubo de transformación
selectCubeButton.addEventListener('click', () => {
  if (transformCube) {
    transformControls.attach(transformCube);
  } else {
    alert('El cubo de transformación no ha sido creado.');
  }
});

// Botón para seleccionar el marco
selectFrameButton.addEventListener('click', () => {
  if (frame) {
    transformControls.attach(frame);
  } else {
    alert('El marco no ha sido creado.');
  }
});
