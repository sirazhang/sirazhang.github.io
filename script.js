// ===== Sound: UI click effect =====
function playClick() {
    const s = document.getElementById('clickSound');
    if (!s) return;
    try {
        s.currentTime = 0;
        s.volume = 0.3;
        const p = s.play();
        if (p && p.catch) p.catch(() => {});
    } catch (e) { /* audio not ready yet */ }
}

// Play a soft click on interactive elements (delegated, covers nav links,
// CTA, DOI buttons, project links, copy pills, skill card, lang toggle)
document.addEventListener('click', function(e) {
    if (e.target.closest('a, button, .contact-copy, .svg-node, .others-card.skills-card, .paper-poster img')) {
        playClick();
    }
});

// ===== Sound: background music toggle =====
// Browsers block autoplay, so music only starts from this user gesture.
let musicPlaying = false;

function toggleMusic() {
    const bgm = document.getElementById('bgm');
    const btn = document.getElementById('musicToggle');
    if (!bgm || !btn) return;

    if (musicPlaying) {
        bgm.pause();
        btn.classList.remove('playing');
    } else {
        bgm.volume = 0.25;
        const p = bgm.play();
        if (p && p.catch) p.catch(() => {});
        btn.classList.add('playing');
    }
    musicPlaying = !musicPlaying;
}

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

// Switch visible paper group with a crossfade (old group fades out on top)
function toggleBranch(branchId) {
    if (activeBranch === branchId) return; // already showing this group

    const allPaperGroups = document.querySelectorAll('.paper-group');

    allPaperGroups.forEach(group => {
        if (group.classList.contains('active')) {
            group.classList.remove('active');
            group.classList.add('leaving');
            setTimeout(() => group.classList.remove('leaving'), 300);
        } else {
            group.classList.remove('leaving');
        }
    });

    const nextGroup = document.getElementById(`papers-${branchId}`);
    if (nextGroup) {
        nextGroup.classList.add('active');
    }

    activeBranch = branchId;
}

// Initialize research rotation animation
function initResearchRotation() {
    const orbitGroup = document.getElementById('orbitGroup');
    if (!orbitGroup) return;

    const centerX = 600;
    const centerY = 450;
    const radius = 350;
    const rotationSpeed = 0.1; // degrees per frame (~60s per revolution)
    const HIGHLIGHT_ANGLE = 180; // left position
    const FALLOFF = 35;          // degrees over which the highlight eases off
    const SWITCH_DIST = 12;      // degrees within which a node claims the papers

    let paused = false;

    // Pause rotation while the visitor reads / clicks the papers
    const displayArea = document.querySelector('.paper-display-area');
    if (displayArea) {
        displayArea.addEventListener('mouseenter', () => { paused = true; });
        displayArea.addEventListener('mouseleave', () => { paused = false; });
    }

    // 5 nodes starting positions (in degrees)
    const nodes = [
        { branch: 1, startAngle: 180, element: null }, // Vocabulary
        { branch: 2, startAngle: 252, element: null }, // Writing
        { branch: 3, startAngle: 324, element: null }, // Assessment
        { branch: 4, startAngle: 36, element: null },  // Curriculum
        { branch: 5, startAngle: 108, element: null }  // Review
    ];

    document.querySelectorAll('.orbit-node').forEach((node, index) => {
        nodes[index].element = node;
    });

    const BLACK = [0, 0, 0];
    const RED = [196, 30, 58]; // #c41e3a

    function lerpColor(c1, c2, t) {
        const r = Math.round(c1[0] + (c2[0] - c1[0]) * t);
        const g = Math.round(c1[1] + (c2[1] - c1[1]) * t);
        const b = Math.round(c1[2] + (c2[2] - c1[2]) * t);
        return `rgb(${r}, ${g}, ${b})`;
    }

    function angleDist(a, b) {
        return Math.abs(((a - b + 540) % 360) - 180);
    }

    function smoothstep(t) {
        return t * t * (3 - 2 * t);
    }

    function updateRotation() {
        if (!paused) {
            rotationAngle += rotationSpeed;
            if (rotationAngle >= 360) rotationAngle -= 360;
        }

        let bestNode = null;
        let bestDist = Infinity;

        nodes.forEach(node => {
            const currentAngle = (node.startAngle + rotationAngle) % 360;
            const radians = (currentAngle * Math.PI) / 180;
            const x = centerX + radius * Math.cos(radians);
            const y = centerY + radius * Math.sin(radians);
            node.element.setAttribute('transform', `translate(${x}, ${y})`);

            // Continuous highlight: radius & colour interpolate with angular
            // distance to the left position instead of snapping on/off
            const dist = angleDist(currentAngle, HIGHLIGHT_ANGLE);
            if (dist < bestDist) {
                bestDist = dist;
                bestNode = node;
            }

            const t = smoothstep(Math.max(0, 1 - dist / FALLOFF));
            const circle = node.element.querySelector('.svg-node');
            circle.setAttribute('r', (90 + 22 * t).toFixed(1));
            circle.setAttribute('fill', lerpColor(BLACK, RED, t));
        });

        // The closest node claims the paper list once it is well inside the
        // highlight zone; it keeps it until another node takes over (no flicker)
        if (bestNode && bestDist < SWITCH_DIST && activeBranch !== bestNode.branch) {
            toggleBranch(bestNode.branch);
        }

        requestAnimationFrame(updateRotation);
    }

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
                    // After the entrance stagger finishes, remove the delays so
                    // hover effects respond instantly (see .settled in CSS)
                    setTimeout(() => entry.target.classList.add('settled'), 1300);
                } else {
                    entry.target.classList.remove('in-view');
                    entry.target.classList.remove('settled');
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
