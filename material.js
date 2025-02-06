function showMaterialProperties(material) {
  materialPropertiesDiv.innerHTML = '';

  const propertiesForm = `
      <form id="materialPropertiesForm">
      <h3>Material</h3>
      
      <label for="color">Color:</label>
      <input type="color" id="color" name="color" value="#ffffff">
      
      <label for="texture">Textura:</label>
      <input type="file" id="texture" name="texture" accept="image/*" />te
      
      <label for="removeTextureButton"></label>
      <button id="removeTextureButton" name="removeTextureButton">Eliminar Textura</button><br>
      
      <label for="pixelBlendCheckbox">Pixel:</label>
      <input type="checkbox" id="pixelBlendCheckbox" name="pixelBlendCheckbox" />
      
      <label for="shadingToggle">Shading Plano</label>
      <input type="checkbox" id="shadingToggle">

      <label for="opacity">Opacidad:</label>
      <input type="checkbox" id="transparent" name="transparent" ${material.transparent ? 'checked' : ''} />
      <input type="range" id="opacity" name="opacity" min="0" max="1" step="0.01" value="${material.opacity}" />
      
      <label for="wireframe">Wireframe:</label>
      <input type="checkbox" id="wireframe" name="wireframe" ${material.wireframe ? 'checked' : ''} />
      
      <label for="visible">Visible:</label>
      <input type="checkbox" id="visible" name="visible" ${material.visible ? 'checked' : ''} />
      
      <label for="inFront">In front of:</label>
      <input type="checkbox" id="inFront" name="inFront" ${material.depthTest ? '' : 'checked'} />
      
      <label for="doubleSided">Double side:</label>
      <input type="checkbox" id="doubleSided" name="doubleSided" />
      
      <label for="metalness">Metalidad:</label>
      <input type="range" id="metalness" name="metalness" min="0" max="1" step="0.01" value="${material.metalness}" />

      <label for="roughness">Rugosidad:</label>
      <input type="range" id="roughness" name="roughness" min="0" max="1" step="0.01" value="${material.roughness}" />

      <label for="shininess">Brillo:</label>
      <input type="range" id="shininess" name="shininess" min="0" max="100" step="1" value="${material.shininess || 0}" />
      
      <label for="emissive">Color Emisivo:</label>
      <input type="color" id="emissive" name="emissive" value="${material.emissive ? material.emissive.getStyle() : '#000000'}" />

      <label for="emissiveIntensity">Intensidad Emisiva:</label>
      <input type="range" id="emissiveIntensity" name="emissiveIntensity" min="0" max="10" step="0.1" value="${material.emissiveIntensity || 0}" />
      
      <label for="normalMap">Normal Map:</label>
      <input type="file" id="normalMap" name="normalMap" accept="image/*" />
      
      <label for="roughnessMap">Roughness Map:</label>
      <input type="file" id="roughnessMap" name="roughnessMap" accept="image/*" />
      
      <label for="metalnessMap">Metalness Map:</label>
      <input type="file" id="metalnessMap" name="metalnessMap" accept="image/*" />
      
      <label for="aoMap">AO Map:</label>
      <input type="file" id="aoMap" name="aoMap" accept="image/*" />

      <label for="displacementMap">Displacement Map:</label>
      <input type="file" id="displacementMap" name="displacementMap" accept="image/*" />
      
      <label for="bumpMap">Bump Map:</label>
      <input type="file" id="bumpMap" name="bumpMap" accept="image/*" />
      
      <label for="removePBR">Eliminar Texturas PBR</label>
      <button id="removePBR" type="button">Eliminar PBR</button>
    </form>
  `;

  materialPropertiesDiv.innerHTML = propertiesForm;

  // Color
  document.getElementById('color').addEventListener('input', (event) => {
    material.color.setStyle(event.target.value);
  });

  // Texture  
  setupTextureLoader(material);
  function setupTextureLoader(material) {
  const textureCache = new Map();
  const lowResTexture = new THREE.TextureLoader().load('path/to/low-res-texture.jpg');

  document.getElementById('texture').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const textureDataUrl = e.target.result;
        loadTextureWithCache(textureDataUrl, material, lowResTexture, textureCache);
      };
      reader.readAsDataURL(file);
    }
  });
}

// Función para cargar la textura y almacenarla en caché
function loadTextureWithCache(url, material, lowResTexture, cache) {
  if (cache.has(url)) {
    material.map = cache.get(url);
    material.needsUpdate = true;
    return;
  }

  material.map = lowResTexture.clone();
  material.needsUpdate = true;

  const textureLoader = new THREE.TextureLoader();
  textureLoader.load(url, (highResTexture) => {
    material.map = highResTexture;
    material.needsUpdate = true;
    cache.set(url, highResTexture);
  });
}
  
  // Pixel
  document.getElementById('pixelBlendCheckbox').addEventListener('change', (event) => {
  const isChecked = event.target.checked;

  if (isChecked) {
    material.map.minFilter = THREE.NearestFilter;
    material.map.magFilter = THREE.NearestFilter;
  } else {
    material.map.minFilter = THREE.LinearFilter;
    material.map.magFilter = THREE.LinearFilter;
  }

  material.map.needsUpdate = true;
  });
  
  // Shading
  function toggleShading() {
  if (objetoSeleccionado && objetoSeleccionado.material) {
    objetoSeleccionado.material.flatShading = document.getElementById('shadingToggle').checked;
    objetoSeleccionado.material.needsUpdate = true;
    }
   }

  document.getElementById('shadingToggle').addEventListener('change', toggleShading);
  
  // Eliminar Textura
  document.getElementById('removeTextureButton').addEventListener('click', (event) => {
  event.preventDefault(); // Prevenir el comportamiento por defecto del botón
  material.map = null;
  material.needsUpdate = true;
  });
  
  // Opacidad
  document.getElementById('opacity').addEventListener('input', (event) => {
    material.opacity = parseFloat(event.target.value);
  });
  
  // Transparente
  document.getElementById('transparent').addEventListener('change', (event) => {
    material.transparent = event.target.checked;
  });
  
  // Wireframe
  document.getElementById('wireframe').addEventListener('change', (event) => {
    material.wireframe = event.target.checked;
  });
  
  // Visible
  document.getElementById('visible').addEventListener('change', (event) => {
    material.visible = event.target.checked;
  });
  
  // In front
  document.getElementById('inFront').addEventListener('change', (event) => {
    material.depthTest = !event.target.checked;
  });
  
  // Double Sided
  document.getElementById('doubleSided').addEventListener('change', (event) => {
  material.side = event.target.checked ? THREE.DoubleSide : THREE.FrontSide;
  material.needsUpdate = true;
  });
  
  // Metalness
  document.getElementById('metalness').addEventListener('input', (event) => {
    material.metalness = parseFloat(event.target.value);
  });
  
  //Roughness
  document.getElementById('roughness').addEventListener('input', (event) => {
    material.roughness = parseFloat(event.target.value);
  });
  
  // Shininess
  document.getElementById('shininess').addEventListener('input', (event) => {
    material.shininess = parseFloat(event.target.value);
  });
  
  // Emissive
  document.getElementById('emissive').addEventListener('input', (event) => {
    material.emissive.setStyle(event.target.value);
  });
  
  // Emissive intensity
  document.getElementById('emissiveIntensity').addEventListener('input', (event) => {
    material.emissiveIntensity = parseFloat(event.target.value);
  });
  
  // Normal map
  document.getElementById('normalMap').addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(e.target.result, (texture) => {
        material.normalMap = texture;
        material.needsUpdate = true;
      });
    };
    reader.readAsDataURL(file);
  }
  });
  
  // Displacement map
  document.getElementById('displacementMap').addEventListener('change', (event) => {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = function(e) {
    const texture = new THREE.TextureLoader().load(e.target.result);
    material.displacementMap = texture;
    material.needsUpdate = true;
  };
  reader.readAsDataURL(file);
  });
  
  // Roughness map
  document.getElementById('roughnessMap').addEventListener('change', (event) => {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = function(e) {
    const texture = new THREE.TextureLoader().load(e.target.result);
    material.roughnessMap = texture;
    material.needsUpdate = true;
  };
  reader.readAsDataURL(file);
  });
  
  // Metalness map
  document.getElementById('metalnessMap').addEventListener('change', (event) => {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = function(e) {
    const texture = new THREE.TextureLoader().load(e.target.result);
    material.metalnessMap = texture;
    material.needsUpdate = true;
  };
  reader.readAsDataURL(file);
  });
  
  // Bump map
  document.getElementById('bumpMap').addEventListener('change', (event) => {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = function(e) {
    const texture = new THREE.TextureLoader().load(e.target.result);
    material.bumpMap = texture;
    material.needsUpdate = true;
  };
  reader.readAsDataURL(file);
  });
  
  // AO map 
  document.getElementById('aoMap').addEventListener('change', (event) => {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = function(e) {
    const texture = new THREE.TextureLoader().load(e.target.result);
    material.aoMap = texture;
    material.needsUpdate = true;
  };
  reader.readAsDataURL(file);
  });
  
  // Delete PBR
  function removePBRTextures() {
  if (objetoSeleccionado && objetoSeleccionado.material) {
    const material = objetoSeleccionado.material;
    material.normalMap = null;
    material.aoMap = null;
    material.roughnessMap = null;
    material.metalnessMap = null;
    material.envMap = null;
    material.needsUpdate = true;
  }
}

document.getElementById('removePBR').addEventListener('click', () => {
  removePBRTextures();
});
}

function listMaterials() {
  materialsDiv.innerHTML = '';

  const materials = new Set();
  scene.traverse((object) => {
    if (object.isMesh && !object.userData.transformControlElement) {
      materials.add(object.material);
    }
  });

  materials.forEach((material) => {
  const materialElement = document.createElement('div');
  materialElement.style.width = '30px';
  materialElement.style.height = '30px';
  materialElement.style.borderRadius = '50%';
  materialElement.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
  materialElement.style.position = 'relative';
  materialElement.style.margin = '8px';
  materialElement.style.display = 'inline-block';

  if (material.map) {
    const texture = material.map.image.src;
    materialElement.style.backgroundImage = `url(${texture})`;
    materialElement.style.backgroundSize = 'cover';
  } else if (material.emissive && material.emissive.getHex() !== 0x000000) {
    materialElement.style.backgroundColor = material.emissive.getStyle();
  } else {
    materialElement.style.backgroundColor = material.color ? material.color.getStyle() : '#fff';
  }

  const innerShadow = document.createElement('div');
  innerShadow.style.position = 'absolute';
  innerShadow.style.top = '0';
  innerShadow.style.left = '0';
  innerShadow.style.right = '0';
  innerShadow.style.bottom = '0';
  innerShadow.style.borderRadius = '90%';
  innerShadow.style.boxShadow = 'inset -6px -2px 6px rgba(0, 0, 0, 0.5)';
  materialElement.appendChild(innerShadow);

  scene.traverse((object) => {
    if (object.isMesh && object.userData.SelectedObject && object.material === material) {
      materialElement.classList.add('selectedMaterial');
    }
  });

  materialElement.addEventListener('click', () => {
    document.querySelectorAll('.selectedMaterial').forEach((elem) => {
      elem.classList.remove('selectedMaterial');
    });
    materialElement.classList.add('selectedMaterial');
    showMaterialProperties(material);

    const materialPropertyDiv = document.getElementById('materialPropertiesDiv');
    if (materialPropertyDiv.style.display === 'none' || materialPropertyDiv.style.display === '') {
      materialPropertyDiv.style.display = 'block';
    } else {
      materialPropertyDiv.style.display = 'none';
    }
  });

  materialsDiv.appendChild(materialElement);
});
}
