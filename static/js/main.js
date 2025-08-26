// Main JavaScript for Portfolio Website

document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing portfolio website...');
    

    
    // Initialize all functionality
    initLoadingScreen();
    initNavigation();
    initTypingEffect();
    
    // Test projects loading with a simple approach
    setTimeout(() => {
        console.log('Testing projects loading...');
        loadProjects();
    }, 1000);
    
    // Also try loading immediately
    console.log('Loading projects immediately...');
    loadProjects();
    
    initContactForm();
    initParticles();
    initAISphere();
    initSkillBars(); // Initialize skill progress bars
    initTalkButton(); // Add talk button functionality
    
    console.log('Portfolio website initialized successfully');
});

// Loading Screen
function initLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    
    // Hide loading screen after 2 seconds
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
    
    // Mobile menu toggle
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });
    
    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });
    
    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 70; // Account for fixed navbar
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
    const words = [ 'Tech Lead', 'Data & AI Engineer', 'AI Solutions Architect', 'Crypto Enthusiast', 'Python Developer'];
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
        
        if (isDeleting) {
            typeSpeed /= 2;
        }
        
        if (!isDeleting && charIndex === currentWord.length) {
            typeSpeed = 2000; // Pause at end
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            typeSpeed = 500; // Pause before next word
        }
        
        setTimeout(type, typeSpeed);
    }
    
    setTimeout(type, 1000);
}





// Load Projects
async function loadProjects() {
    try {
        console.log('Loading projects...');
        
        // Check if projects-grid element exists
        const projectsGrid = document.getElementById('projects-grid');
        if (!projectsGrid) {
            throw new Error('Projects grid element not found');
        }
        console.log('Projects grid found:', projectsGrid);
        
        // Fetch projects.json
        console.log('Fetching projects.json...');
        const response = await fetch('projects.json?v=' + Date.now());
        
        // Clear any existing projects first
        projectsGrid.innerHTML = '';
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Projects data loaded:', data);
        console.log('Number of projects:', data.projects.length);
        
        // Clear existing content (including the "Coming Soon" card)
        console.log('Clearing existing content...');
        projectsGrid.innerHTML = '';
        
        // Create and append project cards
        data.projects.forEach((project, index) => {
            console.log(`Creating project card ${index + 1}:`, project.title);
            const projectCard = createProjectCard(project);
            projectsGrid.appendChild(projectCard);
            console.log(`Project card ${index + 1} added to DOM`);
        });
        
        // Handle project layout classes
        if (data.projects.length === 1) {
            projectsGrid.classList.add('single-project');
        } else {
            projectsGrid.classList.remove('single-project');
        }
        
        console.log('Projects loaded successfully');
        
    } catch (error) {
        console.error('=== ERROR LOADING PROJECTS ===');
        console.error('Error details:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        // Fallback: show error message
        const projectsGrid = document.getElementById('projects-grid');
        if (projectsGrid) {
            projectsGrid.innerHTML = `
                <div class="error-message" style="color: red; padding: 20px; text-align: center;">
                    <h3>Error Loading Projects</h3>
                    <p>${error.message}</p>
                    <p>Please check the console for more details.</p>
                </div>
            `;
        }
    }
}

// Create Project Card
function createProjectCard(project) {
    console.log('Creating project card for:', project.title, 'with image:', project.imageUrl);
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
                 onload="console.log('Image loaded successfully:', '${project.title}')"
                 onerror="console.error('Image failed to load:', '${project.title}', 'URL:', '${project.imageUrl}'); this.src='static/images/projects/placeholder.svg'">
        </div>
        <div class="project-content">
            <h3 class="project-title">${project.title}</h3>
            <p class="project-description">${project.description}</p>
            <div class="project-skills">
                ${skillsHTML}
            </div>
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
            
            // Simple validation
            if (!name || !email || !message) {
                showNotification('Please fill in all fields.', 'error');
                return;
            }
            
            if (!isValidEmail(email)) {
                showNotification('Please enter a valid email address.', 'error');
                return;
            }
            
            // Simulate form submission (replace with actual form handling)
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
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
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
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    });
    
    // Auto-remove after 5 seconds
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
        // Initialize particles for hero section
        particlesJS('particles-js', {
            particles: {
                number: {
                    value: 80,
                    density: {
                        enable: true,
                        value_area: 800
                    }
                },
                color: {
                    value: '#00a8ff'
                },
                shape: {
                    type: 'circle',
                    stroke: {
                        width: 0,
                        color: '#000000'
                    }
                },
                opacity: {
                    value: 0.5,
                    random: false,
                    anim: {
                        enable: false,
                        speed: 1,
                        opacity_min: 0.1,
                        sync: false
                    }
                },
                size: {
                    value: 3,
                    random: true,
                    anim: {
                        enable: false,
                        speed: 40,
                        size_min: 0.1,
                        sync: false
                    }
                },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: '#00a8ff',
                    opacity: 0.4,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 6,
                    direction: 'none',
                    random: false,
                    straight: false,
                    out_mode: 'out',
                    bounce: false,
                    attract: {
                        enable: false,
                        rotateX: 600,
                        rotateY: 1200
                    }
                }
            },
            interactivity: {
                detect_on: 'canvas',
                events: {
                    onhover: {
                        enable: true,
                        mode: 'repulse'
                    },
                    onclick: {
                        enable: true,
                        mode: 'push'
                    },
                    resize: true
                },
                modes: {
                    grab: {
                        distance: 400,
                        line_linked: {
                            opacity: 1
                        }
                    },
                    bubble: {
                        distance: 400,
                        size: 40,
                        duration: 2,
                        opacity: 8,
                        speed: 3
                    },
                    repulse: {
                        distance: 200,
                        duration: 0.4
                    },
                    push: {
                        particles_nb: 4
                    },
                    remove: {
                        particles_nb: 2
                    }
                }
            },
            retina_detect: true
        });
        
        // Common particle configuration for sections
        const sectionParticleConfig = {
            particles: {
                number: {
                    value: 70,
                    density: {
                        enable: true,
                        value_area: 800
                    }
                },
                color: {
                    value: '#00a8ff'
                },
                shape: {
                    type: 'circle',
                    stroke: {
                        width: 0,
                        color: '#000000'
                    }
                },
                opacity: {
                    value: 0.4,
                    random: false,
                    anim: {
                        enable: false,
                        speed: 1,
                        opacity_min: 0.1,
                        sync: false
                    }
                },
                size: {
                    value: 3,
                    random: true,
                    anim: {
                        enable: false,
                        speed: 40,
                        size_min: 0.1,
                        sync: false
                    }
                },
                line_linked: {
                    enable: true,
                    distance: 140,
                    color: '#00a8ff',
                    opacity: 0.3,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 1,
                    direction: 'none',
                    random: false,
                    straight: false,
                    out_mode: 'out',
                    bounce: false,
                    attract: {
                        enable: false,
                        rotateX: 600,
                        rotateY: 1200
                    }
                }
            },
            interactivity: {
                detect_on: 'canvas',
                events: {
                    onhover: {
                        enable: true,
                        mode: 'grab'
                    },
                    onclick: {
                        enable: true,
                        mode: 'push'
                    },
                    resize: true
                },
                modes: {
                    grab: {
                        distance: 140,
                        line_linked: {
                            opacity: 0.5
                        }
                    },
                    push: {
                        particles_nb: 3
                    }
                }
            },
            retina_detect: true
        };

        // Initialize particles for AI Avatar section (more prominent)
        particlesJS('ai-particles', {
            particles: {
                number: {
                    value: 60,
                    density: {
                        enable: true,
                        value_area: 800
                    }
                },
                color: {
                    value: '#00a8ff'
                },
                shape: {
                    type: 'circle',
                    stroke: {
                        width: 0,
                        color: '#000000'
                    }
                },
                opacity: {
                    value: 0.3,
                    random: false,
                    anim: {
                        enable: false,
                        speed: 1,
                        opacity_min: 0.1,
                        sync: false
                    }
                },
                size: {
                    value: 2,
                    random: true,
                    anim: {
                        enable: false,
                        speed: 40,
                        size_min: 0.1,
                        sync: false
                    }
                },
                line_linked: {
                    enable: true,
                    distance: 120,
                    color: '#00a8ff',
                    opacity: 0.2,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 1,
                    direction: 'none',
                    random: false,
                    straight: false,
                    out_mode: 'out',
                    bounce: false,
                    attract: {
                        enable: false,
                        rotateX: 600,
                        rotateY: 1200
                    }
                }
            },
            interactivity: {
                detect_on: 'canvas',
                events: {
                    onhover: {
                        enable: true,
                        mode: 'grab'
                    },
                    onclick: {
                        enable: true,
                        mode: 'push'
                    },
                    resize: true
                },
                modes: {
                    grab: {
                        distance: 140,
                        line_linked: {
                            opacity: 0.5
                        }
                    },
                    push: {
                        particles_nb: 2
                    }
                }
            },
            retina_detect: true
        });

        // Initialize particles for Projects and Skills sections (forced identical configuration)
        const identicalConfig = {
            particles: {
                number: {
                    value: 70,
                    density: {
                        enable: true,
                        value_area: 800
                    }
                },
                color: {
                    value: '#00a8ff'
                },
                shape: {
                    type: 'circle',
                    stroke: {
                        width: 0,
                        color: '#000000'
                    }
                },
                opacity: {
                    value: 0.4,
                    random: false,
                    anim: {
                        enable: false,
                        speed: 1,
                        opacity_min: 0.1,
                        sync: false
                    }
                },
                size: {
                    value: 3,
                    random: true,
                    anim: {
                        enable: false,
                        speed: 40,
                        size_min: 0.1,
                        sync: false
                    }
                },
                line_linked: {
                    enable: true,
                    distance: 140,
                    color: '#00a8ff',
                    opacity: 0.3,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 1,
                    direction: 'none',
                    random: false,
                    straight: false,
                    out_mode: 'out',
                    bounce: false,
                    attract: {
                        enable: false,
                        rotateX: 600,
                        rotateY: 1200
                    }
                }
            },
            interactivity: {
                detect_on: 'canvas',
                events: {
                    onhover: {
                        enable: true,
                        mode: 'grab'
                    },
                    onclick: {
                        enable: true,
                        mode: 'push'
                    },
                    resize: true
                },
                modes: {
                    grab: {
                        distance: 140,
                        line_linked: {
                            opacity: 0.5
                        }
                    },
                    push: {
                        particles_nb: 3
                    }
                }
            },
            retina_detect: true
        };
        
        console.log('Initializing projects particles with forced identical config...');
        particlesJS('projects-particles', identicalConfig);
        
        console.log('Initializing skills particles with forced identical config...');
        particlesJS('skills-particles', identicalConfig);
    } else {
        console.log('Particles.js not loaded');
    }
}

// Skill Bars Animation
function initSkillBars() {
    const skillBars = document.querySelectorAll('.skill-progress');
    
    if (skillBars.length === 0) {
        console.log('No skill bars found');
        return;
    }
    
    console.log('Initializing skill bars...');
    
    skillBars.forEach(bar => {
        const level = bar.getAttribute('data-level');
        if (level) {
            // Set the CSS variable for the width
            bar.style.setProperty('--skill-level', level + '%');
            console.log(`Set skill bar to ${level}%`);
        }
    });
    
    console.log('✅ Skill bars initialized');
}





// Global variables for sphere animation
let sphereAnimationState = 'idle';
let sphereAnimationStartTime = 0;
let spherePulseIntensity = 0;
let sphereThinkingRotationSpeed = 1;
let sphereResponsePulseSpeed = 1;
let sphereScene, sphereCamera, sphereRenderer, sphere, sphereMaterial, particles;

// AI Sphere Interaction with Three.js
function initAISphere() {
    const container = document.getElementById('threejs-container');
    const sphereLabel = document.querySelector('.sphere-label');
    
    if (!container || !sphereLabel) return;
    
    // Set label color from CSS variable
    sphereLabel.style.color = getComputedStyle(document.documentElement).getPropertyValue('--accent');
    
    // Three.js setup
    if (typeof THREE === 'undefined') {
        console.error('Three.js not loaded');
        return;
    }
    
    sphereScene = new THREE.Scene();
    sphereCamera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    sphereRenderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        powerPreference: "high-performance"
    });
    
    sphereRenderer.setSize(container.clientWidth, container.clientHeight);
    sphereRenderer.setPixelRatio(window.devicePixelRatio);
    sphereRenderer.setClearColor(0x000000, 0);
    sphereRenderer.shadowMap.enabled = true;
    sphereRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(sphereRenderer.domElement);
    
    // Create cosmic sphere
    const sphereGeometry = new THREE.SphereGeometry(2, 64, 64);
    
    // Create custom shader material for the cosmic effect
    sphereMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            resolution: { value: new THREE.Vector2(container.clientWidth, container.clientHeight) },
            pulseIntensity: { value: 0 },
            stateColor: { value: new THREE.Color(0xffffff) }
        },
        vertexShader: `
            varying vec3 vNormal;
            varying vec3 vPosition;
            varying vec2 vUv;
            
            void main() {
                vNormal = normalize(normalMatrix * normal);
                vPosition = position;
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            uniform vec2 resolution;
            uniform float pulseIntensity;
            uniform vec3 stateColor;
            varying vec3 vNormal;
            varying vec3 vPosition;
            varying vec2 vUv;
            
            // Noise function
            float noise(vec3 p) {
                return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
            }
            
            // Smooth noise
            float smoothNoise(vec3 p) {
                vec3 i = floor(p);
                vec3 f = fract(p);
                f = f * f * (3.0 - 2.0 * f);
                
                float a = noise(i);
                float b = noise(i + vec3(1.0, 0.0, 0.0));
                float c = noise(i + vec3(0.0, 1.0, 0.0));
                float d = noise(i + vec3(1.0, 1.0, 0.0));
                float e = noise(i + vec3(0.0, 0.0, 1.0));
                float f1 = noise(i + vec3(1.0, 0.0, 1.0));
                float g = noise(i + vec3(0.0, 1.0, 1.0));
                float h = noise(i + vec3(1.0, 1.0, 1.0));
                
                return mix(mix(mix(a, b, f.x), mix(c, d, f.x), f.y), 
                          mix(mix(e, f1, f.x), mix(g, h, f.x), f.y), f.z);
            }
            
            void main() {
                vec3 normal = normalize(vNormal);
                vec3 viewDir = normalize(cameraPosition - vPosition);
                
                // Base cosmic colors
                vec3 blue = vec3(0.2, 0.6, 1.0);
                vec3 purple = vec3(0.6, 0.2, 1.0);
                vec3 orange = vec3(1.0, 0.6, 0.2);
                vec3 pink = vec3(1.0, 0.4, 0.8);
                
                // Create swirling cosmic energy
                float noise1 = smoothNoise(vPosition * 2.0 + time * 0.5);
                float noise2 = smoothNoise(vPosition * 3.0 - time * 0.3);
                float noise3 = smoothNoise(vPosition * 1.5 + time * 0.7);
                
                // Mix colors based on noise and position
                vec3 color1 = mix(blue, purple, noise1);
                vec3 color2 = mix(orange, pink, noise2);
                vec3 finalColor = mix(color1, color2, noise3);
                
                // Apply state color tint with dynamic intensity
                float colorIntensity = 0.4 + pulseIntensity * 0.3;
                finalColor = mix(finalColor, stateColor, colorIntensity);
                
                // Apply pulse intensity with glow effect
                finalColor *= (1.0 + pulseIntensity * 0.4);
                
                // Add state-dependent glow
                if (pulseIntensity > 0.5) {
                    finalColor += stateColor * pulseIntensity * 0.3;
                }
                
                // Add depth and translucency
                float fresnel = pow(1.0 - abs(dot(normal, viewDir)), 3.0);
                finalColor += fresnel * vec3(1.0, 1.0, 1.0) * 0.3;
                
                // Add internal glow
                float internalGlow = smoothNoise(vPosition * 3.0 + time * 0.2);
                finalColor += internalGlow * vec3(0.8, 0.4, 1.0) * 0.4;
                
                // Add rim lighting
                float rim = 1.0 - abs(dot(normal, viewDir));
                rim = pow(rim, 2.0);
                finalColor += rim * vec3(0.6, 0.8, 1.0) * 0.5;
                
                gl_FragColor = vec4(finalColor, 0.9);
            }
        `,
        transparent: true,
        side: THREE.DoubleSide
    });
    
    sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    sphereScene.add(sphere);
    
    // Add internal energy particles
    const particleCount = 100;
    particles = new THREE.Group();
    
    for (let i = 0; i < particleCount; i++) {
        const particleGeometry = new THREE.SphereGeometry(0.02, 8, 8);
        const particleMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color().setHSL(Math.random() * 0.3 + 0.6, 0.8, 0.6),
            transparent: true,
            opacity: 0.8
        });
        
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        particle.position.set(
            (Math.random() - 0.5) * 3.5,
            (Math.random() - 0.5) * 3.5,
            (Math.random() - 0.5) * 3.5
        );
        
        particles.add(particle);
    }
    
    sphereScene.add(particles);
    
    // Add ambient and point lights
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    sphereScene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(5, 5, 5);
    pointLight.castShadow = true;
    sphereScene.add(pointLight);
    
    // Position camera
    sphereCamera.position.z = 5;
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        const time = Date.now() * 0.001;
        const deltaTime = time - sphereAnimationStartTime;
        
        // Base rotation
        let baseRotationSpeed = 0.005;
        let baseParticleSpeed = 0.01;
        
        // Apply animation state effects
        switch (sphereAnimationState) {
            case 'listening':
                // Breathing effect with cyan/blue gradient
                spherePulseIntensity = Math.sin(time * 6) * 0.4 + 0.6;
                sphere.scale.setScalar(0.85 + spherePulseIntensity * 0.15);
                sphereMaterial.uniforms.pulseIntensity.value = spherePulseIntensity;
                sphereMaterial.uniforms.stateColor.value.setHex(0x06b6d4); // Cyan
                // Gentle floating motion
                sphere.position.y = Math.sin(time * 2) * 0.1;
                // Subtle rotation
                sphere.rotation.y += 0.003;
                sphere.rotation.x += 0.001;
                break;
                
            case 'thinking':
                // Intense spinning with purple/indigo gradient
                baseRotationSpeed *= 4;
                sphere.rotation.y += baseRotationSpeed * sphereThinkingRotationSpeed;
                sphere.rotation.x += baseRotationSpeed * 0.7 * sphereThinkingRotationSpeed;
                sphere.rotation.z += baseRotationSpeed * 0.3 * sphereThinkingRotationSpeed;
                sphereMaterial.uniforms.stateColor.value.setHex(0x7c3aed); // Purple
                // Pulsing scale
                sphere.scale.setScalar(0.9 + Math.sin(time * 10) * 0.1);
                // Wobble effect
                sphere.rotation.z = Math.sin(time * 6) * 0.15;
                // Particle intensity
                sphereMaterial.uniforms.pulseIntensity.value = Math.sin(time * 8) * 0.6 + 0.4;
                break;
                
            case 'responding':
                // Energetic pulsing with emerald/green gradient
                spherePulseIntensity = Math.sin(time * 15) * 0.7 + 0.3;
                sphere.scale.setScalar(0.8 + spherePulseIntensity * 0.2);
                sphereMaterial.uniforms.pulseIntensity.value = spherePulseIntensity;
                sphereMaterial.uniforms.stateColor.value.setHex(0x059669); // Emerald
                // Bouncing effect
                sphere.position.y = Math.sin(time * 8) * 0.15;
                // Rapid rotation
                sphere.rotation.y += 0.02;
                sphere.rotation.x += 0.01;
                // Faster particle movement
                baseParticleSpeed *= 3;
                break;
                
            default: // idle
                // Calm floating with warm gradient
                sphere.scale.setScalar(1);
                sphere.rotation.z = 0;
                sphere.position.y = Math.sin(time * 1.5) * 0.05;
                sphereMaterial.uniforms.pulseIntensity.value = Math.sin(time * 2) * 0.1;
                sphereMaterial.uniforms.stateColor.value.setHex(0xf59e0b); // Amber
                // Very slow rotation
                sphere.rotation.y += 0.001;
                sphere.rotation.x += 0.0005;
                break;
        }
        
        // Apply base rotation
        sphere.rotation.y += baseRotationSpeed;
        sphere.rotation.x += baseRotationSpeed * 0.4;
        
        // Animate particles with state-dependent effects
        particles.children.forEach((particle, index) => {
            let particleSpeed = baseParticleSpeed;
            let particleColor = particle.material.color;
            
            // State-dependent particle behavior
            switch (sphereAnimationState) {
                case 'listening':
                    // Gentle floating particles
                    particle.position.x += Math.sin(time * 0.5 + index) * particleSpeed * 0.5;
                    particle.position.y += Math.cos(time * 0.5 + index) * particleSpeed * 0.5;
                    particle.position.z += Math.sin(time * 0.3 + index * 0.5) * particleSpeed * 0.5;
                    particle.material.opacity = 0.7 + Math.sin(time * 2 + index) * 0.3;
                    particleColor.setHex(0x06b6d4); // Cyan
                    break;
                    
                case 'thinking':
                    // Chaotic, fast-moving particles
                    particle.position.x += Math.sin(time * 4 + index) * particleSpeed * 2;
                    particle.position.y += Math.cos(time * 4 + index) * particleSpeed * 2;
                    particle.position.z += Math.sin(time * 3 + index * 0.5) * particleSpeed * 2;
                    particle.material.opacity = 0.5 + Math.sin(time * 5 + index) * 0.5;
                    particleColor.setHex(0x7c3aed); // Purple
                    // Random size changes
                    particle.scale.setScalar(0.5 + Math.sin(time * 3 + index) * 0.5);
                    break;
                    
                case 'responding':
                    // Energetic, expanding particles
                    particle.position.x += Math.sin(time * 6 + index) * particleSpeed * 3;
                    particle.position.y += Math.cos(time * 6 + index) * particleSpeed * 3;
                    particle.position.z += Math.sin(time * 4 + index * 0.5) * particleSpeed * 3;
                    particle.material.opacity = 0.9 + Math.sin(time * 8 + index) * 0.1;
                    particleColor.setHex(0x059669); // Emerald
                    // Pulsing size
                    particle.scale.setScalar(0.8 + Math.sin(time * 4 + index) * 0.4);
                    break;
                    
                default: // idle
                    // Calm, slow-moving particles
                    particle.position.x += Math.sin(time + index) * particleSpeed * 0.3;
                    particle.position.y += Math.cos(time + index) * particleSpeed * 0.3;
                    particle.position.z += Math.sin(time + index * 0.5) * particleSpeed * 0.3;
                    particle.material.opacity = 0.6 + Math.sin(time * 1.5 + index) * 0.2;
                    particleColor.setHex(0xf59e0b); // Amber
                    particle.scale.setScalar(1);
                    break;
            }
            
            // Keep particles within sphere bounds
            const distance = particle.position.length();
            if (distance > 1.8) {
                particle.position.normalize().multiplyScalar(1.8);
            }
        });
        
        // Update shader time uniform
        sphereMaterial.uniforms.time.value = time;
        
        sphereRenderer.render(sphereScene, sphereCamera);
    }
    
    // Handle window resize
    window.addEventListener('resize', () => {
        sphereCamera.aspect = container.clientWidth / container.clientHeight;
        sphereCamera.updateProjectionMatrix();
        sphereRenderer.setSize(container.clientWidth, container.clientHeight);
        sphereMaterial.uniforms.resolution.value.set(container.clientWidth, container.clientHeight);
    });
    
    // Start animation
    animate();
    
    // Test animation after 3 seconds
    setTimeout(() => {
        console.log('🧪 Testing sphere animations...');
        if (window.sphereAnimationController) {
            console.log('✅ Animation controller found');
            window.sphereAnimationController.setListening();
            setTimeout(() => {
                window.sphereAnimationController.setThinking();
                setTimeout(() => {
                    window.sphereAnimationController.setResponding();
                    setTimeout(() => {
                        window.sphereAnimationController.setIdle();
                        console.log('✅ Animation test complete');
                    }, 2000);
                }, 2000);
            }, 2000);
        } else {
            console.error('❌ Animation controller not found');
        }
    }, 3000);
    
    // Make animation control functions globally accessible
    window.sphereAnimationController = {
        setState: function(state) {
            sphereAnimationState = state;
            sphereAnimationStartTime = Date.now() * 0.001;
            console.log('🎭 Sphere animation state changed to:', state, 'at time:', sphereAnimationStartTime);
        },
        
        getState: function() {
            return sphereAnimationState;
        },
        
        // Specific state setters
        setListening: function() {
            this.setState('listening');
        },
        
        setThinking: function() {
            this.setState('thinking');
        },
        
        setResponding: function() {
            this.setState('responding');
        },
        
        setIdle: function() {
            this.setState('idle');
        }
    };
    
    // Add interaction with click support
    let isMouseDown = false;
    let mouseX = 0;
    let mouseY = 0;
    let hasMoved = false;
    
    container.addEventListener('mousedown', (e) => {
        isMouseDown = true;
        hasMoved = false;
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    container.addEventListener('mousemove', (e) => {
        if (isMouseDown) {
            const deltaX = e.clientX - mouseX;
            const deltaY = e.clientY - mouseY;
            
            // Only rotate if mouse has moved significantly
            if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
                hasMoved = true;
                sphere.rotation.y += deltaX * 0.01;
                sphere.rotation.x += deltaY * 0.01;
                
                mouseX = e.clientX;
                mouseY = e.clientY;
            }
        }
    });
    
    container.addEventListener('mouseup', (e) => {
        // If mouse didn't move much, it's a click
        if (isMouseDown && !hasMoved) {
            console.log('🎯 Three.js sphere click detected');
            // Let the click event bubble up to our handlers
        }
        isMouseDown = false;
        hasMoved = false;
    });
    
    container.addEventListener('mouseleave', () => {
        isMouseDown = false;
        hasMoved = false;
    });
    

}





// Talk button functionality
function initTalkButton() {
    console.log('🔧 Initializing talk button functionality...');
    
    const talkButton = document.getElementById('talk-button');
    const aiAssistantSection = document.getElementById('ai-assistant');
    
    console.log('Talk button element:', talkButton);
    console.log('AI Assistant section:', aiAssistantSection);
    
    if (!talkButton || !aiAssistantSection) {
        console.log('❌ Talk button elements not found');
        return;
    }
    
    console.log('✅ Talk button elements found, setting up interaction...');
    
    let hasPlayedWelcome = false;
    let isRecording = false;
    
    async function playWelcomeMessage() {
        try {
            console.log('🎤 Playing welcome message...');
            
            // Update button to show it's processing
            talkButton.classList.add('thinking');
            talkButton.querySelector('.button-text').textContent = 'Playing welcome...';
            
            // Trigger sphere responding animation
            if (window.sphereAnimationController) {
                window.sphereAnimationController.setResponding();
            }
            
            // Welcome message text
            const welcomeText = "Hi, Miguel here! Yes, I know.. pretty cool that now I can answer your questions 24/7. What would you like to know? Click and hold to speak to me.";
            
            // Use ElevenLabs TTS to generate and play the welcome message
            if (window.elevenLabsAI && window.elevenLabsAI.elevenLabsApiKey) {
                // Generate and play the voice message
                await window.elevenLabsAI.textToSpeech(welcomeText);
                
                // After welcome message, change button to microphone
                setTimeout(() => {
                    talkButton.classList.remove('thinking');
                    talkButton.classList.add('ready');
                    talkButton.querySelector('i').className = 'fas fa-microphone';
                    talkButton.querySelector('.button-text').textContent = 'Click & hold to speak';
                    
                    // Reset sphere to idle
                    if (window.sphereAnimationController) {
                        window.sphereAnimationController.setIdle();
                    }
                }, 1000);
                
            } else {
                // Fallback if no API key
                talkButton.querySelector('.button-text').textContent = welcomeText;
                
                setTimeout(() => {
                    talkButton.classList.remove('thinking');
                    talkButton.classList.add('ready');
                    talkButton.querySelector('i').className = 'fas fa-microphone';
                    talkButton.querySelector('.button-text').textContent = 'Click & hold to speak';
                }, 3000);
            }
            
        } catch (error) {
            console.error('❌ Error playing welcome message:', error);
            
            // Fallback
            talkButton.classList.remove('thinking');
            talkButton.classList.add('ready');
            talkButton.querySelector('i').className = 'fas fa-microphone';
            talkButton.querySelector('.button-text').textContent = 'Click & hold to speak';
            
            if (window.sphereAnimationController) {
                window.sphereAnimationController.setIdle();
            }
        }
    }
    
    // Button press and hold handlers
    talkButton.addEventListener('mousedown', async (e) => {
        e.preventDefault();
        
        if (!hasPlayedWelcome) {
            // First press - play welcome message
            hasPlayedWelcome = true;
            await playWelcomeMessage();
        } else if (!isRecording) {
            // Start voice recording on press
            isRecording = true;
            
            // Update button to listening state
            talkButton.classList.add('listening');
            talkButton.querySelector('.button-text').textContent = 'Listening...';
            
            // Update status indicator
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
            // Stop voice recording on release
            isRecording = false;
            
            // Update button to thinking state
            talkButton.classList.remove('listening');
            talkButton.classList.add('thinking');
            talkButton.querySelector('.button-text').textContent = 'Processing...';
            
            // Update status indicator
            const statusText = document.querySelector('.status-text');
            if (statusText) {
                statusText.textContent = 'Processing...';
            }
            
            // Trigger sphere thinking animation
            if (window.sphereAnimationController) {
                window.sphereAnimationController.setThinking();
            }
            
            if (window.elevenLabsAI) {
                await window.elevenLabsAI.stopRecording();
            }
        }
    });
    
    // Handle mouse leave to stop recording if user moves away
    talkButton.addEventListener('mouseleave', async (e) => {
        if (isRecording && hasPlayedWelcome) {
            isRecording = false;
            
            // Update button to thinking state
            talkButton.classList.remove('listening');
            talkButton.classList.add('thinking');
            talkButton.querySelector('.button-text').textContent = 'Processing...';
            
            // Update status indicator
            const statusText = document.querySelector('.status-text');
            if (statusText) {
                statusText.textContent = 'Processing...';
            }
            
            // Trigger sphere thinking animation
            if (window.sphereAnimationController) {
                window.sphereAnimationController.setThinking();
            }
            
            if (window.elevenLabsAI) {
                await window.elevenLabsAI.stopRecording();
            }
        }
    });
    
    // Touch support for mobile devices
    talkButton.addEventListener('touchstart', async (e) => {
        e.preventDefault();
        
        if (!hasPlayedWelcome) {
            // First touch - play welcome message
            hasPlayedWelcome = true;
            await playWelcomeMessage();
        } else if (!isRecording) {
            // Start voice recording on touch
            isRecording = true;
            
            // Update button to listening state
            talkButton.classList.add('listening');
            talkButton.querySelector('.button-text').textContent = 'Listening...';
            
            if (window.elevenLabsAI) {
                await window.elevenLabsAI.startRecording();
            }
        }
    });
    
    talkButton.addEventListener('touchend', async (e) => {
        e.preventDefault();
        
        if (isRecording && hasPlayedWelcome) {
            // Stop voice recording on touch end
            isRecording = false;
            
            // Update button to thinking state
            talkButton.classList.remove('listening');
            talkButton.classList.add('thinking');
            talkButton.querySelector('.button-text').textContent = 'Processing...';
            
            // Update status indicator
            const statusText = document.querySelector('.status-text');
            if (statusText) {
                statusText.textContent = 'Processing...';
            }
            
            // Trigger sphere thinking animation
            if (window.sphereAnimationController) {
                window.sphereAnimationController.setThinking();
            }
            
            if (window.elevenLabsAI) {
                await window.elevenLabsAI.stopRecording();
            }
        }
    });
    
    // Add pulse animation to sphere label when section is visible
    function checkSectionVisibility() {
        const rect = aiAssistantSection.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        if (rect.top < windowHeight * 0.5 && rect.bottom > windowHeight * 0.5) {
            const sphereLabel = document.querySelector('.sphere-label');
            if (sphereLabel) {
                sphereLabel.classList.add('pulse');
                setTimeout(() => {
                    sphereLabel.classList.remove('pulse');
                }, 2000);
            }
        }
    }
    
    // Check on scroll
    window.addEventListener('scroll', checkSectionVisibility);
    
    // Check on page load
    setTimeout(checkSectionVisibility, 100);
    
    console.log('✅ Talk button functionality initialized');
}

// Note: initWelcomeMessage is now called in the main DOMContentLoaded listener
