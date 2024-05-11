
export const getMicrophoneMediaStream = async (deviceId = 'default') => {
    let mediaStream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: { deviceId }
    });

    return {
        mediaStream,
        async update(deviceId = 'default') {
            this.stop();
            this.mediaStream = await navigator.mediaDevices.getUserMedia({
                video: false,
                audio: { deviceId }
            });
        },
        stop () {
            this.mediaStream
                .getTracks()
                .forEach((track) => track.stop())
            }
        };
}

export const createSelect = async (deviceId = 'default') => {
    const select = document.createElement('select');

    const devices = await navigator.mediaDevices.enumerateDevices();
    const microphones = devices.filter((device) => device.kind === 'audioinput');

    microphones.forEach((microphone) => {
        const option = document.createElement('option');
        option.value = microphone.deviceId;
        option.textContent = microphone.label ?? 'N/A';
        option.selected = deviceId === microphone.deviceId;
        select.append(option);
    })
    
    return {select, getSelected() { return select.options[select.selectedIndex].value }};
}