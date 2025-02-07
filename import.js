function fastImport() {
  const input = document.createElement('input');
  input.type = 'file';

  input.onchange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const extension = file.name.split('.').pop().toLowerCase();
    const url = URL.createObjectURL(file);

    switch (extension) {
      case 'obj': {
        const loader = new THREE.OBJLoader();
        loader.load(
          url,
          (object) => {
            scene.add(object);
          },
          undefined,
          (error) => console.error('Error cargando OBJ:', error)
        );
        break;
      }
      case 'fbx': {
        const loader = new THREE.FBXLoader();
        loader.load(
          url,
          (object) => {
            scene.add(object);
            addAutoBone();
          },
          undefined,
          (error) => console.error('Error cargando FBX:', error)
        );
        break;
      }
      case 'gltf':
      case 'glb': {
        const loader = new THREE.GLTFLoader();
        loader.load(
          url,
          (gltf) => {
            scene.add(gltf.scene);
            addAutoBone();
          },
          undefined,
          (error) => console.error('Error cargando GLTF/GLB:', error)
        );
        break;
      }
      case 'stl': {
        const loader = new THREE.STLLoader();
        loader.load(
          url,
          (geometry) => {
            const material = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
            const mesh = new THREE.Mesh(geometry, material);
            scene.add(mesh);
            addAutoBone();
          },
          undefined,
          (error) => console.error('Error cargando STL:', error)
        );
        break;
      }
      default:
        console.error('Formato de archivo no soportado:', extension);
    }
  };

  input.click();
}

function importOBJ() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.obj';

  input.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) {
      console.error('No se seleccionó ningún archivo.');
      return;
    }

    const reader = new FileReader();

    reader.onload = function() {
      const text = reader.result;

      const loader = new THREE.OBJLoader();
      try {
        const obj = loader.parse(text);

        // Verificar si previewScene existe
        if (typeof previewScene !== 'undefined' && previewScene) {
          previewScene.add(obj);
          console.log('Modelo OBJ importado a previewScene.');
        } else {
          scene.add(obj);
          console.log('Modelo OBJ importado directamente a scene.');
        }
      } catch (error) {
        console.error('Error al cargar el modelo OBJ:', error);
      }
    };

    reader.onerror = function(error) {
      console.error('Error al leer el archivo:', error);
    };

    reader.readAsText(file);
  });

  input.click();
}
function importFBX() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.fbx';

  input.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) {
      console.error('No se seleccionó ningún archivo.');
      return;
    }

    const reader = new FileReader();

    reader.onload = function() {
      const arrayBuffer = reader.result;

      const loader = new THREE.FBXLoader();
      try {
        const fbx = loader.parse(arrayBuffer);

        // Verificar si previewScene existe
        if (typeof previewScene !== 'undefined' && previewScene) {
          previewScene.add(fbx);
          console.log('Modelo FBX importado a previewScene.');
        } else {
          scene.add(fbx);
          console.log('Modelo FBX importado directamente a scene.');
        }
      } catch (error) {
        console.error('Error al cargar el modelo FBX:', error);
      }
    };

    reader.onerror = function(error) {
      console.error('Error al leer el archivo:', error);
    };

    reader.readAsArrayBuffer(file);
  });

  input.click();
}
function importGLTF() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.gltf,.glb';

  input.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) {
      console.error('No se seleccionó ningún archivo.');
      return;
    }

    const reader = new FileReader();

    reader.onload = function() {
      const arrayBuffer = reader.result;

      const loader = new THREE.GLTFLoader();
      try {
        loader.parse(arrayBuffer, '', function(gltf) {
          // Si no existe previewScene, se añade directamente a la escena principal
          if (typeof previewScene === 'undefined') {
            scene.add(gltf.scene); // Usamos 'scene' en lugar de 'previewScene'
          } else {
            previewScene.add(gltf.scene);
          }
          console.log('Modelo GLTF importado correctamente.');
        });
      } catch (error) {
        console.error('Error al cargar el modelo GLTF:', error);
      }
    };

    reader.onerror = function(error) {
      console.error('Error al leer el archivo:', error);
    };

    reader.readAsArrayBuffer(file);
  });

  input.click();
}
function importSTL() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.stl';

  input.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) {
      console.error('No se seleccionó ningún archivo.');
      return;
    }

    const reader = new FileReader();

    reader.onload = function() {
      const arrayBuffer = reader.result;

      const loader = new THREE.STLLoader();
      try {
        const geometry = loader.parse(arrayBuffer);
        const material = new THREE.MeshStandardMaterial({ color: 0x0055ff });
        const mesh = new THREE.Mesh(geometry, material);

        // Si no existe previewScene, se añade directamente a la escena principal
        if (typeof previewScene === 'undefined') {
          scene.add(mesh); // Usamos 'scene' en lugar de 'previewScene'
        } else {
          previewScene.add(mesh);
        }
        console.log('Modelo STL importado correctamente.');
      } catch (error) {
        console.error('Error al cargar el modelo STL:', error);
      }
    };

    reader.onerror = function(error) {
      console.error('Error al leer el archivo:', error);
    };

    reader.readAsArrayBuffer(file);
  });

  input.click();
}
function importZIP() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.zip';

  input.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) {
      console.error('No se seleccionó ningún archivo.');
      return;
    }

    const reader = new FileReader();

    reader.onload = function() {
      const arrayBuffer = reader.result;

      JSZip.loadAsync(arrayBuffer).then(function(zip) {
        zip.forEach(function(relativePath, zipEntry) {
          const fileName = zipEntry.name.toLowerCase();

          if (fileName.endsWith('.obj')) {
            zipEntry.async('arraybuffer').then(function(content) {
              const loader = new THREE.OBJLoader();
              const object = loader.parse(content);

              // Si no existe previewScene, se añade directamente a la escena principal
              if (typeof previewScene === 'undefined') {
                scene.add(object); // Usamos 'scene' en lugar de 'previewScene'
              } else {
                previewScene.add(object);
              }
              console.log('Modelo OBJ cargado.');
            });
          } else if (fileName.endsWith('.fbx')) {
            zipEntry.async('arraybuffer').then(function(content) {
              const loader = new THREE.FBXLoader();
              const object = loader.parse(content);

              // Si no existe previewScene, se añade directamente a la escena principal
              if (typeof previewScene === 'undefined') {
                scene.add(object); // Usamos 'scene' en lugar de 'previewScene'
              } else {
                previewScene.add(object);
              }
              console.log('Modelo FBX cargado.');
            });
          } else if (fileName.endsWith('.gltf') || fileName.endsWith('.glb')) {
            zipEntry.async('arraybuffer').then(function(content) {
              const loader = new THREE.GLTFLoader();
              loader.parse(content, '', function(gltf) {
                // Si no existe previewScene, se añade directamente a la escena principal
                if (typeof previewScene === 'undefined') {
                  scene.add(gltf.scene); // Usamos 'scene' en lugar de 'previewScene'
                } else {
                  previewScene.add(gltf.scene);
                }
                console.log('Modelo GLTF cargado.');
              });
            });
          } else if (fileName.endsWith('.stl')) {
            zipEntry.async('arraybuffer').then(function(content) {
              const loader = new THREE.STLLoader();
              const geometry = loader.parse(content);
              const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
              const mesh = new THREE.Mesh(geometry, material);

              // Si no existe previewScene, se añade directamente a la escena principal
              if (typeof previewScene === 'undefined') {
                scene.add(mesh); // Usamos 'scene' en lugar de 'previewScene'
              } else {
                previewScene.add(mesh);
              }
              console.log('Modelo STL cargado.');
            });
          }
        });
      }).catch(function(error) {
        console.error('Error al leer el archivo ZIP:', error);
      });
    };

    reader.onerror = function(error) {
      console.error('Error al leer el archivo:', error);
    };

    reader.readAsArrayBuffer(file);
  });

  input.click();
}

function exportGLTF() {
  const exporter = new THREE.GLTFExporter();

  let objectsToExport = [];

  scene.traverse(function(object) {
    if (object instanceof THREE.Mesh && !object.name.startsWith('TransformControls') && !(object.geometry && object.geometry.type === 'EdgGeometry')) {
      objectsToExport.push(object);
    }
  });

  const exportGroup = new THREE.Group();
  objectsToExport.forEach(object => exportGroup.add(object.clone()));

  exporter.parse(exportGroup, function(result) {
    const blob = new Blob([JSON.stringify(result)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'scene.glb';
    link.click();
  });
}
if (true) {
  
}
function addToScene() {
  if (previewScene) {
    previewScene.traverse(function(object) {
      if ((object.isMesh && object.userData.id !== 'exclude') ||
        (object.isGroup && object.children.some(child => child.isMesh && child.userData.id !== 'exclude'))) {
        scene.add(object);
      }
    });
  }
}

/* Mesh */
function addObjectToScene(object) {
  scene.add(object);
  updateOutliner();
  undoRedoManager.addAction({
    undo: () => {
      scene.remove(object);
      updateOutliner();
    },
    redo: () => {
      scene.add(object);
      updateOutliner();
    }
  });
}

function addCube() {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
  const cube = new THREE.Mesh(geometry, material);
  cube.name = "cube";
  cube.position.set(0, 0, 0);
  cube.castShadow = true;
  cube.receiveShadow = true;

  addObjectToScene(cube);
}
function addSphere() {
  const geometry = new THREE.SphereGeometry(0.5, 16, 10);
  const material = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
  const sphere = new THREE.Mesh(geometry, material);
  sphere.name = "sphere";
  sphere.position.set(0, 0, 0);
  sphere.castShadow = true;
  sphere.receiveShadow = true;

  addObjectToScene(sphere);
}
function addPlane() {
  const geometry = new THREE.PlaneGeometry(2, 2);
  const material = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, side: THREE.DoubleSide });
  const plane = new THREE.Mesh(geometry, material);
  plane.name = "plane";
  plane.position.set(0, 0, 0);
  plane.rotation.x = Math.PI / -2;
  plane.receiveShadow = true;

  addObjectToScene(plane);
}
function addCylinder() {
  const geometry = new THREE.CylinderGeometry(0.5, 0.5, 1.5, 32);
  const material = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
  const cylinder = new THREE.Mesh(geometry, material);
  cylinder.name = "cylinder";
  cylinder.position.set(0, 0, 0);
  cylinder.castShadow = true;
  cylinder.receiveShadow = true;

  addObjectToScene(cylinder);
}
function addPyramid() {
  const geometry = new THREE.ConeGeometry(0.5, 1, 20);
  const material = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
  const pyramid = new THREE.Mesh(geometry, material);
  pyramid.name = "pyramid";
  pyramid.position.set(0, 0, 0);
  pyramid.castShadow = true;
  pyramid.receiveShadow = true;

  addObjectToScene(pyramid);
}
function addToroid() {
  const geometry = new THREE.TorusGeometry(1, 0.4, 16, 30);
  const material = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
  const toroid = new THREE.Mesh(geometry, material);
  toroid.name = "dona";
  toroid.position.set(0, 0, 0);
  toroid.rotation.x = Math.PI/2;
  toroid.scale.set(0.5, 0.5, 0.5);
  toroid.castShadow = true;
  toroid.receiveShadow = true;

  addObjectToScene(toroid);
}
function addCircle() {
  const geometry = new THREE.CircleGeometry(1, 32);
  const material = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
  const circle = new THREE.Mesh(geometry, material);
  circle.name = "circle";
  circle.position.set(0, 0, 0);
  circle.castShadow = true;
  circle.receiveShadow = true;

  addObjectToScene(circle);
}
function addMirror() {
  const mirrorGeometry = new THREE.PlaneGeometry(5, 5);
  const mirror = new THREE.Reflector(mirrorGeometry, {
    clipBias: 0,
    textureWidth: window.innerWidth * window.devicePixelRatio,
    textureHeight: window.innerHeight * window.devicePixelRatio,
    color: 0xaaaaaa,
  });
  mirror.position.set(0, 0, 0);
  mirror.rotation.set(-Math.PI / 2, 0, 0);
  mirror.name = "mirror object";

  addObjectToScene(mirror);
}
function addMonkey() {
  const loader = new THREE.OBJLoader();
  loader.load('assets/models/suzanne.obj', function(object) {

    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      flatShading: false,
    });

    object.traverse(function(child) {
      if (child.isMesh) {
        child.material = material;
        child.receiveShadow = true;
        child.castShadow = true;
        child.scale.set(0.5, 0.5, 0.5);
        child.rotation.y = Math.PI/2;
        addObjectToScene(child);
      }
    });
  });
}
function addEmpty() {
  const size = 0.3;

  const geometryX = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-size, 0, 0),
    new THREE.Vector3(size, 0, 0),
  ]);

  const geometryY = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, -size, 0),
    new THREE.Vector3(0, size, 0),
  ]);

  const geometryZ = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, -size),
    new THREE.Vector3(0, 0, size),
  ]);

  const material = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 1.5 });

  const lineX = new THREE.Line(geometryX, material);
  const lineY = new THREE.Line(geometryY, material);
  const lineZ = new THREE.Line(geometryZ, material);

  const emptyObject = new THREE.Object3D();
  emptyObject.add(lineX, lineY, lineZ);

  emptyObject.name = 'Empty';
  emptyObject.position.set(0, 0, 0);

  addObjectToScene(emptyObject);
}
let videoElement = null;
let isVideoPlaying = false;

function addVideo() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'video/*';

  input.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    videoElement = document.createElement('video');
    videoElement.src = url;
    videoElement.load();
    videoElement.loop = true;

    const texture = new THREE.VideoTexture(videoElement);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.format = THREE.RGBFormat;

    const geometry = new THREE.PlaneGeometry(16, 9);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const plane = new THREE.Mesh(geometry, material);

    plane.position.set(0, 5, 0);
    scene.add(plane);

    console.log('Video añadido a la escena');
  });

  input.click();
}

function playVideo() {
  if (videoElement && !isVideoPlaying) {
    videoElement.play();
    isVideoPlaying = true;
  }
}

function pauseVideo() {
  if (videoElement && isVideoPlaying) {
    videoElement.pause();
    isVideoPlaying = false;
  }
}

function resetVideo() {
  if (videoElement) {
    videoElement.currentTime = 0;
  }
}

function setVideoTime(time) {
  if (videoElement) {
    videoElement.currentTime = time;
  }
}


function addTarget() {
  const size = 0.3;

  const geometryX = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-size, 0, 0),
    new THREE.Vector3(size, 0, 0),
  ]);

  const geometryY = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, -size, 0),
    new THREE.Vector3(0, size, 0),
  ]);

  const geometryZ = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, -size),
    new THREE.Vector3(0, 0, size),
  ]);

  const material = new THREE.LineBasicMaterial({ color: 0xff5000, linewidth: 2 });

  const lineX = new THREE.Line(geometryX, material);
  const lineY = new THREE.Line(geometryY, material);
  const lineZ = new THREE.Line(geometryZ, material);

  const emptyTarget = new THREE.Object3D();
  emptyTarget.add(lineX, lineY, lineZ);

  emptyTarget.userData.id = 'cameraTarget';
  emptyTarget.name = 'Target';
  emptyTarget.position.set(0, 0, 0);

  scene.add(emptyTarget);
}

/* Light */
function addPointLight() {
  const pointLight = new THREE.PointLight(0xffffff, 1, 100);
  pointLight.position.set(0, 5, 0);
  pointLight.castShadow = true;
  const lightHelper = new THREE.PointLightHelper(pointLight, 0.5);
  addObjectToScene(pointLight, addLightIcon());
}
function addDirectionalLight() {
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(1, 2, -1);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.height = 2080;
  directionalLight.shadow.mapSize.width = 2080;
  directionalLight.shadow.radius = 8000;
  directionalLight.shadow.bias = -0.000000001;
  addObjectToScene(directionalLight, addLightIcon());
}
function addSpotLight() {
  const spotLight = new THREE.SpotLight(0xffffff, 1);
  spotLight.position.set(10, 10, 10);
  spotLight.castShadow = true;
  spotLight.angle = Math.PI / 1.1;
  spotLight.distance = 50;
  const spotLightHelper = new THREE.SpotLightHelper(spotLight);
  addObjectToScene(spotLight, addLightIcon());
}
function addAmbientLight() {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  addObjectToScene(ambientLight, addLightIcon());
}
function addHemisphereLight() {
  const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x0000ff, 0.5);
  hemisphereLight.position.set(0, 4, 0);
  hemisphereLight.castShadow = false;
  const helper = new THREE.HemisphereLightHelper(hemisphereLight, 1);
  addObjectToScene(hemisphereLight, addLightIcon());
}
function addRectAreaLight() {
  const rectAreaLight = new THREE.RectAreaLight(0xffffff, 1, 5, 5);
  rectAreaLight.position.set(0, 2, 0);
  rectAreaLight.rotation.x = Math.PI / 2;
  rectAreaLight.castShadow = false;
  const rectAreaLightHelper = new THREE.RectAreaLightHelper(rectAreaLight);
  addObjectToScene(rectAreaLight, addLightIcon());
}

/* Line */
function addLine() {
  const material = new THREE.LineBasicMaterial({ color: 0xffffff });
  const points = [
    new THREE.Vector3(-5, 0, 0),
    new THREE.Vector3(5, 0, 0)
  ];
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.Line(geometry, material);
  line.name = 'Line';
  scene.add(line);
  updateOutliner();
  undoRedoManager.addAction({
    undo: () => {
      scene.remove(line);
      updateOutliner();
    },
    redo: () => {
      scene.add(line);
      updateOutliner();
    }
  });
}
function addDashedLine() {
  const material = new THREE.LineDashedMaterial({
    color: 0xffffff,
    dashSize: 0.3,
    gapSize: 0.2,
  });
  const points = [
    new THREE.Vector3(-5, 0, 0),
    new THREE.Vector3(5, 0, 0)
  ];
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.Line(geometry, material);
  line.computeLineDistances();
  scene.add(line);
  updateOutliner();
  undoRedoManager.addAction({
    undo: () => {
      scene.remove(line);
      updateOutliner();
    },
    redo: () => {
      scene.add(line);
      updateOutliner();
    }
  });
}
function addLineSegments() {
  const material = new THREE.LineBasicMaterial({ color: 0xffffff });
  const points = [
    new THREE.Vector3(-5, 0, 0),
    new THREE.Vector3(0, 5, 0),
    new THREE.Vector3(5, 0, 0),
    new THREE.Vector3(0, -5, 0)
  ];
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const lineSegments = new THREE.LineSegments(geometry, material);
  lineSegments.name = 'Line Segments';
  scene.add(lineSegments);
  updateOutliner();
  undoRedoManager.addAction({
    undo: () => {
      scene.remove(lineSegments);
      updateOutliner();
    },
    redo: () => {
      scene.add(lineSegments);
      updateOutliner();
    }
  });
}
function addThickLine() {
  const material = new THREE.LineDashedMaterial({
    color: 0xffffff,
    linewidth: 4,
    scale: 1,
    dashSize: 3,
    gapSize: 1
  });
  const points = [
    new THREE.Vector3(-5, 0, 0),
    new THREE.Vector3(5, 0, 0)
  ];
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const thickLine = new THREE.Line(geometry, material);
  thickLine.computeLineDistances();
  thickLine.name = 'Thick Line';
  scene.add(thickLine);
  updateOutliner();
  undoRedoManager.addAction({
    undo: () => {
      scene.remove(thickLine);
      updateOutliner();
    },
    redo: () => {
      scene.add(thickLine);
      updateOutliner();
    }
  });
}
function addCurve() {
  const material = new THREE.LineBasicMaterial({
    color: 0xffffff
  });

  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-5, 0, 0),
    new THREE.Vector3(-2, 5, 0),
    new THREE.Vector3(2, -5, 0),
    new THREE.Vector3(5, 0, 0)
  ]);

  const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(50));
  const curveLine = new THREE.Line(geometry, material);
  curveLine.name = 'Curve Line';
  scene.add(curveLine);
  updateOutliner();
  undoRedoManager.addAction({
    undo: () => {
      scene.remove(curveLine);
      updateOutliner();
    },
    redo: () => {
      scene.add(curveLine);
      updateOutliner();
    }
  });
}
function addArrow() {
  const material = new THREE.LineBasicMaterial({
    color: 0xffffff
  });

  const arrowLength = 5;
  const arrowHeadLength = 1;
  const arrowHeadWidth = 0.5;

  const points = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(arrowLength, 0, 0)
  ];

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const arrowLine = new THREE.Line(geometry, material);

  const arrowHead = new THREE.ConeGeometry(arrowHeadWidth, arrowHeadLength, 3);
  const arrowHeadMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const arrowHeadMesh = new THREE.Mesh(arrowHead, arrowHeadMaterial);
  arrowHeadMesh.position.set(arrowLength, 0, 0);
  arrowHeadMesh.rotation.z = Math.PI / 2;
  arrowHeadMesh.name = 'Arrow';
  scene.add(arrowLine);
  scene.add(arrowHeadMesh);
  updateOutliner();
  undoRedoManager.addAction({
    undo: () => {
      scene.remove(arrowLine);
      scene.remove(arrowHeadMesh);
      updateOutliner();
    },
    redo: () => {
      scene.add(arrowLine);
      scene.add(arrowHeadMesh);
      updateOutliner();
    }
  });
}

function addCamera() {
  const cameraObjLoader = new THREE.OBJLoader();

  cameraObjLoader.load('assets/models/Camera.obj', function(obj) {
    let cameraLines;

    obj.traverse((child) => {
      if (child.isMesh) {
        const edges = new THREE.EdgesGeometry(child.geometry);
        cameraLines = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({
          color: 0xffffff,
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

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.name = 'Camera';
    camera.userData.id = 'camera';
    camera.position.set(-2, 2, 2);
    camera.rotation.y = THREE.MathUtils.degToRad(-90);
    camera.lookAt(0, 0, 0);
    
    cameraLines.position.set(0, 0, 0);
    camera.add(cameraLines);

    scene.add(camera);

    window.addEventListener('touchstart', function(event) {
      const mouse = new THREE.Vector2();
      mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(scene.children, true);
    });
  });
}


// Scene add
addCamera();
addCube();



/* Test */
function loadModel() {
  const modelData = document.querySelector('model[name="cubo"]').textContent.trim();
  const loader = new THREE.OBJLoader();
  const blob = new Blob([modelData], { type: 'text/plain' });
  const objectURL = URL.createObjectURL(blob);

  loader.load(objectURL, object => scene.add(object));
}

loadModel();

