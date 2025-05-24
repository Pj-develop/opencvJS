let video = document.getElementById('video');
let canvasOut = document.getElementById('canvasOut');
let ctxOut = canvasOut.getContext('2d');
let streaming = false;

function onOpenCvReady() {
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      video.srcObject = stream;
      video.play();
    })
    .catch(err => console.error('getUserMedia error:', err));

  video.addEventListener('canplay', () => {
    if (!streaming) {
      streaming = true;
      processVideo();
    }
  });
}

function processVideo() {
  if (!streaming) return;

  // Read frame into OpenCV Mat
  let src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
  let gray = new cv.Mat();
  let edges = new cv.Mat();
  let cap = new cv.VideoCapture(video);

  cap.read(src);
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
  cv.Canny(gray, edges, 50, 100);

  // Convert to RGBA and draw
  cv.cvtColor(edges, src, cv.COLOR_GRAY2RGBA);
  let imgData = new ImageData(
    new Uint8ClampedArray(src.data),
    src.cols,
    src.rows
  );
  ctxOut.putImageData(imgData, 0, 0);

  // Schedule next frame
  requestAnimationFrame(processVideo);

  // Clean up
  src.delete();
  gray.delete();
  edges.delete();
}