// 获取canvas元素和上下文
const fireworkCanvas = document.getElementById('firework-canvas');
const fireworkCtx = fireworkCanvas.getContext('2d');
const bgCanvas = document.getElementById('bg-canvas');
const bgCtx = bgCanvas.getContext('2d');

console.log({ fireworkCanvas, fireworkCtx });

// -----

// 星星类
class Star {
  constructor() {
    this.reset();
    this.speed = Math.random() * 0.05 + 0.01;
    this.phase = Math.random() * Math.PI * 2;
    this.sizeVariation = Math.random() * 0.7 + 0.3;
  }

  reset() {
    this.x = Math.random() * bgCanvas.clientWidth;
    this.y = Math.random() * bgCanvas.clientHeight;
    this.radius = Math.random() * 1.2 + 0.5;
    this.baseBrightness = Math.random() * 0.5 + 0.4;
    this.twinkleSpeed = Math.random() * 0.004 + 0.002;
  }

  update(time) {
    // 计算闪烁效果
    const brightness =
      this.baseBrightness +
      Math.sin(time * this.twinkleSpeed + this.phase) * 0.3;

    // 绘制星星
    bgCtx.beginPath();
    bgCtx.arc(this.x, this.y, this.radius * this.sizeVariation, 0, Math.PI * 2);
    bgCtx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, brightness)})`;
    bgCtx.fill();
    bgCtx.closePath();
  }
}

// -----

// 粒子类
class Particle {
  constructor(x, y, color, explodeRadius) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.radius = Math.random() + 1;
    // this.velocity = {
    //   x: (Math.random() - 0.5) * 8,
    //   y: (Math.random() - 0.5) * 8,
    // };
    this.velocity = getEndpoint(randfloat(1, explodeRadius), randint(0, 360));
    this.alpha = 1;
    this.gravity = 0.05;
    this.friction = 0.95;
    this.decay = Math.random() * 0.03 + 0.015;
  }

  draw() {
    fireworkCtx.save();
    fireworkCtx.globalAlpha = this.alpha;
    fireworkCtx.beginPath();
    fireworkCtx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    fireworkCtx.fillStyle = this.color;
    fireworkCtx.fill();
    fireworkCtx.closePath();
    fireworkCtx.restore();
  }

  update() {
    this.velocity.x *= this.friction;
    this.velocity.y *= this.friction;
    this.velocity.y += this.gravity;
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.alpha -= this.decay;

    this.draw();
    return this.alpha > 0;
  }
}

// 烟花类
class Firework {
  constructor(x, y) {
    this.x = x || Math.random() * fireworkCanvas.clientWidth;
    this.y = y || fireworkCanvas.height;
    this.targetY =
      Math.random() * fireworkCanvas.clientHeight * 0.4 +
      fireworkCanvas.clientHeight * 0.1;
    this.color = this.getRandomColor();
    this.velocity = {
      x: 0,
      y: -(Math.random() * 4 + 2),
    };
    this.trail = [];
    this.trailLength = 5;
    this.hasExploded = false;
  }

  getRandomColor() {
    const colors = [
      '#ff0000',
      '#00ff00',
      '#0000ff',
      '#ffff00',
      '#ff00ff',
      '#00ffff',
      '#ff6600',
      '#ff3399',
      '#66ff33',
      '#3366ff',
      '#ff9900',
      '#cc00ff',
      '#00ffcc',
      '#ffcc00',
      '#9933ff',
    ];
    return colors[randint(0, colors.length - 1)];
  }

  draw() {
    // 绘制轨迹
    for (let i = 0; i < this.trail.length; i++) {
      const point = this.trail[i];
      fireworkCtx.globalAlpha = i / this.trail.length;
      fireworkCtx.beginPath();
      fireworkCtx.arc(point.x, point.y, 2, 0, Math.PI * 2);
      fireworkCtx.fillStyle = this.color;
      fireworkCtx.fill();
      fireworkCtx.closePath();
    }
    fireworkCtx.globalAlpha = 1;

    // 绘制烟花主体
    fireworkCtx.beginPath();
    fireworkCtx.arc(this.x, this.y, 3, 0, Math.PI * 2);
    fireworkCtx.fillStyle = this.color;
    fireworkCtx.fill();
    fireworkCtx.closePath();
  }

  update() {
    if (!this.hasExploded) {
      // 添加轨迹点
      this.trail.push({ x: this.x, y: this.y });
      if (this.trail.length > this.trailLength) {
        this.trail.shift();
      }

      // 更新位置
      this.x += this.velocity.x;
      this.y += this.velocity.y;

      // 检查是否到达爆炸点
      if (this.y <= this.targetY) {
        this.hasExploded = true;
        return false; // 返回false表示需要爆炸
      }

      this.draw();
      return true;
    }
    return false;
  }

  explode() {
    const particles = [];
    const particleCount = Math.random() * 100 + 100;
    const explodeRadius = randfloat(4, 7);
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle(this.x, this.y, this.color, explodeRadius));
    }
    return particles;
  }
}

// -----

// 初始化星星
let stars = [];
function resetStars() {
  stars = [];
  const starCount = Math.floor(
    (bgCanvas.clientWidth * bgCanvas.clientHeight) / 5000
  ); // 根据画布大小调整星星数量
  for (let i = 0; i < starCount; i++) {
    stars.push(new Star());
  }
}

// 存储活动的烟花和粒子
let fireworks = [];
let particles = [];

// 创建烟花的频率控制
let frameCount = 0;
let fireworkInterval = 100; // 每100帧创建一个烟花
function setFireworkInterval(value) {
  fireworkInterval = value;
}

// 动画循环
function animate(time = 0) {
  requestAnimationFrame(animate);

  // console.debug('Animate frame', time);
  frameCount++;

  // 清除画布，添加淡出效果
  applyCanvasOpacity(fireworkCanvas, 0.8);

  // 绘制星星
  if (frameCount % 5 === 0) {
    bgCtx.clearRect(0, 0, bgCanvas.clientWidth, bgCanvas.clientHeight);
    stars.forEach((star) => star.update(time));
  }

  // 创建新的烟花
  if (frameCount >= fireworkInterval) {
    fireworks.push(new Firework());
    frameCount = 0;
  }

  // 更新和渲染烟花
  for (let i = fireworks.length - 1; i >= 0; i--) {
    const firework = fireworks[i];
    const shouldContinue = firework.update();

    if (!shouldContinue) {
      // 烟花爆炸
      const newParticles = firework.explode();
      particles.push(...newParticles);
      fireworks.splice(i, 1);
    }
  }

  // 更新和渲染粒子
  for (let i = particles.length - 1; i >= 0; i--) {
    const particle = particles[i];
    const shouldContinue = particle.update();

    if (!shouldContinue) {
      particles.splice(i, 1);
    }
  }
}

// 设置canvas尺寸
function resizeCanvas() {
  fireworkCanvas.width = window.innerWidth;
  fireworkCanvas.height = window.innerHeight;
  bgCanvas.width = window.innerWidth;
  bgCanvas.height = window.innerHeight;

  resetStars();
}

window.addEventListener('resize', resizeCanvas);

// 鼠标点击创建烟花
fireworkCanvas.addEventListener('click', (e) => {
  fireworks.push(new Firework(e.clientX, e.clientY));
});

// 触摸事件（移动设备支持）
fireworkCanvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  const touch = e.touches[0];
  fireworks.push(new Firework(touch.clientX, touch.clientY));
});

resizeCanvas();
// 开始动画
animate();
