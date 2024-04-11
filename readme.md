# Tractor Navigator

Tractor navigator provides guidance for farmers driving tractors. It is a navigation app (like your car
gps) that enables you to:

- Visualize current position and trajectory on an open field (no road)
- Follow accurately a predefined trajectory with live feedback to correct deviation
- Record and visualized saved trajectories

See demo video: https://www.youtube.com/watch?v=9yNK1JyhWI4 

[![Demo video](https://img.youtube.com/vi/jX0ccm-nKyk/0.jpg)](https://www.youtube.com/watch?v=9yNK1JyhWI4)

Download for [APK for Android](https://github.com/tdurand/tractornavigator/raw/master/build/tractornavigator-v1.1.apk)

First version developed for #MyGalileoApp Challenge 2019.

### Dev notes

When cloning on a new machine

- create a `config.json` file at root with a `mapboxToken`

```json
{
    "mapboxToken": "your_mapbox_token"
}
```

- run `npx cap update android` , `npm i`, `npm run build` , `npx cap copy`

- open in native IDE (android studio / Xcode)

### Acknowledgements:

Based on [Ionic PWA toolkit](https://github.com/ionic-team/ionic-pwa-toolkit) augmented with capacitor [https://capacitor.ionicframework.com](https://capacitor.ionicframework.com)
