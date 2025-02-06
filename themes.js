// Abre o crea la base de datos de IndexedDB
let db;
const request = indexedDB.open('themeDB', 1);

request.onupgradeneeded = function(event) {
  db = event.target.result;
  const store = db.createObjectStore('themes', { keyPath: 'name' });
  store.createIndex('name', 'name', { unique: true });
};

request.onerror = function(event) {
  console.error('Error abriendo la base de datos: ', event.target.error);
};

request.onsuccess = function(event) {
  db = event.target.result;
  cargarTemasDesdeIndexedDB(true); // Cargar y aplicar los temas al iniciar
};

// Función para cargar los temas desde archivos .css
function cargarTheme() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.css';
  input.multiple = true;

  input.onchange = function(event) {
    const files = event.target.files;
    if (files.length > 0) {
      for (let file of files) {
        const reader = new FileReader();
        reader.onload = function(e) {
          const styleContent = e.target.result;
          const themeName = file.name;

          // Guardar el tema en IndexedDB
          saveThemeToIndexedDB(themeName, styleContent);

          // Crear un enlace para el tema
          createThemeElement(themeName, styleContent, false);
        };
        reader.readAsText(file);
      }
    }
  };

  input.click();
}

// Guardar tema en IndexedDB
function saveThemeToIndexedDB(themeName, styleContent) {
  const transaction = db.transaction(['themes'], 'readwrite');
  const store = transaction.objectStore('themes');
  const theme = { name: themeName, styleContent };

  const request = store.put(theme);

  request.onsuccess = function() {
    console.log(`Tema "${themeName}" guardado en IndexedDB`);
  };

  request.onerror = function(event) {
    console.error('Error guardando el tema en IndexedDB: ', event.target.error);
  };
}

// Cargar los temas desde IndexedDB y mostrarlos en el div
function cargarTemasDesdeIndexedDB(applyOnLoad = false) {
  const transaction = db.transaction(['themes'], 'readonly');
  const store = transaction.objectStore('themes');
  const request = store.getAll();

  request.onsuccess = function(event) {
    const themes = event.target.result;
    const themeListDiv = document.getElementById('theme-list');
    themeListDiv.innerHTML = '<h3>Lista de Temas</h3>'; // Limpiar la lista antes de cargar

    themes.forEach(theme => {
      const isApplied = document.getElementById(`theme-${theme.name}`) !== null;
      createThemeElement(theme.name, theme.styleContent, isApplied);

      // Aplicar el primer tema o todos si `applyOnLoad` es true
      if (applyOnLoad && !isApplied) {
        applyTheme(theme.name, theme.styleContent);
      }
    });
  };

  request.onerror = function(event) {
    console.error('Error cargando los temas desde IndexedDB: ', event.target.error);
  };
}

// Crear el elemento visual para cada tema
function createThemeElement(themeName, styleContent, isApplied) {
  const themeListDiv = document.getElementById('theme-list');

  // Crear un div para cada tema
  const themeDiv = document.createElement('div');
  themeDiv.classList.add('theme-item');

  const themeTitle = document.createElement('p');
  themeTitle.textContent = themeName;
  themeDiv.appendChild(themeTitle);

  const applyButton = document.createElement('button');
  applyButton.textContent = isApplied ? 'Desinstalar' : 'Aplicar';
  themeDiv.appendChild(applyButton);

  const removeButton = document.createElement('button');
  removeButton.textContent = 'Eliminar';
  themeDiv.appendChild(removeButton);

  // Evento para aplicar el tema
  applyButton.onclick = () => {
    if (isApplied) {
      removeThemeFromPage(themeName);
      removeThemeFromIndexedDB(themeName, themeDiv);
    } else {
      applyTheme(themeName, styleContent);
      updateThemeButton(themeDiv, true); // Cambiar el estado del botón a 'Desinstalar'
    }
  };

  // Evento para eliminar el tema
  removeButton.onclick = () => {
    removeThemeFromIndexedDB(themeName, themeDiv);
  };

  themeListDiv.appendChild(themeDiv);
}

// Aplicar un tema
function applyTheme(themeName, styleContent) {
  // Verificar si el tema ya está aplicado
  const existingStyle = document.getElementById(`theme-${themeName}`);
  if (existingStyle) {
    existingStyle.remove();
  }

  const styleElement = document.createElement('style');
  styleElement.id = `theme-${themeName}`;
  styleElement.textContent = styleContent;
  document.head.appendChild(styleElement);
}

// Eliminar tema de la página
function removeThemeFromPage(themeName) {
  const themeStyle = document.getElementById(`theme-${themeName}`);
  if (themeStyle) {
    themeStyle.remove();
  }
}

// Eliminar el tema de IndexedDB
function removeThemeFromIndexedDB(themeName, themeDiv) {
  const transaction = db.transaction(['themes'], 'readwrite');
  const store = transaction.objectStore('themes');
  const request = store.delete(themeName);

  request.onsuccess = function() {
    console.log(`Tema "${themeName}" eliminado de IndexedDB`);
    themeDiv.remove(); // Eliminar el tema de la interfaz
    alert(`El tema "${themeName}" ha sido eliminado.`);
  };

  request.onerror = function(event) {
    console.error('Error eliminando el tema de IndexedDB: ', event.target.error);
  };
}

// Actualizar el botón de un tema (Aplicar <-> Desinstalar)
function updateThemeButton(themeDiv, isApplied) {
  const applyButton = themeDiv.querySelector('button');
  applyButton.textContent = isApplied ? 'Desinstalar' : 'Aplicar';
}

// Función para recargar la página
function reloadPage() {
  const confirmReload = confirm("¿Estás seguro de que quieres recargar la página?");
  if (confirmReload) {
    location.reload();
  }
}

// Función para codificar el tema (editor de código)
function codifyTheme() {
  const modal = document.createElement('div');
  modal.classList.add('modal');

  const editorContainer = document.createElement('div');
  editorContainer.classList.add('editor-container');

  const textarea = document.createElement('textarea');
  textarea.placeholder = 'Escribe el código de tu tema aquí...';
  textarea.id = 'theme-code-input';

  const buttonContainer = document.createElement('div');
  buttonContainer.classList.add('button-container');

  const saveButton = document.createElement('button');
  saveButton.textContent = 'Guardar como .css';

  const closeButton = document.createElement('button');
  closeButton.textContent = 'Cerrar';

  buttonContainer.appendChild(saveButton);
  buttonContainer.appendChild(closeButton);

  editorContainer.appendChild(textarea);
  editorContainer.appendChild(buttonContainer);
  modal.appendChild(editorContainer);

  document.body.appendChild(modal);

  closeButton.onclick = () => {
    modal.remove();
  };

  saveButton.onclick = () => {
    const themeCode = textarea.value;
    if (themeCode.trim() === '') {
      alert('El código del tema no puede estar vacío');
      return;
    }

    const themeName = prompt("Por favor, ingresa el nombre de tu tema:");
    if (!themeName || themeName.trim() === '') {
      alert("El nombre del tema es obligatorio.");
      return;
    }

    const blob = new Blob([themeCode], { type: 'text/css' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${themeName}.css`;

    link.click();

    saveThemeToIndexedDB(themeName, themeCode);

    alert(`Tema "${themeName}" guardado correctamente como ${themeName}.css`);
    modal.remove();
  };
}