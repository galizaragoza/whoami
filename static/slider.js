const projects = [
  {
    title: "YouTube Channel: X02 Sec",
    description: "Contenido de ciberseguridad, CTFs y desarrollo de bajo nivel. Conceptos técnicos complejos explicados de forma accesible.",
    link: "https://www.youtube.com/@X02_sec"
  },
  {
    title: "eStudents",
    description: "Plataforma web para gestionar notas y asistencia de estudiantes. Construida con PHP, MySQL y Bootstrap.",
    link: "https://www.linkedin.com/in/mario-hinojosa/"
  },
  {
    title: "arsenal",
    description: "Colección de herramientas y scripts de seguridad para pentesting y escaneo automatizado de vulnerabilidades.",
    link: "#"
  }
];

let currentIndex = 0;
let autoTimer = null;

const sliderContent = document.getElementById('slider-content');
const prevBtn = document.getElementById('prev-project');
const nextBtn = document.getElementById('next-project');
const dotsContainer = document.getElementById('slider-dots');

function pad(n) {
  return String(n).padStart(2, '0');
}

function updateSlider() {
  const project = projects[currentIndex];

  sliderContent.innerHTML = '';

  const counter = document.createElement('span');
  counter.className = 'slide-counter';
  counter.textContent = `${pad(currentIndex + 1)} / ${pad(projects.length)}`;

  const h3 = document.createElement('h3');
  h3.textContent = project.title;

  const p = document.createElement('p');
  p.textContent = project.description;

  const a = document.createElement('a');
  a.href = project.link;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.className = 'slider-cta';
  a.textContent = 'VIEW_PROJECT →';

  sliderContent.append(counter, h3, p, a);

  document.querySelectorAll('.dot').forEach((dot, i) => {
    dot.className = i === currentIndex ? 'dot active' : 'dot';
  });
}

function changeTo(newIndex) {
  sliderContent.classList.add('fading');
  setTimeout(() => {
    currentIndex = newIndex;
    updateSlider();
    sliderContent.classList.remove('fading');
  }, 200);
}

function startAuto() {
  autoTimer = setInterval(() => {
    changeTo((currentIndex + 1) % projects.length);
  }, 5000);
}

function stopAuto() {
  clearInterval(autoTimer);
}

function createDots() {
  dotsContainer.innerHTML = '';
  projects.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'dot';
    dot.addEventListener('click', () => {
      stopAuto();
      changeTo(i);
      startAuto();
    });
    dotsContainer.appendChild(dot);
  });
}

prevBtn.addEventListener('click', () => {
  stopAuto();
  changeTo((currentIndex - 1 + projects.length) % projects.length);
  startAuto();
});

nextBtn.addEventListener('click', () => {
  stopAuto();
  changeTo((currentIndex + 1) % projects.length);
  startAuto();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') {
    stopAuto();
    changeTo((currentIndex - 1 + projects.length) % projects.length);
    startAuto();
  } else if (e.key === 'ArrowRight') {
    stopAuto();
    changeTo((currentIndex + 1) % projects.length);
    startAuto();
  }
});

sliderContent.addEventListener('mouseenter', stopAuto);
sliderContent.addEventListener('mouseleave', startAuto);

createDots();
updateSlider();
startAuto();
