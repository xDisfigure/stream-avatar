import { createAudioAnalyzer, getMicrophoneMediaStream, smooth } from './audio';
import { canvas, render } from './canvas';

import './style.css'

const app = document.querySelector<HTMLDivElement>('#app');

if (app === null) {
  throw new Error('Cannot find app in DOM');
}

app.appendChild(canvas);

const main = async () => {
  const microphoneId = 'default';
  const micMediaStream = await getMicrophoneMediaStream(microphoneId);

  const audioAnalyzer = createAudioAnalyzer(micMediaStream);
  
  console.log(`microphone media stream id: ${micMediaStream.id}`);
 
  requestAnimationFrame(function frame(time) {
    const audioLevel =  audioAnalyzer.analyze();
    const smoothedAudioLevel = smooth(audioLevel);
    
    render(time, smoothedAudioLevel);

    requestAnimationFrame(frame);
  });
};

main();

// stats js
// @ts-ignore
(function(){var script=document.createElement('script');script.onload=function(){var stats=new Stats();document.body.appendChild(stats.dom);requestAnimationFrame(function loop(){stats.update();requestAnimationFrame(loop)});};script.src='https://mrdoob.github.io/stats.js/build/stats.min.js';document.head.appendChild(script);})()
