import { progress } from "./animation";
import { randomIntExclusive } from "./number";
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


export const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');

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
    const spriteConfig = configs.get(sprite);

    if (spriteConfig === undefined) {
      throw new Error('sprite config does not exist');
    }
    
    if (audioLevel > spriteConfig.audioThresshold) {
      return sprite;
    }

    return spriteFound;
  },  mouthClose);
}

const mouthProgress = progress(60);
const armProgress = progress(1200);

const maxArmDegree = 6;
let lastArmDegree = 0;
let targetArmDegree = 0;

let sprite = mouthClose;

export const render = (time: number, audioLevel: number) => {
    if (context === null) {
        throw new Error('canvas context is undefined');
    }

    // clear
    context.clearRect(0, 0, canvas.width, canvas.height)

    // scene
    context.drawImage(scene, 0, 0, scene.width, scene.height);

    // mouth
    mouthProgress.onComplete = () => {
        sprite = getSpriteByAudioLevel(audioLevel);
    };
    mouthProgress.run(time);

    const mouthConfig = configs.get(sprite);

    if (mouthConfig === undefined) {
        throw new Error('mouth config does not exists');
    }
  
    const mouthWidth = sprite.width * mouthConfig.scale;
    const mouthHeight = sprite.height * mouthConfig.scale;
    const mouthX = canvas.width / 2 + mouthConfig.offsetX;
    const mouthY = canvas.height / 2 + mouthConfig.offsetY;

    context.drawImage(sprite, mouthX, mouthY, mouthWidth, mouthHeight);

    // arm
    armProgress.onComplete = () => {
        let direction = targetArmDegree > 0 ? -1 : 1;

        if (Math.random() > .5) {
            direction = -1;
        }
        
        lastArmDegree = targetArmDegree;
        targetArmDegree = maxArmDegree * direction;
        armProgress.duration = randomIntExclusive(800, 2000)
    };
    armProgress.run(time);

    const armScale = 1;
    const armOffsetX = 120;
    const armOffsetY = 180;
    const degree = lastArmDegree + armProgress.ratio * (targetArmDegree - lastArmDegree);

    context.setTransform(armScale, 0, 0, armScale, armOffsetX + arm.width, armOffsetY);
    context.rotate(degree * Math.PI / 180);
    context.drawImage(arm, -arm.width, 0, arm.width * armScale, arm.height * armScale);
    context.setTransform(1,0,0,1,0,0)
}