// Solo Leveling Animation Library
class SoloLevelingEffects {
    constructor() {
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        this.createParticles();
        this.setupBackgroundEffects();
        this.createTextParticles();
        
        // Initialize text animations
        const congratsText = document.querySelector('.sl-congratulations');
        if (congratsText) {
            SoloLevelingEffects.animateTextReveal(congratsText);
        }
        
        this.initialized = true;
    }

    createParticles() {
        const container = document.querySelector('.sl-particles');
        if (!container) return;

        const createParticle = () => {
            const particle = document.createElement('div');
            particle.className = 'sl-particle';
            
            // Random properties
            const size = Math.random() * 4 + 1;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            
            // Animation
            const duration = Math.random() * 3 + 2;
            const delay = Math.random() * 2;
            
            particle.animate([
                {
                    transform: 'translate(0, 100vh) scale(0)',
                    opacity: 0
                },
                {
                    transform: 'translate(50px, 50vh) scale(1.5)',
                    opacity: 0.7,
                    offset: 0.5
                },
                {
                    transform: 'translate(100px, -100px) scale(0)',
                    opacity: 0
                }
            ], {
                duration: duration * 1000,
                delay: delay * 1000,
                easing: 'ease-out',
                iterations: Infinity
            });

            container.appendChild(particle);
        };

        // Create initial particles
        for (let i = 0; i < 50; i++) {
            createParticle();
        }

        // Continuously add new particles
        setInterval(() => {
            const particles = container.children;
            if (particles.length > 50) {
                particles[0].remove();
            }
            createParticle();
        }, 200);
    }

    setupBackgroundEffects() {
        const background = document.querySelector('.sl-background-image');
        if (!background) return;

        // Initial entrance animation
        this.createEntranceFlash();
        
        // Add power surge on load
        setTimeout(() => this.createPowerSurge(), 200);
    }

    createEntranceFlash() {
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            inset: 0;
            background: white;
            pointer-events: none;
            z-index: 100;
            animation: flashEffect 1s ease-out forwards;
        `;

        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 1000);
    }

    createPowerSurge() {
        const container = document.querySelector('.sl-background');
        if (!container) return;

        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'sl-power-particle';
            
            const angle = Math.random() * Math.PI * 2;
            const velocity = 10 + Math.random() * 20;
            
            particle.animate([
                {
                    transform: 'translate(-50%, -50%)',
                    opacity: 1
                },
                {
                    transform: `translate(
                        calc(-50% + ${Math.cos(angle) * velocity}vw),
                        calc(-50% + ${Math.sin(angle) * velocity}vh)
                    )`,
                    opacity: 0
                }
            ], {
                duration: 800 + Math.random() * 400,
                easing: 'ease-out'
            });

            container.appendChild(particle);
            setTimeout(() => particle.remove(), 1200);
        }
    }

    createTextParticles() {
        const congratsText = document.querySelector('.sl-congratulations');
        if (!congratsText) return;

        // Create particle container
        const particleContainer = document.createElement('div');
        particleContainer.className = 'sl-text-particles';
        congratsText.appendChild(particleContainer);

        // Create particles with delayed start
        setTimeout(() => {
            this.startTextParticles(particleContainer);
        }, 2000); // Start after text animation completes
    }

    startTextParticles(container) {
        const createParticle = () => {
            const particle = document.createElement('div');
            particle.className = 'sl-text-particle';
            
            // Random starting position at the bottom
            const startX = Math.random() * 100 - 50;
            const startY = 50; // Start from bottom
            const endX = startX + (Math.random() - 0.5) * 100;
            const endY = -50; // Float upwards
            
            particle.style.setProperty('--startX', `${startX}px`);
            particle.style.setProperty('--startY', `${startY}px`);
            particle.style.setProperty('--endX', `${endX}px`);
            particle.style.setProperty('--endY', `${endY}px`);
            
            container.appendChild(particle);
            
            // Remove particle after animation
            particle.addEventListener('animationend', () => particle.remove());
        };

        // Create initial particles
        for (let i = 0; i < 10; i++) {
            createParticle();
        }

        // Continuously create new particles
        setInterval(createParticle, 300);
    }

    addFloatingParticles(element, options = {}) {
        const {
            color = '#85acb9',
            size = 3,
            count = 20
        } = options;

        const container = document.createElement('div');
        container.style.cssText = `
            position: absolute;
            inset: -20px;
            pointer-events: none;
            overflow: hidden;
        `;
        element.style.position = 'relative';
        element.appendChild(container);

        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                background: ${color};
                width: ${size}px;
                height: ${size}px;
                border-radius: 50%;
                pointer-events: none;
            `;

            const startX = Math.random() * 100;
            const duration = 2 + Math.random() * 2;
            const delay = Math.random() * 2;

            particle.animate([
                {
                    transform: `translate(${startX}%, 120%)`,
                    opacity: 0
                },
                {
                    transform: `translate(${startX - 10 + Math.random() * 20}%, -20%)`,
                    opacity: 0.8,
                    offset: 0.5
                },
                {
                    transform: `translate(${startX - 20 + Math.random() * 40}%, -120%)`,
                    opacity: 0
                }
            ], {
                duration: duration * 1000,
                delay: delay * 1000,
                iterations: Infinity,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
            });

            container.appendChild(particle);
        }
    }

    static addTextGlowEffect(element) {
        if (!element) return;

        // Enhanced glow effect with multiple layers
        element.animate([
            {
                textShadow: `
                    0 0 5px #85acb9,
                    0 0 10px #85acb9,
                    0 0 20px #85acb9,
                    0 0 40px rgba(133, 172, 185, 0.5)
                `
            },
            {
                textShadow: `
                    0 0 10px #85acb9,
                    0 0 20px #85acb9,
                    0 0 40px #85acb9,
                    0 0 80px rgba(133, 172, 185, 0.8)
                `
            },
            {
                textShadow: `
                    0 0 5px #85acb9,
                    0 0 10px #85acb9,
                    0 0 20px #85acb9,
                    0 0 40px rgba(133, 172, 185, 0.5)
                `
            }
        ], {
            duration: 2000,
            iterations: Infinity,
            easing: 'ease-in-out'
        });

        // Add letter-by-letter animation for dramatic effect
        if (element.classList.contains('sl-congratulations')) {
            this.animateTextReveal(element);
        }
    }

    static animateTextReveal(element) {
        if (element.dataset.animated) return;
        element.dataset.animated = 'true';

        // Let CSS handle the animations for the text lines
        const lines = element.querySelectorAll('.sl-text-line');
        lines.forEach(line => {
            line.style.visibility = 'visible';
        });
    }
}

// Initialize effects when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const effects = new SoloLevelingEffects();
    effects.init();

    // Add glow effect to congratulations text if present
    const congratsText = document.querySelector('.sl-congratulations');
    if (congratsText) {
        SoloLevelingEffects.addTextGlowEffect(congratsText);
    }
});