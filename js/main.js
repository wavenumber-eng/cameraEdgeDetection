const video = document.querySelector("#video");
const canvas = document.querySelector("#canvas-output");
const toggleButton = document.querySelector("#toggleEdgeDetection");

// Flag edge detection
let edgeDetectionEnabled = true;

// Get slider elements
const lowThresholdSlider = document.querySelector("#lowThresholdRange");
const highThresholdSlider = document.querySelector("#highThresholdRange");

// Get span elements to display slider values
const lowThresholdValue = document.querySelector("#lowThresholdValue");
const highThresholdValue = document.querySelector("#highThresholdValue");

const constraints = { video: { width: 640, height: 480 }, audio: false };

// Allows to draw on the canvas.

const ctx = canvas.getContext("2d", { willReadFrequently: true });

// Function to resize the canvas
function resizeCanvas() {
  const aspectRatio = 640 / 480; // Original aspect ratio
  const width = Math.min(window.innerWidth, 640); // Max width: 640px
  const height = width / aspectRatio;

  canvas.width = width;
  canvas.height = height;

  // Optional: Adjust the video constraints if necessary
  video.style.width = `${width}px`;
  video.style.height = `${height}px`;
}

// Set initial canvas size
resizeCanvas();

// Listen for window resize events
window.addEventListener("resize", resizeCanvas);

var Module = {
  onRuntimeInitialized() {
    // Query html element
    const statusButton = document.querySelector("#status");
    statusButton.innerHTML =
      'OpenCV.js is ready! <i class="bi bi-check-circle"></i>';
    statusButton.classList.remove("btn-primary");
    statusButton.classList.add("btn-success");
  },
};

navigator.mediaDevices
  .getUserMedia(constraints)
  .then((mediaStream) => {
    const video = document.querySelector("#video");
    video.srcObject = mediaStream;
    video.play();

    video.addEventListener("play", () => {
      const processFrame = () => {
        if (video.paused || video.ended) {
          return;
        }

        // Draw the current video on canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const src = cv.imread(canvas);
        if (edgeDetectionEnabled) {
          // Create a Mat from the canvas

          const dst = new cv.Mat();

          const lowThreshold = parseInt(lowThresholdSlider.value);
          const highThreshold = parseInt(highThresholdSlider.value);

          cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
          // First apply Gaussian Blur
          let blurredImage = new cv.Mat();
          let ksize = new cv.Size(7, 7);
          cv.GaussianBlur(src, blurredImage, ksize, 0, 0, cv.BORDER_DEFAULT);

          cv.Canny(blurredImage, dst, lowThreshold, highThreshold);
          // Flip the image horizontally (mirror)
          cv.flip(dst, dst, 1);

          // Show the flipped image on the canvas
          cv.imshow("canvas-output", dst);

          // Clean up resources
          dst.delete();
          blurredImage.delete();
        } else {
          cv.flip(src, src, 1);
          cv.imshow("canvas-output", src);
        }

        src.delete();
        // Call the function recursively to process the next frame
        requestAnimationFrame(processFrame);
      };
      // Start processing the frames
      requestAnimationFrame(processFrame);
    });
  })
  .catch((error) => {
    console.error("Error accessing media devices.", error);
  });

// Update lowThreshold
lowThresholdSlider.addEventListener("input", () => {
  const lowVal = parseInt(lowThresholdSlider.value);
  const highVal = parseInt(highThresholdSlider.value);

  // Ensure lowThreshold is less than or equal to highThreshold
  lowThresholdSlider.value = lowVal > highVal ? highVal : lowVal;
  lowThresholdValue.textContent = lowThresholdSlider.value;
});

// Update highThreshold
highThresholdSlider.addEventListener("input", () => {
  const lowVal = parseInt(lowThresholdSlider.value);
  const highVal = parseInt(highThresholdSlider.value);

  highThresholdSlider.value = highVal < lowVal ? lowVal : highVal;
  highThresholdValue.textContent = highThresholdSlider.value;
});

toggleButton.addEventListener("click", () => {
  edgeDetectionEnabled = !edgeDetectionEnabled;
  toggleButton.textContent = edgeDetectionEnabled
    ? "Disable Edge Detection"
    : "Enable Edge Detection";
});
