window.AudioContext = window.AudioContext || (window as any).webkitAudioContext;

export const getMicrophoneMediaStream = async (deviceId?: string) => {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: {
            deviceId: deviceId ?? 'default'
        }
    });

    return mediaStream;
}


export const createAudioAnalyzer = (mediaStream: MediaStream) => {
    const audioContext = new AudioContext();
    const analyzer = audioContext.createAnalyser();
    
    analyzer.fftSize = 512;
    const blockSize = analyzer.frequencyBinCount;
    const data = new Uint8Array(blockSize)
    const source = audioContext.createMediaStreamSource(mediaStream);

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