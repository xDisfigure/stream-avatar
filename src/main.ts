import { createAudioAnalyzer, smooth } from './audio';
import { canvas, render } from './canvas';
import { createSelect, getMicrophoneMediaStream } from './devices';

import './style.css'

const app = document.querySelector<HTMLDivElement>('#app');

if (app === null) {
  throw new Error('Cannot find app in DOM');
}

app.appendChild(canvas);

const main = async () => {
  const { select, getSelected } = await createSelect('default');
  
  let currentMicrophone = await getMicrophoneMediaStream(getSelected());
  console.log(`microphone media stream id: ${currentMicrophone.mediaStream.id}`);
  
  const audioAnalyzer = createAudioAnalyzer(currentMicrophone.mediaStream);
   
  select.onchange = async () => {
    await currentMicrophone.update(getSelected());
    audioAnalyzer.updateMediaStream(currentMicrophone.mediaStream);
  }
  
  requestAnimationFrame(function frame(time) {
    const audioLevel =  audioAnalyzer.analyze();
    const smoothedAudioLevel = smooth(audioLevel);
    
    render(time, smoothedAudioLevel);

    requestAnimationFrame(frame);
  });

  app.append(select);
};

main();

// stats js
// @ts-ignore
(function(){var script=document.createElement('script');script.onload=function(){var stats=new Stats();document.body.appendChild(stats.dom);requestAnimationFrame(function loop(){stats.update();requestAnimationFrame(loop)});};script.src='https://mrdoob.github.io/stats.js/build/stats.min.js';document.head.appendChild(script);})()
