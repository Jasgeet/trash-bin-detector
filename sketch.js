// frameRate = 60fps 
// Global variables for sketch1: Loader

const w = window.innerWidth, h = window.innerHeight;
const amount = 37;
let v;

// Global variables for sketch2: Real Time Object Detection

let video;
let detector;
let detections = [];

// variables to store dustbin images
let greenDustbin, blueDustbin, blackDustbin;

// video parameters
let videoWidth, videoHeight;
let videoStartingX;

// set videoStartingX's value as soon as videoWidth is set
function setVideoStartingX() {
  // center video horizontally for both mobile and laptop 
  videoStartingX = (w - videoWidth) / 2;
} 
// don't shift video vertically on canvas, start at y = 0
let videoStartingY = 0; 

// canvas parameters
let canvasWidth  = w, canvasHeight;

// variable for front camera/rear camera option
var cameraChoice;

// text parameters
let fontSize;
let fontOutline;
let textDisplacementY; // textDisplacememtX is same for mobile and PC 

// thickness of bounding box
let boxWeight;

// dustbin parameters
let dustbinStartingX, dustbinStartingY;
let dustbinWidth, dustbinHeight;

// parameters for mobile screen
if(w < 768) {
  canvasHeight = h;
  videoWidth = 360;
  // set videoStartingX's value as dustbinStartingX requires it later
  setVideoStartingX();
  videoHeight = 480;
  cameraChoice = {
    video: {
      facingMode: {
        exact: "environment"
      }
    }
  };

  dustbinWidth = 200;
  dustbinHeight = 224;
  // make canvas appear from top to bottom 
  document.querySelector("body").style.alignItems = "start";
  dustbinStartingX = 0;
  // dustbin image always leaves 10px gap at bottom  
  dustbinStartingY = h - dustbinHeight - 10;
  fontSize = 14;
  fontOutline = 2;
  boxWeight = 4;
  textDisplacementY = 10;

} else {
  // parameters for laptop screen
  canvasHeight = 480;
  videoWidth = 640;
  setVideoStartingX();
  videoHeight = 480;
  cameraChoice = {
    video: {
      facingMode: {
        exact: "user"
      }
    }
  };
  
  dustbinWidth = 304;
  dustbinHeight = 343;
  // shift dustbin image horizontally towards the right of video
  dustbinStartingX = videoStartingX + videoWidth + 10;
  // start dustbin image 137 px below where video starts (which starts at y = 0)
  dustbinStartingY = videoStartingY + 137;
  fontSize = 24;
  fontOutline = 3;
  boxWeight = 5;
  textDisplacementY = 24;
}

// sketch1 (Loader) begins
// creating sketch1 object as a new p5 object called 'p'

let sketch1 = new p5 (p => {

  // setting up loader canvas
  p.setup = () => {
    
    // creating a sketch having size as the device's full screen
    // size
    v = p.min(w, h);
    p.createCanvas(w, h);
  }

  p.draw = () => {

    // 1st blue background should appear for 0.5 sec then
    // loader should load till it completes 1 cycle of loading
    // which approx. takes 6 secs = 360 frames
    // so start loading after 0.5 sec = 30 frames, till 6 secs
    if(p.frameCount > 30 && p.frameCount < 390) {
      p.colorMode(p.RGB);
      p.background(0, 0, 0, 10);
      
      // since delayed loading by 30 frames, need to subtract
      // 30 frames for loader to load from beginning, otherwise
      // it'll skip the first 30 frames and display incomplete loader
      var t = ((p.frameCount - 30) / 60) + ((3 / 2) * p.PI);
      t += p.sin(p.frameCount / 60) / (3 * 2);
      const R = v / 3;
      
      for (let i = 0; i < amount; i++) {
        const a = i / amount * p.PI * (p.sin(t) + 1) + t;
        const r = v / 20 * p.sin(i / amount * 10 * p.PI) * (p.sin(t) + 1) / 2;
        const x = w / 2 + (R + r) * p.cos(a);
        const y = h / 2 - (R + r) * p.sin(a);

        p.colorMode(p.HSB, 2 * p.PI, 100, 100);
        p.stroke(a - t, 50, 100);
        p.fill(a - t, 50, 100);
        p.ellipse(x, y, v / 50, v / 50);
      }
    }

    // Completely remove this sketch (Loader) at 6.5 sec from start
    if(p.frameCount >= 390) {
      p.remove();
    }
  }
});

// sketch2 (Real Time Object Detection) begins
// creating sketch2 object as a new p5 object also called 'p'

// Object Detection starts at 6.63 sec to avoid 
// overlapping with loader
setTimeout(() => {
  let sketch2 = new p5 (p => {

    // loading ML5 COCO-SSD Object Detection Model
    // and dustbin images
    p.preload = () => {
      detector = ml5.objectDetector('cocossd');
      greenDustbin = p.loadImage('images/dustbin-green.png');
      blueDustbin = p.loadImage('images/dustbin-blue.png');
      blackDustbin = p.loadImage('images/dustbin-black.png');
    }

    // setting up object detection canvas
    p.setup = () => {

      // create canvas of window.width px by 480 px
      // so that camera can be placed in center(horizontally)  
      // without using CSS's margin
      // create an HTML video element of size 640 px by 480 px and hide it
      // perform object detection on video 

      p.createCanvas(canvasWidth, canvasHeight);
      video = p.createCapture(cameraChoice);
      video.size(videoWidth, videoHeight);
      video.hide();
      detector.detect(video, p.gotDetections);
    }

    p.draw = () => {
      
      // clear the canvas background with a color similar
      // to web app's background - needed as object.label 
      // will otherwise stay if it is drawn outside video element
      // display the video element on canvas at center (horizontally)
      p.background(40, 54, 96);
      p.image(video, videoStartingX, videoStartingY);

      // outline and display label of all the objects 
      // detected
      for (let i = 0; i < detections.length; i++) {
        let object = detections[i];

        // don't outline person
        if(object.label != 'person') {

          // outline black, blue and green dustbin wastes
          // with their respective colors and display corresponding
          // resized dustbin images so they fit on canvas 
          if(object.label == 'electronics - hazardous - recyclable - black') {
            p.stroke(0);
            p.image(blackDustbin, dustbinStartingX, dustbinStartingY, dustbinWidth, dustbinHeight);
          }
          else if(object.label == 'organic waste - biodegradable - green') {
            p.stroke(0, 255, 0);
            p.image(greenDustbin, dustbinStartingX, dustbinStartingY, dustbinWidth, dustbinHeight);
          }
          else {
            p.stroke(0, 0, 255);
            p.image(blueDustbin, dustbinStartingX, dustbinStartingY, dustbinWidth, dustbinHeight);
          }
          
          // set thickness of outline
          p.strokeWeight(boxWeight);

          // don't fill the rectangle with color otherwise the object 
          // won't be visible
          p.noFill();

          // create the outline around detected object and 
          // shift this outline as video element is also shifted by videoStartingX
          // but dont shift y coordinate as video is not shifted vertically in canvas
          p.rect(object.x + videoStartingX, object.y, object.width, object.height);

          // Add a black stroke around text alphabets to 
          // enhance visibility
          p.stroke(0);
          p.strokeWeight(fontOutline);

          // Color of text - white
          p.fill(255);

          // set size of text
          p.textSize(fontSize);

          // display text above the object outline
          // shift text as video element is shifted
          p.text(object.label, object.x + videoStartingX + 10, object.y - textDisplacementY);
        }
      }
    }
    
    p.gotDetections = (error, results) => {

      // display error if any
      if (error) {
        console.error(error);
      }

      // store detection results in the global array
      detections = results;

      // to enable real time object detection recursively
      // call this function
      detector.detect(video, p.gotDetections);
    }
  });
}, 6630);