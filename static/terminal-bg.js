const canvas = document.getElementById('terminal-bg');
const ctx = canvas.getContext('2d');

let width, height, columns;
const fontSize = 16;
const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz$#@&%*<>[]{}/\\|';

let drops = [];

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    columns = Math.floor(width / fontSize);
    
    drops = [];
    for (let i = 0; i < columns; i++) {
        drops[i] = Math.random() * -100;
    }
}

function draw() {
    ctx.fillStyle = 'rgba(12, 12, 12, 0.15)';
    ctx.fillRect(0, 0, width, height);

    ctx.font = 'bold ' + fontSize + 'px monospace';
    ctx.fillStyle = '#00ff00';

    for (let i = 0; i < drops.length; i++) {
        const char = characters.charAt(Math.floor(Math.random() * characters.length));
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        ctx.shadowBlur = 5;
        ctx.shadowColor = '#00ff00';
        ctx.fillText(char, x, y);
        ctx.shadowBlur = 0;

        drops[i] += 1.2;

        if (drops[i] * fontSize > height) {
            if (Math.random() > 0.95) {
                drops[i] = 0;
            }
        }
    }
}

window.addEventListener('resize', resize);
resize();

function animate() {
    draw();
    requestAnimationFrame(animate);
}

animate();
