export const progress = (duration: number) => {
    return {
        _lastTime: 0,
      duration,
      ratio: 0,
      onComplete: () => {},
      run(time: number) {
        this.ratio = (time - this._lastTime) / this.duration;
        
        if (this._lastTime === 0 || this.ratio > 1) {
          this.reset(time);
          this.onComplete();
        }
      },
      reset(time = 0) {
        this._lastTime = time;
        this.ratio = 0;
      }
    }
  }
  