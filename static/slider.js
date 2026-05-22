const projects = [
  {
    title: "YouTube Channel: X02 Sec",
    description: "Cybersecurity content, CTFs, and low-level development. Focused on explaining complex technical concepts in an accessible way.",
    link: "https://www.youtube.com/@X02_sec"
  },
  {
    title: "eStudents",
    description: "A web platform for managing student grades and attendance. Built with PHP, MySQL, and Bootstrap. Designed for simplicity and efficiency in academic environments.",
    link: "https://www.linkedin.com/in/mario-hinojosa/"
  },
  {
    title: "arsenal",
    description: "A collection of security tools and scripts for pentesting and automated vulnerability scanning.",
    link: "#"
  }
];

let currentIndex = 0;

const sliderContent = document.getElementById('slider-content');
const prevBtn = document.getElementById('prev-project');
const nextBtn = document.getElementById('next-project');
const dotsContainer = document.getElementById('slider-dots');

function updateSlider() {
  const project = projects[currentIndex];

  sliderContent.innerHTML = '';

  const h3 = document.createElement('h3');
  h3.textContent = project.title;

  const p = document.createElement('p');
  p.textContent = project.description;

  const output = document.createElement('div');
  output.className = 'output';

  const a = document.createElement('a');
  a.href = project.link;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.textContent = 'VIEW_PROJECT';

  output.appendChild(a);
  sliderContent.append(h3, p, output);

  document.querySelectorAll('.dot').forEach((dot, index) => {
    dot.className = index === currentIndex ? 'dot active' : 'dot';
  });
}

function createDots() {
  dotsContainer.innerHTML = '';
  projects.forEach((_, index) => {
    const dot = document.createElement('div');
    dot.className = 'dot';
    dot.addEventListener('click', () => {
      currentIndex = index;
      updateSlider();
    });
    dotsContainer.appendChild(dot);
  });
}

prevBtn.addEventListener('click', () => {
  currentIndex = (currentIndex === 0) ? projects.length - 1 : currentIndex - 1;
  updateSlider();
});

nextBtn.addEventListener('click', () => {
  currentIndex = (currentIndex === projects.length - 1) ? 0 : currentIndex + 1;
  updateSlider();
});

createDots();
updateSlider();
