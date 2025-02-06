/* Selection System */
let objetoSeleccionado = null;
const raycaster = new THREE.Raycaster();
const touch = new THREE.Vector2();

window.addEventListener('touchstart', (event) => {
  if (event.touches.length > 0) {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
  }
});

function seleccionarObjeto(event) {
  if (event.changedTouches.length > 0) {
    const touchEndX = event.changedTouches[0].clientX;
    const touchEndY = event.changedTouches[0].clientY;
    const deltaX = Math.abs(touchEndX - touchStartX);
    const deltaY = Math.abs(touchEndY - touchStartY);

    if (deltaX < touchThreshold && deltaY < touchThreshold) {
      touch.x = (event.changedTouches[0].clientX / window.innerWidth) * 2 - 1;
      touch.y = -(event.changedTouches[0].clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(touch, camera);
      const intersecciones = raycaster.intersectObjects(scene.children, true);

      let objetoTocado = null;

      for (let i = 0; i < intersecciones.length; i++) {
        const interseccion = intersecciones[i];
        if (interseccion.object instanceof THREE.Mesh && !isNoSeleccionable(interseccion.object)) {
          objetoTocado = interseccion.object;
          break;
        }
      }

      if (objetoTocado) {
        if (objetoSeleccionado && objetoSeleccionado !== objetoTocado) {
          resetVertexColor(objetoSeleccionado); // Reset color del objeto previo
        }

        objetoSeleccionado = objetoTocado;
        updateVertexColor(objetoSeleccionado, 0xff7000); // Color naranja para el objeto seleccionado
      } else {
        deselectObject();
      }
    }
  }
}

function resetVertexColor(objeto) {
  const geometry = objeto.geometry;
  if (geometry && geometry.attributes && geometry.attributes.position) {
    const position = geometry.attributes.position;
    const colors = new THREE.BufferAttribute(new Float32Array(position.count * 3), 3);

    for (let i = 0; i < position.count; i++) {
      colors.setXYZ(i, 1, 1, 1); // Restablecer el color original (blanco)
    }

    geometry.setAttribute('color', colors);
    objeto.material.vertexColors = true; // Asegúrate de que el material soporte colores por vértice
  }
}

function updateVertexColor(objeto, color) {
  const geometry = objeto.geometry;
  if (geometry && geometry.attributes && geometry.attributes.position) {
    const position = geometry.attributes.position;
    const colors = new THREE.BufferAttribute(new Float32Array(position.count * 3), 3);

    for (let i = 0; i < position.count; i++) {
      colors.setXYZ(i, (color >> 16 & 0xFF) / 255, (color >> 8 & 0xFF) / 255, (color & 0xFF) / 255); // Establecer el color (naranja)
    }

    geometry.setAttribute('color', colors);
    objeto.material.vertexColors = true; // Asegúrate de que el material soporte colores por vértice
  }
}

function deselectObject() {
  if (objetoSeleccionado) {
    resetVertexColor(objetoSeleccionado); // Restablecer color
    objetoSeleccionado = null;
  }
}