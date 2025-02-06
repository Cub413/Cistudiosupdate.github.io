/* HDRI */
const hdrTextureLoader = new THREE.RGBELoader();
const loadHdriButton = document.getElementById('loadHdriButton');
const loadHdriInput = document.getElementById('loadHdri');
const toggleHdriCheckbox = document.getElementById('toggleHdri');
let hdrTexture = null;
let envMap = null;
let originalBackgroundColor = scene.background;
loadHdriButton.addEventListener('click', function() {
  loadHdriInput.click();
});
loadHdriInput.addEventListener('change', function(event) {
  const file = event.target.files[0];

  if (file) {
    const reader = new FileReader();

    reader.onload = function(e) {
      const fileExtension = file.name.split('.').pop().toLowerCase();

      if (fileExtension === 'hdr') {
        const arrayBuffer = e.target.result;

        hdrTextureLoader.load(URL.createObjectURL(new Blob([arrayBuffer])), function(texture) {
          texture.mapping = THREE.EquirectangularReflectionMapping;

          hdrTexture = texture;
          scene.background = hdrTexture;
          scene.environment = hdrTexture;

          const pmremGenerator = new THREE.PMREMGenerator(renderer);
          envMap = pmremGenerator.fromEquirectangular(hdrTexture).texture;

          const intensity = 0.2;

          scene.environment = envMap;
          scene.background = envMap;

          scene.traverse(function(child) {
            if (child.isMesh && !child.userData.exclude) {
              child.material = new THREE.MeshStandardMaterial({
                envMap: envMap,
                envMapIntensity: intensity,
              });
              child.material.needsUpdate = true;
            }
          });

          toggleHdriCheckbox.checked = true;
        });
      } else if (fileExtension === 'jpg' || fileExtension === 'png') {
        const textureLoader = new THREE.TextureLoader();

        textureLoader.load(URL.createObjectURL(file), function(texture) {
          texture.mapping = THREE.EquirectangularReflectionMapping;

          scene.background = texture;
          scene.environment = null;

          scene.traverse(function(child) {
            if (child.isMesh && !child.userData.exclude) {
              child.material.envMap = null;
            }
          });

          toggleHdriCheckbox.checked = false;
        });
      }
    };

    reader.readAsArrayBuffer(file);
  }
});
toggleHdriCheckbox.addEventListener('change', function() {
  if (toggleHdriCheckbox.checked && hdrTexture) {
    scene.background = hdrTexture;
    scene.environment = envMap;

    scene.traverse(function(child) {
      if (child.isMesh && !child.userData.exclude) {
        child.material.envMap = envMap;
      }
    });
  } else {
    scene.background = originalBackgroundColor;
    scene.environment = null;

    scene.traverse(function(child) {
      if (child.isMesh && !child.userData.exclude) {
        child.material.envMap = null;
      }
    });
  }
});
 
/* Render Image */
let hiddenObjects = [];
function renderImage() {
  scene.traverse((object) => {
    if (object instanceof THREE.GridHelper || object instanceof THREE.Bone || object instanceof THREE.AxesHelper || object instanceof THREE.TransformControls || object.userData.id === 'bone' || object.userData.id === 'exclude') {
      if (object.visible) {
        hiddenObjects.push(object);
      }
      object.visible = false;
    }
  });

  renderer.render(scene, camera);

  const imgData = renderer.domElement.toDataURL("image/png");

  const imgElement = document.createElement('img');
  imgElement.src = imgData;

  const renderedImageContainer = document.getElementById('renderedImage');
  renderedImageContainer.innerHTML = '';
  renderedImageContainer.appendChild(imgElement);

  setTimeout(() => {
    hiddenObjects.forEach((object) => {
      object.visible = true;
    });
    hiddenObjects = [];
  }, 10);
}

function saveRenderedImage() {
  const imgElement = document.getElementById('renderedImage').querySelector('img');

  if (imgElement) {
    const imgData = imgElement.src;
    const link = document.createElement('a');
    link.href = imgData;
    link.download = 'nexel_rendered_image.png';
    link.click();
  }
}
document.getElementById('saveRender').addEventListener('click', saveRenderedImage);


/* Render Video */
// Vertex Shader
const vertexShader = `
    varying vec3 vPosition;
    varying vec3 vNormal;

    void main() {
        vPosition = position;
        vNormal = normal;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

// Fragment Shader
const fragmentShader = `
    uniform sampler2D depthMap;
    varying vec3 vPosition;
    varying vec3 vNormal;
    uniform vec2 resolution;

    void main() {
        float occlusion = 0.0;

        // Mapa de profundidad para calcular proximidad
        vec4 depthInfo = texture2D(depthMap, gl_FragCoord.xy / resolution);
        float depth = depthInfo.r;

        // Calcular oclusión por proximidad (más oscuro si está cerca de un objeto)
        if (depth < 0.5) {
            occlusion += 0.5;
        }

        // Detectar bordes cercanos a -90 grados con la normal
        float angle = abs(dot(vNormal, vec3(0.0, -1.0, 0.0))); // Normal comparada con el eje Y negativo
        if (angle > 0.9) {
            occlusion += 0.5; // Aumentar oclusión en bordes cercanos a -90 grados
        }

        // Establecer el color verde y modificar la saturación dependiendo de la oclusión
        vec3 color = vec3(0.0, 1.0, 0.0); // Verde
        color *= (1.0 - occlusion); // Oscurecer el verde dependiendo de la oclusión

        gl_FragColor = vec4(color, 1.0);
    }
`;

// Crear el material con el shader
const material = new THREE.ShaderMaterial({
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  uniforms: {
    depthMap: { value: null }, // El mapa de profundidad será asignado aquí
    resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
  }
});

// Crear el render target para la captura de profundidad
const width = window.innerWidth;
const height = window.innerHeight;
const depthRenderTarget = new THREE.WebGLRenderTarget(width, height, {
  format: THREE.DepthFormat,
  type: THREE.FloatType
});

// Función para actualizar el mapa de profundidad y aplicar el shader
function applyAmbientOcclusion(scene, renderer, camera) {
  // Renderizar la escena en el render target para obtener el mapa de profundidad
  renderer.setRenderTarget(depthRenderTarget);
  renderer.render(scene, camera);

  // Volver a configurar el render target a null para renderizar en la pantalla
  renderer.setRenderTarget(null);

  // Asignar el mapa de profundidad al material
  material.uniforms.depthMap.value = depthRenderTarget.texture;
}

// Función para aplicar el material con oclusión a los objetos
function applyShaderToObjects(scene) {
  scene.traverse(function(object) {
    if (object.isMesh) {
      object.material = material;
    }
  });
}

// Llamar a estas funciones en tu ciclo de renderizado
// Asegúrate de llamar a `applyAmbientOcclusion` antes de renderizar la escena
// y `applyShaderToObjects` para aplicar el material con oclusión a los objetos.

function render() {
  applyAmbientOcclusion(scene, renderer, camera);
  applyShaderToObjects(scene);
  renderer.render(scene, camera);
}

// Suponiendo que ya tienes configurado tu ciclo de renderizado de Three.js,
// solo necesitarás llamar a la función `render()` en cada frame.

window.onload = function() {
    document.getElementById("menu-button").click();
};
