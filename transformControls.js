const transformControls = new THREE.TransformControls(camera, renderer.domElement);
transformControls.setSpace('local');
scene.add(transformControls);

scene.traverse((object) => {
  if (object.userData.isBone && object.selected) {
    if (!scene.children.includes(object)) {
      scene.add(object);
    }
    transformControls.attach(object);
  }
});

transformControls.addEventListener('dragging-changed', function(event) {
  controls.enableRotate = !event.value;
});

transformControls.traverse((child) => {
  if (child.isLine) {
    child.material.linewidth = 3;
  }
});

transformControls.traverse((child) => {
  if (child.isMesh || child.isObject3D) {
    child.userData.transformControlElement = true;
    child.userData.noSeleccionable = true;
    child.userData.exclude = true;
  }
});

function getSelectedObject() {
  return scene.children.find(obj => obj.userData.SelectedObject === true && !obj.userData.locked);
}

/* Transform Buttons */
let selectedObject = null;

function setModeAndSelect(mode, buttonId) {
  transformControls.setMode(mode);
  document.getElementById(buttonId).style.backgroundColor = transformControls.mode === mode ? 'var(--accent-secondary)' : '';

  if (selectedObject) {
    scene.traverse((object) => {
      object.userData.SelectedObject = false;
    });

    selectedObject.userData.SelectedObject = true;
    transformControls.attach(selectedObject);
    updateOutliner();
  }
}

document.getElementById('pos').addEventListener('click', function() {
  setModeAndSelect('translate', 'pos');
});

document.getElementById('rot').addEventListener('click', function() {
  setModeAndSelect('rotate', 'rot');
});

document.getElementById('scl').addEventListener('click', function() {
  setModeAndSelect('scale', 'scl');
});

transformControls.addEventListener('change', function() {
  ['pos', 'rot', 'scl'].forEach((id) => {
    const button = document.getElementById(id);
    if (transformControls.mode !== id) {
      button.style.backgroundColor = '';
    } else {
      button.style.backgroundColor = 'var(--accent-secondary)';
    }
  });
});

scene.addEventListener('click', function(event) {
  const intersects = raycaster.intersectObjects(scene.children, true);
  if (intersects.length > 0) {
    const newSelection = intersects[0].object;

    if (selectedObject) {
      selectedObject.userData.SelectedObject = false;
    }

    selectedObject = newSelection;
    selectedObject.userData.SelectedObject = true;

    transformControls.attach(selectedObject);
    updateOutliner();
  }
});

// Snap functionality
document.addEventListener('DOMContentLoaded', () => {
  const snapButton = document.getElementById('snap-toggle');
  const snapImage = document.getElementById('snap-img');
  let snapEnabled = false;
  let snapValue = 1;

  let clickCount = 0;
  const doubleClickTime = 50;

  snapButton.addEventListener('click', () => {
    clickCount++;
    if (clickCount === 1) {
      setTimeout(() => {
        if (clickCount === 1) {
          snapEnabled = !snapEnabled;
          if (snapEnabled) {
            snapImage.src = '/icons/snap_on.svg';
            snapButton.style.backgroundColor = 'var(--accent-secondary)';
          } else {
            snapImage.src = '/icons/snap_off.svg';
            snapButton.style.backgroundColor = '';
          }
        }
        clickCount = 0;
      }, doubleClickTime);
    } else if (clickCount === 2) {
      const newSnapValue = prompt('Ingrese el valor de Snap:', snapValue);
      if (newSnapValue !== null && !isNaN(newSnapValue)) {
        snapValue = parseFloat(newSnapValue);
        alert(`Nuevo valor de Snap: ${snapValue}`);
      }
      clickCount = 0;
    }
  });

  transformControls.addEventListener('objectChange', () => {
    const selectedObject = getSelectedObject();
    if (selectedObject) {
      const gridSize = snapValue;

      if (snapEnabled && (transformControls.mode === 'translate' || transformControls.mode === 'rotate')) {
        const position = selectedObject.position;
        selectedObject.position.set(
          Math.round(position.x / gridSize) * gridSize,
          Math.round(position.y / gridSize) * gridSize,
          Math.round(position.z / gridSize) * gridSize
        );

        const rotation = selectedObject.rotation;
        selectedObject.rotation.set(
          Math.round(rotation.x / gridSize) * gridSize,
          Math.round(rotation.y / gridSize) * gridSize,
          Math.round(rotation.z / gridSize) * gridSize
        );
      }

      if (snapEnabled && transformControls.mode === 'scale') {
        const scale = selectedObject.scale;
        selectedObject.scale.set(
          Math.round(scale.x / gridSize) * gridSize,
          Math.round(scale.y / gridSize) * gridSize,
          Math.round(scale.z / gridSize) * gridSize
        );
      }
    }
  });
});

function updateAttachment() {
  const selectedObject = scene.children.find(obj => obj.userData.SelectedObject && !obj.userData.locked);

  checkTransformControlsSize();

  if (selectedObject) {
    selectedObject.updateMatrixWorld(true);

    let rootObject = selectedObject;
    while (rootObject.parent && rootObject.parent !== scene) {
      rootObject = rootObject.parent;
    }

    transformControls.attach(rootObject);
    rootObject.traverse((child) => {
      if (child.userData.SelectedObject && !child.userData.locked) {
        transformControls.attach(child);
      }
    });

    rootObject.updateMatrixWorld(true);
  } else {
    transformControls.detach();
  }
}

function checkTransformControlsSize() {
  if (window.innerWidth > window.innerHeight) {
    transformControls.setSize(2.1);
  } else {
    transformControls.setSize(1);
  }
}

window.addEventListener('resize', checkTransformControlsSize);


/* Undo System */
transformControls.addEventListener('dragging-changed', function(event) {
  const selectedObject = getSelectedObject();

  if (event.value) {
    if (selectedObject) {
      initialTransform = {
        position: selectedObject.position.clone(),
        rotation: selectedObject.rotation.clone(),
        scale: selectedObject.scale.clone()
      };

      console.log('Guardando transformación inicial:', {
        position: initialTransform.position.toArray(),
        rotation: initialTransform.rotation.toArray(),
        scale: initialTransform.scale.toArray()
      });
    }
    controls.enableRotate = false;
  } else {
    if (selectedObject && initialTransform) {
      const finalTransform = {
        position: selectedObject.position.clone(),
        rotation: selectedObject.rotation.clone(),
        scale: selectedObject.scale.clone()
      };

      console.log('Guardando transformación final:', {
        position: finalTransform.position.toArray(),
        rotation: finalTransform.rotation.toArray(),
        scale: finalTransform.scale.toArray()
      });

      const undoTransform = {
        position: initialTransform.position.clone(),
        rotation: initialTransform.rotation.clone(),
        scale: initialTransform.scale.clone()
      };

      undoRedoManager.addAction({
        undo: function() {
          const object = getSelectedObject();
          if (object) {
            console.log('Deshaciendo a transformación previa:', {
              position: undoTransform.position.toArray(),
              rotation: undoTransform.rotation.toArray(),
              scale: undoTransform.scale.toArray()
            });

            object.position.copy(undoTransform.position);
            object.rotation.copy(undoTransform.rotation);
            object.scale.copy(undoTransform.scale);

            object.updateMatrixWorld(true);
            transformControls.attach(object);
            renderer.render(scene, camera);
          }
        },
        redo: function() {
          const object = getSelectedObject();
          if (object) {
            console.log('Rehaciendo a transformación final:', {
              position: finalTransform.position.toArray(),
              rotation: finalTransform.rotation.toArray(),
              scale: finalTransform.scale.toArray()
            });

            object.position.copy(finalTransform.position);
            object.rotation.copy(finalTransform.rotation);
            object.scale.copy(finalTransform.scale);

            object.updateMatrixWorld(true);
            transformControls.attach(object);
            renderer.render(scene, camera);
          }
        }
      });

      initialTransform = null;
    }
    controls.enableRotate = true;
  }
});