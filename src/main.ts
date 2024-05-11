import { createAudioAnalyzer, getMicrophoneMediaStream, smooth } from './audio';
import './style.css'

const app = document.querySelector<HTMLDivElement>('#app');

if (app === null) {
  throw new Error('Cannot find app in DOM');
}

// listen to audio and make lips move
// get image
// crop each part that needs animations
// make animation moving 
const canvas = document.createElement('canvas');

app.appendChild(canvas);

const context = canvas.getContext('2d');

if (!context) {
  throw new Error('cannot find canvas context');
}

const scene = new Image();
const mouthClose = new Image();
const mouthBarelyOpen = new Image();
const mouthOpenSmall = new Image();
const mouthOpenBig = new Image();
const arm = new Image();

scene.src = 'scene-without-arm.jpeg';
mouthClose.src = 'mouth-close.png';
mouthBarelyOpen.src = 'mouth-barely-open.jpeg';
mouthOpenSmall.src = 'mouth-open-small.png';
mouthOpenBig.src = 'mouth-open-big.jpeg';
arm.src = 'arm.png';

scene.onload = () => {
  canvas.width = scene.width;
  canvas.height = scene.height;
}

const configs = new WeakMap();

configs.set(mouthClose, { audioThresshold: 0, offsetX: 5, offsetY: -18, scale: .6 });
configs.set(mouthBarelyOpen, { audioThresshold: 0.13, offsetX: 0, offsetY: -20, scale: .6});
configs.set(mouthOpenSmall, { audioThresshold: 0.34, offsetX: 0, offsetY: -22, scale: .4 });
configs.set(mouthOpenBig, { audioThresshold: 0.42, offsetX: 5, offsetY: -22, scale: .4 });

const sprites = [
  mouthClose,
  mouthBarelyOpen,
  mouthOpenSmall,
  mouthOpenBig
]

const getSpriteByAudioLevel = (audioLevel: number) => {
  return sprites.reduce((spriteFound, sprite) => {
    const spriteConfig = configs.get(sprite) || {};
    
    if (audioLevel > spriteConfig.audioThresshold) {
      return sprite;
    }

    return spriteFound;
  },  mouthClose);
}

const drawImage = (
  image: HTMLImageElement,
  x: number,
  y: number,
  cx: number,
  cy: number,
  scale: number,
  rotation: number
) => {
  context.setTransform(scale, 0, 0, scale, x, y); // sets scale and origin
  context.rotate(rotation);
  context.drawImage(image, -cx, -cy, image.width * scale, image.height * scale);
  context.setTransform(1,0,0,1,0,0);
} 

const timer = (duration: number) => {
  return {
    duration,
    _lastTime: 0,
    progression: 0,

    run(time: number, oncomplete?: () => void) {
      this.progression = (time - this._lastTime) / this.duration;
      
      if (this._lastTime === 0 || this.progression > 1) {
        this._lastTime = time;
        this.progression = 0;
        oncomplete?.();
      }
    },
    reset(time = 0) {
      this._lastTime = time;
      this.progression = 0;
    }
  }
}

const randomIntFromInterval = (min: number, max: number) => { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const main = async () => {
  const microphoneId = 'default';
  const micMediaStream = await getMicrophoneMediaStream(microphoneId);

  const tick = timer(60);
  const armTimer = timer(1200);
  
  const { analyze } = createAudioAnalyzer(micMediaStream);
  
  console.log(`microphone media stream id: ${micMediaStream.id}`);
  
 
  const maxArmDegree = 6;
  let lastArmDegree = 0;
  let targetArmDegree = 0;
  let sprite = mouthClose;

  const render = (time: number) => {    
    // clear scene
    context.clearRect(0, 0, canvas.width, canvas.height)
    
    // draw scene
    context.drawImage(scene, 0, 0, scene.width, scene.height);

    // audio computations
    const audioLevel = analyze();

    const smoothedAudioLevel = smooth(audioLevel);
    const candidateSprite = getSpriteByAudioLevel(smoothedAudioLevel);
    
    tick.run(time, () => {
      sprite = candidateSprite;
    });

    // mouth sprite config
    const { offsetX = 0, offsetY = 0, scale = 1 } = configs.get(sprite) || {};
    
    // mouth position & size
    const width = sprite.width * scale;
    const height = sprite.height * scale;
    const x = canvas.width / 2 + offsetX;
    const y = canvas.height / 2 + offsetY;
    
    // draw mouth
    context.drawImage(sprite, x, y, width, height);

    // draw arm
    const armScale = 1;
    const armOffsetX = 120;
    const armOffsetY = 180;

    armTimer.run(time, () => {
      const direction = Math.random() > .5 ? -1 : targetArmDegree > 0 ? -1 : 1;
      
      lastArmDegree = targetArmDegree;
      targetArmDegree = maxArmDegree * direction;
      armTimer.duration = randomIntFromInterval(800, 2000)
    });
    
    const degree = lastArmDegree + armTimer.progression * (targetArmDegree - lastArmDegree);

    drawImage(
      arm, 
      armOffsetX+arm.width, 
      armOffsetY, 
      arm.width, 
      0, 
      armScale, 
      degree * Math.PI/180
    )
  
    requestAnimationFrame(render);
  };

  requestAnimationFrame(render);
};

main();

// stats js
// @ts-ignore
(function(){var script=document.createElement('script');script.onload=function(){var stats=new Stats();document.body.appendChild(stats.dom);requestAnimationFrame(function loop(){stats.update();requestAnimationFrame(loop)});};script.src='https://mrdoob.github.io/stats.js/build/stats.min.js';document.head.appendChild(script);})()
