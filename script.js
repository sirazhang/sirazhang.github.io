// Global state
let currentLang = 'en';
let activeBranch = null;
let rotationAngle = 0;
let rotationInterval = null;

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    initTypewriter();
    initSmoothScroll();
    initNavHighlight();
    initResearchRotation();
    initEducationReveal();
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
    allSvgNodes.forEach(node => {
        node.classList.remove('active');
        node.setAttribute('r', '90'); // Reset size
    });
    
    // Show clicked paper group and highlight node
    if (clickedPaperGroup) {
        clickedPaperGroup.classList.add('active');
    }
    if (clickedSvgNode) {
        clickedSvgNode.classList.add('active');
        clickedSvgNode.setAttribute('r', '110'); // Enlarge active node
    }
    
    // Update active branch state
    activeBranch = branchId;
}

// Initialize research rotation animation
function initResearchRotation() {
    const orbitGroup = document.getElementById('orbitGroup');
    if (!orbitGroup) return;
    
    const centerX = 600;
    const centerY = 450;
    const radius = 350;
    const rotationSpeed = 0.1; // degrees per frame (调整为 0.1，约60秒转一圈)
    
    // 5 nodes starting positions (in degrees)
    const nodes = [
        { branch: 1, startAngle: 180, element: null }, // Vocabulary
        { branch: 2, startAngle: 252, element: null }, // Writing
        { branch: 3, startAngle: 324, element: null }, // Assessment
        { branch: 4, startAngle: 36, element: null },  // Curriculum
        { branch: 5, startAngle: 108, element: null }  // Review
    ];
    
    // Get node elements
    document.querySelectorAll('.orbit-node').forEach((node, index) => {
        nodes[index].element = node;
    });
    
    function updateRotation() {
        rotationAngle += rotationSpeed;
        if (rotationAngle >= 360) rotationAngle -= 360;
        
        // Update each node position and check if it's at the highlight position (left, 180°)
        nodes.forEach((node, index) => {
            const currentAngle = (node.startAngle + rotationAngle) % 360;
            const radians = (currentAngle * Math.PI) / 180;
            
            const x = centerX + radius * Math.cos(radians);
            const y = centerY + radius * Math.sin(radians);
            
            // Update position
            node.element.setAttribute('transform', `translate(${x}, ${y})`);
            
            // Get the circle element
            const circle = node.element.querySelector('.svg-node');
            
            // Check if node is near the left position (180° ± 10°)
            const isAtHighlight = (currentAngle >= 170 && currentAngle <= 190);
            
            if (isAtHighlight) {
                // Enlarge and highlight
                circle.setAttribute('r', '110');
                circle.setAttribute('fill', '#c41e3a');
                
                // Show corresponding paper group
                if (activeBranch !== node.branch) {
                    toggleBranch(node.branch);
                }
            } else {
                // Reset to normal
                if (activeBranch !== node.branch) {
                    circle.setAttribute('r', '90');
                    circle.setAttribute('fill', '#000000');
                }
            }
            
            // Text stays upright - no rotation needed
        });
        
        requestAnimationFrame(updateRotation);
    }
    
    // Start animation
    updateRotation();
}

// Pause rotation on hover (optional enhancement)
function pauseResearchRotation() {
    if (rotationInterval) {
        clearInterval(rotationInterval);
        rotationInterval = null;
    }
}

function resumeResearchRotation() {
    if (!rotationInterval) {
        initResearchRotation();
    }
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

// Reveal education cards/markers sequentially when section scrolls into view
function initEducationReveal() {
    const eduSection = document.querySelector('.education-section');
    if (!eduSection) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            } else {
                // Reset so the animation replays next time it scrolls into view
                entry.target.classList.remove('in-view');
            }
        });
    }, { threshold: 0.3 });

    observer.observe(eduSection);

    // Reveal contact/others cards when scrolled into view
    const contactSection = document.querySelector('.contact-section');
    if (contactSection) {
        const contactObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                } else {
                    entry.target.classList.remove('in-view');
                }
            });
        }, { threshold: 0.2 });

        contactObserver.observe(contactSection);
    }
}

// Copy to clipboard with visual feedback
function copyToClipboard(text, element) {
    const showCopied = () => {
        element.classList.add('copied');
        setTimeout(() => element.classList.remove('copied'), 1500);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(showCopied).catch(() => {
            fallbackCopy(text);
            showCopied();
        });
    } else {
        fallbackCopy(text);
        showCopied();
    }
}

function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
    } catch (err) {
        console.error('Copy failed', err);
    }
    document.body.removeChild(textarea);
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
