const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 1920;
canvas.height = 1920;

const centerLogo = new Image();
centerLogo.src = 'img/bitstarz_logo.png';
centerLogo.onload = () => {
  drawWheel();
};

const spinBtn = document.getElementById('spinBtn');
const borderSpinBtn = document.getElementById('borderSpinBtn');
const recordNormalBtn = document.getElementById('recordNormalBtn');
const recordBorderBtn = document.getElementById('recordBorderBtn');
const inputsContainer = document.getElementById('segmentsInputs');
const targetSelector = document.getElementById('targetSegment');
const wheelButtons = document.querySelectorAll('.wheel-option');

let segments = [];
let rotation = 0;
let isSpinning = false;
let wheelType = 'default';

const wheelConfigs = {
  default: {
    labels: Array.from({ length: 8 }, (_, i) => `Polje ${i + 1}`),
    colors: ['#FF0000', '#00A2FF', '#00FF66', '#FFD700', '#FF1493', '#8A2BE2', '#FF6B00', '#00CED1'],
    editable: true
  },
  half: {
    labels: ['Polje 1', 'Polje 2'],
    colors: ['#FF0000', '#00A2FF'],
    editable: true
  },
  six: {
    labels: Array.from({ length: 6 }, (_, i) => `Polje ${i + 1}`),
    colors: ['#FF0000', '#00A2FF', '#00FF66', '#FFD700', '#FF1493', '#8A2BE2'],
    editable: true
  },
  three: {
    labels: Array.from({ length: 3 }, (_, i) => `Polje ${i + 1}`),
    colors: ['#FF0000', '#00A2FF', '#FFFF00'],
    editable: true
  }
};

function setWheel(type) {
  wheelType = type;
  const config = wheelConfigs[type];
  segments = [...config.labels];
  updateSegmentOptions();
  drawWheel();

  inputsContainer.innerHTML = '';
  if (config.editable) {
    segments.forEach((label, i) => {
      const input = document.createElement('input');
      input.placeholder = `Polje ${i + 1}`;
      input.value = label;
      input.addEventListener('input', (e) => {
        segments[i] = e.target.value || `Polje ${i + 1}`;
        updateSegmentOptions();
        drawWheel();
      });
      inputsContainer.appendChild(input);
    });
  }
}

function updateSegmentOptions() {
  targetSelector.innerHTML = '<option value="">Izberi polje za ustavitev</option>';
  segments.forEach((label, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = label || `Polje ${i + 1}`;
    targetSelector.appendChild(opt);
  });
}

function easeInOutCustom(t) {
  if (t < 0.4) {
    return (t / 0.4) ** 2 * 0.4;
  } else {
    const p = (t - 0.4) / 0.6;
    const eased = 1 - Math.pow(1 - p, 3);
    return 0.4 + eased * 0.6;
  }
}

function drawWheel(highlightSegment = -1, greenScreen = false) {
  const numSegments = segments.length;
  const angle = (2 * Math.PI) / numSegments;
  const colors = wheelConfigs[wheelType].colors;
  const radius = 850;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (greenScreen) {
    ctx.fillStyle = numSegments === 3 ? '#FFFF00' : '#00FF00';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);

  // First, draw all segments
  for (let i = 0; i < numSegments; i++) {
    ctx.save();
    ctx.rotate(angle * i + rotation);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, 0, angle);
    ctx.closePath();

    const grad = ctx.createRadialGradient(0, 0, 100, 0, 0, radius);
    grad.addColorStop(0, lightenColor(colors[i % colors.length], 0.2));
    grad.addColorStop(1, colors[i % colors.length]);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();
  }

  // Draw segment borders for the highlighted segment
  if (highlightSegment !== -1) {
    ctx.save();
    ctx.rotate(angle * highlightSegment + rotation);
    
    // Draw the complete segment border
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(radius, 0);
    ctx.arc(0, 0, radius, 0, angle);
    ctx.lineTo(0, 0);
    ctx.closePath();
    
    // Solid white border
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 35;
    ctx.stroke();
    
    ctx.restore();
  }

  // Draw the outer circle
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 12;
  ctx.stroke();

  // Draw the segment divider lines
  for (let i = 0; i < numSegments; i++) {
    ctx.save();
    ctx.rotate(angle * i + rotation);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(radius, 0);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 12;
    ctx.stroke();
    ctx.restore();
  }

  // Draw the text
  for (let i = 0; i < numSegments; i++) {
    ctx.save();
    ctx.rotate(angle * i + rotation + angle / 2);
    const fontSize = numSegments === 2 ? 120 : numSegments === 3 ? 100 : numSegments === 8 ? 90 : 80;
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 12;
    ctx.strokeText(segments[i], 530, 0);
    ctx.fillStyle = "#FFF";
    ctx.fillText(segments[i], 530, 0);
    ctx.restore();
  }

  // Draw the center logo
  ctx.drawImage(centerLogo, -225, -225, 450, 450);
  ctx.restore();

  // Draw the pointer
  ctx.save();
  ctx.translate(canvas.width / 2, 60);
  ctx.beginPath();
  ctx.moveTo(-100, 0);
  ctx.lineTo(100, 0);
  ctx.lineTo(0, 200);
  ctx.closePath();
  ctx.fillStyle = '#FFF';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 10;
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function lightenColor(color, percent) {
  const num = parseInt(color.slice(1), 16);
  const amt = Math.round(2.55 * percent * 100);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return `rgb(${Math.min(R, 255)},${Math.min(G, 255)},${Math.min(B, 255)})`;
}

async function spinToSegment(targetIndex, stopOnBorder = false) {
  return new Promise((resolve) => {
    const anglePerSegment = (2 * Math.PI) / segments.length;
    const baseSpins = 8;
    const spinDuration = 5500;
    const highlightDelay = 300;

    const targetAngle = anglePerSegment * targetIndex;
    const finalRotation = (2 * Math.PI * baseSpins) +
      (-Math.PI / 2 - targetAngle - (stopOnBorder ? anglePerSegment * 0.95 : anglePerSegment * 0.3));

    let start = null;
    let lastFrameTime = 0;
    const targetFPS = 120;
    const frameTime = 1000 / targetFPS;
    let highlightStartTime = null;

    function animate(timestamp) {
      if (!start) {
        start = timestamp;
        lastFrameTime = timestamp;
        requestAnimationFrame(animate);
        return;
      }

      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / spinDuration, 1);
      
      const deltaTime = timestamp - lastFrameTime;
      
      if (deltaTime >= frameTime) {
        const eased = easeInOutCustom(progress);
        const wobble = progress > 0.92 ? Math.sin(progress * 45) * 0.0008 : 0;
        
        rotation = finalRotation * eased + wobble;
        
        if (progress >= 1 && !highlightStartTime) {
          highlightStartTime = timestamp;
        }
        
        const showHighlight = highlightStartTime && (timestamp - highlightStartTime) >= highlightDelay;
        drawWheel(showHighlight ? targetIndex : -1);
        
        lastFrameTime = timestamp;
      }

      if (progress < 1 || (highlightStartTime && (timestamp - highlightStartTime) < highlightDelay + 1000)) {
        requestAnimationFrame(animate);
      } else {
        isSpinning = false;
        resolve();
      }
    }

    isSpinning = true;
    requestAnimationFrame(animate);
  });
}

async function startRecording(useBorderSpin) {
  if (isSpinning) return;

  const selected = parseInt(targetSelector.value);
  const target = isNaN(selected) ? Math.floor(Math.random() * segments.length) : selected;

  try {
    // Ensure high quality rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Draw initial frame
    drawWheel(-1, true);
    
    // Wait for the frame to be rendered
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Start recording
    await recordSmoothSpin(target, useBorderSpin);
  } catch (error) {
    console.error('Napaka med snemanjem:', error);
  }
}

async function recordSmoothSpin(targetIndex, useBorderSpin) {
  const fps = 60;
  const duration = 5000; // 5 seconds for spin to match preview
  const frameTime = 1000 / fps;
  const staticDuration = 3000; // 3 seconds for final display

  // Draw initial frame with green screen
  drawWheel(-1, true);
  
  // Wait for the frame to be rendered
  await new Promise(resolve => setTimeout(resolve, 100));

  const stream = canvas.captureStream(fps);
  const recorder = new MediaRecorder(stream, {
    mimeType: 'video/webm;codecs=vp9',
    videoBitsPerSecond: 12000000
  });

  const chunks = [];
  recorder.ondataavailable = (e) => chunks.push(e.data);
  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wheel_${wheelType}_${useBorderSpin ? 'border' : 'normal'}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  recorder.start();

  const startTime = performance.now();
  let lastFrameTime = startTime;
  let highlightStartTime = null;

  function animate(currentTime) {
    const elapsed = currentTime - startTime;
    const totalDuration = duration + staticDuration;
    
    // Calculate progress for the spinning phase
    const spinProgress = Math.min(elapsed / duration, 1);
    
    if (spinProgress < 1) {
      // Still in spinning phase
      const eased = easeInOutCustom(spinProgress);
      const wobble = spinProgress > 0.95 ? Math.sin(spinProgress * 50) * 0.001 : 0;
      
      const anglePerSegment = (2 * Math.PI) / segments.length;
      const baseSpins = 8; // Match preview spin
      const targetAngle = anglePerSegment * targetIndex;
      const finalRotation = (2 * Math.PI * baseSpins) +
        (-Math.PI / 2 - targetAngle - (useBorderSpin ? anglePerSegment * 0.95 : anglePerSegment * 0.3));
      
      rotation = finalRotation * eased + wobble;
      drawWheel(-1, true);
    } else {
      // In static phase - show highlight after delay
      rotation = (-Math.PI / 2) - (targetIndex * (2 * Math.PI / segments.length)) - 
        (useBorderSpin ? (2 * Math.PI / segments.length) * 0.95 : (2 * Math.PI / segments.length) * 0.3);
      
      if (!highlightStartTime) {
        highlightStartTime = currentTime;
      }
      
      const showHighlight = highlightStartTime && (currentTime - highlightStartTime) >= 300;
      drawWheel(showHighlight ? targetIndex : -1, true);
    }

    // Continue animation if we haven't reached total duration
    if (elapsed < totalDuration) {
      const nextFrameTime = lastFrameTime + frameTime;
      const timeToNextFrame = nextFrameTime - currentTime;
      setTimeout(() => requestAnimationFrame(animate), Math.max(0, timeToNextFrame));
      lastFrameTime = nextFrameTime;
    } else {
      // Ensure we show one last frame with highlight before stopping
      drawWheel(targetIndex, true);
      setTimeout(() => recorder.stop(), 100);
    }
  }

  requestAnimationFrame(animate);
}

// Dogodki
spinBtn.addEventListener('click', () => {
  if (isSpinning) return;
  const selected = parseInt(targetSelector.value);
  const target = isNaN(selected) ? Math.floor(Math.random() * segments.length) : selected;
  spinToSegment(target, false);
});

borderSpinBtn.addEventListener('click', () => {
  if (isSpinning) return;
  const selected = parseInt(targetSelector.value);
  const target = isNaN(selected) ? Math.floor(Math.random() * segments.length) : selected;
  spinToSegment(target, true);
});

recordNormalBtn.addEventListener('click', () => {
  startRecording(false);
});

recordBorderBtn.addEventListener('click', () => {
  startRecording(true);
});

wheelButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    setWheel(btn.dataset.wheel);
  });
});

setWheel('default');

