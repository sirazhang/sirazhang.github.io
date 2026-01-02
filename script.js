// Global state
let currentLang = 'en';
let activeBranch = null;

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    initTypewriter();
    initSmoothScroll();
    initNavHighlight();
});

// Language Toggle
function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'zh' : 'en';
    updateLanguage();
    
    // Update button appearance
    const zhSpan = document.querySelector('.lang-zh');
    const enSpan = document.querySelector('.lang-en');
    
    if (currentLang === 'zh') {
        zhSpan.classList.add('active');
        enSpan.classList.remove('active');
    } else {
        enSpan.classList.add('active');
        zhSpan.classList.remove('active');
    }
    
    // Restart typewriter for subtitle
    initTypewriter();
}

function updateLanguage() {
    // Update all elements with data-zh and data-en attributes
    const elements = document.querySelectorAll('[data-zh][data-en]');
    elements.forEach(el => {
        const text = el.getAttribute(`data-${currentLang}`);
        if (text) {
            el.innerHTML = text;
        }
    });
    
    // Update HTML lang attribute
    document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';
}

// Typewriter Effect
function initTypewriter() {
    const subtitleEl = document.querySelector('#typewriter .subtitle-text');
    if (!subtitleEl) return;
    
    const text = subtitleEl.getAttribute(`data-${currentLang}`);
    subtitleEl.innerHTML = '';
    
    let i = 0;
    const cursor = document.createElement('span');
    cursor.className = 'cursor';
    cursor.innerHTML = '|';
    subtitleEl.appendChild(cursor);
    
    function type() {
        if (i < text.length) {
            subtitleEl.insertBefore(document.createTextNode(text.charAt(i)), cursor);
            i++;
            setTimeout(type, 50);
        }
    }
    
    setTimeout(type, 500);
}

// Smooth Scroll
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const navHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = target.offsetTop - navHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Navigation Highlight
function initNavHighlight() {
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-links a');
    
    window.addEventListener('scroll', () => {
        let current = '';
        const navHeight = document.querySelector('.navbar').offsetHeight;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - navHeight - 100;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// Toggle branch papers visibility - supports infinite mutual exclusion
function toggleBranch(branchId) {
    const allPaperGroups = document.querySelectorAll('.paper-group');
    const allSvgNodes = document.querySelectorAll('.svg-node');
    const clickedPaperGroup = document.getElementById(`papers-${branchId}`);
    const clickedSvgNode = allSvgNodes[branchId - 1]; // 0-indexed
    
    // If clicking the same active branch, toggle it off
    if (activeBranch === branchId) {
        // Hide all
        allPaperGroups.forEach(group => group.classList.remove('active'));
        allSvgNodes.forEach(node => node.classList.remove('active'));
        activeBranch = null;
        return;
    }
    
    // Different branch clicked - hide all first, then show new one
    allPaperGroups.forEach(group => group.classList.remove('active'));
    allSvgNodes.forEach(node => node.classList.remove('active'));
    
    // Show clicked paper group and highlight node
    if (clickedPaperGroup) {
        clickedPaperGroup.classList.add('active');
    }
    if (clickedSvgNode) {
        clickedSvgNode.classList.add('active');
    }
    
    // Update active branch state
    activeBranch = branchId;
}

// Lightbox
function openLightbox(imgSrc) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    lightboxImg.src = imgSrc;
    lightbox.classList.add('active');
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.remove('active');
}

// Skills Color Toggle
function toggleSkillsColor(element) {
    element.classList.toggle('inverted');
    
    // Also invert the icon
    const iconImg = element.querySelector('.others-icon-direct');
    if (iconImg) {
        iconImg.style.filter = element.classList.contains('inverted') ? 'invert(1)' : '';
    }
}

// Close overlay/lightbox on outside click
document.addEventListener('click', function(e) {
    const lightbox = document.getElementById('lightbox');
    
    if (e.target === lightbox) {
        closeLightbox();
    }
});

// Close on Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeLightbox();
        // Also close any active branch
        const allPaperGroups = document.querySelectorAll('.paper-group');
        const allSvgNodes = document.querySelectorAll('.svg-node');
        allPaperGroups.forEach(group => group.classList.remove('active'));
        allSvgNodes.forEach(node => node.classList.remove('active'));
        activeBranch = null;
    }
});

// Scroll reveal animation
function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.section').forEach(section => {
        observer.observe(section);
    });
}

document.addEventListener('DOMContentLoaded', initScrollReveal);
