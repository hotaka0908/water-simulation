let droplet;
let waves = [];
let waterLevel;

// 色設定 (元の画像を参考に)
let backgroundColor;
let waterColor;
let rippleColorBase; // 波紋の基本色
let dropletColor;

function setup() {
  let canvas = createCanvas(600, 400); // キャンバスサイズ
  canvas.parent(document.querySelector('main')); // canvasをmainタグの子要素にする

  // 色の定義
  backgroundColor = color(255); // 白色背景
  waterColor = color(0, 120, 220, 200);    // 青い水面 (透明度あり)
  rippleColorBase = color(70, 170, 255); // 明るい青色の波紋
  dropletColor = color(10, 80, 180);      // 水滴の色

  waterLevel = height * 0.65; // 水面のY座標

  // 最初の水滴を生成 (マウスで追加も可能にするため、最初はnullでも良い)
  // droplet = new Droplet(width / 2, 50, 8); // 中央上部から開始

  textAlign(CENTER, CENTER);
  textSize(16);
}

function draw() {
  background(backgroundColor);

  // 水面を描画
  fill(waterColor);
  noStroke();
  rect(0, waterLevel, width, height - waterLevel);

  // 水滴の処理
  if (droplet) {
    droplet.update();
    droplet.display();

    if (droplet.hasHitWater(waterLevel)) {
      // 波紋を生成
      waves.push(new Wave(droplet.x, waterLevel));
      // 水滴を消滅させる（または再利用のためにリセット）
      droplet = null;
    } else if (droplet.isOffScreen(height)) {
      droplet = null; // 画面外に消えた場合も消滅
    }
  } else {
    // 水滴がない場合、クリックを促すメッセージ
    fill(0, 100);
    noStroke();
    text("クリックして水滴を落とす", width / 2, height / 3);
  }

  // 波紋の処理 (配列の末尾から処理することで、途中で要素を削除しても安全)
  for (let i = waves.length - 1; i >= 0; i--) {
    waves[i].update();
    waves[i].display();
    if (waves[i].isFinished()) {
      waves.splice(i, 1); // 波紋を配列から削除
    }
  }
}

function mousePressed() {
  // 既存の水滴がない場合のみ、新しい水滴を生成
  if (!droplet && mouseY < waterLevel) { // 水面より上でクリックされた場合
    droplet = new Droplet(mouseX, mouseY, 8);
  } else if (!droplet && mouseY >=waterLevel) { // 水面下でクリックされた場合は水面少し上から
     droplet = new Droplet(mouseX, waterLevel - 30, 8);
  }
}

// 水滴クラス
class Droplet {
  constructor(x, y, r) {
    this.x = x;
    this.y = y;
    this.radius = r;
    this.color = dropletColor;
    this.velocityY = 0;
    this.gravity = 0.25; // 重力加速度
  }

  update() {
    this.velocityY += this.gravity;
    this.y += this.velocityY;
  }

  display() {
    fill(this.color);
    noStroke();
    ellipse(this.x, this.y, this.radius * 2);
  }

  hasHitWater(level) {
    return this.y + this.radius > level;
  }

  isOffScreen(screenHeight) {
    // 水面より下に落ちて、さらに画面外に出たか
    return this.y - this.radius > screenHeight && this.y > waterLevel;
  }
}

// 波紋クラス
class Wave {
  constructor(x, y) {
    this.x = x; // 波紋の中心X
    this.y = y; // 波紋の中心Y (水面)
    this.initialRadius = 2;
    this.currentRadius = this.initialRadius;
    this.maxRadiusVisual = 300; // 見た目上の最大半径 (これを超えても減衰は続く)
    this.speed = 1.8; // 波紋が広がる速さ

    this.lifespan = 255; // 波紋の寿命 (透明度で表現)
    this.fadeRate = 2.5;   // 透明度が減少する速さ

    this.initialStrokeWeight = 3.5;
    this.currentStrokeWeight = this.initialStrokeWeight;
  }

  update() {
    this.currentRadius += this.speed;
    this.lifespan -= this.fadeRate;

    // 波紋の太さを寿命に応じて変化させる (細くなって消える感じ)
    this.currentStrokeWeight = map(this.lifespan, 0, 255, 0, this.initialStrokeWeight);
    this.currentStrokeWeight = max(0, this.currentStrokeWeight); // 0未満にならないように
  }

  display() {
    if (this.lifespan > 0) {
      noFill();
      // 波紋の色に透明度を適用
      stroke(red(rippleColorBase), green(rippleColorBase), blue(rippleColorBase), this.lifespan);
      strokeWeight(this.currentStrokeWeight);
      ellipse(this.x, this.y, this.currentRadius * 2);
    }
  }

  isFinished() {
    return this.lifespan <= 0;
  }
}