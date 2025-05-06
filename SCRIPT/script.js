document.addEventListener('DOMContentLoaded', function() {
    const burger = document.querySelector('.burger');
    const nav = document.getElementById('navbar');
    const body = document.body;
    const overlay = document.querySelector('.menu-overlay');
    const mobileNavItems = document.querySelectorAll('.mobile-nav-item');

    // Burger menu toggle with overlay
    burger.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleMenu();
    });

    function toggleMenu() {
        burger.classList.toggle('active');
        nav.classList.toggle('active');
        
        // Only toggle overlay and no-scroll for mobile view
        if (window.innerWidth <= 768) {
            overlay.classList.toggle('active');
            body.classList.toggle('no-scroll');
        }
    }

    // Close menu when clicking overlay
    overlay.addEventListener('click', () => {
        toggleMenu();
    });

    // Modified navigation link handling - Exclude login buttons
    document.querySelectorAll('nav a:not(.login-btn), .mobile-nav-item').forEach(link => {
        link.addEventListener('click', function(e) {
            if (!this.classList.contains('login-btn')) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const target = document.querySelector(targetId);
                
                if (target) {
                    const headerHeight = document.querySelector('header').offsetHeight;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
                    const offsetPosition = targetPosition - headerHeight;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });

                    // Close mobile menu if open
                    if (window.innerWidth <= 768) {
                        burger.classList.remove('active');
                        nav.classList.remove('active');
                        overlay.classList.remove('active');
                        body.classList.remove('no-scroll');
                    }
                }
            }
        });
    });

    // Handle login button clicks separately
    document.querySelectorAll('.login-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            // Don't prevent default - allow normal link behavior
            if (window.innerWidth <= 768) {
                burger.classList.remove('active');
                nav.classList.remove('active');
                overlay.classList.remove('active');
                body.classList.remove('no-scroll');
            }
        });
    });

    // Active state for mobile navigation items
    function updateActiveSection() {
        const scrollPosition = window.scrollY;
        const sections = ['home', 'about', 'contact'];
        
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                const sectionTop = section.offsetTop - 100;
                const sectionBottom = sectionTop + section.offsetHeight;
                
                if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                    mobileNavItems.forEach(item => {
                        item.classList.remove('active');
                        if (item.getAttribute('href') === `#${sectionId}`) {
                            item.classList.add('active');
                        }
                    });
                }
            }
        });
    }

    // Update active section on scroll
    window.addEventListener('scroll', updateActiveSection);
    
    // Initial update of active section
    updateActiveSection();

    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            overlay.classList.remove('active');
            body.classList.remove('no-scroll');
        }
    });
});
