const getMicrophoneMediaStream = async () => {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: {
            deviceId: 'a695726332ad7ce703ed05d25eb699e360ac13642b0eaf8c37e0178e97b7abed'
            // deviceId: 'default'
        }
    });

    return mediaStream;
}

window.AudioContext = window.AudioContext || (window as any).webkitAudioContext;

export const createAudioAnalyzer = async () => {
    const micMediaStream = await getMicrophoneMediaStream()
    const audioContext = new AudioContext();
    const analyzer = audioContext.createAnalyser();
    
    analyzer.fftSize = 512;
    const blockSize = analyzer.frequencyBinCount;
    const data = new Uint8Array(blockSize)
    const source = audioContext.createMediaStreamSource(micMediaStream);

    console.log(`microphone media stream id: ${micMediaStream.id}`);

    source.connect(analyzer);
    
    return {
        analyze() {
            analyzer.getByteFrequencyData(data);
        
            let sum = 0;
            
            for (let i = 0; i < blockSize; i++) {
                sum += data[i];
            }
        
            return sum / blockSize / 255;
        }
    }
}

export const smooth = (value: number) => Math.max(0, 0.1 * Math.log10(value) + 0.5);