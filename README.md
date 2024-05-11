### Stream avatar project
This project relies on vite (vanilla-ts) and a canvas to render a (cheap) doodle of a streamer. This output (hence webpage) will be used inside OBS as a fake webcam. The AudioContext api is used to listen to microphones audio level and animates the doodle's mouth. Other animations (like the arm), are pure random transition timings.

https://github.com/xDisfigure/stream-avatar/assets/7613287/11546178-9cfc-4744-b7c3-e8b4235259a0

### Setup

Dependencies
```
yarn
```

Run project on localhost
```
yarn dev
```
### ideas
Explorer a path with pure CSS and JS, without canvas
