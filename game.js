// --- Audio Controller using Web Audio API ---
const AudioCtrl = {
  ctx: null,

  init() {
    // AudioContext will be initialized on first user interaction (start button click)
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  },

  playBounce() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  },

  playKick() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.15);
    
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  },

  playWhistle() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    
    const playWhistleTone = (startTime, duration, freq) => {
      const osc = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      // vibrato
      osc.frequency.linearRampToValueAtTime(freq + 10, startTime + duration/2);
      osc.frequency.linearRampToValueAtTime(freq - 10, startTime + duration);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 1.01, startTime);
      
      gain.gain.setValueAtTime(0.0, startTime);
      gain.gain.linearRampToValueAtTime(0.12, startTime + 0.05);
      gain.gain.linearRampToValueAtTime(0.12, startTime + duration - 0.05);
      gain.gain.linearRampToValueAtTime(0.0, startTime + duration);
      
      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
      osc2.start(startTime);
      osc2.stop(startTime + duration);
    };

    playWhistleTone(now, 0.2, 1000);
    playWhistleTone(now + 0.25, 0.4, 1000);
  },

  playGoal() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    // Stadium cheer noise
    const bufferSize = this.ctx.sampleRate * 2.0; // 2 seconds
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Generate white noise with falling amplitude and bandpass filtering
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, now);
    filter.frequency.exponentialRampToValueAtTime(800, now + 0.5);
    filter.frequency.exponentialRampToValueAtTime(300, now + 2.0);
    filter.Q.setValueAtTime(1.5, now);
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.1);
    gain.gain.linearRampToValueAtTime(0.1, now + 0.8);
    gain.gain.linearRampToValueAtTime(0.0, now + 2.0);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    
    noise.start(now);
    
    // Also play a synth fanfare
    const notes = [261.63, 329.63, 392.00, 523.25]; // C E G C
    notes.forEach((freq, index) => {
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.value = freq;
      
      oscGain.gain.setValueAtTime(0.0, now + index * 0.1);
      oscGain.gain.linearRampToValueAtTime(0.05, now + index * 0.1 + 0.05);
      oscGain.gain.linearRampToValueAtTime(0.0, now + index * 0.1 + 0.4);
      
      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);
      osc.start(now + index * 0.1);
      osc.stop(now + index * 0.1 + 0.4);
    });
  },

  playUnlock() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]; // Arpeggio
    notes.forEach((freq, index) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      gain.gain.setValueAtTime(0.0, now + index * 0.08);
      gain.gain.linearRampToValueAtTime(0.1, now + index * 0.08 + 0.04);
      gain.gain.linearRampToValueAtTime(0.0, now + index * 0.08 + 0.3);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + index * 0.08);
      osc.stop(now + index * 0.08 + 0.3);
    });
  }
};

// --- Particles Background for Landing & Unboxing ---
function createParticles() {
  const container = document.getElementById('particles');
  const count = 30;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.classList.add('particle');
    
    const size = Math.random() * 6 + 2;
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.left = `${Math.random() * 100}vw`;
    p.style.animationDelay = `${Math.random() * 8}s`;
    p.style.animationDuration = `${Math.random() * 5 + 5}s`;
    
    // random HSL color (mostly green & teal)
    const hue = Math.random() > 0.5 ? 140 : 190;
    p.style.backgroundColor = `hsl(${hue}, 100%, 50%)`;
    
    container.appendChild(p);
  }
}

// --- Confetti Effect for Victory ---
function spawnConfetti() {
  for (let i = 0; i < 150; i++) {
    const confetti = document.createElement('div');
    confetti.classList.add('confetti');
    
    const size = Math.random() * 8 + 5;
    confetti.style.width = `${size}px`;
    confetti.style.height = `${size}px`;
    
    // Random position across top of viewport
    confetti.style.left = `${Math.random() * 100}vw`;
    confetti.style.top = `-20px`;
    
    // Random color
    const colors = ['#00ff7f', '#ffd700', '#00d2ff', '#ff0055', '#ff9f00', '#ffffff'];
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    
    // Animation details
    confetti.style.animationDelay = `${Math.random() * 3}s`;
    confetti.style.animationDuration = `${Math.random() * 3 + 2}s`;
    confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
    
    document.body.appendChild(confetti);
    
    // Remove from DOM after animation finishes
    setTimeout(() => {
      confetti.remove();
    }, 5000);
  }
}

// --- Game Engine ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
let gameInterval = null;
let matchStartTime = 0;
let timerInterval = null;
let isGoalPaused = false;
let screenShakeTimer = 0;

// Physics Config
const GRAVITY = 0.48;
const FLOOR_Y = 440;
const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 500;

// Scoring
let scorePlayer = 0;
let scoreBot = 0;

// Key States
const keys = {
  a: false,
  d: false,
  w: false,
  ArrowLeft: false,
  ArrowRight: false,
  ArrowUp: false,
  Space: false
};

// Player (YOU)
const player = {
  x: 200,
  y: FLOOR_Y - 45,
  vx: 0,
  vy: 0,
  radius: 45,
  speed: 6.5,
  jumpStrength: -11.5,
  isGrounded: false,
  color: '#ffffff', // Germany White/Black
  jerseyColor: '#111111',
  score: 0,
  shoeAngle: 0,
  
  reset() {
    this.x = 200;
    this.y = FLOOR_Y - this.radius;
    this.vx = 0;
    this.vy = 0;
    this.isGrounded = false;
  },

  update() {
    // Controls
    let moveDir = 0;
    if (keys.a || keys.ArrowLeft) moveDir -= 1;
    if (keys.d || keys.ArrowRight) moveDir += 1;

    this.vx = moveDir * this.speed;

    if ((keys.w || keys.ArrowUp || keys.Space) && this.isGrounded) {
      this.vy = this.jumpStrength;
      this.isGrounded = false;
      AudioCtrl.playBounce();
    }

    // Apply physics
    this.vy += GRAVITY;
    this.x += this.vx;
    this.y += this.vy;

    // Boundaries
    if (this.x - this.radius < 0) {
      this.x = this.radius;
    }
    // Cannot pass half field (or can they? Slime soccer restricts them to their half!)
    if (this.x + this.radius > CANVAS_WIDTH / 2) {
      this.x = CANVAS_WIDTH / 2 - this.radius;
    }

    if (this.y + this.radius >= FLOOR_Y) {
      this.y = FLOOR_Y - this.radius;
      this.vy = 0;
      this.isGrounded = true;
    }

    // Animate shoe based on movement
    if (Math.abs(this.vx) > 0.1) {
      this.shoeAngle += 0.2;
    } else {
      this.shoeAngle = 0;
    }
  },

  draw(c) {
    c.save();
    
    // Draw body shadow
    c.beginPath();
    c.ellipse(this.x, FLOOR_Y, this.radius * 0.9, 10, 0, 0, Math.PI * 2);
    c.fillStyle = 'rgba(0, 0, 0, 0.35)';
    c.fill();

    // Body (Germany Theme: White with black/red/yellow trim)
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI, true);
    c.lineTo(this.x - this.radius, this.y);
    c.fillStyle = '#ffffff';
    c.fill();
    c.lineWidth = 3;
    c.strokeStyle = '#1a1a1a';
    c.stroke();

    // Jersey striping (Germany Flag details)
    c.beginPath();
    c.rect(this.x - this.radius + 10, this.y - 12, (this.radius * 2) - 20, 10);
    c.fillStyle = '#111111'; // black stripe
    c.fill();

    c.beginPath();
    c.rect(this.x - this.radius + 15, this.y - 2, (this.radius * 2) - 30, 6);
    c.fillStyle = '#ff0000'; // red stripe
    c.fill();

    // Eye looking at ball
    const angleToBall = Math.atan2(ball.y - (this.y - 15), ball.x - (this.x + 15));
    const eyeX = this.x + 18 + Math.cos(angleToBall) * 4;
    const eyeY = this.y - 15 + Math.sin(angleToBall) * 4;

    // Eye white
    c.beginPath();
    c.arc(this.x + 18, this.y - 15, 10, 0, Math.PI * 2);
    c.fillStyle = '#ffffff';
    c.fill();
    c.strokeStyle = '#1a1a1a';
    c.lineWidth = 2;
    c.stroke();

    // Pupil
    c.beginPath();
    c.arc(eyeX, eyeY, 4, 0, Math.PI * 2);
    c.fillStyle = '#000000';
    c.fill();

    // Shoes
    const shoeLeftX = this.x - 18 + Math.sin(this.shoeAngle) * 5;
    const shoeRightX = this.x + 12 - Math.sin(this.shoeAngle) * 5;
    const shoeY = FLOOR_Y - 10;

    c.fillStyle = '#ff0055'; // neon red shoes
    c.strokeStyle = '#1a1a1a';
    c.lineWidth = 2;

    // Left Shoe
    c.beginPath();
    c.ellipse(shoeLeftX, shoeY, 12, 8, 0, 0, Math.PI * 2);
    c.fill();
    c.stroke();

    // Right Shoe
    c.beginPath();
    c.ellipse(shoeRightX, shoeY, 12, 8, 0, 0, Math.PI * 2);
    c.fill();
    c.stroke();

    // Headband
    c.beginPath();
    c.rect(this.x - this.radius + 8, this.y - this.radius, (this.radius * 2) - 16, 8);
    c.fillStyle = '#ffd700'; // Gold headband
    c.fill();

    c.restore();
  }
};

// Bot (AI - Brazil Jersey Theme)
const bot = {
  x: 800,
  y: FLOOR_Y - 45,
  vx: 0,
  vy: 0,
  radius: 45,
  speed: 4.8, // Playable but challenging
  jumpStrength: -11.0,
  isGrounded: false,
  shoeAngle: 0,
  decisionTimer: 0,
  aiState: 'defend', // defend, attack, idle

  reset() {
    this.x = 800;
    this.y = FLOOR_Y - this.radius;
    this.vx = 0;
    this.vy = 0;
    this.isGrounded = false;
  },

  update() {
    // Bot AI Logic
    this.decisionTimer++;
    
    // Predict or check ball position
    const ballInBotHalf = ball.x > CANVAS_WIDTH / 2 - 50;
    
    let targetX = 800;
    let shouldJump = false;

    if (ballInBotHalf) {
      this.aiState = 'attack';
      // Head towards the ball
      targetX = ball.x;
      
      // If the ball is close to bot in X
      const distToBallX = Math.abs(ball.x - this.x);
      
      // Decide to jump
      if (distToBallX < 120 && ball.y < this.y - 10 && ball.vy > -2 && Math.random() < 0.2) {
        shouldJump = true;
      }

      // If ball is behind the bot, try to get around it
      if (ball.x > this.x && this.x > 900) {
        targetX = ball.x - 30;
      }
    } else {
      this.aiState = 'defend';
      // Return to defensive base position
      targetX = 750 + Math.sin(this.decisionTimer * 0.05) * 40;
      
      // Jump only if ball comes flying towards goal
      if (ball.x < 300 && ball.vx > 3 && ball.y < 350 && Math.random() < 0.05) {
        shouldJump = true;
      }
    }

    // Move toward targetX
    let moveDir = 0;
    if (this.x < targetX - 5) moveDir = 1;
    else if (this.x > targetX + 5) moveDir = -1;

    this.vx = moveDir * this.speed;

    if (shouldJump && this.isGrounded) {
      this.vy = this.jumpStrength;
      this.isGrounded = false;
    }

    // Apply physics
    this.vy += GRAVITY;
    this.x += this.vx;
    this.y += this.vy;

    // Boundaries
    if (this.x + this.radius > CANVAS_WIDTH) {
      this.x = CANVAS_WIDTH - this.radius;
    }
    if (this.x - this.radius < CANVAS_WIDTH / 2) {
      this.x = CANVAS_WIDTH / 2 + this.radius;
    }

    if (this.y + this.radius >= FLOOR_Y) {
      this.y = FLOOR_Y - this.radius;
      this.vy = 0;
      this.isGrounded = true;
    }

    // Animate shoe
    if (Math.abs(this.vx) > 0.1) {
      this.shoeAngle += 0.2;
    } else {
      this.shoeAngle = 0;
    }
  },

  draw(c) {
    c.save();
    
    // Draw shadow
    c.beginPath();
    c.ellipse(this.x, FLOOR_Y, this.radius * 0.9, 10, 0, 0, Math.PI * 2);
    c.fillStyle = 'rgba(0, 0, 0, 0.35)';
    c.fill();

    // Body (Brazil Theme: Canary Yellow)
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI, true);
    c.lineTo(this.x - this.radius, this.y);
    c.fillStyle = '#ffd700'; // Canary Yellow
    c.fill();
    c.lineWidth = 3;
    c.strokeStyle = '#008000'; // Green outline
    c.stroke();

    // Brazil flag striping (Green/blue details)
    c.beginPath();
    c.rect(this.x - this.radius + 10, this.y - 12, (this.radius * 2) - 20, 8);
    c.fillStyle = '#008000'; // Green stripe
    c.fill();

    c.beginPath();
    c.arc(this.x, this.y - 8, 4, 0, Math.PI * 2);
    c.fillStyle = '#0000ff'; // Blue crest
    c.fill();

    // Eye looking at ball
    const angleToBall = Math.atan2(ball.y - (this.y - 15), ball.x - (this.x - 15));
    const eyeX = this.x - 18 + Math.cos(angleToBall) * 4;
    const eyeY = this.y - 15 + Math.sin(angleToBall) * 4;

    // Eye white
    c.beginPath();
    c.arc(this.x - 18, this.y - 15, 10, 0, Math.PI * 2);
    c.fillStyle = '#ffffff';
    c.fill();
    c.strokeStyle = '#1a1a1a';
    c.lineWidth = 2;
    c.stroke();

    // Pupil
    c.beginPath();
    c.arc(eyeX, eyeY, 4, 0, Math.PI * 2);
    c.fillStyle = '#000000';
    c.fill();

    // Shoes (Blue)
    const shoeLeftX = this.x - 12 + Math.sin(this.shoeAngle) * 5;
    const shoeRightX = this.x + 18 - Math.sin(this.shoeAngle) * 5;
    const shoeY = FLOOR_Y - 10;

    c.fillStyle = '#00c6ff'; // Neon blue shoes
    c.strokeStyle = '#008000';
    c.lineWidth = 2;

    // Left Shoe
    c.beginPath();
    c.ellipse(shoeLeftX, shoeY, 12, 8, 0, 0, Math.PI * 2);
    c.fill();
    c.stroke();

    // Right Shoe
    c.beginPath();
    c.ellipse(shoeRightX, shoeY, 12, 8, 0, 0, Math.PI * 2);
    c.fill();
    c.stroke();

    c.restore();
  }
};

// Ball Physics
const ball = {
  x: 500,
  y: 120,
  vx: 0,
  vy: 0,
  radius: 20,
  rotation: 0,
  bounceDamping: 0.82,
  friction: 0.992,

  reset(servingPlayer) {
    this.x = servingPlayer === 'player' ? 300 : 700;
    this.y = 120;
    this.vx = 0;
    this.vy = 0;
    this.rotation = 0;
  },

  update() {
    // Apply gravity
    this.vy += GRAVITY * 0.75; // Ball falls slightly slower/floatier than players
    
    // Apply drag
    this.vx *= this.friction;
    this.vy *= this.friction;

    // Move
    this.x += this.vx;
    this.y += this.vy;

    // Rotate based on horizontal speed
    this.rotation += this.vx * 0.05;

    // Collision: Floor
    if (this.y + this.radius >= FLOOR_Y) {
      this.y = FLOOR_Y - this.radius;
      this.vy = -this.vy * this.bounceDamping;
      
      // Roll friction
      this.vx *= 0.96;
      
      if (Math.abs(this.vy) > 0.8) {
        AudioCtrl.playBounce();
      } else {
        this.vy = 0; // stop small bounces
      }
    }

    // Collision: Ceiling
    if (this.y - this.radius < 0) {
      this.y = this.radius;
      this.vy = -this.vy * this.bounceDamping;
      AudioCtrl.playBounce();
    }

    // Collision: Left/Right Walls (Only above the goal height)
    const goalTop = 270;
    const goalLeftWall = 80;
    const goalRightWall = 920;

    if (this.y - this.radius < goalTop) {
      // Normal walls bounce above goals
      if (this.x - this.radius < 0) {
        this.x = this.radius;
        this.vx = -this.vx * this.bounceDamping;
        AudioCtrl.playBounce();
      }
      if (this.x + this.radius > CANVAS_WIDTH) {
        this.x = CANVAS_WIDTH - this.radius;
        this.vx = -this.vx * this.bounceDamping;
        AudioCtrl.playBounce();
      }
    } else {
      // Inside Goal Level
      // Left Goalpost/Net check
      if (this.x - this.radius < 0) {
        // Goal scored by Bot!
        triggerGoal('bot');
        return;
      }
      
      // Right Goalpost/Net check
      if (this.x + this.radius > CANVAS_WIDTH) {
        // Goal scored by Player!
        triggerGoal('player');
        return;
      }

      // Check collision with the back wall of goals if ball is below crossbar
      if (this.x < 0) {
        triggerGoal('bot');
        return;
      }
      if (this.x > CANVAS_WIDTH) {
        triggerGoal('player');
        return;
      }
    }

    // --- Goal Post Collisions ---
    // Left Goalpost tip: (80, 270)
    // Right Goalpost tip: (920, 270)
    checkCirclePointCollision(this, 80, 270);
    checkCirclePointCollision(this, 920, 270);

    // Left Goalpost top line (y = 270, x from 0 to 80)
    if (this.y + this.radius >= 270 && this.y - this.radius <= 270 && this.x <= 80) {
      // Bounce off top/bottom of left crossbar
      this.vy = -this.vy * this.bounceDamping;
      if (this.y < 270) {
        this.y = 270 - this.radius;
      } else {
        this.y = 270 + this.radius;
      }
      AudioCtrl.playBounce();
      triggerScreenShake(8);
    }

    // Right Goalpost top line (y = 270, x from 920 to 1000)
    if (this.y + this.radius >= 270 && this.y - this.radius <= 270 && this.x >= 920) {
      // Bounce off top/bottom of right crossbar
      this.vy = -this.vy * this.bounceDamping;
      if (this.y < 270) {
        this.y = 270 - this.radius;
      } else {
        this.y = 270 + this.radius;
      }
      AudioCtrl.playBounce();
      triggerScreenShake(8);
    }
  },

  draw(c) {
    c.save();
    c.translate(this.x, this.y);
    c.rotate(this.rotation);

    // Draw ball shadow on floor
    c.restore();
    c.save();
    c.beginPath();
    const shadowSize = Math.max(5, this.radius * (1 - (FLOOR_Y - this.y) / 400));
    const shadowOpacity = Math.max(0, 0.4 * (1 - (FLOOR_Y - this.y) / 400));
    c.ellipse(this.x, FLOOR_Y, shadowSize * 1.5, shadowSize * 0.4, 0, 0, Math.PI * 2);
    c.fillStyle = `rgba(0, 0, 0, ${shadowOpacity})`;
    c.fill();
    c.restore();

    // Draw soccer ball
    c.save();
    c.translate(this.x, this.y);
    c.rotate(this.rotation);
    
    // Main white body
    c.beginPath();
    c.arc(0, 0, this.radius, 0, Math.PI * 2);
    c.fillStyle = '#ffffff';
    c.fill();
    c.lineWidth = 2;
    c.strokeStyle = '#111';
    c.stroke();

    // Pentagons (classic soccer pattern)
    c.fillStyle = '#111';
    const drawPentagon = (px, py, size) => {
      c.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
        const x = px + Math.cos(angle) * size;
        const y = py + Math.sin(angle) * size;
        if (i === 0) c.moveTo(x, y);
        else c.lineTo(x, y);
      }
      c.closePath();
      c.fill();
    };

    // Center pentagon
    drawPentagon(0, 0, 7);

    // Outer pentagon tips
    for (let i = 0; i < 5; i++) {
      const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
      const px = Math.cos(angle) * 15;
      const py = Math.sin(angle) * 15;
      drawPentagon(px, py, 4);
      
      // Connect lines
      c.beginPath();
      c.moveTo(Math.cos(angle) * 7, Math.sin(angle) * 7);
      c.lineTo(px, py);
      c.strokeStyle = '#111';
      c.lineWidth = 1.5;
      c.stroke();
    }

    c.restore();
  }
};

// Check collision with physical point (like corner of crossbar)
function checkCirclePointCollision(c, px, py) {
  const dx = c.x - px;
  const dy = c.y - py;
  const dist = Math.sqrt(dx * dx + dy * dy);
  
  if (dist < c.radius) {
    // Resolve overlap
    const overlap = c.radius - dist;
    const nx = dx / dist;
    const ny = dy / dist;
    
    c.x += nx * overlap;
    c.y += ny * overlap;
    
    // Reflect velocity
    const dot = c.vx * nx + c.vy * ny;
    c.vx = (c.vx - 2 * dot * nx) * c.bounceDamping;
    c.vy = (c.vy - 2 * dot * ny) * c.bounceDamping;
    
    AudioCtrl.playBounce();
    triggerScreenShake(6);
  }
}

// Collide ball with player/bot circles
function handleCharacterBallCollision(char) {
  // We represent the slime as a half-circle on the ground, but they can jump.
  // The collision is resolved as a circle-circle collision with the upper hemisphere.
  // If the ball hits the flat bottom or below the slime center, we handle it as hitting the side.
  const dx = ball.x - char.x;
  // Calculate relative y from slime center
  const dy = ball.y - char.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  
  if (dist < (ball.radius + char.radius)) {
    // Is collision hitting the bottom of player? (slimes rest on floor, so normally only top hemisphere matters)
    // To make it feel super bouncy, we treat player as full circle, but clamp resolving forces upwards
    
    const nx = dx / dist;
    const ny = dy / dist;
    const overlap = (ball.radius + char.radius) - dist;
    
    // Push ball out
    ball.x += nx * overlap;
    ball.y += ny * overlap;
    
    // Relative velocity
    const rvx = ball.vx - char.vx;
    const rvy = ball.vy - char.vy;
    
    // Dot product of relative velocity and normal
    const velAlongNormal = rvx * nx + rvy * ny;
    
    // Only resolve if ball is moving towards the player
    if (velAlongNormal < 0) {
      const restitution = 0.8;
      let impulse = -(1 + restitution) * velAlongNormal;
      
      // Calculate new velocities
      ball.vx += nx * impulse;
      ball.vy += ny * impulse;
      
      // Add player momentum influence to give player kick control
      ball.vx += char.vx * 0.55;
      
      // Kicking boost if moving towards ball
      if (char.vy < 0) {
        // Jumping kicks it sky high!
        ball.vy += char.vy * 0.6;
      }
      
      // Add a slight upward kick guarantee to avoid ball getting stuck inside slimes
      if (ball.vy > -2) {
        ball.vy = -3.5 - Math.random() * 2;
      }
      
      AudioCtrl.playKick();
      triggerScreenShake(4);
    }
  }
}

// Goals rendering config
const leftGoal = { x: 0, y: 270, w: 80, h: 170 };
const rightGoal = { x: 920, y: 270, w: 80, h: 170 };

function drawPitch() {
  // Draw green stripes
  const stripesCount = 12;
  const stripeWidth = CANVAS_WIDTH / stripesCount;
  for (let i = 0; i < stripesCount; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#103923' : '#0e311e';
    ctx.fillRect(i * stripeWidth, 0, stripeWidth, FLOOR_Y);
  }

  // Pitch floor (grass outline)
  ctx.fillStyle = '#0f4f2c';
  ctx.fillRect(0, FLOOR_Y, CANVAS_WIDTH, CANVAS_HEIGHT - FLOOR_Y);
  
  // Bright neon line dividing field & grass border
  ctx.strokeStyle = 'rgba(0, 255, 127, 0.4)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, FLOOR_Y);
  ctx.lineTo(CANVAS_WIDTH, FLOOR_Y);
  ctx.stroke();

  // Pitch markings (Neon style)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 3;

  // Center Line
  ctx.beginPath();
  ctx.moveTo(CANVAS_WIDTH / 2, 100);
  ctx.lineTo(CANVAS_WIDTH / 2, FLOOR_Y);
  ctx.stroke();

  // Center Circle
  ctx.beginPath();
  ctx.arc(CANVAS_WIDTH / 2, (FLOOR_Y + 100) / 2, 70, 0, Math.PI * 2);
  ctx.stroke();

  // Draw Goals
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#ffffff';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';

  // Left Goal Box & Net drawing
  ctx.strokeRect(leftGoal.x, leftGoal.y, leftGoal.w, leftGoal.h);
  // Net grid
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 1.5;
  for (let gx = 0; gx <= leftGoal.w; gx += 16) {
    ctx.beginPath();
    ctx.moveTo(gx, leftGoal.y);
    ctx.lineTo(gx, FLOOR_Y);
    ctx.stroke();
  }
  for (let gy = leftGoal.y; gy <= FLOOR_Y; gy += 16) {
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(leftGoal.w, gy);
    ctx.stroke();
  }

  // Right Goal Box & Net drawing
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#ffffff';
  ctx.strokeRect(rightGoal.x, rightGoal.y, rightGoal.w, rightGoal.h);
  
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 1.5;
  for (let gx = rightGoal.x; gx <= CANVAS_WIDTH; gx += 16) {
    ctx.beginPath();
    ctx.moveTo(gx, rightGoal.y);
    ctx.lineTo(gx, FLOOR_Y);
    ctx.stroke();
  }
  for (let gy = rightGoal.y; gy <= FLOOR_Y; gy += 16) {
    ctx.beginPath();
    ctx.moveTo(rightGoal.x, gy);
    ctx.lineTo(CANVAS_WIDTH, gy);
    ctx.stroke();
  }

  // Left Crossbar tip glow
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(80, 270, 4, 0, Math.PI * 2);
  ctx.fill();

  // Right Crossbar tip glow
  ctx.beginPath();
  ctx.arc(920, 270, 4, 0, Math.PI * 2);
  ctx.fill();
}

function triggerScreenShake(amt) {
  screenShakeTimer = amt;
}

function updateGame() {
  if (isGoalPaused) return;

  // Update game objects
  player.update();
  bot.update();
  ball.update();

  // Handle collisions
  handleCharacterBallCollision(player);
  handleCharacterBallCollision(bot);
}

function drawGame() {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.save();
  // Screen shake effect
  if (screenShakeTimer > 0) {
    const dx = (Math.random() - 0.5) * screenShakeTimer;
    const dy = (Math.random() - 0.5) * screenShakeTimer;
    ctx.translate(dx, dy);
    screenShakeTimer *= 0.9; // decay
    if (screenShakeTimer < 0.2) screenShakeTimer = 0;
  }

  // Draw Arena
  drawPitch();

  // Draw Entities
  player.draw(ctx);
  bot.draw(ctx);
  ball.draw(ctx);

  ctx.restore();
}

function gameLoop() {
  updateGame();
  drawGame();
  requestAnimationFrame(gameLoop);
}

// Match Timer
let secondsElapsed = 0;
function updateTimerDisplay() {
  const mins = Math.floor(secondsElapsed / 60).toString().padStart(2, '0');
  const secs = (secondsElapsed % 60).toString().padStart(2, '0');
  document.getElementById('match-timer').textContent = `${mins}:${secs}`;
}

function startTimer() {
  secondsElapsed = 0;
  updateTimerDisplay();
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (!isGoalPaused) {
      secondsElapsed++;
      updateTimerDisplay();
    }
  }, 1000);
}

function triggerGoal(scoringTeam) {
  isGoalPaused = true;
  AudioCtrl.playGoal();
  triggerScreenShake(20);

  // Update Scores
  if (scoringTeam === 'player') {
    scorePlayer++;
    document.getElementById('player-score').textContent = scorePlayer;
    document.getElementById('goal-text').textContent = '🇩🇪 GOOOOAL! 🇩🇪';
    document.getElementById('goal-text').style.color = 'var(--color-primary)';
  } else {
    scoreBot++;
    document.getElementById('bot-score').textContent = scoreBot;
    document.getElementById('goal-text').textContent = '🇧🇷 GOAL FOR BOT 🇧🇷';
    document.getElementById('goal-text').style.color = 'var(--color-accent)';
  }

  // Show goal overlay
  const goalOverlay = document.getElementById('goal-overlay');
  goalOverlay.classList.add('active');

  // Check Match End Condition (Best of 7, or if either hits 7)
  setTimeout(() => {
    goalOverlay.classList.remove('active');
    
    if (scorePlayer >= 7 || scoreBot >= 7) {
      endMatch();
    } else {
      // Reset positions for next round
      player.reset();
      bot.reset();
      // Server is the one who was scored on
      ball.reset(scoringTeam === 'player' ? 'bot' : 'player');
      isGoalPaused = false;
      AudioCtrl.playWhistle();
    }
  }, 2200);
}

function endMatch() {
  clearInterval(timerInterval);
  isGoalPaused = true;
  
  document.getElementById('final-player-score').textContent = scorePlayer;
  document.getElementById('final-bot-score').textContent = scoreBot;

  if (scorePlayer === 7 && scoreBot === 1) {
    // 7:1 Legendary Win!
    showModal('gift-modal');
    AudioCtrl.playUnlock();
    spawnConfetti();
  } else {
    // Standard game over
    const titleEl = document.getElementById('game-over-title');
    const descEl = document.getElementById('game-over-desc');
    
    if (scorePlayer > scoreBot) {
      titleEl.textContent = '🇩🇪 YOU WON THE MATCH! 🏆';
      descEl.textContent = `Great victory (${scorePlayer}:${scoreBot})! But to unlock the Mystery Gift, you must win with the legendary 7:1 scoreline. Try again!`;
      titleEl.style.color = 'var(--color-primary)';
    } else {
      titleEl.textContent = '🇧🇷 BOT WINS! 🇧🇷';
      descEl.textContent = `The bot defeated you (${scorePlayer}:${scoreBot}). Practice your defense and try again for the ultimate 7:1 match!`;
      titleEl.style.color = 'var(--color-accent)';
    }
    showModal('game-over-modal');
  }
}

function showModal(id) {
  document.getElementById(id).classList.add('active');
}

function hideModals() {
  document.querySelectorAll('.modal-overlay').forEach(el => {
    el.classList.remove('active');
  });
  // Reset gift state
  document.getElementById('gift-reveal-content').classList.add('hidden');
  document.getElementById('gift-box-trigger').classList.remove('hidden');
  document.getElementById('gift-box-trigger').querySelector('.gift-box').classList.remove('open');
}

function restartGame() {
  scorePlayer = 0;
  scoreBot = 0;
  document.getElementById('player-score').textContent = '0';
  document.getElementById('bot-score').textContent = '0';
  
  player.reset();
  bot.reset();
  ball.reset('player');
  
  hideModals();
  isGoalPaused = false;
  startTimer();
  AudioCtrl.playWhistle();
}

// --- Screen Switching Navigation ---
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  document.getElementById(screenId).classList.add('active');
}

// --- Event Listeners & Input Binding ---
window.addEventListener('keydown', (e) => {
  const k = e.key;
  if (k === 'a' || k === 'A') keys.a = true;
  if (k === 'd' || k === 'D') keys.d = true;
  if (k === 'w' || k === 'W') keys.w = true;
  if (k === 'ArrowLeft') keys.ArrowLeft = true;
  if (k === 'ArrowRight') keys.ArrowRight = true;
  if (k === 'ArrowUp') keys.ArrowUp = true;
  if (k === ' ' || k === 'Spacebar') keys.Space = true;
});

window.addEventListener('keyup', (e) => {
  const k = e.key;
  if (k === 'a' || k === 'A') keys.a = false;
  if (k === 'd' || k === 'D') keys.d = false;
  if (k === 'w' || k === 'W') keys.w = false;
  if (k === 'ArrowLeft') keys.ArrowLeft = false;
  if (k === 'ArrowRight') keys.ArrowRight = false;
  if (k === 'ArrowUp') keys.ArrowUp = false;
  if (k === ' ' || k === 'Spacebar') keys.Space = false;
});

// UI Event Handlers
document.getElementById('start-button').addEventListener('click', () => {
  AudioCtrl.init();
  showScreen('game-screen');
  restartGame();
});

document.getElementById('restart-game-btn').addEventListener('click', () => {
  restartGame();
});

document.getElementById('back-to-menu-btn').addEventListener('click', () => {
  clearInterval(timerInterval);
  showScreen('landing-screen');
});

// Modal Actions
document.getElementById('modal-retry-btn').addEventListener('click', () => {
  restartGame();
});

document.getElementById('modal-menu-btn').addEventListener('click', () => {
  hideModals();
  showScreen('landing-screen');
});

document.getElementById('close-gift-modal').addEventListener('click', () => {
  hideModals();
  showScreen('landing-screen');
});

// Dev Cheat button to quickly test the 7:1 screen!
document.getElementById('dev-score-btn').addEventListener('click', () => {
  scorePlayer = 6;
  scoreBot = 1;
  document.getElementById('player-score').textContent = scorePlayer;
  document.getElementById('bot-score').textContent = scoreBot;
  player.reset();
  bot.reset();
  ball.reset('player');
});

// Gift Opening Click Interaction
document.getElementById('gift-box-trigger').addEventListener('click', () => {
  const giftBox = document.getElementById('gift-box-trigger').querySelector('.gift-box');
  giftBox.classList.add('open');
  
  // Unboxing sound effect
  AudioCtrl.playUnlock();
  
  setTimeout(() => {
    document.getElementById('gift-box-trigger').classList.add('hidden');
    const revealContent = document.getElementById('gift-reveal-content');
    revealContent.classList.remove('hidden');
    setTimeout(() => {
      revealContent.classList.add('active');
    }, 50);
  }, 1000);
});

// Initialize ambient components on page load
window.addEventListener('load', () => {
  createParticles();
  // Start drawing loop immediately, even if landing screen is active
  requestAnimationFrame(gameLoop);
});
