const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');

const shipImage = new Image();
shipImage.src = 'nave.png';

const asteroidImage = new Image();
asteroidImage.src = 'asteroide.png';

const backgroundImage = new Image();
backgroundImage.src = 'espacio.jpeg';

const ship = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 30,
    angle: 0,
    rotation: 0,
    thrust: {
        x: 0,
        y: 0
    },
    lasers: [],
    canShoot: true
};

let asteroids = [];
const numAsteroids = 5;
let score = 0;
let highScore = 0;
let lives = 3;
let gameOver = false;

const keys = {};

function createAsteroid(x, y, radius) {
    return {
        x: x || Math.random() * canvas.width,
        y: y || Math.random() * canvas.height,
        radius: radius || Math.random() * 30 + 15,
        angle: Math.random() * Math.PI * 2,
        speed: Math.random() * 50 + 50
    };
}

function createAsteroidBelt() {
    for (let i = 0; i < 1; i++) {
        let side = Math.floor(Math.random() * 4);
        let x, y;

        switch (side) {
            case 0: 
                x = Math.random() * canvas.width;
                y = -50; 
                break;
            case 1: 
                x = canvas.width + 50;
                y = Math.random() * canvas.height;
                break;
            case 2: 
                x = Math.random() * canvas.width;
                y = canvas.height + 50;
                break;
            case 3: 
                x = -50; 
                y = Math.random() * canvas.height;
                break;
        }

        let asteroid = {
            x: x,
            y: y,
            radius: Math.random() * 30 + 15,
            angle: Math.random() * Math.PI * 2,
            speed: Math.random() * 50 + 50
        };
        asteroids.push(asteroid);
    }
}

function update() {
    if (gameOver) return;

    if (keys['ArrowUp'] || keys['w']) {
        ship.thrust.x += 0.1 * Math.cos(ship.angle);
        ship.thrust.y += 0.1 * Math.sin(ship.angle);
    } else {
        ship.thrust.x -= 0.05 * ship.thrust.x;
        ship.thrust.y -= 0.05 * ship.thrust.y;
    }

    if (keys['ArrowDown'] || keys['s']) {
        ship.thrust.x -= 0.1 * Math.cos(ship.angle);
        ship.thrust.y -= 0.1 * Math.sin(ship.angle);
    }

    if (keys['ArrowLeft'] || keys['a']) {
        ship.angle -= 0.1;
    }

    if (keys['ArrowRight'] || keys['d']) {
        ship.angle += 0.1;
    }

    ship.x += ship.thrust.x;
    ship.y += ship.thrust.y;

    if (ship.x < 0) ship.x = canvas.width;
    if (ship.x > canvas.width) ship.x = 0;
    if (ship.y < 0) ship.y = canvas.height;
    if (ship.y > canvas.height) ship.y = 0;

    for (let i = 0; i < asteroids.length; i++) {
        asteroids[i].x += asteroids[i].speed * Math.cos(asteroids[i].angle) / 60;
        asteroids[i].y += asteroids[i].speed * Math.sin(asteroids[i].angle) / 60;

        if (asteroids[i].x < 0) asteroids[i].x = canvas.width;
        if (asteroids[i].x > canvas.width) asteroids[i].x = 0;
        if (asteroids[i].y < 0) asteroids[i].y = canvas.height;
        if (asteroids[i].y > canvas.height) asteroids[i].y = 0;

        if (distanceBetweenPoints(ship.x, ship.y, asteroids[i].x, asteroids[i].y) < ship.radius + asteroids[i].radius) {
            if (lives > 0) {
                lives--;
            }
            if (lives <= 0) {
                lives = 0;
                gameOver = true;
            } else {
                resetShipPosition();
                asteroids.splice(i, 1);
                createAsteroidBelt();
            }
        }
    }

    for (let i = ship.lasers.length - 1; i >= 0; i--) {
        ship.lasers[i].x += ship.lasers[i].xVel;
        ship.lasers[i].y += ship.lasers[i].yVel;

        if (ship.lasers[i].x < 0 || ship.lasers[i].x > canvas.width || ship.lasers[i].y < 0 || ship.lasers[i].y > canvas.height) {
            ship.lasers.splice(i, 1);
            continue;
        }

        for (let j = asteroids.length - 1; j >= 0; j--) {
            if (distanceBetweenPoints(ship.lasers[i].x, ship.lasers[i].y, asteroids[j].x, asteroids[j].y) < asteroids[j].radius) {
                score += 10;
                asteroids.splice(j, 1);
                ship.lasers.splice(i, 1);
                
                createAsteroidBelt();
                createAsteroidBelt();
                
                break;
            }
        }
    }
}

function drawShip(x, y, angle) {
    context.save();
    context.translate(x, y);
    context.rotate(angle);
    context.drawImage(shipImage, -ship.radius, -ship.radius, ship.radius * 2, ship.radius * 2);
    context.restore();
}

function drawAsteroids() {
    for (let i = 0; i < asteroids.length; i++) {
        context.drawImage(asteroidImage, 
                        asteroids[i].x - asteroids[i].radius, 
                        asteroids[i].y - asteroids[i].radius, 
                        asteroids[i].radius * 2, 
                        asteroids[i].radius * 2);
    }
}

function drawLasers() {
    for (let i = 0; i < ship.lasers.length; i++) {
        context.fillStyle = 'red';
        context.beginPath();
        context.arc(ship.lasers[i].x, ship.lasers[i].y, 4, 0, Math.PI * 2);
        context.fill();
    }
}

function drawHUD() {
    context.fillStyle = 'white';
    context.font = '24px Arial';
    context.fillText('Puntaje: ' + score, 10, 30);
    context.fillText('Puntaje Más Alto: ' + highScore, 10, 60);
    context.fillText('Vidas: ' + lives, 10, 90);
}

function drawGameOver() {
    context.fillStyle = 'rgba(0, 0, 0, 0.7)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = 'white';
    context.font = '48px Arial';
    context.textAlign = 'center';
    context.fillText('¡Has perdido!', canvas.width / 2, canvas.height / 2 - 50);

    context.font = '24px Arial';
    context.fillText('Presiona "R" para reiniciar el juego', canvas.width / 2, canvas.height / 2 + 20);
}

function render() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    drawShip(ship.x, ship.y, ship.angle);
    drawAsteroids();
    drawLasers();
    drawHUD();

    if (gameOver) {
        drawGameOver();
    }
}

function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

function distanceBetweenPoints(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

document.addEventListener('keydown', function(event) {
    keys[event.key] = true;

    if (event.key === ' ') {
        shootLaser();
    }

    if (event.key === 'r' && gameOver) {
        restartGame();
    }
});

document.addEventListener('keyup', function(event) {
    keys[event.key] = false;
});

function shootLaser() {
    if (ship.canShoot) {
        const laserStartX = ship.x + ship.radius * Math.cos(ship.angle);
        const laserStartY = ship.y + ship.radius * Math.sin(ship.angle);

        ship.lasers.push({
            x: laserStartX,
            y: laserStartY, 
            xVel: +500 * Math.cos(ship.angle) / 60,
            yVel: +500 * Math.sin(ship.angle) / 60
        });
        ship.canShoot = false;
        setTimeout(() => ship.canShoot = true, 200);
    }
}

function restartGame() {
    if (score > highScore) {
        highScore = score;
    }
    lives = 3;
    score = 0;
    ship.x = canvas.width / 2;
    ship.y = canvas.height / 2;
    ship.thrust.x = 0;
    ship.thrust.y = 0;
    ship.angle = 0;
    ship.lasers = [];
    asteroids = [];
    createAsteroidBelt();
    gameOver = false;
}

function resetShipPosition() {
    ship.x = canvas.width / 2;
    ship.y = canvas.height / 2;
    ship.thrust.x = 0;
    ship.thrust.y = 0;
    ship.angle = 0;
}

createAsteroidBelt();
gameLoop();
