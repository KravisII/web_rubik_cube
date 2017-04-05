function addKeydownEventsFor(_obj) {
  const innerObj = _obj;
  document.addEventListener('keydown', (event) => {
    const keyName = event.key || event.keyIdentifier;
    switch (keyName) {
      case 'ArrowLeft':
      case 'Left':
        event.preventDefault();
        innerObj.position.x -= 0.2;
        break;
      case 'ArrowRight':
      case 'Right':
        event.preventDefault();
        innerObj.position.x += 0.2;
        break;
      case 'ArrowUp':
      case 'Up':
        event.preventDefault();
        innerObj.position.y += 0.2;
        break;
      case 'ArrowDown':
      case 'Down':
        event.preventDefault();
        innerObj.position.y -= 0.2;
        break;
      case '[':
      case 'U+005B':
        innerObj.position.z -= 0.2;
        break;
      case ']':
      case 'U+005D':
        innerObj.position.z += 0.2;
        break;
      case 'x':
      case 'U+0058':
        innerObj.rotation.x += Math.PI * 0.1;
        break;
      case 'y':
      case 'U+0059':
        innerObj.rotation.y += Math.PI * 0.1;
        break;
      case 'z':
      case 'U+005A':
        innerObj.rotation.z += Math.PI * 0.1;
        break;
      default:
        break;
    }
  }, false);
}

function markUpCube(_obj) {
  const objInner = _obj;
  for (let i = 0; i < objInner.material.materials.length; i += 1) {
    objInner.material.materials[i].opacity = 0.6;
    objInner.material.materials[i].transparent = true;
  }
}

function remarkUpCube(_obj) {
  const objInner = _obj;
  for (let i = 0; i < objInner.material.materials.length; i += 1) {
    objInner.material.materials[i].transparent = false;
  }
}