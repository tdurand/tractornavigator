

export function sayHello() {
  return Math.random() < 0.5 ? 'Hello' : 'Hola';
}

export class PulsingDot {

  size = 100;
  width = 100;
  height = 100;
  data = new Uint8Array(100 * 100 * 4);
  map =  null;
  context = null;

  constructor(map) {
    this.map = map;
  }

  onAdd() {
    var canvas = document.createElement('canvas');
    canvas.width = this.width;
    canvas.height = this.height;
    this.context = canvas.getContext('2d');
  }

  render() {
    var duration = 1000;
    var t = (performance.now() % duration) / duration;

    var radius = this.size / 2 * 0.3;
    var outerRadius = this.size / 2 * 0.7 * t + radius;
    var context = this.context;

    // draw outer circle
    context.clearRect(0, 0, this.width, this.height);
    context.beginPath();
    context.arc(this.width / 2, this.height / 2, outerRadius, 0, Math.PI * 2);
    context.fillStyle = 'rgba(255, 200, 200,' + (1 - t) + ')';
    context.fill();

    // draw inner circle
    context.beginPath();
    context.arc(this.width / 2, this.height / 2, radius, 0, Math.PI * 2);
    context.fillStyle = 'rgba(255, 100, 100, 1)';
    context.strokeStyle = 'white';
    context.lineWidth = 2 + 4 * (1 - t);
    context.fill();
    context.stroke();

    // update this image's data with data from the canvas
    this.data = context.getImageData(0, 0, this.width, this.height).data;

    // keep the map repainting
    this.map.triggerRepaint();

    // return `true` to let the map know that the image was updated
    return true;
  }
};
