function randint(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
function randfloat(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * 计算从原点出发的线段末端坐标
 * @param {number} length - 线段长度（正数）
 * @param {number} angleDeg - 与y轴正半轴的顺时针夹角（0-360度）
 * @returns {{x: number, y: number}} 末端坐标 {x, y}
 */
function getEndpoint(length, angleDeg) {
  // 角度转弧度
  const rad = (angleDeg * Math.PI) / 180;

  // 计算坐标（关键公式）
  const x = length * Math.sin(rad);
  const y = length * Math.cos(rad);

  return { x, y };
}

function applyCanvasOpacity(canvas, opacity) {
  const ctx = canvas.getContext('2d');
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  const tempCtx = tempCanvas.getContext('2d');

  // 复制原内容到离屏画布
  tempCtx.drawImage(canvas, 0, 0);
  // 清空原画布并以指定透明度重绘
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.globalAlpha = opacity;
  ctx.drawImage(tempCanvas, 0, 0);
  ctx.globalAlpha = 1.0; // 重置
}

function to2digit(num) {
  if (num < 0) return `-${to2digit(Math.abs(num))}`;
  if (num >= 0 && num < 10) return `0${num}`;
  return num.toString();
}