let img1;
let img2;
let slides = [];

/** `null` = solo M1 senza pupille; dopo il primo click parte la sequenza */
let seqStart = null;

let lastTouchX = null;
let lastTouchY = null;

const STEP_MS = 5000;

const EYE_LEFT_IX = 500;
const EYE_LEFT_IY = 700;
const EYE_RIGHT_IX = 750;
const EYE_RIGHT_IY = 700;
const EYE_DIAM_BASE = 20;
const POINTER_STILL_PX = 2;

let ptrLastX = null;
let ptrLastY = null;
let ptrStillSince = null;

const UX_CAPTION =
  "Sympathy for the Devil installation UX test.\n" +
  "Left Click to be a person in front of it\n" +
  "Left Click when you think he gave it all (20s)\n" +
  "the lack of movement of the closest person to the demon\n" +
  "will be identified as \"gaze\" making him furious";

const OZORA_LINE = "It's gonna be a blasting Ozora! Kirai!";

function preload() {
  img1 = loadImage("data/m1.png");
  img2 = loadImage("data/m2.png");
  slides = [
    loadImage("data/a1.png"),
    loadImage("data/a2.png"),
    loadImage("data/a3.png"),
    loadImage("data/a4.png"),
  ];
}

function canvasSize() {
  return [window.innerWidth, window.innerHeight];
}

function setup() {
  const [cw, ch] = canvasSize();
  createCanvas(cw, ch);
  window.addEventListener("orientationchange", () => {
    setTimeout(() => {
      const [w, h] = canvasSize();
      resizeCanvas(w, h);
    }, 200);
  });
}

function windowResized() {
  const [cw, ch] = canvasSize();
  resizeCanvas(cw, ch);
}

function seqElapsed() {
  if (seqStart === null) return null;
  return millis() - seqStart;
}

/** 0 = M2 … 4 = A4: −10 px a step; su A4 l'ultimo passo è −20 (−50 px totali) */
function pupilYOffsetPx(phaseIdx) {
  if (phaseIdx <= 0) return 0;
  if (phaseIdx < 4) return -10 * phaseIdx;
  return -10 * (phaseIdx - 1) - 20;
}

function slidePhaseFromElapsed(t) {
  if (t < STEP_MS) return 0;
  if (t < 2 * STEP_MS) return 1;
  if (t < 3 * STEP_MS) return 2;
  if (t < 4 * STEP_MS) return 3;
  return 4;
}

function handlePrimaryInput() {
  const t = seqElapsed();
  if (t === null) {
    seqStart = millis();
    return;
  }
  if (t >= 4 * STEP_MS) seqStart = null;
}

function mousePressed() {
  if (touches.length > 0) return;
  handlePrimaryInput();
}

function touchStarted() {
  if (touches.length > 0) {
    lastTouchX = touches[0].x;
    lastTouchY = touches[0].y;
  }
  handlePrimaryInput();
  return false;
}

function touchMoved() {
  if (touches.length > 0) {
    lastTouchX = touches[0].x;
    lastTouchY = touches[0].y;
  }
  return false;
}

function pointerX() {
  if (touches.length > 0) return touches[0].x;
  if (lastTouchX !== null) return lastTouchX;
  return mouseX;
}

function pointerY() {
  if (touches.length > 0) return touches[0].y;
  if (lastTouchY !== null) return lastTouchY;
  return mouseY;
}

function resetPointerStillness() {
  ptrLastX = null;
  ptrLastY = null;
  ptrStillSince = null;
}

function updatePointerStillnessForEyes() {
  const x = pointerX();
  const y = pointerY();
  const now = millis();
  if (ptrLastX === null || ptrLastY === null) {
    ptrLastX = x;
    ptrLastY = y;
    ptrStillSince = now;
    return;
  }
  if (Math.hypot(x - ptrLastX, y - ptrLastY) > POINTER_STILL_PX) {
    ptrLastX = x;
    ptrLastY = y;
    ptrStillSince = now;
  }
}

function eyeDiamImagePx() {
  if (ptrStillSince === null) return EYE_DIAM_BASE;
  return EYE_DIAM_BASE + Math.floor((millis() - ptrStillSince) / 100);
}

const EYE_FOLLOW_RADIUS = 5;

function clampedFollow(ox, oy, targetX, targetY, maxDist) {
  const dx = targetX - ox;
  const dy = targetY - oy;
  const d = Math.sqrt(dx * dx + dy * dy);
  if (d <= maxDist || d === 0) return { x: targetX, y: targetY };
  const k = maxDist / d;
  return { x: ox + dx * k, y: oy + dy * k };
}

function drawEyesOnImage(img, imgLeft, imgTop, dispW, dispH, phaseIdx) {
  if (!img || img.width === 0) return;
  const sx = dispW / img.width;
  const sy = dispH / img.height;
  const d = eyeDiamImagePx() * sx;
  const yBump = pupilYOffsetPx(phaseIdx);

  const leftOx = imgLeft + EYE_LEFT_IX * sx;
  const leftOy = imgTop + EYE_LEFT_IY * sy + yBump;
  const rightOx = imgLeft + EYE_RIGHT_IX * sx;
  const rightOy = imgTop + EYE_RIGHT_IY * sy + yBump;

  const leftP = clampedFollow(
    leftOx,
    leftOy,
    pointerX(),
    pointerY(),
    EYE_FOLLOW_RADIUS
  );
  const rightP = clampedFollow(
    rightOx,
    rightOy,
    pointerX(),
    pointerY(),
    EYE_FOLLOW_RADIUS
  );

  push();
  fill(255, 0, 0);
  stroke(0);
  strokeWeight(2);
  circle(leftP.x, leftP.y, d);
  circle(rightP.x, rightP.y, d);
  pop();
}

function drawOzoraLine(margin) {
  push();
  textFont("Roboto");
  textSize(16);
  textAlign(RIGHT, BOTTOM);
  fill(0);
  noStroke();
  text(OZORA_LINE, width - margin, height - margin);
  pop();
}

function drawUxCaption(margin) {
  push();
  textFont("Roboto");
  textSize(24);
  textAlign(LEFT, TOP);
  fill(0);
  noStroke();
  text(UX_CAPTION, margin, margin, width - 2 * margin);
  pop();
}

function currentImage() {
  const t = seqElapsed();
  if (t === null) return img1;
  if (t < STEP_MS) return img2;
  if (t < 2 * STEP_MS) return slides[0];
  if (t < 3 * STEP_MS) return slides[1];
  if (t < 4 * STEP_MS) return slides[2];
  return slides[3];
}

function draw() {
  background("#f9f9f9");

  if (seqStart === null) {
    resetPointerStillness();
  }

  const img = currentImage();
  if (!img || img.width === 0) return;

  const margin = 24;
  const maxW = width - margin * 2;
  const maxH = height - margin * 2;
  const scale = Math.min(maxW / img.width, maxH / img.height, 1);
  const w = img.width * scale;
  const h = img.height * scale;
  const imgLeft = (width - w) / 2;
  const imgTop = (height - h) / 2;

  image(img, imgLeft, imgTop, w, h);

  if (seqStart !== null) {
    const t = seqElapsed();
    updatePointerStillnessForEyes();
    drawEyesOnImage(
      img,
      imgLeft,
      imgTop,
      w,
      h,
      slidePhaseFromElapsed(t)
    );
  }

  drawUxCaption(margin);
  drawOzoraLine(margin);
}
