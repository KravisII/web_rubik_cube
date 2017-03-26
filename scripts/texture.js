function faces(faceCode) {
  let color = 'rgb(0, 0, 0)';
  switch (faceCode) {
    case 'U':
      color = 'rgb(255, 255, 255)';
      break;
    case 'F':
      color = 'rgb(0, 157, 84)';
      break;
    case 'R':
      color = 'rgb(220, 66, 47)';
      break;
    case 'D':
      color = 'rgb(253, 204, 9)';
      break;
    case 'L':
      color = 'rgb(255, 108, 0)';
      break;
    case 'B':
      color = 'rgb(61, 129, 246)';
      break;
    default:
      break;
  }
  let canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  let ctx = canvas.getContext('2d');

  ctx.fillStyle = 'rgba(0,0,0,1)';
  ctx.fillRect(0, 0, 512, 512);
  ctx.rect(71, 71, 370, 370);
  ctx.lineJoin = 'round';
  ctx.lineWidth = 100;
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.fill();

  ctx.fillStyle = 'black';
  ctx.font = 'Italic 300px Times New Roman';
  ctx.fillText(faceCode, 160, 364);
  return canvas;
}

faces('B');
