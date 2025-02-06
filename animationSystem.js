document.addEventListener('DOMContentLoaded', () => {
  let isPaused = true;
  const totalFrames = 1500;
  let currentFrame = 0;

  const keyframesByObject = new Map();
  let copiedKeyframe = null;

  const timeline = document.getElementById('timeline');
  const frames = [];
  for (let i = 0; i < totalFrames; i++) {
    const frame = document.createElement('div');
    frame.className = 'frame';
    frames.push(frame);
    timeline.appendChild(frame);
  }

  const frameCursor = document.createElement('div');
  frameCursor.className = 'frame-cursor';
  timeline.appendChild(frameCursor);

  let selectedTransition = 'linear';
  const transitionsMenu = document.getElementById('transitions');
  transitionsMenu.addEventListener('change', (event) => {
    selectedTransition = event.target.value;
  });

  let autoKeyActive = false;
  const autoKeyButton = document.getElementById('autoKey');
  autoKeyButton.addEventListener('click', () => {
  autoKeyActive = !autoKeyActive;

  // Cambiar la imagen según el estado del autoKey
  if (autoKeyActive) {
    autoKeyButton.innerHTML = '<img src="/assets/models/keyframe1.svg" alt="Auto Keyframe On">';
    autoKeyButton.style.backgroundColor = 'var(--accent-secondary)';
  } else {
    autoKeyButton.innerHTML = '<img src="/assets/models/keyframe1.svg" alt="Auto Keyframe Off">';
    autoKeyButton.style.backgroundColor = ''; 
  }
});

  const zoomInButton = document.getElementById("zoomIn");
const zoomOutButton = document.getElementById("zoomOut");
const timelineFrames = document.querySelectorAll(".frame");

let borderWidth = 6;

zoomInButton.addEventListener("click", () => {
  if (borderWidth < 30) borderWidth++;
  updateZoom();
});

zoomOutButton.addEventListener("click", () => {
  if (borderWidth > 1) borderWidth--;
  updateZoom();
});

function updateZoom() {
  timelineFrames.forEach(frame => {
    frame.style.borderRight = `${borderWidth}px solid var(--bg-primary)`;
  });
}

  function updateKeyframeButtonText() {
  const keyframeButton = document.getElementById('keyframeButton');
  const selectedObject = getSelectedObject();
  if (selectedObject) {
    const keyframes = keyframesByObject.get(selectedObject) || [];
    const isKeyframe = keyframes.some(k => k.frame === currentFrame);
    const currentKeyframe = keyframes.find(k => k.frame === currentFrame);
    
    if (isKeyframe && currentKeyframe) {
      const hasChanged = !selectedObject.position.equals(currentKeyframe.position) ||
        !selectedObject.rotation.equals(currentKeyframe.rotation) ||
        !selectedObject.scale.equals(currentKeyframe.scale);

      keyframeButton.innerHTML = hasChanged 
        ? '<img src="/assets/models/keyframe1.svg" alt="Change">'
        : '<img src="" alt="Add">';
    } else {
      keyframeButton.innerHTML = '<img src="/assets/models/keyframe1.svg" alt="Add">';
    }
  }
}

  const keyframeButton = document.getElementById('keyframeButton');
  keyframeButton.addEventListener('click', () => {
    const selectedObject = getSelectedObject();
    if (!selectedObject) {
      alert('Por favor, selecciona un objeto primero.');
      return;
    }

    let keyframes = keyframesByObject.get(selectedObject) || [];
    const existingKeyframeIndex = keyframes.findIndex(k => k.frame === currentFrame);

    if (existingKeyframeIndex !== -1) {
      const currentKeyframe = keyframes[existingKeyframeIndex];
      const hasChanged = !selectedObject.position.equals(currentKeyframe.position) ||
        !selectedObject.rotation.equals(currentKeyframe.rotation) ||
        !selectedObject.scale.equals(currentKeyframe.scale);

      if (hasChanged) {
        const position = selectedObject.position.clone();
        const rotation = selectedObject.rotation.clone();
        const scale = selectedObject.scale.clone();
        keyframes[existingKeyframeIndex] = { frame: currentFrame, position, rotation, scale };
      } else {
        keyframes.splice(existingKeyframeIndex, 1);
      }
    } else {
      const position = selectedObject.position.clone();
      const rotation = selectedObject.rotation.clone();
      const scale = selectedObject.scale.clone();
      keyframes.push({ frame: currentFrame, position, rotation, scale });
    }

    keyframes.sort((a, b) => a.frame - b.frame);
    keyframesByObject.set(selectedObject, keyframes);
    renderKeyframes();
    updateKeyframeButtonText();
  });

const copyButton = document.getElementById('copyButton');
copyButton.addEventListener('click', () => {
  const selectedObject = getSelectedObject();
  if (!selectedObject) {
    alert('Por favor, selecciona un objeto primero.');
    return;
  }

  const icon = copyButton.querySelector('img');

  if (icon.src.includes('duplicate.svg')) {
    let keyframes = keyframesByObject.get(selectedObject) || [];
    const currentKeyframe = keyframes.find(k => k.frame === currentFrame);

    if (currentKeyframe) {
      copiedKeyframe = { ...currentKeyframe };
      icon.src = '/assets/models/keyframe1.svg';
    } else {
      alert('No hay keyframe para copiar en el frame actual.');
    }
  } else if (icon.src.includes('paste_down.svg')) {
    if (copiedKeyframe) {
      let keyframes = keyframesByObject.get(selectedObject) || [];
      const newKeyframe = { ...copiedKeyframe, frame: currentFrame };
      keyframes.push(newKeyframe);
      keyframes.sort((a, b) => a.frame - b.frame);
      keyframesByObject.set(selectedObject, keyframes);
      copiedKeyframe = null;
      icon.src = '/assets/models/keyframe1.svg';
      renderKeyframes();
      updateKeyframeButtonText();
    }
  }
});

  function getSelectedObjects() {
  const selectedObjects = [];
  scene.traverse((object) => {
    if (object.userData.SelectedObject) {
      selectedObjects.push(object);
    }
  });
  return selectedObjects;
}

  function clearKeyframes() {
    frames.forEach((frame) => {
      frame.style.backgroundColor = '';
      frame.classList.remove('keyframe');
      const marker = frame.querySelector('.keyframe-marker');
      if (marker) {
        frame.removeChild(marker);
      }
    });
  }

  function renderKeyframes() {
    clearKeyframes();
    const selectedObject = getSelectedObject();
    if (selectedObject) {
      const keyframes = keyframesByObject.get(selectedObject) || [];
      keyframes.forEach(keyframe => {
        if (!keyframe.hidden) {
          const keyframeElement = frames[keyframe.frame];
          keyframeElement.classList.add('keyframe');
          const marker = document.createElement('div');
          marker.className = 'keyframe-marker';
          keyframeElement.appendChild(marker);
        }
      });
    }
    renderFrameCursor();
  }
  
  function addFrameNumbers() {
    
  const timeline = document.getElementById('timeline');
  const timelineContainer = document.getElementById('timelineContainer');
  const frameWidth = timeline.offsetWidth / totalFrames;
  const frameNumbersContainer = document.getElementById('timeline-numbers');
  frameNumbersContainer.innerHTML = '';

  for (let i = 0; i < totalFrames; i++) {
    if (i % 10 === 0) {
      const number = document.createElement('div');
      number.className = 'frame-number';
      number.innerText = i;
      number.style.left = `${i * frameWidth}px`;
      frameNumbersContainer.appendChild(number);
    }
  }
}
  document.getElementById('frameNumber').addEventListener('input', function() {
    currentFrame = Math.max(0, Math.min(parseInt(this.value, 10) || 0, totalFrames));
    frameCursor.style.left = `${(currentFrame / totalFrames) * 100}%`;
  });
  
  function renderFrameCursor() {
    frameCursor.style.left = `${(currentFrame / totalFrames) * 100}%`;
    const frameNumberInput = document.getElementById('frameNumber');
    frameNumberInput.value = currentFrame;
  }

  function getEasingFunction(t) {
    switch (selectedTransition) {
      case 'linear': return t;
      case 'smooth': return Math.sin((t * Math.PI) / 2);
      case 'constant': return t < 1 ? 0 : 1;
      case 'easeIn': return TWEEN.Easing.Quadratic.In(t);
      case 'easeOut': return TWEEN.Easing.Quadratic.Out(t);
      case 'easeInOut': return TWEEN.Easing.Quadratic.InOut(t);
      default: return t;
    }
  }
  
  
  document.getElementById('clearAnimation').addEventListener('click', () => {
  keyframesByObject.forEach((keyframes, object) => {
    keyframes.length = 0;
  });

  frames.forEach((frame) => {
    frame.style.backgroundColor = '';
    frame.classList.remove('keyframe');
    const marker = frame.querySelector('.keyframe-marker');
    if (marker) {
      frame.removeChild(marker);
    }
  });

  renderFrameCursor();
  updateKeyframeButtonText();
});

  function interpolateKeyframes() {
    keyframesByObject.forEach((keyframes, object) => {
      if (keyframes.length < 2) return;

      let startKeyframe, endKeyframe;

      for (let i = 0; i < keyframes.length - 1; i++) {
        if (keyframes[i].frame <= currentFrame && currentFrame <= keyframes[i + 1].frame) {
          startKeyframe = keyframes[i];
          endKeyframe = keyframes[i + 1];
          break;
        }
      }

      if (startKeyframe && endKeyframe) {
        const t = (currentFrame - startKeyframe.frame) / (endKeyframe.frame - startKeyframe.frame);
        const easing = getEasingFunction(t);

        object.position.lerpVectors(startKeyframe.position, endKeyframe.position, easing);
        object.rotation.set(
          startKeyframe.rotation.x + (endKeyframe.rotation.x - startKeyframe.rotation.x) * easing,
          startKeyframe.rotation.y + (endKeyframe.rotation.y - startKeyframe.rotation.y) * easing,
          startKeyframe.rotation.z + (endKeyframe.rotation.z - startKeyframe.rotation.z) * easing
        );
        object.scale.lerpVectors(startKeyframe.scale, endKeyframe.scale, easing);
      }
    });
  }
  
  
  function animate() {
    if (!isPaused) {
      currentFrame = (currentFrame + 1) % totalFrames;
      interpolateKeyframes();
      renderFrameCursor();
      requestAnimationFrame(animate);
      updatePhysics();
      playVideo();
      
    } else {
      pauseVideo();
    }
  }
  
  /* Pause Button */
  const pauseButton = document.getElementById('pauseButton');
  pauseButton.innerHTML = isPaused ? '<img src="/assets/models/keyframe1.svg" alt="Play">' : '<img src="/assets/models/keyframe1.svg" alt="Pause">';
  pauseButton.addEventListener('click', () => {
  isPaused = !isPaused;
  pauseButton.innerHTML = isPaused ? '<img src="/assets/models/keyframe1.svg" alt="Play">' : '<img src="/assets/models/keyframe1.svg" alt="Pause">';

  if (!isPaused) {
    pauseButton.style.backgroundColor = 'var(--accent-secondary)';
    animate();
  } else {
    pauseButton.style.backgroundColor = ''
  }
  });
  
  
  timeline.addEventListener('click', (event) => {
  const rect = timeline.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const frameWidth = rect.width / totalFrames;
  currentFrame = Math.floor(x / frameWidth);

  if (currentFrame >= totalFrames) {
    currentFrame = totalFrames - 1;
  }

  interpolateKeyframes();
  renderKeyframes();
  renderFrameCursor();
  updateKeyframeButtonText();

  const videoTime = (currentFrame / totalFrames) * videoElement.duration;
  setVideoTime(videoTime);
});

  const nextButton = document.getElementById('nextButton');
  nextButton.addEventListener('click', () => {
    const selectedObject = getSelectedObject();
    if (selectedObject) {
      const keyframes = keyframesByObject.get(selectedObject) || [];
      const lastKeyframe = keyframes[keyframes.length - 1];
      if (lastKeyframe) {
        currentFrame = lastKeyframe.frame;
        renderKeyframes();
        renderFrameCursor();
        updateKeyframeButtonText();
      }
    }
  });

  const prevButton = document.getElementById('prevButton');
  prevButton.addEventListener('click', () => {
    currentFrame = 0;
    resetVideo();
    renderKeyframes();
    renderFrameCursor();
    updateKeyframeButtonText();
  });
  
  let lastPosition = null;
  let lastRotation = null;
  let lastScale = null;

function detectObjectChanges() {
  const selectedObjects = getSelectedObjects();
  if (selectedObjects.length === 0) return;

  selectedObjects.forEach(selectedObject => {
    if (!lastPosition || !lastRotation || !lastScale) {
      lastPosition = lastPosition || selectedObject.position.clone();
      lastRotation = lastRotation || selectedObject.rotation.clone();
      lastScale = lastScale || selectedObject.scale.clone();
    }

    const hasPositionChanged = !selectedObject.position.equals(lastPosition);
    const hasRotationChanged = !selectedObject.rotation.equals(lastRotation);
    const hasScaleChanged = !selectedObject.scale.equals(lastScale);

    if (autoKeyActive && (hasPositionChanged || hasRotationChanged || hasScaleChanged)) {
      addKeyframeIfChanged(selectedObject);
    }

    if (hasPositionChanged) lastPosition.copy(selectedObject.position);
    if (hasRotationChanged) lastRotation.copy(selectedObject.rotation);
    if (hasScaleChanged) lastScale.copy(selectedObject.scale);
  });
}

function addKeyframeIfChanged(selectedObject) {
  let keyframes = keyframesByObject.get(selectedObject) || [];
  const existingKeyframeIndex = keyframes.findIndex(k => k.frame === currentFrame);

  if (existingKeyframeIndex === -1) {
    const position = selectedObject.position.clone();
    const rotation = selectedObject.rotation.clone();
    const scale = selectedObject.scale.clone();
    keyframes.push({ frame: currentFrame, position, rotation, scale });
    keyframes.sort((a, b) => a.frame - b.frame);
    keyframesByObject.set(selectedObject, keyframes);
    renderKeyframes();
  }
}

function getSelectedObjects() {
  const selectedObjects = [];
  scene.traverse((object) => {
    if (object.userData.SelectedObject) {
      selectedObjects.push(object);
    }
  });
  return selectedObjects;
}

function monitorObjectChanges() {
  requestAnimationFrame(() => {
    detectObjectChanges();
    monitorObjectChanges();
  });
}

monitorObjectChanges();
renderKeyframes();
addFrameNumbers();

});

/* Funciones de exportacion de Keyframes */
