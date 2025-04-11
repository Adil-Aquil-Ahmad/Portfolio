const allLinks = document.querySelectorAll('header a, .sub-nav a');
const sections = document.querySelectorAll('.page');
const timeline = document.querySelector('.timeline');
const progress = document.querySelector('.timeline-progress');
const ladderPoint = document.querySelector('.ladder-point');
const items = document.querySelectorAll('.timeline-item');
const confettiCanvas = document.getElementById('confetti-canvas');
const ctx = confettiCanvas.getContext('2d');
let confettiParticles = [];
let itemStops = [];
let inConfettiZone = false;
let confettiAnimationId = null;
let activePopup = null;

// Initialize functions
function init() {
    projectCards = document.querySelectorAll('.project-card');
    setupNavigation();
    setupTimeline();
    setupProjectPopups();
    setupConfetti();
    setupThemeToggle(); // Add this line
    window.addEventListener('resize', handleResize);
    window.addEventListener('load', handleLoad);
    window.addEventListener('scroll', updateTimelineProgress);
}

// Navigation setup
function setupNavigation() {
    allLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            allLinks.forEach(nav => nav.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));
            link.classList.add('active');

            const targetId = link.getAttribute('data-target');
            const target = document.getElementById(targetId);
            if (target) {
                target.classList.add('active');
                if (targetId === 'hackathons') {
                    setTimeout(() => {
                        calculateItemStops();
                        updateTimelineProgress();
                    }, 100);
                }
            }
        });
    });
}

// Timeline functions
function setupTimeline() {
    calculateItemStops();
}

function calculateItemStops() {
    itemStops = Array.from(items).map(item => {
        const rect = item.getBoundingClientRect();
        return rect.top + window.scrollY + rect.height / 2;
    });

    if (items.length > 0) {
        const lastItem = items[items.length - 1];
        const lastItemBottom = lastItem.getBoundingClientRect().bottom + window.scrollY;
        itemStops.push(lastItemBottom + 300);
    }
}

function updateTimelineProgress() {
    if (!document.getElementById('hackathons').classList.contains('active')) return;

    const scrollTop = window.scrollY + window.innerHeight / 2;
    const timelineTop = timeline.offsetTop;

    let closestIndex = 0;
    let minDistance = Infinity;

    itemStops.forEach((stop, index) => {
        const distance = Math.abs(scrollTop - stop);
        if (distance < minDistance) {
            minDistance = distance;
            closestIndex = index;
        }
    });

    const progressHeight = Math.min(
        itemStops[closestIndex] - timelineTop,
        itemStops[itemStops.length - 1] - timelineTop
    );
    
    ladderPoint.style.top = `${progressHeight}px`;
    progress.style.height = `${progressHeight}px`;

    items.forEach((item, i) => {
        const isActive = i === closestIndex && closestIndex < items.length;
        item.classList.toggle('active-item', isActive);
        item.classList.toggle('in-view', isActive);
    });

    if (closestIndex === itemStops.length - 1 && !inConfettiZone) {
        inConfettiZone = true;
        triggerConfettiBurst();
    } else if (closestIndex !== itemStops.length - 1) {
        inConfettiZone = false;
    }
}

// Project popups
function setupProjectPopups() {
    const projectCards = document.querySelectorAll('.project-card');
    const popupBackdrop = document.querySelector('.popup-backdrop');
    
    projectCards.forEach(card => {
        const popup = card.querySelector('.project-popup');
        const closeBtn = popup.querySelector('.close-popup');
        
        card.addEventListener('click', function(e) {
            // Don't open popup if clicking on interactive elements
            if (e.target.closest('a') || e.target.closest('button')) {
                return;
            }
            
            // Close any existing popup first
            if (activePopup) {
                closeActivePopup();
                return;
            }
            
            // Open the new popup
            activePopup = popup;
            document.body.classList.add('popup-open');
            popupBackdrop.style.display = 'block';
            popup.classList.add('active');
            
            // Disable scrolling
            document.body.style.overflow = 'hidden';
        });
        
        closeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            closeActivePopup();
        });
    });
    
    // Close popup when clicking on backdrop
    document.querySelector('.popup-backdrop').addEventListener('click', function() {
        closeActivePopup();
    });
    
    // Close popup with ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && activePopup) {
            closeActivePopup();
        }
    });
}

// Update your closeActivePopup function:
function closeActivePopup() {
    if (activePopup) {
        const popupBackdrop = document.querySelector('.popup-backdrop');
        activePopup.classList.remove('active');
        document.body.classList.remove('popup-open');
        popupBackdrop.style.display = 'none';
        document.body.style.overflow = '';
        activePopup = null;
    }
}

// Confetti functions
function setupConfetti() {
    resizeCanvas();
}

function resizeCanvas() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
}

function createConfetti() {
    confettiParticles = [];
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    for (let i = 0; i < 150; i++) {
        const angle = Math.random() * 2 * Math.PI;
        const speed = Math.random() * 6 + 2;
        confettiParticles.push({
            x: centerX,
            y: centerY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            r: Math.random() * 6 + 4,
            color: `hsl(${Math.random() * 360}, 100%, 50%)`,
            gravity: 0.05,
            opacity: 1
        });
    }
}

function drawConfetti() {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    for (let p of confettiParticles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.opacity -= 0.0025;
    }
    ctx.globalAlpha = 1;

    if (confettiParticles.some(p => p.opacity > 0)) {
        confettiAnimationId = requestAnimationFrame(drawConfetti);
    } else {
        confettiCanvas.style.display = 'none';
        cancelAnimationFrame(confettiAnimationId);
    }
}

function triggerConfettiBurst() {
    if (confettiAnimationId !== null) {
        cancelAnimationFrame(confettiAnimationId);
    }
    resizeCanvas();
    createConfetti();
    confettiCanvas.style.display = 'block';
    drawConfetti();
}

// Event handlers
function handleResize() {
    resizeCanvas();
    calculateItemStops();
}

function handleLoad() {
    resizeCanvas();
    calculateItemStops();
}

// Theme toggle functionality
function setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const icon = themeToggle.querySelector('i');

    // Check for saved theme preference or use dark theme as default
    const currentTheme = localStorage.getItem('theme') || 'dark';
    document.body.setAttribute('data-theme', currentTheme);

    // Update icon based on current theme
    if (currentTheme === 'light') {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    }

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        // Set the new theme
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Toggle icon
        icon.classList.toggle('fa-moon');
        icon.classList.toggle('fa-sun');
    });
}


// Initialize the application
document.addEventListener('DOMContentLoaded', init);

const projectPopups = document.querySelectorAll('.project-popup');
const projectOpenButtons = document.querySelectorAll('.open-project');
const projectCloseButtons = document.querySelectorAll('.close-project');

projectOpenButtons.forEach((btn, index) => {
  btn.addEventListener('click', () => {
    const popup = projectPopups[index];
    const iframe = popup.querySelector('iframe');
    const videoId = btn.dataset.videoId; // store the video ID in data-video-id
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;

    popup.classList.add('active'); // show popup
    document.body.classList.add('no-scroll');
  });
});

projectCloseButtons.forEach((btn, index) => {
  btn.addEventListener('click', () => {
    const popup = projectPopups[index];
    const iframe = popup.querySelector('iframe');
    popup.classList.remove('active');
    document.body.classList.remove('no-scroll');

    // Reset src to stop the video and remove spinner
    iframe.src = '';
  });
});
