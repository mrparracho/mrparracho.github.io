// Main JavaScript for Portfolio Website
console.log('=== SCRIPT LOADED ===');

document.addEventListener('DOMContentLoaded', function() {
    console.log('=== DOM CONTENT LOADED ===');
    console.log('Initializing portfolio website...');
    

    
    // Initialize all functionality
    initLoadingScreen();
    initNavigation();
    initTypingEffect();
    initScrollAnimations();
    initSkillBars();
    
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
    initAIAssistant(); // Add this line
    
    console.log('=== ALL INITIALIZATION COMPLETE ===');
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
    
    // Navbar background on scroll
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(10, 10, 10, 0.98)';
        } else {
            navbar.style.background = 'rgba(10, 10, 10, 0.95)';
        }
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

// Scroll Animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.timeline-item, .skill-item, .project-card');
    animateElements.forEach(el => {
        el.classList.add('scroll-animate');
        observer.observe(el);
    });
}

// Skill Bars Animation
function initSkillBars() {
    const skillBars = document.querySelectorAll('.skill-progress');
    
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const level = entry.target.getAttribute('data-level');
                entry.target.style.width = level + '%';
                skillObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    skillBars.forEach(bar => {
        skillObserver.observe(bar);
    });
}

// Load Projects
async function loadProjects() {
    try {
        console.log('=== LOADING PROJECTS ===');
        
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
        
        console.log('=== PROJECTS LOADED SUCCESSFULLY ===');
        
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
    }
}

// Parallax Effect
function initParallax() {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.parallax');
        
        parallaxElements.forEach(element => {
            const speed = element.dataset.speed || 0.5;
            element.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });
}

// Smooth reveal animations
function revealOnScroll() {
    const reveals = document.querySelectorAll('.reveal');
    
    reveals.forEach(element => {
        const windowHeight = window.innerHeight;
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < windowHeight - elementVisible) {
            element.classList.add('active');
        }
    });
}

// Initialize additional features
window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', () => {
    initParallax();
    revealOnScroll();
});

// Utility function to debounce scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debouncing to scroll events
const debouncedRevealOnScroll = debounce(revealOnScroll, 10);
window.addEventListener('scroll', debouncedRevealOnScroll);

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
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        powerPreference: "high-performance"
    });
    
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    
    // Create cosmic sphere
    const sphereGeometry = new THREE.SphereGeometry(2, 64, 64);
    
    // Create custom shader material for the cosmic effect
    const sphereMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            resolution: { value: new THREE.Vector2(container.clientWidth, container.clientHeight) }
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
    
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    scene.add(sphere);
    
    // Add internal energy particles
    const particleCount = 100;
    const particles = new THREE.Group();
    
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
    
    scene.add(particles);
    
    // Add ambient and point lights
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(5, 5, 5);
    pointLight.castShadow = true;
    scene.add(pointLight);
    
    // Position camera
    camera.position.z = 5;
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        const time = Date.now() * 0.001;
        
        // Rotate sphere slowly
        sphere.rotation.y += 0.005;
        sphere.rotation.x += 0.002;
        
        // Animate particles
        particles.children.forEach((particle, index) => {
            particle.position.x += Math.sin(time + index) * 0.01;
            particle.position.y += Math.cos(time + index) * 0.01;
            particle.position.z += Math.sin(time + index * 0.5) * 0.01;
            
            // Keep particles within sphere bounds
            const distance = particle.position.length();
            if (distance > 1.8) {
                particle.position.normalize().multiplyScalar(1.8);
            }
        });
        
        // Update shader time uniform
        sphereMaterial.uniforms.time.value = time;
        
        renderer.render(scene, camera);
    }
    
    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
        sphereMaterial.uniforms.resolution.value.set(container.clientWidth, container.clientHeight);
    });
    
    // Start animation
    animate();
    
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
    
    // Click event handled by ElevenLabs integration
    // container.addEventListener('click', function() {
    //     // This is now handled by the ElevenLabs integration
    //     console.log('AI Sphere click handled by ElevenLabs integration');
    // });
}

// AI Assistant functionality with RAG integration
function initAIAssistant() {
    const startChatButton = document.getElementById('start-ai-chat');
    const modal = document.getElementById('rag-chat-modal');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalClose = document.getElementById('modal-close');
    const modalChatInput = document.getElementById('modal-chat-input');
    const modalSendButton = document.getElementById('modal-send-message');
    const modalChatMessages = document.getElementById('modal-chat-messages');
    

    
    let isStreaming = false;
    
    // Start AI chat from main section
    if (startChatButton) {
        startChatButton.addEventListener('click', () => {
            modal.classList.add('active');
            modalChatInput.focus();
        });
    }
    
    // Close modal when overlay or close button is clicked
    modalOverlay.addEventListener('click', closeModal);
    modalClose.addEventListener('click', closeModal);
    
    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
    
    function closeModal() {
        modal.classList.remove('active');
        modalChatInput.value = '';
    }
    

    

    
    // Modal send message functionality
    modalChatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendModalMessage();
        }
    });
    
    modalSendButton.addEventListener('click', sendModalMessage);
    
    async function sendModalMessage() {
        const message = modalChatInput.value.trim();
        if (!message || isStreaming) return;
        
        // Add user message to modal
        addModalMessage(message, 'user');
        modalChatInput.value = '';
        
        // Disable input during streaming
        isStreaming = true;
        modalChatInput.disabled = true;
        modalSendButton.disabled = true;
        
        // Add typing indicator
        addModalTypingIndicator();
        
        try {
            // Connect to your RAG API
            const response = await fetch('http://localhost:8001/ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question: message })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullResponse = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            
                            if (data.token) {
                                if (fullResponse === '') {
                                    removeModalTypingIndicator();
                                    addModalMessage('', 'assistant');
                                }
                                fullResponse += data.token;
                                const lastMessage = modalChatMessages.querySelector('.message.assistant:last-child .message-content');
                                if (lastMessage) {
                                    lastMessage.textContent = fullResponse;
                                }
                            } else if (data.text) {
                                // Final response
                                const lastMessage = modalChatMessages.querySelector('.message.assistant:last-child .message-content');
                                if (lastMessage) {
                                    lastMessage.textContent = data.text;
                                }
                            }
                        } catch (e) {
                            // Ignore parsing errors for incomplete chunks
                        }
                    }
                }
            }

        } catch (error) {
            console.error('Error:', error);
            removeModalTypingIndicator();
            addModalMessage(`Error: ${error.message}`, 'assistant');
        } finally {
            // Re-enable input
            isStreaming = false;
            modalChatInput.disabled = false;
            modalSendButton.disabled = false;
            modalChatInput.focus();
        }
    }
    
    function addModalMessage(content, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = content;
        
        messageDiv.appendChild(contentDiv);
        modalChatMessages.appendChild(messageDiv);
        modalChatMessages.scrollTop = modalChatMessages.scrollHeight;
    }
    
    function addModalTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message assistant';
        typingDiv.id = 'modal-typing-indicator';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = 'Miguel is thinking...';
        
        typingDiv.appendChild(contentDiv);
        modalChatMessages.appendChild(typingDiv);
        modalChatMessages.scrollTop = modalChatMessages.scrollHeight;
    }
    
    function removeModalTypingIndicator() {
        const typingIndicator = document.getElementById('modal-typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
}

// CSS for typing indicator
const typingCSS = `
.typing-dots {
    display: flex;
    gap: 4px;
    align-items: center;
    padding: 8px 0;
}

.typing-dots span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--primary);
    animation: typing 1.4s infinite ease-in-out;
}

.typing-dots span:nth-child(1) { animation-delay: 0s; }
.typing-dots span:nth-child(2) { animation-delay: 0.2s; }
.typing-dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing {
    0%, 60%, 100% {
        transform: translateY(0);
        opacity: 0.3;
    }
    30% {
        transform: translateY(-10px);
        opacity: 1;
    }
}
`;

// Add typing CSS to head
const style = document.createElement('style');
style.textContent = typingCSS;
document.head.appendChild(style);

// Add initAIAssistant to your main initialization function
document.addEventListener('DOMContentLoaded', function() {
    // ... existing code ...
    
    initAIAssistant(); // Add this line
});
