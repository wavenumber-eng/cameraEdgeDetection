const constraints = { video: { width: 640, height: 480 }, audio: false };
const video = document.querySelector("#video");

// Select  <canvas> element from  HTML
const canvas = document.querySelector("#canvas-output");

// 2D rendering context allows to draw on the canvas.
// Now ctx will be a 2D context object,
// and so we can use various methods to draw on the canvas.
const ctx = canvas.getContext("2d", { willReadFrequently: true });

// Set canvas size to 640x480
canvas.width = 640;
canvas.height = 480;

// Get slider elements
const lowThresholdSlider = document.querySelector("#lowThresholdRange");
const highThresholdSlider = document.querySelector("#highThresholdRange");

// Get span elements to display slider values
const lowThresholdValue = document.querySelector("#lowThresholdValue");
const highThresholdValue = document.querySelector("#highThresholdValue");

var Module = {
  onRuntimeInitialized() {
    const statusButton = document.querySelector("#status");
    statusButton.innerHTML =
      'OpenCV.js is ready! <i class="bi bi-check-circle"></i>';
    statusButton.classList.remove("btn-primary");
    statusButton.classList.add("btn-success");
  },
};

navigator.mediaDevices
  .getUserMedia({ video: true, audio: false })
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

        // Create a Mat from the canvas
        const src = cv.imread(canvas);
        const dst = new cv.Mat();

        const lowThreshold = parseInt(lowThresholdSlider.value);
        const highThreshold = parseInt(highThresholdSlider.value);

        cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
        // First apply Gaussian Blur
        let blurredImage = new cv.Mat();
        let ksize = new cv.Size(7, 7);
        cv.GaussianBlur(src, blurredImage, ksize, 0, 0, cv.BORDER_DEFAULT);
        cv.Canny(
          blurredImage,
          dst,
          lowThreshold,
          highThreshold,
          (apertureSize = 3),
          (L2gradient = false)
        );

        // Flip the image horizontally (mirror)
        cv.flip(dst, dst, 1);

        // Show the flipped image on the canvas
        cv.imshow("canvas-output", dst);

        // Clean up resources
        src.delete();
        dst.delete();

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
