let video = document.getElementById('video');
let canvasOut = document.getElementById('canvasOut');
let ctxOut = canvasOut.getContext('2d');
let streaming = false;
let cap = null;
let filter = 'edge';
let lastTime = performance.now();
let fpsDisplay = document.getElementById('fpsDisplay');

function setFilter(name) {
  filter = name;
}

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
      setTimeout(() => {
        cap = new cv.VideoCapture(video);
        processVideo();
      }, 100);
    }
  });
}

function processVideo() {
  if (!streaming || !cap) return;

  let src = new cv.Mat(video.videoHeight, video.videoWidth, cv.CV_8UC4);
  let dst = new cv.Mat();

  try {
    cap.read(src);

    switch (filter) {
      case 'gray':
        cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
        cv.cvtColor(dst, src, cv.COLOR_GRAY2RGBA);
        break;
      case 'blur':
        cv.GaussianBlur(src, dst, new cv.Size(7, 7), 1.5, 1.5);
        break;
      case 'edge':
        let gray = new cv.Mat();
        let edges = new cv.Mat();
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
        cv.Canny(gray, edges, 50, 100);
        cv.cvtColor(edges, src, cv.COLOR_GRAY2RGBA);
        gray.delete();
        edges.delete();
        break;
      default:
        dst = src.clone();
    }

    let output = filter === 'none' ? src : dst;
    let imgData = new ImageData(new Uint8ClampedArray(output.data), output.cols, output.rows);
    ctxOut.putImageData(imgData, 0, 0);

    // FPS Counter
    let now = performance.now();
    let fps = Math.round(1000 / (now - lastTime));
    fpsDisplay.textContent = `FPS: ${fps}`;
    lastTime = now;

    requestAnimationFrame(processVideo);
  } catch (err) {
    console.error("OpenCV processing error:", err);
  } finally {
    src.delete();
    dst.delete();
  }
}