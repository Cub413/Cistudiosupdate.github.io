/* Delete */
function deleteSel() {
  const deletedObjects = [];

  scene.traverse((object) => {
    if (object.userData.SelectedObject === true) {
      deletedObjects.push({
        object,
        parent: object.parent,
        position: object.position.clone(),
        rotation: object.rotation.clone(),
        scale: object.scale.clone()
      });
    }
  });

  deletedObjects.forEach(({ object }) => {
    if (object.edges) scene.remove(object.edges);
    if (object.helper) scene.remove(object.helper);

    if (object.parent) {
      object.parent.remove(object);
    } else {
      scene.remove(object);
    }

    if (object instanceof THREE.Mesh) {
      object.geometry?.dispose();
      if (Array.isArray(object.material)) {
        object.material.forEach((mat) => mat.dispose());
      } else {
        object.material?.dispose();
      }
    } else if (object instanceof THREE.Group) {
      object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry?.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => mat.dispose());
          } else {
            child.material?.dispose();
          }
        }
      });
    }

    transformControls.detach();
  });

  updateOutliner();

  if (deletedObjects.length > 0) {
    undoRedoManager.addAction({
      undo: () => {
        deletedObjects.forEach(({ object, parent, position, rotation, scale }) => {
          object.position.copy(position);
          object.rotation.copy(rotation);
          object.scale.copy(scale);

          if (parent) {
            parent.add(object);
          } else {
            scene.add(object);
          }
        });
        updateOutliner();
        renderer.render(scene, camera);
      },
      redo: () => {
        deletedObjects.forEach(({ object }) => {
          if (object.parent) {
            object.parent.remove(object);
          } else {
            scene.remove(object);
          }
        });
        updateOutliner();
        renderer.render(scene, camera);
      }
    });
  }
}

/* Duplicate */
function duplicateSel() {
  const duplicatedObjects = [];
  removeAllEdgeOutlines();
  scene.traverse((object) => {
    if (object.userData.SelectedObject) {
      let clonedObject;

      if (object instanceof THREE.Mesh || object instanceof THREE.Group || object instanceof THREE.Light || object instanceof THREE.Object3D) {
        clonedObject = object.clone();

        if (clonedObject instanceof THREE.Mesh) {
          clonedObject.geometry = object.geometry.clone();
          clonedObject.material = object.material;
        }

        clonedObject.userData.SelectedObject = false;
        clonedObject.position.copy(object.position);

        let baseName = object.name || "Object";
        let nameMatch = baseName.match(/(.*?)(\d+)?$/);
        let base = nameMatch[1];
        let index = parseInt(nameMatch[2]) || 0;

        let newName;
        do {
          index += 1;
          newName = `${base}${index}`;
        } while (scene.getObjectByName(newName));

        clonedObject.name = newName;

        if (object.parent) {
          object.parent.add(clonedObject);
        } else {
          scene.add(clonedObject);
        }

        duplicatedObjects.push({
          object: clonedObject,
          parent: object.parent || scene
        });
      }
    }
  });

  updateOutliner();

  if (duplicatedObjects.length > 0) {
    undoRedoManager.addAction({
      undo: () => {
        duplicatedObjects.forEach(({ object, parent }) => {
          parent.remove(object);
        });
        updateOutliner();
        renderer.render(scene, camera);
      },
      redo: () => {
        duplicatedObjects.forEach(({ object, parent }) => {
          parent.add(object);
        });
        updateOutliner();
        renderer.render(scene, camera);
      }
    });
  }
}

/* Group */
function groupSel() {
  const selectedObjects = [];
  let parentObject = null;
  const center = new THREE.Vector3();

  scene.traverse((object) => {
    if (object.userData.SelectedObject) {
      selectedObjects.push(object);
      parentObject = object.parent;
      center.add(object.getWorldPosition(new THREE.Vector3()));
    }
  });

  const group = new THREE.Group();
  group.name = 'Group';

  const groupedData = [];

  if (selectedObjects.length > 0) {
    center.divideScalar(selectedObjects.length);

    selectedObjects.forEach((object) => {
      const originalParent = object.parent;
      const originalPosition = object.position.clone();

      const localPosition = new THREE.Vector3();
      object.getWorldPosition(localPosition);
      object.userData.SelectedObject = false;

      scene.attach(object);
      group.add(object);
      object.position.copy(localPosition.sub(center));

      groupedData.push({
        object,
        originalParent,
        originalPosition,
      });
    });

    group.position.copy(center);
  }

  if (parentObject) {
    parentObject.add(group);
  } else {
    scene.add(group);
  }

  updateOutliner();

  undoRedoManager.addAction({
    undo: () => {
      groupedData.forEach(({ object, originalParent, originalPosition }) => {
        group.remove(object);
        if (originalParent) {
          originalParent.add(object);
        } else {
          scene.add(object);
        }
        object.position.copy(originalPosition);
      });

      if (group.parent) {
        group.parent.remove(group);
      } else {
        scene.remove(group);
      }

      updateOutliner();
      renderer.render(scene, camera);
    },
    redo: () => {
      if (parentObject) {
        parentObject.add(group);
      } else {
        scene.add(group);
      }

      groupedData.forEach(({ object }) => {
        scene.attach(object);
        group.add(object);
      });

      updateOutliner();
      renderer.render(scene, camera);
    },
  });
}

/* Center */
function centerSel() {
  const previousCameraState = {
    position: camera.position.clone(),
    target: controls.target.clone()
  };

  let selectedObject = null;

  scene.traverse((object) => {
    if (object.userData.SelectedObject) {
      selectedObject = object;
    }
  });

  if (!selectedObject) return;

  removeAllEdgeOutlines();

  const box = new THREE.Box3().setFromObject(selectedObject);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const distance = maxDim * 2;

  const newCameraState = {
    position: center.clone().add(new THREE.Vector3(distance, distance, distance)),
    target: center.clone()
  };

  const tweenPosition = new TWEEN.Tween(camera.position)
    .to({
      x: newCameraState.position.x,
      y: newCameraState.position.y,
      z: newCameraState.position.z
    }, 500) // Duración en milisegundos
    .easing(TWEEN.Easing.Quadratic.Out);

  const tweenTarget = new TWEEN.Tween(controls.target)
    .to({
      x: newCameraState.target.x,
      y: newCameraState.target.y,
      z: newCameraState.target.z
    }, 500)
    .easing(TWEEN.Easing.Quadratic.Out);

  tweenPosition.onUpdate(() => {
    renderer.render(scene, camera);
  });

  tweenTarget.onUpdate(() => {
    controls.update();
    renderer.render(scene, camera);
  });

  tweenPosition.start();
  tweenTarget.start();
  
  const duration = 500;
  let startTime = performance.now();

  function updateTween() {
    const currentTime = performance.now();
    const elapsed = currentTime - startTime;

    if (elapsed < duration) {
      TWEEN.update();
      requestAnimationFrame(updateTween);
    } else {
      TWEEN.update(); // Asegura el último frame
      renderer.render(scene, camera);
    }
  }

  updateTween();

  undoRedoManager.addAction({
    undo: () => {
      camera.position.copy(previousCameraState.position);
      controls.target.copy(previousCameraState.target);
      controls.update();
      renderer.render(scene, camera);
    },
    redo: () => {
      camera.position.copy(newCameraState.position);
      controls.target.copy(newCameraState.target);
      controls.update();
      renderer.render(scene, camera);
    }
  });
}

/* Hide */
function hideSel() {
  const hiddenData = [];

  scene.traverse((object) => {
    if (object.userData.SelectedObject) {
      hiddenData.push({ object, previousVisibility: object.visible });
      object.visible = !object.visible;
    }
  });

  undoRedoManager.addAction({
    undo: () => {
      hiddenData.forEach(({ object, previousVisibility }) => {
        object.visible = previousVisibility;
      });

      renderer.render(scene, camera);
    },
    redo: () => {
      hiddenData.forEach(({ object }) => {
        object.visible = !object.visible;
      });

      renderer.render(scene, camera);
    },
  });
}

/* Rename */
function renameSel() {
  let selectedObject = null;
  let previousName = null;

  scene.traverse((obj) => {
    if (obj.userData.SelectedObject) {
      selectedObject = obj;
    }
  });

  if (selectedObject) {
    previousName = selectedObject.name || 'Unnamed';
    const newName = prompt('Introduce un nuevo nombre para el objeto:', previousName);

    if (newName && newName.trim() !== '') {
      const trimmedName = newName.trim();

      let isNameTaken = false;
      scene.traverse((obj) => {
        if (obj.name === trimmedName && obj !== selectedObject) {
          isNameTaken = true;
        }
      });

      if (isNameTaken) {
        alert(`El nombre "${trimmedName}" ya está en uso. Por favor, elige otro.`);
        return;
      }

      selectedObject.name = trimmedName;
      updateOutliner();

      undoRedoManager.addAction({
        undo: () => {
          selectedObject.name = previousName;
          updateOutliner();
        },
        redo: () => {
          selectedObject.name = trimmedName;
          updateOutliner();
        },
      });
    }
  } else {
    alert('No hay ningún objeto seleccionado para renombrar.');
  }
}

/* Lock */
let lockIDCounter = 0;
function lockSel() {
  const selectedObject = scene.children.find(obj => obj.userData.SelectedObject);
  const lockButtonImage = document.getElementById('lock');
  const lockButton = lockButtonImage.closest('button');

  if (selectedObject) {
    if (!selectedObject.userData.locked) {
      lockIDCounter++;
      selectedObject.userData.lockID = lockIDCounter;
      selectedObject.userData.locked = true;

      selectedObject.traverse((child) => {
        child.userData.locked = true;
        child.userData.lockID = lockIDCounter;
      });

      transformControls.detach();
    } else {
      delete selectedObject.userData.lockID;
      selectedObject.userData.locked = false;

      selectedObject.traverse((child) => {
        child.userData.locked = false;
        delete child.userData.lockID;
      });

      transformControls.attach(selectedObject);
    }

    updateLockButton(selectedObject.userData.locked);
    updateOutliner();
  }
}
function updateLockButton(isLocked) {
  const lockButtonImage = document.getElementById('lock');
  const lockButton = lockButtonImage.closest('button');

  if (isLocked) {
    lockButtonImage.src = '/icons/locked.svg';
    lockButton.style.backgroundColor = 'var(--accent-secondary)';
  } else {
    lockButtonImage.src = '/icons/unlocked.svg';
    lockButton.style.backgroundColor = '';
  }
}

/* Parent */
const parentSelButton = document.getElementById('parentSel');
let selectedForParenting = null;
let isWaitingForParent = false;
function updateButtonStyle() {
  parentSelButton.style.backgroundColor = isWaitingForParent ? 'var(--accent-secondary)' : '';
}
function parentSel() {
  if (selectedForParenting) {
    let targetObject = null;

    scene.traverse((object) => {
      if (object.userData.SelectedObject && object !== selectedForParenting) {
        targetObject = object;
      }
    });

    if (!targetObject) {
      console.warn("No se ha encontrado un segundo objeto para parentar.");
      return;
    }

    const globalPosition = new THREE.Vector3();
    selectedForParenting.getWorldPosition(globalPosition);

    targetObject.add(selectedForParenting);

    const localPosition = targetObject.worldToLocal(globalPosition);
    selectedForParenting.position.copy(localPosition);

    deselectObject(selectedForParenting);
    deselectObject(targetObject);

    selectedForParenting = null;
    isWaitingForParent = false;
    updateButtonStyle();
    console.log("El objeto seleccionado ahora es hijo de:", targetObject);
  } else {
    scene.traverse((object) => {
      if (object.userData.SelectedObject) {
        selectedForParenting = object;
        isWaitingForParent = true;
        updateButtonStyle();
      }
    });
  }
}
parentSelButton.addEventListener('click', () => {
  parentSel();
  if (!isWaitingForParent) {
    console.log("Esperando el próximo objeto para parentar.");
  }
});

/* Fix */
function fixSel() {
  let selectedObject = null;

  scene.traverse((object) => {
    if (object.userData.SelectedObject) {
      selectedObject = object;
    }
  });

  if (!selectedObject) {
    console.warn('No hay un objeto seleccionado.');
    return;
  }

  const initialScale = selectedObject.scale.clone();
  const initialGeometryData = [];

  selectedObject.traverse((child) => {
    if (child.isMesh && child.geometry) {
      const geometryClone = child.geometry.clone();
      initialGeometryData.push({
        mesh: child,
        geometry: geometryClone,
      });
    }
  });

  const scale = selectedObject.scale.clone();

  selectedObject.traverse((child) => {
    if (child.isMesh && child.geometry) {
      child.geometry.applyMatrix4(new THREE.Matrix4().makeScale(scale.x, scale.y, scale.z));
      child.geometry.computeBoundingSphere();
      child.geometry.computeBoundingBox();
    }
  });

  selectedObject.scale.set(1, 1, 1);

  deselectObject(); // Reinicia el outline al deseleccionar

  // Guardar la acción en el manager de undo/redo
  undoRedoManager.addAction({
    undo: () => {
      selectedObject.scale.copy(initialScale);
      initialGeometryData.forEach((data) => {
        data.mesh.geometry = data.geometry.clone();
        data.mesh.geometry.computeBoundingSphere();
        data.mesh.geometry.computeBoundingBox();
      });
    },
    redo: () => {
      selectedObject.scale.copy(scale);
      selectedObject.traverse((child) => {
        if (child.isMesh && child.geometry) {
          child.geometry.applyMatrix4(new THREE.Matrix4().makeScale(scale.x, scale.y, scale.z));
          child.geometry.computeBoundingSphere();
          child.geometry.computeBoundingBox();
        }
      });
    },
  });
}

/* Change Camera */
function changeCamera() {
  let selectedCamera = null;

  scene.traverse((object) => {
    if (object instanceof THREE.Camera && object.userData.SelectedObject) {
      selectedCamera = object;
    }
  });

  if (selectedCamera) {
    let followCamera = selectedCamera.userData.followCamera || false;

    if (followCamera) {
      selectedCamera.userData.followCamera = false;

      let direction = new THREE.Vector3();
      selectedCamera.getWorldDirection(direction);
      camera.position.copy(selectedCamera.position).add(direction.multiplyScalar(-0.5));
      camera.rotation.copy(selectedCamera.rotation);
      controls.update();
      renderer.render(scene, camera);
    } else {
      selectedCamera.userData.followCamera = true;
      camera.position.copy(selectedCamera.position);
      camera.rotation.copy(selectedCamera.rotation);
      controls.update();
      renderer.render(scene, camera);

      function syncSelectedCamera() {
        if (selectedCamera.userData.followCamera) {
          selectedCamera.position.copy(camera.position);
          selectedCamera.rotation.copy(camera.rotation);
          renderer.render(scene, camera);
          requestAnimationFrame(syncSelectedCamera);
        }
      }

      syncSelectedCamera();
    }
  } else {
    console.log("No hay cámara seleccionada.");
  }
}

/* Save Presets */
function presetSel() {
  const selectedObjects = [];
  scene.traverse((object) => {
    if (object.userData.SelectedObject) {
      selectedObjects.push(object);
    }
  });

  if (selectedObjects.length === 0) return;

  const defaultName = selectedObjects[0]?.name || 'NewPreset';
  const presetName = prompt('Enter a name for the selected objects:', defaultName);
  if (!presetName) return;

  let savedPresets = JSON.parse(localStorage.getItem('presets')) || [];

  const existingPresetIndex = savedPresets.findIndex(preset => preset.name === presetName);
  if (existingPresetIndex !== -1) {
    const confirmOverwrite = confirm('A preset with this name already exists. Do you want to overwrite it?');
    if (!confirmOverwrite) return;

    const existingDiv = document.querySelector(`#presetsContainer .menu-item[data-name="${presetName}"]`);
    if (existingDiv) existingDiv.remove();
    savedPresets.splice(existingPresetIndex, 1);
  }

  const presetData = selectedObjects.map((object) => {
    const objectData = object.toJSON();
    objectData.userData = object.userData;
    return objectData;
  });

  savedPresets.push({ name: presetName, data: presetData });
  localStorage.setItem('presets', JSON.stringify(savedPresets));

  const presetMenu = document.getElementById('presetsContainer');
  if (!presetMenu) return;

  const presetDiv = document.createElement('div');
  presetDiv.classList.add('menu-item');
  presetDiv.style.margin = '5px';
  presetDiv.dataset.name = presetName;

  const iconImage = document.createElement('img');
  iconImage.src = 'icons/preset.svg';
  iconImage.alt = 'Preset Icon';
  iconImage.style.width = '20px';
  iconImage.style.marginRight = '5px';

  const presetText = document.createElement('span');
  presetText.textContent = presetName;

  presetDiv.appendChild(iconImage);
  presetDiv.appendChild(presetText);

  presetDiv.onclick = () => {
    loadPreset(presetData);
  };

  let timer;
  presetDiv.addEventListener('mousedown', () => {
    timer = setTimeout(() => {
      const confirmDelete = confirm('Do you want to delete this preset?');
      if (confirmDelete) {
        savedPresets = savedPresets.filter((p) => p.name !== presetName);
        localStorage.setItem('presets', JSON.stringify(savedPresets));
        presetMenu.removeChild(presetDiv);
      }
    }, 300);
  });

  presetDiv.addEventListener('mouseup', () => {
    clearTimeout(timer);
  });

  presetMenu.appendChild(presetDiv);
}

function loadPresets() {
  const presetsContainer = document.getElementById('presetsContainer');
  const savedPresets = JSON.parse(localStorage.getItem('presets')) || [];

  presetsContainer.innerHTML = '';

  savedPresets.forEach((preset) => {
    const presetDiv = document.createElement('div');
    presetDiv.classList.add('menu-item');
    presetDiv.style.margin = '5px';
    presetDiv.dataset.name = preset.name;

    const iconImage = document.createElement('img');
    iconImage.src = 'icons/preset.svg';
    iconImage.alt = 'Preset Icon';
    iconImage.style.width = '20px';
    iconImage.style.marginRight = '5px';

    const presetText = document.createElement('span');
    presetText.textContent = preset.name;

    presetDiv.appendChild(iconImage);
    presetDiv.appendChild(presetText);

    presetDiv.onclick = () => {
      loadPreset(preset.data);
    };

    let timer;
    presetDiv.addEventListener('mousedown', () => {
      timer = setTimeout(() => {
        const confirmDelete = confirm('Do you want to delete this preset?');
        if (confirmDelete) {
          savedPresets = savedPresets.filter((p) => p.name !== preset.name);
          localStorage.setItem('presets', JSON.stringify(savedPresets));
          presetsContainer.removeChild(presetDiv);
        }
      }, 300);
    });

    presetDiv.addEventListener('mouseup', () => {
      clearTimeout(timer);
    });

    presetsContainer.appendChild(presetDiv);
  });
}

function loadPreset(presetData) {
  presetData.forEach((json) => {
    const object = new THREE.ObjectLoader().parse(json);
    object.traverse((child) => {
      if (child.material) {
        if (child.material.map) child.material.map.needsUpdate = true;
        if (child.material.normalMap) child.material.normalMap.needsUpdate = true;
        if (child.material.emissiveMap) child.material.emissiveMap.needsUpdate = true;
      }
    });

    scene.add(object);
  });

  updateOutliner();
}

function deletePresets() {
  const presetsContainer = document.getElementById('presetsContainer');
  let savedPresets = JSON.parse(localStorage.getItem('presets')) || [];

  presetsContainer.innerHTML = '';

  savedPresets.forEach((preset) => {
    const presetDiv = document.createElement('div');
    presetDiv.classList.add('menu-item');
    presetDiv.style.margin = '5px';
    presetDiv.dataset.name = preset.name;
    presetDiv.style.position = 'relative'; // Asegura que el contenedor esté en el flujo normal

    const iconImage = document.createElement('img');
    iconImage.src = 'icons/preset.svg';
    iconImage.alt = 'Preset Icon';
    iconImage.style.width = '20px';
    iconImage.style.marginRight = '5px';

    const presetText = document.createElement('span');
    presetText.textContent = preset.name;

    const deleteIcon = document.createElement('img');
    deleteIcon.src = 'icons/trash.svg';
    deleteIcon.alt = 'Delete Icon';
    deleteIcon.style.width = '15px';
    deleteIcon.style.marginLeft = '10px';
    deleteIcon.style.cursor = 'pointer';
    deleteIcon.classList.add('alert'); // Añadiendo la clase .alert

    deleteIcon.onclick = () => {
      const confirmDelete = confirm('Are you sure you want to delete this preset?');
      if (confirmDelete) {
        savedPresets = savedPresets.filter((p) => p.name !== preset.name);
        localStorage.setItem('presets', JSON.stringify(savedPresets));
        presetsContainer.removeChild(presetDiv);
      }
    };

    presetDiv.appendChild(iconImage);
    presetDiv.appendChild(presetText);
    presetDiv.appendChild(deleteIcon);

    let timer;
    presetDiv.addEventListener('mousedown', () => {
      timer = setTimeout(() => {
        const confirmDelete = confirm('Do you want to delete this preset?');
        if (confirmDelete) {
          savedPresets = savedPresets.filter((p) => p.name !== preset.name);
          localStorage.setItem('presets', JSON.stringify(savedPresets));
          presetsContainer.removeChild(presetDiv);
        }
      }, 300);
    });

    presetDiv.addEventListener('mouseup', () => {
      clearTimeout(timer);
    });

    presetDiv.onclick = () => {
      loadPreset(preset.data);
    };

    presetsContainer.appendChild(presetDiv);
  });
}

/* Save Projects */
function saveProject() {
  const selectedObjects = [];
  scene.traverse((object) => {
    if (object.userData.SelectedObject) { // Solo seleccionamos los objetos marcados como seleccionados
      selectedObjects.push(object);
    }
  });

  if (selectedObjects.length === 0) return;

  const projectName = prompt('Enter a name for the project:');
  if (!projectName) return;

  const projectsContainer = document.getElementById('projectsContainer');
  if (!projectsContainer) return;

  const projectData = selectedObjects.map((object) => {
    return object.toJSON();
  });

  let savedProjects = JSON.parse(localStorage.getItem('projects')) || [];
  savedProjects.push({ name: projectName, data: projectData });
  localStorage.setItem('projects', JSON.stringify(savedProjects));

  const projectButton = document.createElement('button');
  projectButton.textContent = projectName;
  projectButton.style.margin = '5px';
  projectButton.onclick = () => {
    loadProject(projectData);
  };

  projectsContainer.appendChild(projectButton);
}
function loadProjects() {
  const projectsContainer = document.getElementById('projectsContainer');
  const savedProjects = JSON.parse(localStorage.getItem('projects')) || [];

  savedProjects.forEach((project) => {
    const projectButton = document.createElement('button');
    projectButton.textContent = project.name;
    projectButton.style.margin = '5px';
    projectButton.onclick = () => {
      loadProject(project.data);
    };

    projectsContainer.appendChild(projectButton);
  });
}
function loadProject(projectData) {
  projectData.forEach((json) => {
    const object = new THREE.ObjectLoader().parse(json);
    object.traverse((child) => {
      if (child.material) {
        if (child.material.map) child.material.map.needsUpdate = true;
        if (child.material.normalMap) child.material.normalMap.needsUpdate = true;
        if (child.material.emissiveMap) child.material.emissiveMap.needsUpdate = true;
      }
    });
    scene.add(object);
  });

  updateOutliner();
}
function deleteProjects() {
  localStorage.removeItem('projects');
  const projectsContainer = document.getElementById('projectsContainer');
  while (projectsContainer.firstChild) {
    projectsContainer.removeChild(projectsContainer.firstChild);
  }
}
