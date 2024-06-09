/* MoveNet Skeleton - Steve's Makerspace (most of this code is from TensorFlow)

MoveNet is developed by TensorFlow:
https://www.tensorflow.org/hub/tutorials/movenet

*/

function preload() { 
  carImg = loadImage("upload_e7b8681276bf136e02f932e89ea6fe54.gif");
}

let video, bodypose, pose, keypoint, detector;
let poses = [];
let imgSpeed = 2; // Speed of image movement
let imgXLeft, imgXRight; // X positions for the images
let imgXLeftEye, imgXRightEye, imgXLeftWrist, imgXRightWrist; // X positions for eye and wrist images

async function init() {
  const detectorConfig = {
    modelType: poseDetection.movenet.modelType.MULTIPOSE_LIGHTNING,
  };
  detector = await poseDetection.createDetector(
    poseDetection.SupportedModels.MoveNet,
    detectorConfig
  );
}

async function videoReady() {
  console.log("video ready");
  await getPoses();
}

async function getPoses() {
  if (detector) {
    poses = await detector.estimatePoses(video.elt, {
      maxPoses: 2,
      //flipHorizontal: true,
    });
  }
  requestAnimationFrame(getPoses);
}

async function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO, videoReady);
  video.size(width, height);
  video.hide();
  await init();

  stroke(255);
  strokeWeight(5);

  imgXLeft = width; // Initialize image position off the canvas on the right
  imgXRight = width; // Initialize image position off the canvas on the right
  imgXLeftEye = width; // Initialize image position off the canvas on the right
  imgXRightEye = width; // Initialize image position off the canvas on the right
  imgXLeftWrist = -75; // Initialize image position off the canvas on the left
  imgXRightWrist = -75; // Initialize image position off the canvas on the left
}

function draw() {
  image(video, 0, 0);
  drawSkeleton();
  // flip horizontal
  let cam = get();
  translate(cam.width, 0);
  scale(-1, 1);
  image(cam, 0, 0);
}

function drawSkeleton() {
  // Draw all the tracked landmark points
  for (let i = 0; i < poses.length; i++) {
    pose = poses[i];
    // Display text near the nose
    partA = pose.keypoints[0];
    if (partA.score > 0.1) {
      push();
      textSize(40);
      scale(-1, 1);
      text("412730482,陳儷靜", partA.x - width, partA.y - 150);
      pop();
    }
    
    // Left eye to right eye
    partA = pose.keypoints[1];
    partB = pose.keypoints[2];
    if (partA.score > 0.1 && partB.score > 0.1) {
      // Move image from right to left
      imgXLeftEye -= imgSpeed;
      imgXRightEye -= imgSpeed;
      if (imgXLeftEye < -75) {
        imgXLeftEye = width;
      }
      if (imgXRightEye < -75) {
        imgXRightEye = width;
      }
      push();
      image(carImg, imgXLeftEye - 75, partA.y - 75, 150, 150); // 左眼
      image(carImg, imgXRightEye - 75, partB.y - 75, 150, 150); // 右眼
      pop();
    }

    // Left wrist to right wrist
    partA = pose.keypoints[9];
    partB = pose.keypoints[10];
    if (partA.score > 0.1 && partB.score > 0.1) {
      // Move image from left to right
      imgXLeftWrist += imgSpeed;
      imgXRightWrist += imgSpeed;
      if (imgXLeftWrist > width) {
        imgXLeftWrist = -75;
      }
      if (imgXRightWrist > width) {
        imgXRightWrist = -75;
      }
      push();
      image(carImg, imgXLeftWrist, partA.y - 75, 150, 150); // 左手腕
      image(carImg, imgXRightWrist, partB.y - 75, 150, 150); // 右手腕
      pop();
    }

    // shoulder to shoulder
    partA = pose.keypoints[5];
    partB = pose.keypoints[6];
    if (partA.score > 0.1 && partB.score > 0.1) {
      // Move image from right to left
      imgXLeft -= imgSpeed;
      imgXRight -= imgSpeed;
      if (imgXLeft < -75) {
        imgXLeft = width;
      }
      if (imgXRight < -75) {
        imgXRight = width;
      }
      push();
      image(carImg, imgXLeft - 75, partA.y - 75, 150, 150); // 左邊肩膀
      image(carImg, imgXRight - 75, partB.y - 75, 150, 150); // 右邊肩膀
      pop();
    }
    
    // Draw lines for other body parts
    // hip to hip
    partA = pose.keypoints[11];
    partB = pose.keypoints[12];
    if (partA.score > 0.1 && partB.score > 0.1) {
      line(partA.x, partA.y, partB.x, partB.y);
    }
    // shoulders to hips
    partA = pose.keypoints[5];
    partB = pose.keypoints[11];
    if (partA.score > 0.1 && partB.score > 0.1) {
      line(partA.x, partA.y, partB.x, partB.y);
    }
    partA = pose.keypoints[6];
    partB = pose.keypoints[12];
    if (partA.score > 0.1 && partB.score > 0.1) {
      line(partA.x, partA.y, partB.x, partB.y);
    }
    // hip to foot
    for (let j = 11; j < 15; j++) {
      if (pose.keypoints[j].score > 0.1 && pose.keypoints[j + 2].score > 0.1) {
        partA = pose.keypoints[j];
        partB = pose.keypoints[j + 2];
        line(partA.x, partA.y, partB.x, partB.y);
      }
    }
  }
}

/* Points (view on left of screen = left part - when mirrored)
  0 nose
  1 left eye
  2 right eye
  3 left ear
  4 right ear
  5 left shoulder
  6 right shoulder
  7 left elbow
  8 right elbow
  9 left wrist
  10 right wrist
  11 left hip
  12 right hip
  13 left knee
  14 right knee
  15 left foot
  16 right foot
*/
