const createCanvas = (width, height) => {
  let body = document.getElementsByTagName('body')[0];

  let canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  body.appendChild(canvas);
  return canvas;
};

const drawPoint = p => {
  context.beginPath();
  context.arc(p.x, p.y, 2, 0, Math.PI * 2);
  context.fill();
}

const drawLine = (line) => {
  context.beginPath();
  context.moveTo(line.point1.x, line.point1.y);
  context.lineTo(line.point2.x, line.point2.y);
  context.stroke();
}

const drawCircle = (circle) => {
  context.beginPath();
  context.arc(circle.center.x, circle.center.y, circle.radius, 0, 2 * Math.PI);
  context.stroke();
}

const cast = (ray, line) => {
  //https://www.youtube.com/watch?v=TOEi6T2mtHo
  const x1 = line.point1.x;
  const y1 = line.point1.y;
  const x2 = line.point2.x;
  const y2 = line.point2.y;

  const x3 = ray.point1.x;
  const y3 = ray.point1.y;
  const x4 = ray.point2.x;
  const y4 = ray.point2.y;

  const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

  if (den === 0) {
    return;
  }

  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;

  if (t > 0 && t < 1 && u > 0) {
    return {
      x: x1 + t * (x2 - x1),
      y: y1 + t * (y2 - y1),
      color: line.color
    }
  } else {
    return;
  }
};

const getIntersectsWithCircle = (line, circle) => {
  //https://stackoverflow.com/questions/37224912/circle-line-segment-collision
  var b, c, d, u1, u2, ret, retP1, retP2, v1, v2;
  v1 = {};
  v2 = {};
  v1.x = line.point2.x - line.point1.x;
  v1.y = line.point2.y - line.point1.y;
  v2.x = line.point1.x - circle.center.x;
  v2.y = line.point1.y - circle.center.y;
  b = (v1.x * v2.x + v1.y * v2.y);
  c = 2 * (v1.x * v1.x + v1.y * v1.y);
  b *= -2;
  d = Math.sqrt(b * b - 2 * c * (v2.x * v2.x + v2.y * v2.y - circle.radius * circle.radius));
  if(isNaN(d)){ // no intercept
      return [];
  }
  u1 = (b - d) / c;  // these represent the unit distance of point one and two on the line
  u2 = (b + d) / c;    
  retP1 = {};   // return points
  retP2 = {}  
  ret = []; // return array
  if(u1 <= 1 && u1 >= 0){  // add point if on the line segment
      retP1.x = line.point1.x + v1.x * u1;
      retP1.y = line.point1.y + v1.y * u1;
      retP1.color = circle.color;
      ret[0] = retP1;
  }
  if(u2 <= 1 && u2 >= 0){  // second add point if on the line segment
      retP2.x = line.point1.x + v1.x * u2;
      retP2.y = line.point1.y + v1.y * u2;
      retP2.color = circle.color;
      ret[ret.length] = retP2;
  }       
  return ret;
}

const rotate = (center, point, angle) => {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const nx = (cos * (point.x - center.x)) + (sin * (point.y - center.y)) + center.x;
  const ny = (cos * (point.y - center.y)) - (sin * (point.x - center.x)) + center.y;
  return {
    x: nx,
    y: ny
  };
}

const drawObject = o => {
  context.strokeStyle = o.color;
  switch (o.type) {
    case 'circle':
      drawCircle(o);
      break;
    case 'line':
      drawLine(o);
      break;
  }
};

const getIntersectsWithLine = (ray, line) => {
  const p = cast(ray, line);
  if (p) {
    return [p];
  } else {
    return [];
  };
}

const getIntersect = (ray, o) => {
  switch (o.type) {
    case 'circle':
      return getIntersectsWithCircle(ray, o);
    case 'line':
    return getIntersectsWithLine(ray, o);
  }
};

const random = (max) => 
  Math.floor(Math.random() * max);

const range = count => [...Array(count).keys()];

const windowWidth = 1500;
const windowHeight = 900;

let canvas = createCanvas(windowWidth, windowHeight);
let context = canvas.getContext('2d');
context.lineWidth = 0.5;

const point = { x: 200, y: 200 };
drawPoint(point);

const getRandomColor = () => {
  return `rgb(${random(256)},${random(256)},${random(256)})`;
}

const objects1 = range(10)
.map(() => {
  return {
    type: 'line',
    color: getRandomColor(),
    point1: {x: random(windowWidth) , y: random(windowHeight)}, 
    point2: {x: random(windowWidth) , y: random(windowHeight)}
  };
});

const objects2 = range(20)
  .map(() => {
    return {
      type: 'circle',
      color: getRandomColor(),
      center: {x: random(windowWidth) , y: random(windowHeight)},
      radius: 20
    };
  });

const objects = [].concat.apply([], [objects1, objects2]);

objects.forEach(drawObject);

const rayCount = 360;

const getNearest = (points) => {
  const d = (p) => Math.hypot(p.x-point.x, p.y-point.y);
  
  if (points.length < 2) {
    return points;
  }

  var closest = points.slice(1).reduce(function(min, p) {
    const distance = d(p);
    if (distance < min.d) {
      return {
        point: p,
        d: distance
      };
    }
    return min;
  }, {point: points[0], d:d(points[0])}).point;

  return [closest];
}

const draw = () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  //objects.forEach(drawObject);

  const ray = {x: point.x, y: point.y + 1000};

  for(let i = 0; i < rayCount; i++) {
    const rayPoint = rotate(point, ray, Math.PI * 2 / rayCount * i);
    const rayLine = {
      point1: point,
      point2: rayPoint
    };

    const arrays = objects.map(x => {
      return getIntersect(rayLine, x);
    });

    var merged = [].concat.apply([], arrays);
    var nearest = getNearest(merged);
    nearest
      .forEach(x => {
        context.strokeStyle = x.color;
        drawLine({ point1: point, point2: x });
      });
  }

  requestAnimationFrame(draw);
}

canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  point.x = e.x - rect.left;
  point.y = e.y - rect.top;
});

draw();
