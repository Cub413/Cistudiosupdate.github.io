/* Shadows */
function toggleLighting() {
  const lightingToggle = document.getElementById('lightingToggle');
  const lights = [];

  scene.traverse((object) => {
    if (object.isLight && !(object instanceof THREE.AmbientLight)) {
      lights.push(object);
    }
  });

  lights.forEach(light => light.visible = false);

  if (lightingToggle.checked) {
    setTimeout(() => {
      lights.forEach(light => light.visible = true);
    }, 100);
  }
}

/* Lightning */
const lightingToggle = document.getElementById('lightingToggle');

lightingToggle.addEventListener('change', (event) => {
  const enableLighting = event.target.checked;

  scene.traverse((object) => {
    if (object.isLight && !(object instanceof THREE.AmbientLight)) {
      object.visible = enableLighting;
    }
  });
});

/* Textures */
const texturesToggle = document.getElementById('texturesToggle');

texturesToggle.addEventListener('change', (event) => {
  const enableTextures = event.target.checked;

  scene.traverse((object) => {
    if (object.isMesh) {
      object.traverse((child) => {
        if (child.isMesh) {
          if (enableTextures) {
            if (!child.material.originalMap) {
              child.material.originalMap = child.material.map;
            }
            child.material.map = child.material.originalMap;
          } else {
            child.material.originalMap = child.material.map;
            child.material.map = null;
          }
          child.material.needsUpdate = true;
        }
      });
    }
  });
});

/* Grid */
const gridToggle = document.getElementById('gridToggle');

gridToggle.addEventListener('change', (event) => {
  const showGrid = event.target.checked;
  gridHelper.visible = showGrid;
});

/* Axes */
const axesToggle = document.getElementById('axesToggle');
const axesHelper = new THREE.AxesHelper(1);
axesHelper.name = 'axesHelper';
axesHelper.userData.exclude = true;

if (axesToggle.checked) {
  scene.add(axesHelper);
}

axesToggle.addEventListener('change', (event) => {
  if (event.target.checked) {
    if (!scene.getObjectByName('axesHelper')) {
      scene.add(axesHelper);
    }
  } else {
    const helper = scene.getObjectByName('axesHelper');
    if (helper) {
      scene.remove(helper);
    }
  }
});

/* Wireframe */
const wireframeToggle = document.getElementById('wireframeToggle');

wireframeToggle.addEventListener('change', (event) => {
  const wireframeEnabled = event.target.checked;
  scene.traverse((object) => {
    if (object.isMesh) {
      object.material.wireframe = wireframeEnabled;
    }
  });
});


/* Skeleton */
const skeletonToggle = document.getElementById('skeletonToggle');

function toggleSkeleton() {
  scene.traverse((object) => {
    if (object.isMesh && object.skeleton) {
      if (object.helper) {
        scene.remove(object.helper);
        delete object.helper;
      } else {
        const helper = new THREE.SkeletonHelper(object);
        const material = new THREE.LineBasicMaterial({
          color: 0xFFA500,
          linewidth: 3,
          opacity: 1,
          transparent: true,
          depthTest: false,
          depthWrite: false,
          vertexColors: false,
          wireframe: true,
          wireframeLinewidth: 1,
          fog: false,
          lights: true,
          dithering: false,
          flatShading: false,
          visible: true,
          clipShadows: false,
        });
        helper.material = material;
        object.helper = helper;
        scene.add(helper);
      }
    }
  });
}

skeletonToggle.addEventListener('change', () => {
  if (skeletonToggle.checked) {
    toggleSkeleton();
  } else {
    scene.traverse((object) => {
      if (object.isMesh && object.skeleton && object.helper) {
        scene.remove(object.helper);
        delete object.helper;
      }
    });
  }
});


/* Counters */
const countersToggle = document.getElementById('countersToggle');
const counterContainer = document.getElementById('counterContainer');

// Inicializa la visibilidad según el estado del checkbox al cargar la página
counterContainer.style.display = countersToggle.checked ? 'flex' : 'none';

countersToggle.addEventListener('change', (event) => {
  counterContainer.style.display = event.target.checked ? 'flex' : 'none';
});


/* Full HD */
const fullHdToggle = document.getElementById('fullHdToggle');

fullHdToggle.addEventListener('change', (event) => {
  if (event.target.checked) {
    const width = Math.min(1920, window.innerWidth);
    const height = Math.min(1080, window.innerHeight);
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
  } else {
    const width = Math.min(1280, window.innerWidth);
    const height = Math.min(720, window.innerHeight);
    renderer.setSize(width, height);
    renderer.setPixelRatio(0.9);
  }
});


/* Shading Modes Preview */
let activeMode = null;
function activateMode(mode) {
  if (activeMode !== null) {
    deactivateMode(activeMode);
  }

  activeMode = mode;

  updateButtonState(mode, true);
}
function deactivateMode(mode) {
  if (mode === 'wireframe') {
    deactivateWireframeMode();
  } else if (mode === 'solid') {
    deactivateSolidMode();
  } else if (mode === 'texture') {
    deactivateTextureMode();
  } else if (mode === 'rendered') {
    deactivateRenderedMode();
  }
  activeMode = null;
  updateButtonState(mode, false);
}
function updateButtonState(mode, isActive) {
  const buttons = document.querySelectorAll('#viewModePanel button');
  buttons.forEach(button => {
    if (button.id === `${mode}Shading`) {
      if (isActive) {
        button.style.backgroundColor = 'var(--accent-secondary)';
      } else {
        button.style.backgroundColor = '';
      }
    } else {
      button.style.backgroundColor = '';
    }
  });
}

// WIREFRAME
document.getElementById('wireframeShading').addEventListener('click', () => {
  if (activeMode === 'wireframe') {
    deactivateWireframeMode();
  } else {
    activateMode('wireframe');
    activateWireframeMode();
  }
});
function deactivateWireframeMode() {
  scene.traverse((object) => {
    if (object.isMesh && object.userData.id !== 'exclude' && !object.userData.transformControlElement) {
      object.material.wireframe = false;
    }
  });
}
function activateWireframeMode() {
  scene.traverse((object) => {
    if (object.isMesh && object.userData.id !== 'exclude' && !object.userData.transformControlElement) {
      object.material.wireframe = true;
    }
  });
}

// SOLID
document.getElementById('solidShading').addEventListener('click', () => {
  if (activeMode === 'solid') {
    deactivateSolidMode();
  } else {
    activateMode('solid');
    activateSolidMode();
  }
});
function deactivateSolidMode() {
  scene.traverse((object) => {
    if (object.isMesh && object.userData.id !== 'exclude' && !object.userData.transformControlElement) {
      object.material = object.userData.originalMaterial;
    }
  });
}
function activateSolidMode() {
  scene.traverse((object) => {
    if (object.isMesh && object.userData.id !== 'exclude' && !object.userData.transformControlElement) {
      if (!object.userData.originalMaterial) {
        object.userData.originalMaterial = object.material;
      }
      object.material = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 1,
        metalness: 0,
      });
    }
  });
}

// TEXTURED
document.getElementById('textureShading').addEventListener('click', () => {
  if (activeMode === 'texture') {
    deactivateTextureMode();
  } else {
    activateMode('texture');
    activateTextureMode();
  }
});
function deactivateTextureMode() {
  scene.traverse((object) => {
    if (object.isMesh && object.userData.id !== 'exclude' && !object.userData.transformControlElement) {
      if (object.userData.originalMaterial) {
        object.material = object.userData.originalMaterial;
      }
    }
  });
}
function activateTextureMode() {
  scene.traverse((object) => {
    if (object.isMesh && object.userData.id !== 'exclude' && !object.userData.transformControlElement) {
      if (!object.userData.originalMaterial) {
        object.userData.originalMaterial = object.material.clone(); // Clonar material original
      }
      object.material = new THREE.MeshStandardMaterial({
        map: object.userData.originalMaterial.map || null,
        color: object.userData.originalMaterial.color || 0xffffff,
      });
    }
  });
}

// RENDERED
document.getElementById('renderedShading').addEventListener('click', () => {
  if (activeMode === 'rendered') {
    deactivateMode('rendered');
  } else {
    activateMode('rendered');
    activateRenderedMode();
  }
});
function activateRenderedMode() {
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  scene.traverse((object) => {
    if (object.isMesh && object.userData.id !== 'exclude' && !object.userData.transformControlElement) {
      if (object.userData.originalMaterial) {
        object.material = object.userData.originalMaterial; // Restaurar material original
      }
    }
  });
}
function deactivateRenderedMode() {
  renderer.shadowMap.enabled = false;
}


window.onload = function() {
  setTimeout(() => {
    document.getElementById('textureShading').click();
  }, 5000);
  loadPresets();
  loadProjects();
  loadAddonsFromLocalStorage();
};

document.getElementById("renderViewButton").addEventListener("click", function() {
    var panel = document.getElementById("viewModePanel");
    panel.style.display = (panel.style.display === "none") ? "block" : "none";
});
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("renderViewButton").click();
  });
  document.addEventListener("DOMContentLoaded", function() {
    let button = document.querySelector("button[onclick*=\"showMenu('outliner')\"]");
    if (button) {
      button.click(); 
      setTimeout(() => button.click(), 100); // Segundo clic después de 100ms
    }
  });
  document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("actionButtons").click();
  });
  function toggleUndoRedo() {
    let panel = document.getElementById("undoRedo");
    if (panel) {
      panel.style.display = (panel.style.display === "none") ? "block" : "none";
    }
  }
  document.addEventListener("DOMContentLoaded", function() {
    let button = document.querySelector("button[onclick*='toggleUndoRedo()']");
    if (button) {
      button.click(); // Simula un clic en el botón al cargar la página
    }
  });