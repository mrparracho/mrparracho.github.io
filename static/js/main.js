// Main JavaScript for Portfolio Website

document.addEventListener('DOMContentLoaded', async function() {
    // Initialize all functionality
    initLoadingScreen();
    initNavigation();
    initTypingEffect();
        loadProjects();
    initContactForm();
    initParticles();
    await initAISphere();
    initSkillBars();
    initTalkButton();
});

// Loading Screen
function initLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }, 2000);
}

// Navigation
function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });
    
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 70;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Typing Effect
function initTypingEffect() {
    const typingText = document.getElementById('typing-text');
    const words = ['Tech Lead', 'Data & AI Engineer', 'AI Solutions Architect', 'Crypto Enthusiast', 'Python Developer'];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    
    function type() {
        const currentWord = words[wordIndex];
        
        if (isDeleting) {
            typingText.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typingText.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
        }
        
        let typeSpeed = 150;
        if (isDeleting) typeSpeed /= 2;
        
        if (!isDeleting && charIndex === currentWord.length) {
            typeSpeed = 2000;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            typeSpeed = 500;
        }
        
        setTimeout(type, typeSpeed);
    }
    
    setTimeout(type, 1000);
}

// Load Projects
async function loadProjects() {
    try {
        const projectsGrid = document.getElementById('projects-grid');
        if (!projectsGrid) return;
        
        const response = await fetch('projects.json?v=' + Date.now());
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        projectsGrid.innerHTML = '';
        
        data.projects.forEach((project, index) => {
            const projectCard = createProjectCard(project);
            projectsGrid.appendChild(projectCard);
        });
        
        if (data.projects.length === 1) {
            projectsGrid.classList.add('single-project');
        } else {
            projectsGrid.classList.remove('single-project');
        }
        
    } catch (error) {
        console.error('Error loading projects:', error);
        const projectsGrid = document.getElementById('projects-grid');
        if (projectsGrid) {
            projectsGrid.innerHTML = `
                <div class="error-message" style="color: red; padding: 20px; text-align: center;">
                    <h3>Error Loading Projects</h3>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }
}

// Create Project Card
function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card';
    
    const skillsHTML = project.skills.map(skill => 
        `<span class="project-skill">
            <i class="${skill.icon}"></i>
            <span>${skill.name}</span>
        </span>`
    ).join('');
    
    card.innerHTML = `
        <div class="project-image">
            <img src="${project.imageUrl}" alt="${project.title}" 
                 onerror="this.src='static/images/projects/placeholder.svg'">
        </div>
        <div class="project-content">
            <h3 class="project-title">${project.title}</h3>
            <p class="project-description">${project.description}</p>
            <div class="project-skills">${skillsHTML}</div>
            <div class="project-links">
                <a href="${project.repoUrl}" class="project-link primary" target="_blank">
                    <i class="fab fa-github"></i>
                    View Code
                </a>
            </div>
        </div>
    `;
    
    return card;
}

// Contact Form
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(contactForm);
            const name = formData.get('name');
            const email = formData.get('email');
            const message = formData.get('message');
            
            if (!name || !email || !message) {
                showNotification('Please fill in all fields.', 'error');
                return;
            }
            
            if (!isValidEmail(email)) {
                showNotification('Please enter a valid email address.', 'error');
                return;
            }
            
            showNotification('Thank you for your message! I\'ll get back to you soon.', 'success');
            contactForm.reset();
        });
    }
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--error)' : 'var(--primary)'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: var(--border-radius-sm);
        box-shadow: var(--shadow);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease-out;
        max-width: 400px;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    });
    
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);
}

// Particles Background
function initParticles() {
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            particles: {
                number: { value: 80, density: { enable: true, value_area: 800 } },
                color: { value: '#00a8ff' },
                shape: { type: 'circle', stroke: { width: 0, color: '#000000' } },
                opacity: { value: 0.5, random: false, anim: { enable: false, speed: 1, opacity_min: 0.1, sync: false } },
                size: { value: 3, random: true, anim: { enable: false, speed: 40, size_min: 0.1, sync: false } },
                line_linked: { enable: true, distance: 150, color: '#00a8ff', opacity: 0.4, width: 1 },
                move: { enable: true, speed: 6, direction: 'none', random: false, straight: false, out_mode: 'out', bounce: false }
            },
            interactivity: {
                detect_on: 'canvas',
                events: {
                    onhover: { enable: true, mode: 'repulse' },
                    onclick: { enable: true, mode: 'push' },
                    resize: true
                },
                modes: {
                    grab: { distance: 400, line_linked: { opacity: 1 } },
                    bubble: { distance: 400, size: 40, duration: 2, opacity: 8, speed: 3 },
                    repulse: { distance: 200, duration: 0.4 },
                    push: { particles_nb: 4 },
                    remove: { particles_nb: 2 }
                }
            },
            retina_detect: true
        });
        
        // Initialize other particle sections
        const sectionConfig = {
            particles: {
                number: { value: 70, density: { enable: true, value_area: 800 } },
                color: { value: '#00a8ff' },
                shape: { type: 'circle', stroke: { width: 0, color: '#000000' } },
                opacity: { value: 0.4, random: false, anim: { enable: false, speed: 1, opacity_min: 0.1, sync: false } },
                size: { value: 3, random: true, anim: { enable: false, speed: 40, size_min: 0.1, sync: false } },
                line_linked: { enable: true, distance: 140, color: '#00a8ff', opacity: 0.3, width: 1 },
                move: { enable: true, speed: 1, direction: 'none', random: false, straight: false, out_mode: 'out', bounce: false }
            },
            interactivity: {
                detect_on: 'canvas',
                events: {
                    onhover: { enable: true, mode: 'grab' },
                    onclick: { enable: true, mode: 'push' },
                    resize: true
                },
                modes: {
                    grab: { distance: 140, line_linked: { opacity: 0.5 } },
                    push: { particles_nb: 3 }
                }
            },
            retina_detect: true
        };

        particlesJS('ai-particles', sectionConfig);
        particlesJS('projects-particles', sectionConfig);
        particlesJS('skills-particles', sectionConfig);
    }
}

// Skill Bars Animation
function initSkillBars() {
    const skillBars = document.querySelectorAll('.skill-progress');
    skillBars.forEach(bar => {
        const level = bar.getAttribute('data-level');
        if (level) {
            bar.style.setProperty('--skill-level', level + '%');
        }
    });
}

// AI Sphere with Three.js
async function initAISphere() {
    const container = document.getElementById('threejs-container');
    if (!container) return;
    
    try {
        const THREE = await import('three');
        const sphere = new TexturedSphere(container, THREE);
        window.aiSphere = sphere;
        
        window.sphereAnimationController = {
            setState: function(state) {
                sphere.setState(state);
            },
            getState: function() { return sphere.state; },
            setListening: function() { this.setState('listening'); },
            setThinking: function() { this.setState('thinking'); },
            setSpeaking: function() { this.setState('speaking'); },
            setResponding: function() { this.setState('speaking'); },
            setIdle: function() { this.setState('idle'); }
            };
    } catch (error) {
        console.error('Failed to load Three.js:', error);
    }
}

// TexturedSphere class (simplified)
class TexturedSphere {
    constructor(container, THREE) {
        this.container = container;
        this.THREE = THREE;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.sphere = null;
        this.material = null;
        this.texture = null;
        this.time = 0;
        this.state = 'idle';
        this.energy = 0;
        this.isAnimating = false;
        
        this.init();
    }
    
    async init() {
        this.setupScene();
        await this.createRadialTexture();
        this.createSphere();
        this.setupLighting();
        this.startAnimation();
    }
    
    setupScene() {
        this.scene = new this.THREE.Scene();
        this.camera = new this.THREE.PerspectiveCamera(75, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);
        this.camera.position.z = 4;
        
        this.renderer = new this.THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 0);
        
        this.container.appendChild(this.renderer.domElement);
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    async createRadialTexture() {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 512;
            const ctx = canvas.getContext('2d');
            
            const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
            gradient.addColorStop(0, '#ffffff');
            gradient.addColorStop(0.1, '#e8f4fd');
            gradient.addColorStop(0.3, '#90caf9');
            gradient.addColorStop(0.5, '#42a5f5');
            gradient.addColorStop(0.7, '#1e88e5');
            gradient.addColorStop(0.9, '#1565c0');
            gradient.addColorStop(1, '#073279');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 512, 512);
            
            this.texture = new this.THREE.CanvasTexture(canvas);
            this.texture.wrapS = this.THREE.RepeatWrapping;
            this.texture.wrapT = this.THREE.RepeatWrapping;
            
            resolve(this.texture);
        });
    }
    
    createSphere() {
        const geometry = new this.THREE.SphereGeometry(2, 64, 64);
        
        this.material = new this.THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
                texture1: { value: this.texture },
                energy: { value: 0 },
                state: { value: 0 },
                thinkingProgress: { value: 0 },
                resolution: { value: new this.THREE.Vector2(512, 512) }
        },
        vertexShader: `
                uniform float time;
                uniform float energy;
            varying vec2 vUv;
                varying vec3 vPosition;
                varying vec3 vNormal;
            
            void main() {
                vUv = uv;
                    vPosition = position;
                    vNormal = normal;
                    
                    vec3 pos = position;
                    float breathe = sin(time * 0.5) * 0.02;
                    float energyPulse = energy * 0.1 * sin(time * 2.0);
                    pos += normal * (breathe + energyPulse);
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
                uniform sampler2D texture1;
                uniform float energy;
                uniform float state;
            varying vec2 vUv;
                varying vec3 vPosition;
                varying vec3 vNormal;
            
            void main() {
                    vec2 animatedUv = vUv;
                    animatedUv.x += sin(time * 0.3 + vPosition.y * 2.0) * 0.015;
                    animatedUv.y += cos(time * 0.25 + vPosition.x * 2.0) * 0.015;
                    
                    vec4 texColor = texture2D(texture1, animatedUv);
                    
                    float glow = energy * (sin(time * 2.5) * 0.5 + 0.5);
                    texColor.rgb += texColor.rgb * glow * 0.4;
                    
                    if (state == 1.0) {
                        float scanLine = sin(vPosition.y * 8.0 + time * 4.0) * 0.5 + 0.5;
                        vec3 scanColor = vec3(0.2, 0.7, 1.0) * scanLine;
                        texColor.rgb += scanColor * 0.25;
                    }
                    else if (state == 2.0) {
                        float angle = atan(vPosition.x, vPosition.z) / (2.0 * 3.14159) + 0.5;
                        float progressGlow = smoothstep(0.0, 1.0, angle);
                        vec3 thinkColor = vec3(0.4, 1.0, 0.6) * progressGlow;
                        texColor.rgb += thinkColor * 0.4;
                    }
                    else if (state == 3.0) {
                        float pulse = sin(time * 5.0) * 0.5 + 0.5;
                        texColor.rgb += texColor.rgb * pulse * 0.3;
                    }
                    
                    vec3 viewDirection = normalize(cameraPosition - vPosition);
                    float fresnel = pow(1.0 - abs(dot(vNormal, viewDirection)), 1.8);
                    vec3 rimColor = vec3(1.0, 0.9, 0.8);
                    texColor.rgb += fresnel * rimColor * 0.35;
                    
                    gl_FragColor = vec4(texColor.rgb, texColor.a);
            }
        `,
        transparent: true,
        side: this.THREE.DoubleSide
    });
    
        this.sphere = new this.THREE.Mesh(geometry, this.material);
        this.scene.add(this.sphere);
    }
    
    setupLighting() {
        const ambientLight = new this.THREE.AmbientLight(0x4a90e2, 0.4);
        this.scene.add(ambientLight);
        
        const keyLight = new this.THREE.DirectionalLight(0xffffff, 1.2);
        keyLight.position.set(3, 4, 5);
        this.scene.add(keyLight);
        
        const fillLight = new this.THREE.DirectionalLight(0xadd8e6, 0.5);
        fillLight.position.set(-3, 2, -2);
        this.scene.add(fillLight);
    }
    
    setState(state) {
        const stateMap = { 'idle': 0, 'listening': 1, 'thinking': 2, 'speaking': 3, 'error': 4 };
        this.state = state;
        if (this.material.uniforms) {
            this.material.uniforms.state.value = stateMap[state] || 0;
        }
        
        switch (state) {
            case 'speaking': this.setEnergy(0.8); break;
            case 'listening': this.setEnergy(0.4); break;
            case 'thinking': this.setEnergy(0.6); break;
            case 'error': this.setEnergy(0.3); break;
            default: this.setEnergy(0.1);
        }
    }
    
    setEnergy(value) {
        this.energy = Math.max(0, Math.min(1, value));
        if (this.material.uniforms) {
            this.material.uniforms.energy.value = this.energy;
        }
    }
    
    startAnimation() {
        this.isAnimating = true;
        this.animate();
    }
    
    animate() {
        if (!this.isAnimating) return;
        
        requestAnimationFrame(() => this.animate());
        
        this.time += 0.016;
        
        if (this.sphere) {
            this.sphere.rotation.y += 0.008;
            this.sphere.position.y = Math.sin(this.time * 0.8) * 0.05;
            
            if (this.material.uniforms) {
                this.material.uniforms.time.value = this.time;
            }
        }
        
        this.renderer.render(this.scene, this.camera);
    }
    
    onWindowResize() {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }
}

// Talk Button - Simple and Clean
function initTalkButton() {
    const talkButton = document.getElementById('talk-button');
    if (!talkButton) return;
    
    let hasPlayedWelcome = false;
    let isRecording = false;
    let isProcessing = false;
    
    // Simple functions
    function unlockButton() {
        talkButton.disabled = false;
        talkButton.classList.remove('listening', 'processing');
        talkButton.querySelector('i').className = 'fas fa-microphone';
        
        // Force reset all processing states
        isProcessing = false;
        isRecording = false;
    }
    

    
    function lockButton() {
        talkButton.disabled = true;
    }
    
    // Ensure button starts unlocked and states are reset
    unlockButton();
    

    

    
        // Welcome message function
    async function playWelcomeMessage() {
        const welcomeText = "Hi, Miguel here! Yes, it's amazing that now I can answer your questions 24/7. What would you like to know? Click and hold to speak to me.";
        
        lockButton();
        talkButton.classList.add('processing');
        
        // Update status to show welcome message
        const statusText = document.querySelector('.status-text');
        if (statusText) {
            statusText.textContent = 'Playing welcome message...';
        }
        
            if (window.sphereAnimationController) {
                window.sphereAnimationController.setResponding();
            }
            
            if (window.elevenLabsAI && window.elevenLabsAI.elevenLabsApiKey) {
                await window.elevenLabsAI.textToSpeech(welcomeText);
        }
    }
    
    // Mouse events
    talkButton.addEventListener('mousedown', async (e) => {
        e.preventDefault();
        if (isProcessing) {
            return;
        }
        
        if (!hasPlayedWelcome) {
            hasPlayedWelcome = true;
            await playWelcomeMessage();
        } else if (!isRecording) {
            isRecording = true;
            talkButton.classList.add('listening');
            
            // Update status to show listening
            const statusText = document.querySelector('.status-text');
            if (statusText) {
                statusText.textContent = 'Listening...';
            }
            
            if (window.elevenLabsAI) {
                await window.elevenLabsAI.startRecording();
            }
        }
    });
    
    talkButton.addEventListener('mouseup', async (e) => {
        e.preventDefault();
        if (isRecording && hasPlayedWelcome) {
            isRecording = false;
            isProcessing = true;
            
            talkButton.classList.remove('listening');
            talkButton.classList.add('processing');
            lockButton();
            
            // Update status to show processing
            const statusText = document.querySelector('.status-text');
            if (statusText) {
                statusText.textContent = 'Processing question...';
            }
            
            if (window.sphereAnimationController) {
                window.sphereAnimationController.setThinking();
            }
            
            if (window.elevenLabsAI) {
                await window.elevenLabsAI.stopRecording();
            }
        }
    });
    
    talkButton.addEventListener('mouseleave', async (e) => {
        if (isRecording && hasPlayedWelcome) {
            isRecording = false;
            isProcessing = true;
            
            talkButton.classList.remove('listening');
            talkButton.classList.add('processing');
            lockButton();
            
            // Update status to show processing
            const statusText = document.querySelector('.status-text');
            if (statusText) {
                statusText.textContent = 'Processing question...';
            }
            
            if (window.sphereAnimationController) {
                window.sphereAnimationController.setThinking();
            }
            
            if (window.elevenLabsAI) {
                await window.elevenLabsAI.stopRecording();
            }
        }
    });
    
    // Touch events
    talkButton.addEventListener('touchstart', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isProcessing) {
            return;
        }
        
        if (!hasPlayedWelcome) {
            hasPlayedWelcome = true;
            await playWelcomeMessage();
        } else if (!isRecording) {
            isRecording = true;
            talkButton.classList.add('listening');
            
            // Update status to show listening
            const statusText = document.querySelector('.status-text');
            if (statusText) {
                statusText.textContent = 'Listening...';
            }
            
            if (window.elevenLabsAI) {
                await window.elevenLabsAI.startRecording();
            }
        }
    });
    
    talkButton.addEventListener('touchend', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isRecording && hasPlayedWelcome) {
            isRecording = false;
            isProcessing = true;
            
            talkButton.classList.remove('listening');
            talkButton.classList.add('processing');
            lockButton();
            
            // Update status to show processing
            const statusText = document.querySelector('.status-text');
            if (statusText) {
                statusText.textContent = 'Processing question...';
            }
            
            if (window.sphereAnimationController) {
                window.sphereAnimationController.setThinking();
            }
            
            if (window.elevenLabsAI) {
                await window.elevenLabsAI.stopRecording();
            }
        }
    });
    
    // Audio completion handling
    if (window.elevenLabsAI) {
        // Store the original function
        const originalOnAudioComplete = window.elevenLabsAI.onAudioComplete;
        
        // Override the original function
        window.elevenLabsAI.onAudioComplete = function() {
            // Reset all states
            isProcessing = false;
            isRecording = false;
            
            // Call the original function first
            if (originalOnAudioComplete) {
                originalOnAudioComplete.call(this);
            }
            
            // Then ensure our state is correct
                setTimeout(() => {
                if (isProcessing || isRecording) {
                    isProcessing = false;
                    isRecording = false;
                }
            }, 100);
        };
        
        // Also listen to the global event as backup
        document.addEventListener('audioCompleted', (event) => {
            // Force reset states immediately
            isProcessing = false;
            isRecording = false;
            
            // Update status to show ready
            const statusText = document.querySelector('.status-text');
            if (statusText) {
                statusText.textContent = 'Ready to chat';
            }
            
            // Also ensure button is unlocked
            unlockButton();
        });
    } else {
        // Retry after a delay
        setTimeout(() => {
            if (window.elevenLabsAI) {
                const originalOnAudioComplete = window.elevenLabsAI.onAudioComplete;
                window.elevenLabsAI.onAudioComplete = function() {
                    isProcessing = false;
                    isRecording = false;
                    
                    if (originalOnAudioComplete) {
                        originalOnAudioComplete.call(this);
                    }
                };
            }
        }, 1000);
    }
}
