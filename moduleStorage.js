// Function to save a module to IndexedDB
async function saveModuleToIndexedDB(url, moduleName) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch module: ${moduleName}`);
    const moduleText = await response.text();

    const request = indexedDB.open('modulesDB', 1);

    request.onupgradeneeded = function(event) {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('modules')) {
        db.createObjectStore('modules', { keyPath: 'name' });
      }
    };

    request.onsuccess = function(event) {
      const db = event.target.result;
      const transaction = db.transaction('modules', 'readwrite');
      const store = transaction.objectStore('modules');
      store.put({ name: moduleName, content: moduleText });
      console.log(`Module ${moduleName} saved to IndexedDB.`);
    };

    request.onerror = function(event) {
      console.error('Error opening IndexedDB:', event);
    };
  } catch (error) {
    console.error('Error saving module to IndexedDB:', error);
  }
}

// Function to load a module from IndexedDB
async function loadModuleFromIndexedDB(moduleName) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('modulesDB', 1);

    request.onsuccess = function(event) {
      const db = event.target.result;
      const transaction = db.transaction('modules', 'readonly');
      const store = transaction.objectStore('modules');
      const getRequest = store.get(moduleName);

      getRequest.onsuccess = function(event) {
        const result = event.target.result;
        if (result) {
          const script = document.createElement('script');
          script.textContent = result.content;
          document.head.appendChild(script);
          console.log(`Module ${moduleName} loaded from IndexedDB.`);
          resolve();
        } else {
          reject(`Module ${moduleName} not found in IndexedDB`);
        }
      };

      getRequest.onerror = function(event) {
        reject(`Error loading module from IndexedDB: ${event}`);
      };
    };

    request.onerror = function(event) {
      reject(`Error opening IndexedDB: ${event}`);
    };
  });
}

// Function to save all modules to IndexedDB
async function saveAllModules() {
  const modules = [
    { url: 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', name: 'three.min.js' },
    { url: 'https://cdn.jsdelivr.net/npm/three-subdivision-modifier@0.1.2/dist/three-subdivision-modifier.js', name: 'three-subdivision-modifier.js' },
    { url: 'https://cdnjs.cloudflare.com/ajax/libs/tween.js/18.6.4/tween.umd.js', name: 'tween.umd.js' },
    { url: 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/TransformControls.js', name: 'TransformControls.js' },
    { url: 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js', name: 'OrbitControls.js' },
    { url: 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js', name: 'GLTFLoader.js' },
    { url: 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/FBXLoader.js', name: 'FBXLoader.js' },
    { url: 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/OBJLoader.js', name: 'OBJLoader.js' },
    { url: 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/examples/jsm/postprocessing/OutlinePass.js', name: 'OutlinePass.js' },
    { url: 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/examples/jsm/postprocessing/EffectComposer.js', name: 'EffectComposer.js' },
    { url: 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/examples/jsm/postprocessing/RenderPass.js', name: 'RenderPass.js' },
    { url: 'https://cdn.jsdelivr.net/npm/@simonwep/pickr', name: 'pickr.js' }
  ];

  for (const module of modules) {
    await saveModuleToIndexedDB(module.url, module.name);
  }
}

// Function to load all modules from IndexedDB in a loop until successful
async function loadAllModules() {
  const moduleNames = [
    'three.min.js',
    'three-subdivision-modifier.js',
    'tween.umd.js',
    'TransformControls.js',
    'OrbitControls.js',
    'GLTFLoader.js',
    'FBXLoader.js',
    'OBJLoader.js',
    'OutlinePass.js',
    'EffectComposer.js',
    'RenderPass.js',
    'pickr.js'
  ];

  for (const moduleName of moduleNames) {
    let loaded = false;
    while (!loaded) {
      try {
        await loadModuleFromIndexedDB(moduleName);
        loaded = true;
      } catch (error) {
        console.error(error);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Retry after 1 second
      }
    }
  }
}

// Initialize the process
async function initModules() {
  await saveAllModules();
  await loadAllModules();
  console.log('Modules initialized successfully.');
}

// Call initModules when the document is ready
document.addEventListener('DOMContentLoaded', initModules);

