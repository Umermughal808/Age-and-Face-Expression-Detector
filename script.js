async function setupCamera() {
  const video = document.getElementById('video');

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    await video.play(); // Ensure video actually starts
    console.log("Camera started successfully");
  } catch (err) {
    console.error("Camera access error:", err);
    alert("Camera access failed. Please allow webcam access and try again.");
  }
}

async function loadModels() {
  const MODEL_URL = "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights";
  await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
  await faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL);
  await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);  
}

async function analyze() {
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const context = canvas.getContext('2d');
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  console.log("Running face detection...");

  const detections = await faceapi
    .detectSingleFace(canvas, new faceapi.TinyFaceDetectorOptions())
    .withAgeAndGender()
    .withFaceExpressions();

  console.log("Detection result:", detections);

  const resultDiv = document.getElementById('result');
  if (!detections) {
    resultDiv.innerHTML = "❌ No face detected. Try again.";
    return;
  }

  const age = detections.age.toFixed(1);
  const gender = detections.gender;
  const expressions = detections.expressions;
  const mood = Object.entries(expressions).reduce((a, b) => a[1] > b[1] ? a : b)[0];

  resultDiv.innerHTML = `
    <p><strong>Estimated Age:</strong> ${age}</p>
    <p><strong>Gender:</strong> ${gender}</p>
    <p><strong>Mood:</strong> ${mood}</p>
  `;
}


window.addEventListener('DOMContentLoaded', async () => {
  await loadModels();
  setupCamera();
});
