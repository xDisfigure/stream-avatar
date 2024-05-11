import { createAudioAnalyzer, smooth } from './audio';
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

scene.src = 'scene.jpeg';
mouthClose.src = 'mouth-close.png';
mouthBarelyOpen.src = 'mouth-barely-open.jpeg';
mouthOpenSmall.src = 'mouth-open-small.png';
mouthOpenBig.src = 'mouth-open-big.jpeg';

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

const main = async () => {
  const { analyze } = await createAudioAnalyzer();

  let lastTime = 0;
  let sprite = mouthClose;
  const refreshMs = 60;

  const render = (time: number) => {    
    // clear scene
    context.clearRect(0, 0, canvas.width, canvas.height)
    
    // draw scene
    context.drawImage(scene, 0, 0, scene.width, scene.height);

    // audio computations
    const audioLevel = analyze();
    const smoothedAudioLevel = smooth(audioLevel);
    const candidateSprite = getSpriteByAudioLevel(smoothedAudioLevel);
    
    if (lastTime === 0 || time - lastTime > refreshMs) {
      lastTime = time;
      sprite = candidateSprite;
    }

    // console.log(smoothedAudioLevel)

    // mouth sprite config
    const { offsetX = 0, offsetY = 0, scale = 1 } = configs.get(sprite) || {};
    
    // mouth position & size
    const width = sprite.width * scale;
    const height = sprite.height * scale;
    const x = canvas.width / 2 + offsetX;
    const y = canvas.height / 2 + offsetY;
    
    // draw mouth
    context.drawImage(sprite, x, y, width, height);

    requestAnimationFrame(render);
  };

  requestAnimationFrame(render);
};

main();

javascript:(function(){var script=document.createElement('script');script.onload=function(){var stats=new Stats();document.body.appendChild(stats.dom);requestAnimationFrame(function loop(){stats.update();requestAnimationFrame(loop)});};script.src='https://mrdoob.github.io/stats.js/build/stats.min.js';document.head.appendChild(script);})()
