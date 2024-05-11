window.AudioContext = window.AudioContext || (window as any).webkitAudioContext;

export const createAudioAnalyzer = (mediaStream: MediaStream) => {
    const audioContext = new AudioContext();
    const analyzer = audioContext.createAnalyser();
    
    analyzer.fftSize = 512;
    const blockSize = analyzer.frequencyBinCount;
    const data = new Uint8Array(blockSize)
    let source = audioContext.createMediaStreamSource(mediaStream);

    source.connect(analyzer);
    
    return {
        updateMediaStream(mediaStream: MediaStream) {
            source.disconnect();
            source = audioContext.createMediaStreamSource(mediaStream)
            source.connect(analyzer);
        },
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