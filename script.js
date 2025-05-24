let video = document.getElementById('video');
let canvasOut = document.getElementById('canvasOut');
let ctxOut = canvasOut.getContext('2d');
let streaming = false;
let cap = null;

// Called once OpenCV.js is ready
function onOpenCvReady() {
  console.log('OpenCV.js is ready');

  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      video.srcObject = stream;
      video.play();
    })
    .catch(err => console.error('getUserMedia error:', err));

  video.addEventListener('canplay', () => {
    if (!streaming) {
      streaming = true;

      // Ensure OpenCV constructs are ready before using
      setTimeout(() => {
        cap = new cv.VideoCapture(video);
        processVideo();
      }, 100);  // short delay to ensure webcam feed stabilizes
    }
  });
}

function processVideo() {
  if (!streaming || !cap) return;

  let src = new cv.Mat(video.videoHeight, video.videoWidth, cv.CV_8UC4);
  let gray = new cv.Mat();
  let edges = new cv.Mat();

  try {
    cap.read(src);
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
    cv.Canny(gray, edges, 50, 100);
    cv.cvtColor(edges, src, cv.COLOR_GRAY2RGBA);

    let imgData = new ImageData(new Uint8ClampedArray(src.data), src.cols, src.rows);
    ctxOut.putImageData(imgData, 0, 0);

    requestAnimationFrame(processVideo);
  } catch (err) {
    console.error("OpenCV processing error:", err);
  } finally {
    src.delete();
    gray.delete();
    edges.delete();
  }
}
