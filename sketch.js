let img1;
let img2;
let slides = [];

/** `null` = solo M1 senza pupille; dopo il primo click parte la sequenza */
let seqStart = null;

const STEP_MS = 5000;

const EYE_LEFT_IX = 500;
const EYE_LEFT_IY = 700;
const EYE_RIGHT_IX = 750;
const EYE_RIGHT_IY = 700;
const EYE_DIAM_PX = 20;

const UX_CAPTION =
  "Sympathy for the Devil installation UX test.\n" +
  "Left Click to be a person in front of it\n" +
  "Left Click when you think he gave it all (20s)";

const OZORA_LINE = "It's gonna be a blasting Ozora!";

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

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
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

function mousePressed() {
  const t = seqElapsed();
  if (t === null) {
    seqStart = millis();
    return;
  }
  if (t >= 4 * STEP_MS) seqStart = null;
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
  const d = EYE_DIAM_PX * sx;
  const yBump = pupilYOffsetPx(phaseIdx);

  const leftOx = imgLeft + EYE_LEFT_IX * sx;
  const leftOy = imgTop + EYE_LEFT_IY * sy + yBump;
  const rightOx = imgLeft + EYE_RIGHT_IX * sx;
  const rightOy = imgTop + EYE_RIGHT_IY * sy + yBump;

  const leftP = clampedFollow(leftOx, leftOy, mouseX, mouseY, EYE_FOLLOW_RADIUS);
  const rightP = clampedFollow(rightOx, rightOy, mouseX, mouseY, EYE_FOLLOW_RADIUS);

  push();
  fill(255, 0, 0);
  noStroke();
  circle(leftP.x, leftP.y, d);
  circle(rightP.x, rightP.y, d);
  pop();
}

function drawOzoraLine(margin) {
  push();
  textFont("Roboto");
  textSize(24);
  textAlign(RIGHT, TOP);
  fill(0);
  noStroke();
  text(OZORA_LINE, width - margin, margin);
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
