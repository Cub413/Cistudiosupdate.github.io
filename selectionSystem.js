/* Selection System */
let objetoSeleccionado = null;
let touchStartX = 0;
let touchStartY = 0;
const touchThreshold = 10;

const raycaster = new THREE.Raycaster();
const touch = new THREE.Vector2();
window.addEventListener('touchstart', (event) => {
  if (event.touches.length > 0) {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
  }
});
function isTouchOnUIElement(event) {
  const touchX = event.changedTouches[0].clientX;
  const touchY = event.changedTouches[0].clientY;
  const touchedElement = document.elementFromPoint(touchX, touchY);

  if (touchedElement) {
    const ignoredClasses = [
      "menu", "menu-item", "primary-menu", "transformControls",
      "keyframeExtraButtons", "keyframeButtons", "timelineContainer",
      "extraAnimTools"
    ];

    const ignoredIDs = [
      "meshMenu", "addMenu", "selectArea", "pos", "rot", "scl",
      "snap-toggle", "timeline", "animationMode", "keyframeExtraButtons",
      "keyframeButtons", "prevButton", "nextButton", "pauseButton",
      "clearAnimation", "exportAnimations", "copyButton", "frameNumber",
      "transitions", "autoKey", "keyframeButton"
    ];

    if (ignoredClasses.some((cls) => touchedElement.classList.contains(cls))) {
      return true;
    }

    if (ignoredIDs.includes(touchedElement.id)) {
      return true;
    }

    if (touchedElement.tagName === "IMG") {
      return true;
    }

    if (touchedElement.tagName === "BUTTON") {
      return true;
    }

    if (touchedElement.nodeType === Node.TEXT_NODE) {
      return true;
    }

    if (touchedElement.tagName === "INPUT" || touchedElement.tagName === "SELECT" || touchedElement.tagName === "TEXTAREA") {
      return true;
    }

    if (touchedElement.id === "timeline" || touchedElement.closest("#timelineContainer")) {
      return true;
    }
  }
  return false;
}
function seleccionarObjeto(event) {
  if (event.changedTouches.length > 0) {
    const touchEndX = event.changedTouches[0].clientX;
    const touchEndY = event.changedTouches[0].clientY;
    const deltaX = Math.abs(touchEndX - touchStartX);
    const deltaY = Math.abs(touchEndY - touchStartY);

    if (deltaX < touchThreshold && deltaY < touchThreshold) {
      touch.x = (event.changedTouches[0].clientX / window.innerWidth) * 2 - 1;
      touch.y = -(event.changedTouches[0].clientY / window.innerHeight) * 2 + 1;

      if (isTouchOnUIElement(event)) return;

      raycaster.setFromCamera(touch, camera);
      const intersecciones = raycaster.intersectObjects(scene.children, true);

      const interseccionesConMalla = intersecciones.filter((interseccion) => {
        return interseccion.object instanceof THREE.Mesh && !isPartOfTransformControls(interseccion.object) && !isNoSeleccionable(interseccion.object);
      });

      let objetoTocado = null;

      for (let i = 0; i < intersecciones.length; i++) {
        const interseccion = intersecciones[i];
        if (interseccion.object.userData.id === 'bone') {
          objetoTocado = interseccion.object.parent;
          break;
        }
      }

      // Detectamos si se selecciona la cámara y la seleccionamos correctamente
      for (let i = 0; i < intersecciones.length; i++) {
        const interseccion = intersecciones[i];
        if (interseccion.object.userData.id === 'camera') {
          objetoTocado = interseccion.object.parent; // Seleccionamos el padre (la cámara)
          break;
        }
      }

      // Detectamos si se selecciona una luz por su icono
      for (let i = 0; i < intersecciones.length; i++) {
        const interseccion = intersecciones[i];
        if (interseccion.object.userData.id && interseccion.object.userData.id.startsWith('light-')) {
          objetoTocado = interseccion.object.userData.light; // Seleccionamos la luz
          break;
        }
      }

      if (!objetoTocado && interseccionesConMalla.length > 0) {
        objetoTocado = interseccionesConMalla[0].object;
      }

      if (objetoTocado) {
        if (objetoSeleccionado && objetoSeleccionado !== objetoTocado) {
          if (objetoSeleccionado instanceof THREE.Bone) {
            const boneMesh = objetoSeleccionado.children[0];
            if (boneMesh) {
              boneMesh.material.emissive.set(0x000000);
            }
          }
          objetoSeleccionado.userData.SelectedObject = false;
        }

        objetoTocado.userData.SelectedObject = true;
        updateAttachment();
        updateOutliner();
        objetoSeleccionado = objetoTocado;

        console.log("Objeto seleccionado:", objetoTocado.name);
        transformControls.attach(objetoTocado);

        if (objetoTocado instanceof THREE.Bone) {
          const boneMesh = objetoTocado.children[0];
          if (boneMesh) {
            boneMesh.material.emissive.set(0xff7000);
            boneMesh.material.emissiveIntensity = 0.5;
          }
        }

        if (objetoTocado.userData.id === 'camera') {
          // Cambiar el color de las líneas del objeto hijo de la cámara a naranja
          const cameraLines = objetoTocado.getObjectByName('cameraLines');
          if (cameraLines) {
            cameraLines.material.color.set(0xff8000);
          }
          objetoTocado.material.emissive.set(0x00ff00);
        }

        if (objetoTocado instanceof THREE.Light) {
          // Al seleccionar la luz, cambiar el color del icono a verde
          const icon = objetoTocado.getObjectByName('lightIcon');
          if (icon) {
            icon.material.color.set(0x00ff00);
          }
        }
      } else {
        deselectObject();
        transformControls.detach();
      }
    }
  }
}
function isPartOfTransformControls(object) {
  if (object === transformControls) return true;
  let parent = object.parent;
  while (parent) {
    if (parent === transformControls) return true;
    parent = parent.parent;
  }
  return false;
}
function isNoSeleccionable(object) {
  return object.userData.noSeleccionable === true;
}
window.addEventListener('touchend', seleccionarObjeto);

/* Deselect */
function deselectObject() {
  scene.traverse((object) => {
    if (object.userData.SelectedObject) {
      object.userData.SelectedObject = false;
    }
  });

  objetoSeleccionado = null;
  updateOutliner();
}

/* Area Selection */
const selectAreaButton = document.getElementById('selectArea');
let isSelectingArea = false;
selectAreaButton.addEventListener('click', () => {
  if (!isSelectingArea) {
    isSelectingArea = true;
    controls.enableRotate = false;
    selectAreaButton.style.backgroundColor = "var(--accent-primary)";
    console.log("Modo de selección activado");
    startSelectionRectangle();
  } else {
    console.log("Modo de selección desactivado");
    stopSelectionRectangle();
    controls.enableRotate = true;
    selectAreaButton.style.backgroundColor = "";
    isSelectingArea = false;
  }
});
let selectionRectangle;
let startX = 0;
let startY = 0;
function startSelectionRectangle() {
  window.addEventListener('touchstart', onTouchStart);
  window.addEventListener('touchmove', onTouchMove);
  window.addEventListener('touchend', onTouchEnd);

  selectionRectangle = document.createElement('div');
  selectionRectangle.style.position = 'absolute';
  selectionRectangle.style.border = '1px dashed #FFA500';
  selectionRectangle.style.backgroundColor = 'rgba(255, 165, 0, 0.2)';
  selectionRectangle.style.pointerEvents = 'none';
  document.body.appendChild(selectionRectangle);
}
function stopSelectionRectangle() {
  window.removeEventListener('touchstart', onTouchStart);
  window.removeEventListener('touchmove', onTouchMove);
  window.removeEventListener('touchend', onTouchEnd);

  if (selectionRectangle) {
    selectionRectangle.remove();
    selectionRectangle = null;
  }
}
function onTouchStart(event) {
  if (event.touches.length === 1) {
    startX = event.touches[0].clientX;
    startY = event.touches[0].clientY;

    selectionRectangle.style.left = `${startX}px`;
    selectionRectangle.style.top = `${startY}px`;
    selectionRectangle.style.width = `0px`;
    selectionRectangle.style.height = `0px`;
  }
}
function onTouchMove(event) {
  if (event.touches.length === 1) {
    const currentX = event.touches[0].clientX;
    const currentY = event.touches[0].clientY;

    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);

    selectionRectangle.style.left = `${Math.min(startX, currentX)}px`;
    selectionRectangle.style.top = `${Math.min(startY, currentY)}px`;
    selectionRectangle.style.width = `${width}px`;
    selectionRectangle.style.height = `${height}px`;
  }
}
function onTouchEnd() {
  console.log("Selección completada");

  const rect = selectionRectangle.getBoundingClientRect();
  const minX = rect.left;
  const minY = rect.top;
  const maxX = rect.right;
  const maxY = rect.bottom;

  const selectedObjects = [];

  scene.traverse((object) => {
    if (object instanceof THREE.Mesh && !isNoSeleccionable(object)) {
      const box = new THREE.Box3().setFromObject(object);
      const center = box.getCenter(new THREE.Vector3());
      const screenPos = center.clone().project(camera);

      const screenX = (screenPos.x * 0.5 + 0.5) * window.innerWidth;
      const screenY = (1 - (screenPos.y * 0.5 + 0.5)) * window.innerHeight;

      if (screenX >= minX && screenX <= maxX && screenY >= minY && screenY <= maxY) {
        selectedObjects.push(object);
        object.userData.SelectedObject = true;
        console.log("Objeto seleccionado:", object.name);
      } else {
        object.userData.SelectedObject = false;
      }
    }
  });

  if (selectedObjects.length === 0) {
    console.log("No se seleccionaron objetos.");
  } else {
    console.log(`${selectedObjects.length} objetos seleccionados.`);
  }

  stopSelectionRectangle();
  controls.enableRotate = true;
  selectAreaButton.style.backgroundColor = "";
}

const edgeMaterial = new THREE.LineBasicMaterial({
  color: 0x0000ff,  // Azul
  linewidth: 4,
  depthWrite: false,
});

function addEdgeOutline(object) {
  const edgesGeometry = new THREE.EdgesGeometry(object.geometry);
  const edges = new THREE.LineSegments(edgesGeometry, edgeMaterial);
  edges.position.set(0, 0, 0);
  object.add(edges);
  object.edges = edges;
  object.edges.userData.exclude = true;
  updateOutliner();
}
function removeEdgeOutline(object) {
  if (object.edges) {
    object.remove(object.edges);
    object.edges.geometry.dispose();
    object.edges.material.dispose();
    delete object.edges;
  }
}
function removeAllEdgeOutlines() {
  scene.traverse((object) => {
    if (object.edges) {
      object.remove(object.edges);
      object.edges.geometry.dispose();
      object.edges.material.dispose();
      delete object.edges;
    }
  });
}
function updateOutlines() {
  let selectedObjectExists = false;

  scene.traverse((object) => {
    const hasBones = object instanceof THREE.Object3D && object.children.some(child => child instanceof THREE.Bone);

    if (object instanceof THREE.Mesh && object.userData.SelectedObject && !hasBones) {
      selectedObjectExists = true;
      if (!object.edges) {
        addEdgeOutline(object);
      }
    } else if (object.edges) {
      removeEdgeOutline(object);
    }
  });

  if (!selectedObjectExists) {
    removeAllEdgeOutlines();
  }
}