/* Mostrar y ocultar menus */
function showMenu(id) {
  const element = document.getElementById(id);
  const primaryMenus = document.querySelectorAll('.primary-menu');
  let menuOpened = null;

  // Verifica si algún menú está abierto y lo guarda en la variable menuOpened
  primaryMenus.forEach(menu => {
    if (menu.style.display === 'block') {
      menuOpened = menu; // Guarda el menú que está abierto
    }
  });

  // Si hay un menú abierto y no es el que estamos intentando abrir, lo cerramos
  if (menuOpened && menuOpened !== element) {
    menuOpened.style.display = 'none'; // Cierra el menú anterior
  }

  // Alterna la visibilidad del menú que se quiere abrir
  if (element.style.display === 'none' || element.style.display === '') {
    element.style.display = 'block'; // Abre el nuevo menú
  } else {
    element.style.display = 'none'; // Si ya está abierto, lo cierra
  }
}
function hide() {
    const menus = document.querySelectorAll('.menu');
    const primaryMenus = document.querySelectorAll('.primary-menu');
    
    menus.forEach(menu => {
        menu.style.display = 'none';
    });

    primaryMenus.forEach(menu => {
        menu.style.display = 'none';
    });
}

/* Boton de Cerrar (×) */
document.querySelectorAll('.menu').forEach(menu => {
  const closeButton = document.createElement('button');
  closeButton.id = 'x';
  closeButton.innerHTML = '×';

  menu.appendChild(closeButton);
});
document.querySelectorAll('button').forEach(button => {
  if (button.textContent.trim() === '×') {
    button.addEventListener('click', hide);
  }
});

/* Timeline */
function showTimeline() {
  const timeline = document.getElementById('animationMode');

  if (!timeline) {
    console.warn('Elemento #animationMode no encontrado.');
    return;
  }

  const isVisible = timeline.style.display !== 'none';

  if (isVisible) {
    timeline.style.display = 'none';
  } else {
    timeline.style.display = 'block';
  }
}

/* Buttons */
function toggleTransformControls() {
  const controls = document.querySelector('.transformControls');
  const button = document.querySelector('#transformButtons');
  const children = controls.children;

  if (children[1].style.display !== 'none') {
    Array.from(children).forEach((child, index) => {
      if (index !== 0) {
        child.style.display = 'none';
      }
    });
    button.style.transform = 'rotate(90deg)';
    button.style.right = '2px';
  } else {
    Array.from(children).forEach((child, index) => {
      if (index !== 0) {
        child.style.display = '';
      }
    });
    button.style.transform = 'rotate(0deg)';
    button.style.right = '';
  }
}
function toggleActionButtons() {
  const controls = document.querySelector('.actionBar');
  const button = document.querySelector('#actionButtons');
  const children = controls.children;

  if (children[1].style.display !== 'none') {
    Array.from(children).forEach((child, index) => {
      if (index !== 0) {
        child.style.display = 'none';
      }
    });
    button.style.transform = 'rotate(90deg)';
    button.style.right = '2px';
  } else {
    Array.from(children).forEach((child, index) => {
      if (index !== 0) {
        child.style.display = '';
      }
    });
    button.style.transform = 'rotate(0deg)';
    button.style.right = '';
  }
}



/* Seleccion de Modo */
function changeMode() {
  const selectedMode = document.getElementById('modeDropdown').value;
  const modes = ['objectMode', 'animationMode', 'riggingMode', 'materialMode'];
  modes.forEach(mode => {
    const modeContainer = document.getElementById(mode);
    if (modeContainer) {
      modeContainer.style.display = 'none';
    }
  });
  const selectedContainer = document.getElementById(selectedMode);
  if (selectedContainer) {
    selectedContainer.style.display = 'block';
  }
}

let isDynamic = true;
let currentShape = "box";

function toggleRigidBodyType() {
  isDynamic = !isDynamic;
  const button = document.getElementById("rigidTypeBtn");
  button.textContent = isDynamic ? "Dynamic" : "Static";
}

function toggleShape() {
  const shapes = ["box", "sphere", "mesh"];
  const currentIndex = shapes.indexOf(currentShape);
  const nextIndex = (currentIndex + 1) % shapes.length;
  currentShape = shapes[nextIndex];

  const button = document.getElementById("rigidShapeBtn");
  button.textContent = capitalizeFirstLetter(currentShape);
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function toggleActionBar() {
  const outliner = document.getElementById('outliner');
  const actionBar = document.querySelector('.actionBar');

  if (window.getComputedStyle(outliner).display === 'block') {
    actionBar.style.display = 'none';
  } else {
    actionBar.style.display = 'flex'; 
  }
}
toggleActionBar();
const observer = new MutationObserver(() => toggleActionBar());
observer.observe(document.getElementById('outliner'), {
  attributes: true,
  attributeFilter: ['style'],
});


/* Model Viewport */
let previewScene, previewCamera, previewRenderer, previewGroup;

function initializePreviewScene() {
  const previewElement = document.getElementById('modelPreview');

  previewScene = new THREE.Scene();
  previewCamera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
  previewCamera.position.set(4, 3, 4);
  previewCamera.lookAt(0, 1, 0);

  previewRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  previewRenderer.setSize(previewElement.offsetWidth, previewElement.offsetHeight);
  previewElement.appendChild(previewRenderer.domElement);

  previewScene.background = null;

  previewGroup = new THREE.Group();
  previewGroup.userData.id = 'exclude';
  previewGroup.name = 'excludedGroup'
  previewGroup.add(previewCamera);
  previewScene.add(previewGroup);

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 5, 5);
  previewScene.add(light);

  const ambientLight = new THREE.AmbientLight(0x404040, 1);
  previewScene.add(ambientLight);

  const gridHelper = new THREE.GridHelper(10, 10);
  gridHelper.userData.id = 'exclude'; // Marcar el grid para no añadirlo a la escena
  previewScene.add(gridHelper);

  function animate() {
    if (previewScene) {
      previewGroup.rotation.y += 0.01;
      previewRenderer.render(previewScene, previewCamera);
      requestAnimationFrame(animate);
    }
  }

  animate();
}

function removePreviewScene() {
  const previewElement = document.getElementById('modelPreview');
  while (previewElement.firstChild) {
    previewElement.removeChild(previewElement.firstChild);
  }
  previewScene = null;
  previewRenderer = null;
}

document.getElementById('togglePreview').addEventListener('change', function(event) {
  if (event.target.checked) {
    initializePreviewScene();
  } else {
    removePreviewScene();
  }
});

/* Object Tools */
const objectToolsButton = document.getElementById('objectTools');
let currentMenu = null;

objectToolsButton.addEventListener('click', () => {
  const selectedObject = getSelectedObject();
  if (selectedObject) {
    if (currentMenu && currentMenu.style.display === 'block') {
      currentMenu.style.display = 'none';
      currentMenu = null;
    } else {
      showObjectTools(selectedObject);
    }
  }
});

function updateObjectToolsButton() {
  const selectedObject = getSelectedObject();
  const toolMenus = document.querySelectorAll('.toolMenu');

  if (selectedObject) {
    objectToolsButton.style.display = 'block';
  } else {
    objectToolsButton.style.display = 'none';
    toolMenus.forEach(menu => menu.style.display = 'none');
    currentMenu = null;
  }
}

function showObjectTools(selectedObject) {
  const menuName = selectedObject.name || "Unnamed";
  const toolMenus = document.querySelectorAll('.toolMenu');
  toolMenus.forEach(menu => menu.style.display = 'none');

  if (selectedObject instanceof THREE.Mesh) {
    currentMenu = document.getElementById('meshTools');
    showMenu('meshTools');
    document.querySelector('#meshTools h4').textContent = `Mesh: ${menuName}`;
  } else if (selectedObject instanceof THREE.Light) {
    currentMenu = document.getElementById('lightTools');
    showMenu('lightTools');
    document.querySelector('#lightTools h4').textContent = `Light: ${menuName}`;
  } else if (selectedObject instanceof THREE.Bone) {
    currentMenu = document.getElementById('boneTools');
    showMenu('boneTools');
    document.querySelector('#boneTools h4').textContent = `Bone: ${menuName}`;
  } else if (selectedObject instanceof THREE.Camera) {
    currentMenu = document.getElementById('cameraTools');
    showMenu('cameraTools');
    document.querySelector('#cameraTools h4').textContent = `Camera: ${menuName}`;
  }
}

function handleSelectionChange() {
  const selectedObject = getSelectedObject();
  const toolMenus = document.querySelectorAll('.toolMenu');

  if (!selectedObject) {
    toolMenus.forEach(menu => menu.style.display = 'none');
    currentMenu = null;
  } else {
    showObjectTools(selectedObject);
  }
}

function getSelectedObject() {
  const selectedObjects = [];
  scene.traverse(object => {
    if (object.userData.SelectedObject) {
      selectedObjects.push(object);
    }
  });
  return selectedObjects.length > 0 ? selectedObjects[0] : null;
}

scene.traverse(object => {
  object.addEventListener('selectionChanged', handleSelectionChange);
});

// Mesh tools
function createMeshTools() {
  const meshToolsDiv = document.getElementById('meshTools');

  const shadingOptions = document.createElement('div');
  shadingOptions.classList.add('shading-options-container');
  shadingOptions.id = 'shadingOptions';

  const shadingLabel = document.createElement('h5');
  shadingLabel.textContent = 'Shading:';
  shadingOptions.appendChild(shadingLabel);

  const smoothShadingButton = document.createElement('button');
  smoothShadingButton.textContent = 'Smooth';
  smoothShadingButton.classList.add('shading-option');
  smoothShadingButton.addEventListener('click', () => applySmoothShading());

  const linearShadingButton = document.createElement('button');
  linearShadingButton.textContent = 'Linear';
  linearShadingButton.classList.add('shading-option');
  linearShadingButton.addEventListener('click', () => applyLinearShading());

  shadingOptions.appendChild(smoothShadingButton);
  shadingOptions.appendChild(linearShadingButton);

  const materialOptions = document.createElement('div');
  materialOptions.classList.add('material-options-container');
  materialOptions.id = 'materialOptions';

  const materialLabel = document.createElement('h5');
  materialLabel.textContent = 'Material:';
  materialOptions.appendChild(materialLabel);

  const standardButton = document.createElement('button');
  standardButton.textContent = 'Standard';
  standardButton.classList.add('material-option');
  standardButton.addEventListener('click', () => applyStandardMaterial());

  const matcapButton = document.createElement('button');
  matcapButton.textContent = 'Matcap';
  matcapButton.classList.add('material-option');
  matcapButton.addEventListener('click', () => applyMatcapMaterial());

  materialOptions.appendChild(standardButton);
  materialOptions.appendChild(matcapButton);

  meshToolsDiv.appendChild(shadingOptions);
  meshToolsDiv.appendChild(materialOptions);
}
function quickTexture() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.style.display = 'none';

  input.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const textureUrl = URL.createObjectURL(file);
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(textureUrl, () => {
      const selectedObjects = scene.children.filter(obj => obj.userData.SelectedObject);
      if (selectedObjects.length === 0) return;

      selectedObjects.forEach(object => {
        if (object instanceof THREE.Mesh) {
          object.material.map = texture;
          object.material.needsUpdate = true;
        }
      });
    });
  });

  input.click();
}
function applySmoothShading() {
  const selectedObject = scene.children.find(child => child.userData.SelectedObject);
  if (selectedObject && selectedObject instanceof THREE.Mesh) {
    selectedObject.material.flatShading = false;
    selectedObject.geometry.computeVertexNormals();
    selectedObject.material.needsUpdate = true;
  }
}
function applyLinearShading() {
  const selectedObject = scene.children.find(child => child.userData.SelectedObject);
  if (selectedObject && selectedObject instanceof THREE.Mesh) {
    selectedObject.material.flatShading = true;
    selectedObject.geometry.computeVertexNormals();
    selectedObject.material.needsUpdate = true;
  }
}
function applyStandardMaterial() {
  const selectedObject = scene.children.find(child => child.userData.SelectedObject);
  if (selectedObject && selectedObject instanceof THREE.Mesh) {
    selectedObject.material = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
  }
}
function applyMatcapMaterial() {
  const selectedObject = scene.children.find(child => child.userData.SelectedObject);
  if (selectedObject && selectedObject instanceof THREE.Mesh) {
    const textureLoader = new THREE.TextureLoader();
    const matcapTexture = textureLoader.load('assets/Textures/12719-v4.jpg');
    selectedObject.material = new THREE.MeshMatcapMaterial({ matcap: matcapTexture });
  }
}
function combineSel() {
  let selectedObjects = [];

  scene.traverse((object) => {
    if (object.userData.SelectedObject) {
      selectedObjects.push(object);
    }
  });

  if (selectedObjects.length < 2) {
    console.error('Debe seleccionar al menos dos objetos.');
    return;
  }

  // Crear una nueva geometría combinada
  const mergedGeometry = new THREE.BufferGeometry();

  let offset = 0;

  selectedObjects.forEach(object => {
    const geometry = object.geometry.clone();

    if (!geometry.attributes.position) return; // Asegurarse de que tiene geometría válida
    const positions = geometry.attributes.position.array;
    const normals = geometry.attributes.normal ? geometry.attributes.normal.array : [];
    const uvs = geometry.attributes.uv ? geometry.attributes.uv.array : [];

    // Establecer atributos de la geometría combinada
    mergedGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions.length + offset), 3));
    mergedGeometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals.length + offset), 3));
    if (uvs.length) mergedGeometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs.length + offset), 2));

    // Copiar los datos de las geometrías seleccionadas a la geometría combinada
    for (let i = 0; i < positions.length; i++) {
      mergedGeometry.attributes.position.setXYZ(offset + i, positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
      if (normals.length) mergedGeometry.attributes.normal.setXYZ(offset + i, normals[i * 3], normals[i * 3 + 1], normals[i * 3 + 2]);
      if (uvs.length) mergedGeometry.attributes.uv.setXY(offset + i, uvs[i * 2], uvs[i * 2 + 1]);
    }

    offset += positions.length / 3;
  });

  // Crear un nuevo mesh con la geometría combinada
  const combinedMesh = new THREE.Mesh(mergedGeometry, selectedObjects[0].material);

  // Añadir el objeto combinado a la escena
  scene.add(combinedMesh);

  // Exportar el objeto combinado a formato .obj
  const exporter = new THREE.OBJExporter();
  const objData = exporter.parse(combinedMesh);

  // Crear un objeto Blob con el contenido exportado
  const blob = new Blob([objData], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);

  // Cargar el objeto .obj exportado de vuelta en la escena
  const loader = new THREE.OBJLoader();
  loader.load(url, (object) => {
    scene.add(object);
    console.log("Objeto importado correctamente.");

    // Eliminar los objetos originales de la escena
    selectedObjects.forEach(object => scene.remove(object));
  });
}
createMeshTools();

// Ligth tools
function createLightTools() {
  const lightToolsDiv = document.getElementById('lightTools');

  const typeOptions = document.createElement('div');
  typeOptions.classList.add('type-options-container');
  typeOptions.id = 'typeOptions';

  
  
  const intensityOptions = document.createElement('div');
  intensityOptions.classList.add('intensity-options-container');
  intensityOptions.id = 'intensityOptions';

  const intensityLabel = document.createElement('h5');
  intensityLabel.textContent = 'Intensity:';
  intensityOptions.appendChild(intensityLabel);

  const intensityInput = document.createElement('input');
  intensityInput.type = 'range';
  intensityInput.min = 0;
  intensityInput.max = 10;
  intensityInput.step = 0.1;
  intensityInput.value = 1;
  intensityInput.addEventListener('input', (e) => adjustLightIntensity(e.target.value));
  intensityOptions.appendChild(intensityInput);

  const colorOptions = document.createElement('div');
  colorOptions.classList.add('color-options-container');
  colorOptions.id = 'colorOptions';

  const colorLabel = document.createElement('h5');
  colorLabel.textContent = 'Color:';
  colorOptions.appendChild(colorLabel);

  const colorInput = document.createElement('input');
  colorInput.type = 'color';
  colorInput.value = '#ffffff';
  colorInput.addEventListener('input', (e) => changeLightColor(e.target.value));
  colorOptions.appendChild(colorInput);

  const shadowOptions = document.createElement('div');
  shadowOptions.classList.add('shadow-options-container');
  shadowOptions.id = 'shadowOptions';

  const shadowLabel = document.createElement('h5');
  shadowLabel.textContent = 'Shadows:';
  shadowOptions.appendChild(shadowLabel);

  const shadowCheckbox = document.createElement('input');
  shadowCheckbox.type = 'checkbox';
  shadowCheckbox.addEventListener('change', (e) => toggleLightShadows(e.target.checked));
  shadowOptions.appendChild(shadowCheckbox);

  const distanceOptions = document.createElement('div');
  distanceOptions.classList.add('distance-options-container');
  distanceOptions.id = 'distanceOptions';

  const distanceLabel = document.createElement('h5');
  distanceLabel.textContent = 'Distance:';
  distanceOptions.appendChild(distanceLabel);

  const distanceInput = document.createElement('input');
  distanceInput.type = 'range';
  distanceInput.min = 0;
  distanceInput.max = 100;
  distanceInput.step = 1;
  distanceInput.value = 10;
  distanceInput.addEventListener('input', (e) => adjustLightDistance(e.target.value));
  distanceOptions.appendChild(distanceInput);

  lightToolsDiv.appendChild(typeOptions);
  lightToolsDiv.appendChild(intensityOptions);
  lightToolsDiv.appendChild(colorOptions);
  lightToolsDiv.appendChild(shadowOptions);
  lightToolsDiv.appendChild(distanceOptions);
}
function changeLightType(type) {
  const selectedObject = scene.children.find(child => child.userData.SelectedObject && child instanceof THREE.Light);
  if (selectedObject) {
    let newLight;
    switch (type) {
      case 'point':
        newLight = new THREE.PointLight(0xFFFFFF, selectedObject.intensity, selectedObject.distance);
        break;
      case 'directional':
        newLight = new THREE.DirectionalLight(0xFFFFFF, selectedObject.intensity);
        break;
      case 'spot':
        newLight = new THREE.SpotLight(0xFFFFFF, selectedObject.intensity, selectedObject.distance);
        break;
      case 'ambient':
        newLight = new THREE.AmbientLight(0xFFFFFF, selectedObject.intensity);
        break;
    }
    // Reemplazar el objeto de luz actual con el nuevo tipo
    const parent = selectedObject.parent;
    parent.remove(selectedObject);
    parent.add(newLight);
    selectedObject = newLight; // Actualizar el objeto seleccionado
  }
}
function adjustLightIntensity(value) {
  const selectedObject = scene.children.find(child => child.userData.SelectedObject && child instanceof THREE.Light);
  if (selectedObject) {
    selectedObject.intensity = parseFloat(value);
  }
}
function changeLightColor(value) {
  const selectedObject = scene.children.find(child => child.userData.SelectedObject && child instanceof THREE.Light);
  if (selectedObject) {
    selectedObject.color.set(value);
  }
}
function toggleLightShadows(enabled) {
  const selectedObject = scene.children.find(child => child.userData.SelectedObject && child instanceof THREE.Light);
  if (selectedObject) {
    selectedObject.castShadow = enabled;
  }
}
function adjustLightDistance(value) {
  const selectedObject = scene.children.find(child => child.userData.SelectedObject && child instanceof THREE.Light);
  if (selectedObject) {
    selectedObject.distance = parseFloat(value);
  }
}
createLightTools();


function addLightIcon() {
  const textureLoader = new THREE.TextureLoader();
  textureLoader.load('assets/textures/light.svg', function(lightIconTexture) {
    let lightFound = false;

    scene.traverse((object) => {
      if (object.isLight && object.type !== 'AmbientLight') {
        lightFound = true;
        let existingSprite = object.getObjectByName('lightIcon');
        if (existingSprite) {
          return;
        }

        const spriteMaterial = new THREE.SpriteMaterial({
          map: lightIconTexture,
          transparent: true,
          opacity: 1
        });

        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.position.set(0, 0, 0);
        sprite.scale.set(1, 1, 1);
        object.add(sprite);
        sprite.name = 'lightIcon';
        sprite.userData.exclude = true;
        function updateSpriteSize() {
          const cameraDistance = camera.position.distanceTo(sprite.position);
          const scaleFactor = cameraDistance * 0.05;
          sprite.scale.set(scaleFactor, scaleFactor, 1);
        }

        function animate() {
          updateSpriteSize();
          sprite.material.color.set(object.color);
          requestAnimationFrame(animate);
        }

        animate();
        sprite.userData.light = object;
        sprite.userData.id = `light-${Math.random()}`;
        sprite.onClick = function() {
          selectLight(sprite.userData.light);
        };
      }
    });

    if (!lightFound) {
      console.log('No hay luces');
    } else {
      console.log('Iconos añadidos');
    }
  }, undefined, function(error) {
    console.error('Error al añador icono: ', error);
  });
}


let cameraRenderer, cameraViewport, cameraRenderTarget, viewportCamera;

function setupCameraViewport() {
  cameraViewport = document.getElementById('cameraViewport');
  if (cameraViewport.style.display === 'block') {
    cameraViewport.style.display = 'none';
    return;
  }
  cameraViewport.style.display = 'block';

  cameraRenderTarget = new THREE.WebGLRenderTarget(200, 100);

  if (!cameraRenderer) {
    cameraRenderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    });
    cameraRenderer.setSize(200, 100);
    cameraRenderer.setPixelRatio(window.devicePixelRatio);
    cameraViewport.appendChild(cameraRenderer.domElement);
  }

  updateViewportCamera();

  function updateViewportCamera() {
    let selectedCamera = null;
    scene.traverse((object) => {
      if (object.userData.SelectedObject && object instanceof THREE.Camera) {
        selectedCamera = object;
      }
    });

    if (selectedCamera) {
      viewportCamera = selectedCamera;
      const aspectRatio = 200 / 100;
      viewportCamera.aspect = aspectRatio;
      viewportCamera.updateProjectionMatrix();
    }
  }

  function render() {
    requestAnimationFrame(render);
    if (viewportCamera) {
      viewportCamera.updateMatrixWorld();

      cameraRenderer.setScissorTest(true);
      cameraRenderer.setScissor(0, 0, 200, 100);

      const hiddenObjects = [];

      scene.traverse((object) => {
        if (
          (object instanceof THREE.TransformControls ||
            object instanceof THREE.LineSegments ||
            object instanceof THREE.Line ||
            object instanceof THREE.Sprite) &&
          !(object instanceof THREE.GridHelper)
        ) {
          hiddenObjects.push(object);
          object.visible = false;
        }
      });

      cameraRenderer.render(scene, viewportCamera);

      hiddenObjects.forEach((object) => {
        object.visible = true;
      });

      cameraRenderer.setScissorTest(false);
    }
  }

  render();
}
function closeViewport() {
  const cameraViewport = document.getElementById('cameraViewport');
  cameraViewport.style.display = 'none';
}
function makeViewportDraggable() {
  const cameraViewport = document.getElementById('cameraViewport');

  if (!cameraViewport) return;

  cameraViewport.style.position = 'absolute';

  let isDragging = false;
  let previousTouch = { x: 0, y: 0 };
  const viewportWidth = parseFloat(cameraViewport.offsetWidth);
  const viewportHeight = parseFloat(cameraViewport.offsetHeight);

  cameraViewport.addEventListener('touchstart', (event) => {
    if (event.touches.length === 1) {
      isDragging = true;
      previousTouch.x = event.touches[0].clientX;
      previousTouch.y = event.touches[0].clientY;
    }
  });

  cameraViewport.addEventListener('touchmove', (event) => {
    if (isDragging && event.touches.length === 1) {
      const deltaX = event.touches[0].clientX - previousTouch.x;
      const deltaY = event.touches[0].clientY - previousTouch.y;

      const currentStyle = window.getComputedStyle(cameraViewport);
      const currentLeft = parseFloat(currentStyle.left) || 0;
      const currentTop = parseFloat(currentStyle.top) || 0;

      let newLeft = currentLeft + deltaX;
      let newTop = currentTop + deltaY;

      newLeft = Math.max(0, Math.min(window.innerWidth - viewportWidth, newLeft));
      newTop = Math.max(0, Math.min(window.innerHeight - viewportHeight, newTop));

      cameraViewport.style.left = `${newLeft}px`;
      cameraViewport.style.top = `${newTop}px`;

      previousTouch.x = event.touches[0].clientX;
      previousTouch.y = event.touches[0].clientY;
    }
  });

  cameraViewport.addEventListener('touchend', () => {
    isDragging = false;
  });

  cameraViewport.addEventListener('touchcancel', () => {
    isDragging = false;
  });
}
function pin() {
  const cameraViewport = document.getElementById('cameraViewport');
  const viewportButtons = cameraViewport.querySelectorAll('button');
  const isPinned = cameraViewport.getAttribute('data-pinned') === 'true';

  if (isPinned) {
    cameraViewport.setAttribute('data-pinned', 'false');
    cameraViewport.style.pointerEvents = 'auto';
    viewportButtons.forEach(button => {
      button.style.display = 'block';
    });
  } else {
    cameraViewport.setAttribute('data-pinned', 'true');
    cameraViewport.style.pointerEvents = 'none';
    viewportButtons.forEach(button => {
      button.style.display = 'none';
    });
  }
}
function lookOnObject() {
  const target = scene.children.find((child) => child.userData?.id === 'cameraTarget');
  
  if (!target) {
    console.error('No se encontró un objeto con el ID "cameraTarget".');
    return;
  }

  let selectedCamera = null;

  scene.traverse((object) => {
    if (object.userData.SelectedObject && object.isCamera) {
      selectedCamera = object;
    }
  });

  if (!selectedCamera) {
    console.error('No hay ninguna cámara seleccionada.');
    return;
  }
  
  function updateCameraView() {
    const cameraPosition = selectedCamera.position;
    const targetPosition = target.getWorldPosition(new THREE.Vector3());
    const direction = new THREE.Vector3().subVectors(targetPosition, cameraPosition).normalize();
    
    selectedCamera.lookAt(targetPosition);
    selectedCamera.rotation.setFromRotationMatrix(new THREE.Matrix4().lookAt(
      cameraPosition,
      targetPosition,
      new THREE.Vector3(0, 1, 0)
    ));

    requestAnimationFrame(updateCameraView);
  }

  updateCameraView();
}
function changeColor() {
  const input = document.getElementById('backgroundColor');
  const selectedCamera = scene.getObjectByName('Camera'); // O la cámara que estés utilizando

  if (selectedCamera && selectedCamera.isCamera) {
    scene.background = new THREE.Color(input.value);
    renderer.render(scene, selectedCamera);
  } else {
    console.error('No se ha seleccionado una cámara válida.');
  }
}
function orthographicProjection() {
  const selectedCamera = scene.children.find(obj => obj.userData.SelectedObject && obj.isCamera);

  if (selectedCamera && selectedCamera.isPerspectiveCamera) {
    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 8;

    const cameraObjLoader = new THREE.OBJLoader();

    cameraObjLoader.load('assets/Models/camera.obj', function(obj) {
      let cameraLines;

      obj.traverse((child) => {
        if (child.isMesh) {
          const edges = new THREE.EdgesGeometry(child.geometry);
          cameraLines = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({
            color: 0x000000,
            linewidth: 2,
          }));
          cameraLines.userData.exclude = true;
          cameraLines.userData.id = 'camera';
          cameraLines.rotation.y = THREE.MathUtils.degToRad(90);
        }
      });

      if (!cameraLines) {
        console.error('No se encontró geometría válida en el archivo OBJ para las líneas de la cámara.');
        return;
      }

      const orthographicCamera = new THREE.OrthographicCamera(
        -frustumSize * aspect / 2,
        frustumSize * aspect / 2,
        frustumSize / 2,
        -frustumSize / 2,
        selectedCamera.near,
        selectedCamera.far
      );

      orthographicCamera.name = 'Camera';
      orthographicCamera.userData.id = 'camera';
      orthographicCamera.position.copy(selectedCamera.position);
      orthographicCamera.rotation.copy(selectedCamera.rotation);
      orthographicCamera.lookAt(0, 0, 0);

      cameraLines.position.set(0, 0, 0);
      orthographicCamera.add(cameraLines);
      orthographicCamera.scale.set(3, 1, 0.5);
      scene.add(orthographicCamera);

      transformControls.detach();
      transformControls.attach(orthographicCamera);

      selectedCamera.userData.SelectedObject = false;
      scene.remove(selectedCamera);

      orthographicCamera.userData.SelectedObject = true;

      setupCameraViewport();
      updateOutliner();
      setupCameraViewport();
    });
  } else {
    console.error('No se ha seleccionado una cámara válida o la cámara ya es ortográfica.');
  }
}
function perspectiveProjection() {
  const selectedCamera = scene.children.find(obj => obj.userData.SelectedObject && obj.isCamera);

  if (selectedCamera && selectedCamera.isOrthographicCamera) {
    const aspect = window.innerWidth / window.innerHeight;
    const fov = 50;
    const near = selectedCamera.near;
    const far = selectedCamera.far;

    const cameraObjLoader = new THREE.OBJLoader();

    cameraObjLoader.load('assets/Models/camera.obj', function(obj) {
      let cameraLines;

      obj.traverse((child) => {
        if (child.isMesh) {
          const edges = new THREE.EdgesGeometry(child.geometry);
          cameraLines = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({
            color: 0x000000,
            linewidth: 2,
          }));
          cameraLines.userData.exclude = true;
          cameraLines.userData.id = 'camera';
          cameraLines.rotation.y = THREE.MathUtils.degToRad(90);
        }
      });

      if (!cameraLines) {
        console.error('No se encontró geometría válida en el archivo OBJ para las líneas de la cámara.');
        return;
      }

      const perspectiveCamera = new THREE.PerspectiveCamera(fov, aspect, near, far);

      perspectiveCamera.name = 'Camera';
      perspectiveCamera.userData.id = 'camera';
      perspectiveCamera.position.copy(selectedCamera.position);
      perspectiveCamera.rotation.copy(selectedCamera.rotation);
      perspectiveCamera.lookAt(0, 0, 0);

      cameraLines.position.set(0, 0, 0);
      perspectiveCamera.add(cameraLines);

      scene.add(perspectiveCamera);

      transformControls.detach();
      transformControls.attach(perspectiveCamera);

      selectedCamera.userData.SelectedObject = false;
      scene.remove(selectedCamera);

      perspectiveCamera.userData.SelectedObject = true;

      setupCameraViewport();
      updateOutliner();
      setupCameraViewport();
    });
  } else {
    console.error('No se ha seleccionado una cámara válida o la cámara ya es perspectiva.');
  }
}

addDirectionalLight();

function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    sidebar.style.display = sidebar.style.display === "none" ? "block" : "none";
  }
// Obtener el botón por su etiqueta (o por su clase, id, etc.)
  const button = document.querySelector('button[onclick="showMenu(\'outliner\'), updateOutliner()"]');

  // Función para simular hacer clic dos veces en el botón
  function clickButtonTwice() {
    button.click(); // Primer clic
    setTimeout(() => {
      button.click(); // Segundo clic después de un pequeño retraso (100 ms en este caso)
    }, 100);
  }

  // Llamar a la función clickButtonTwice para simular los dos clics
  clickButtonTwice();
