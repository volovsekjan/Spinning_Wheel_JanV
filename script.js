// ===============================
// 1. Inicializacija
// ===============================
const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 960;
canvas.height = 960;

const centerLogo = new Image();
centerLogo.src = 'img/bitstarz_logo.png';
centerLogo.onload = () => drawWheel();

const spinBtn = document.getElementById('spinBtn');
const borderSpinBtn = document.getElementById('borderSpinBtn');
const recordNormalBtn = document.getElementById('recordNormalBtn');
const recordBorderBtn = document.getElementById('recordBorderBtn');
const inputsContainer = document.getElementById('segmentsInputs');
const targetSelector = document.getElementById('targetSegment');
const wheelButtons = document.querySelectorAll('.wheel-option');
const pointerPositionToggle = document.getElementById('pointerPositionToggle');
const pointerPositionText = document.getElementById('pointerPositionText');

let segments = [];
let rotation = 0;
let isSpinning = false;
let wheelType = 'default';
let pointerPosition = 'top'; // 'top' ali 'right'
let spinSpeed = 'default';
let textDynamic = true; // Changed variable name and default value

const speedSlider = document.getElementById('speedSlider');
const speedText = document.getElementById('speedText');

// Add counter for video exports
let videoExportCounter = 1;

function updateSpeedText(value) {
  switch(parseInt(value)) {
    case 0:
      speedText.textContent = 'Običajno';
      break;
    case 1:
      speedText.textContent = 'Hitro & Kratko';
      break;
    case 2:
      speedText.textContent = 'Počasi & Kratko';
      break;
  }
}

speedSlider.addEventListener('input', function() {
  updateSpeedText(this.value);
  switch(parseInt(this.value)) {
    case 0:
      spinSpeed = 'default';
      break;
    case 1:
      spinSpeed = 'quick';
      break;
    case 2:
      spinSpeed = 'fast';
      break;
  }
});

// Nastavimo začetni tekst
updateSpeedText(speedSlider.value);

// ===============================
// 2. Konfiguracija kolesa
// ===============================
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

// ===============================
// 3. UI
// ===============================
function setWheel(type) {
  wheelType = type;
  const config = wheelConfigs[type];
  segments = [...config.labels];
  updateSegmentOptions();
  drawWheel();

  inputsContainer.innerHTML = '';
  if (config.editable) {
    segments.forEach((label, i) => {
      const textarea = document.createElement('textarea');
      textarea.placeholder = `Polje ${i + 1}`;
      textarea.value = label;
      textarea.rows = 2;
      textarea.style.resize = 'none';
      textarea.style.width = '120px';
      textarea.style.height = '40px';
      textarea.style.padding = '6px';
      textarea.style.margin = '4px';
      textarea.addEventListener('input', (e) => {
        segments[i] = e.target.value || `Polje ${i + 1}`;
        updateSegmentOptions();
        drawWheel();
      });
      inputsContainer.appendChild(textarea);
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

function getSelectedTarget() {
  const val = parseInt(targetSelector.value);
  return isNaN(val) ? Math.floor(Math.random() * segments.length) : val;
}

// ===============================
// 4. Kolo
// ===============================
function drawMultilineText(ctx, text, x, y, maxWidth, lineHeight) {
  const lines = text.split('\n');
  let yPos = y - (lines.length - 1) * lineHeight / 2;
  
  for (let i = 0; i < lines.length; i++) {
    ctx.strokeText(lines[i], x, yPos);
    ctx.fillText(lines[i], x, yPos);
    yPos += lineHeight;
  }
}

function drawWheel(highlightSegment = -1, greenScreen = false) {
  const numSegments = segments.length;
  const angle = (2 * Math.PI) / numSegments;
  const colors = wheelConfigs[wheelType].colors;
  const radius = 430;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Zeleno ozadje
  ctx.fillStyle = '#00FF00';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);

  for (let i = 0; i < numSegments; i++) {
    ctx.save();
    ctx.rotate(angle * i + rotation);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, 0, angle);
    ctx.closePath();

    const grad = ctx.createRadialGradient(0, 0, 50, 0, 0, radius);
    grad.addColorStop(0, lightenColor(colors[i % colors.length], 0.2));
    grad.addColorStop(1, colors[i % colors.length]);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();
  }

  if (highlightSegment !== -1) {
    ctx.save();
    ctx.rotate(angle * highlightSegment + rotation);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, 0, angle);
    ctx.closePath();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 20;
    ctx.stroke();
    ctx.restore();
  }

  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 8;
  ctx.stroke();

  for (let i = 0; i < numSegments; i++) {
    ctx.save();
    ctx.rotate(angle * i + rotation);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(radius, 0);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 8;
    ctx.stroke();
    ctx.restore();
  }

  for (let i = 0; i < numSegments; i++) {
    ctx.save();
    ctx.rotate(angle * i + rotation + angle / 2);
    const fontSize = numSegments === 2 ? 59 : numSegments === 3 ? 57 : numSegments === 6 ? 51 : 47;
    ctx.font = `900 ${fontSize}px Roboto`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 7;
    ctx.fillStyle = '#FFF';

    if (textDynamic) {
      // Dinamična orientacija glede na absolutni kot segmenta
      let currentAngle = (angle * i + rotation + angle / 2) % (2 * Math.PI);
      if (currentAngle < 0) currentAngle += 2 * Math.PI;
    
      const needsRotation = currentAngle > Math.PI / 2 && currentAngle < Math.PI * 1.5;
    
      if (needsRotation) {
        ctx.rotate(Math.PI);
        drawMultilineText(ctx, segments[i], -240, 0, 200, fontSize * 1.2);
      } else {
        drawMultilineText(ctx, segments[i], 240, 0, 200, fontSize * 1.2);
      }
    } else {
      // Statična orientacija – vedno enaka, neodvisno od trenutne rotacije
      // Besedilo vgravirano kot na fizičnem wheelu, samo pri risanju
      let baseAngle = (angle * i + angle / 2) % (2 * Math.PI);
      if (baseAngle < 0) baseAngle += 2 * Math.PI;
    
      const needsRotation = baseAngle > Math.PI / 2 && baseAngle < Math.PI * 1.5;
    
      if (needsRotation) {
        ctx.rotate(Math.PI);
        drawMultilineText(ctx, segments[i], -240, 0, 200, fontSize * 1.2);
      } else {
        drawMultilineText(ctx, segments[i], 240, 0, 200, fontSize * 1.2);
      }
    }
    ctx.restore();
    
    
  }

  ctx.drawImage(centerLogo, -100, -100, 200, 200);
  ctx.restore();

  // pointer
  ctx.save();
  if (pointerPosition === 'top') {
    ctx.translate(canvas.width / 2, 20);
    ctx.beginPath();
    ctx.moveTo(-50, 0);
    ctx.lineTo(50, 0);
    ctx.lineTo(0, 100);
  } else {
    ctx.translate(canvas.width - 20, canvas.height / 2);
    ctx.beginPath();
    ctx.moveTo(0, -50);
    ctx.lineTo(0, 50);
    ctx.lineTo(-100, 0);
  }
  ctx.closePath();
  ctx.fillStyle = '#FFF';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 6;
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

function easeInOutCustom(t) {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ===============================
// 5. Spin animacija
// ===============================
async function spinToSegment(targetIndex, stopOnBorder = false) {
  return new Promise((resolve) => {
    const anglePerSegment = (2 * Math.PI) / segments.length;
    
    // Nastavitve za različne hitrosti
    let baseSpins, spinDuration;
    
    switch(spinSpeed) {
      case 'quick':
        baseSpins = 10;
        spinDuration = 4000; // Hitro vrtenje - enako število obratov, krajši čas
        break;
      case 'fast':
        baseSpins = 6;
        spinDuration = 7000; // Kratko vrtenje - manj obratov, normalen čas
        break;
      default:
        baseSpins = 10;
        spinDuration = 7000; // Privzete nastavitve
    }

    const highlightDelay = 300;
    const targetAngle = anglePerSegment * targetIndex;
    let finalRotation;
    
    if (pointerPosition === 'top') {
      finalRotation = (2 * Math.PI * baseSpins) +
        (-Math.PI / 2 - targetAngle - (stopOnBorder ? anglePerSegment * 0.95 : anglePerSegment * 0.3));
    } else {
      finalRotation = (2 * Math.PI * baseSpins) +
        (0 - targetAngle - (stopOnBorder ? anglePerSegment * 0.95 : anglePerSegment * 0.3));
    }

    let start = null;
    let highlightStartTime = null;
    let lastTimestamp = null;

    function animate(timestamp) {
      if (!start) {
        start = timestamp;
        lastTimestamp = timestamp;
      }
      
      const elapsed = timestamp - start;
      const deltaTime = timestamp - lastTimestamp;
      lastTimestamp = timestamp;
      
      const progress = Math.min(elapsed / spinDuration, 1);
      const eased = easeInOutCustom(progress);
      
      const microVibration = progress < 0.8 ? Math.sin(elapsed * 0.1) * 0.001 : 0;
      const wobble = progress > 0.92 ? Math.sin(progress * 50) * (1 - progress) * 0.002 : 0;
      
      rotation = finalRotation * eased + wobble + microVibration;

      if (progress >= 1 && !highlightStartTime) highlightStartTime = timestamp;

      const showHighlight = highlightStartTime && (timestamp - highlightStartTime) >= highlightDelay;
      drawWheel(showHighlight ? targetIndex : -1);

      if (progress < 1 || (timestamp - highlightStartTime) < highlightDelay + 1000) {
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

// ===============================
// 6. Snemanje s RecordRTC
// ===============================
async function recordWithRecordRTC(targetIndex, useBorderSpin = false) {
  if (isSpinning) {
    console.log('Snemanje že poteka');
    return;
  }

  isSpinning = true;
  console.log('🎬 Začenjam snemanje z visokim bitrate...');

  const stream = canvas.captureStream(120);
  const recorder = new RecordRTC(stream, {
    type: 'video',
    mimeType: 'video/webm;codecs=vp9',
    videoBitsPerSecond: 12000000,
    frameInterval: 1,
    quality: 100
  });

  drawWheel(-1, true);
  recorder.startRecording();

  await new Promise(resolve => setTimeout(resolve, 2000));
  await spinToSegment(targetIndex, useBorderSpin);
  await new Promise(resolve => setTimeout(resolve, 2000));

  recorder.stopRecording(() => {
    const blob = recorder.getBlob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `spinning_wheel_${videoExportCounter++}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('✅ Snemanje končano v visoki kvaliteti!');
    isSpinning = false;
  });
}

// ===============================
// 7. Event listenerji
// ===============================
spinBtn.addEventListener('click', () => {
  if (!isSpinning) spinToSegment(getSelectedTarget(), false);
});

borderSpinBtn.addEventListener('click', () => {
  if (!isSpinning) spinToSegment(getSelectedTarget(), true);
});

recordNormalBtn.addEventListener('click', () => {
  console.log('Klik na Snemaj navadno');
  if (!isSpinning) recordWithRecordRTC(getSelectedTarget(), false);
});

recordBorderBtn.addEventListener('click', () => {
  console.log('Klik na Snemaj na meji');
  if (!isSpinning) recordWithRecordRTC(getSelectedTarget(), true);
});

wheelButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    wheelButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    setWheel(btn.dataset.wheel);
  });
});

pointerPositionToggle.addEventListener('change', function() {
  pointerPosition = this.checked ? 'right' : 'top';
  pointerPositionText.textContent = this.checked ? 'Desno' : 'Zgoraj';
  drawWheel();
});

// Dodamo event listener za radio buttone
document.querySelectorAll('input[name="spinSpeed"]').forEach(radio => {
  radio.addEventListener('change', function() {
    spinSpeed = this.value;
  });
});

// ===============================
// 8. Inicializacija
// ===============================

// Gumb za preklop med dinamičnim in realnim (statičnim) prikazom besedila
const toggleTextOrientationBtn = document.getElementById('toggleTextOrientationBtn');

toggleTextOrientationBtn.addEventListener('click', () => {
  textDynamic = !textDynamic;
  toggleTextOrientationBtn.textContent = textDynamic
    ? '🌀 Tekst: Dinamičen'
    : '📍 Tekst: Statičen (realno)';
  drawWheel();
});


setWheel('default');

// ===============================
// Gifts Game Logic
// ===============================
const giftsGame = document.getElementById('giftsGame');
const wheelContainer = document.querySelector('.container');
const gameButtons = document.querySelectorAll('.game-btn');
const gifts = document.querySelectorAll('.gift');
const giftAnimation = document.getElementById('giftAnimation');
const gift1Animation = document.getElementById('gift1Animation');
let giftTexts = ['', '', ''];
let isGiftOpening = false;

// Initialize Lottie animation
let lottieAnim = null;

// Load the JSON animation data
console.log('Starting to load animation...');
fetch('Lottie_animation/gift_animation.json')
  .then(response => {
    console.log('Response received:', response);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log('JSON data loaded successfully:', data);
    if (window.lottie) {
      console.log('Initializing Lottie animation...');
      lottieAnim = lottie.loadAnimation({
        container: gift1Animation,
        renderer: 'svg',
        loop: true,
        autoplay: false,
        animationData: data
      });
      console.log('Lottie animation initialized');
    } else {
      console.error('Lottie library not found');
    }
  })
  .catch(error => {
    console.error('Error loading animation data:', error);
  });

// Game selection with 404 error message
gameButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    gameButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    if (btn.dataset.game === 'gifts') {
      // Show 404 error message
      alert('🎁 Error 404: Igra darila coming real soon... 🎁');
      // Switch back to wheel
      btn.classList.remove('active');
      document.querySelector('.game-btn[data-game="wheel"]').classList.add('active');
    }
  });
});

// Gift text inputs
for (let i = 1; i <= 3; i++) {
  const input = document.getElementById(`gift${i}Text`);
  input.addEventListener('input', (e) => {
    giftTexts[i-1] = e.target.value;
    updateGiftText(i-1);
  });
}

function updateGiftText(index) {
  const giftTextElement = gifts[index].querySelector('.gift-text');
  giftTextElement.textContent = giftTexts[index];
}

// Gift opening animation
gifts.forEach((gift, index) => {
  gift.addEventListener('click', async () => {
    if (isGiftOpening) return;
    isGiftOpening = true;

    // Open selected gift first
    gift.classList.add('opened');
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Then open all other gifts
    gifts.forEach((g, i) => {
      if (g !== gift) {
        g.classList.add('opened');
      }
    });

    await new Promise(resolve => setTimeout(resolve, 500));
    isGiftOpening = false;
  });
});

// Reset gifts when switching games
function resetGifts() {
  gifts.forEach(gift => gift.classList.remove('opened'));
}

gameButtons.forEach(btn => {
  if (btn.dataset.game === 'wheel') {
    btn.addEventListener('click', resetGifts);
  }
});

// Update event listener for text orientation toggle
document.addEventListener('DOMContentLoaded', () => {
    const textOrientationToggle = document.getElementById('textOrientationToggle');
    if (textOrientationToggle) {
        textOrientationToggle.checked = textDynamic; // Set initial state
        textOrientationToggle.addEventListener('change', function() {
            textDynamic = this.checked;
            const textOrientationText = document.getElementById('textOrientationText');
            if (textOrientationText) {
                textOrientationText.textContent = this.checked ? 'Besedilo: Dinamično' : 'Besedilo: Statično';
            }
            drawWheel();
        });
    }
});
