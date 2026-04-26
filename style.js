

// ===== YEAR DROPDOWN =====
function initYearDropdown() {
    const dropdown = document.getElementById('year-dropdown');
    const yearMessage = document.getElementById('year-message');
    const featuredSection = document.getElementById('featured-award');
    const awardsSection = document.querySelector('.awards-section');

    if (!dropdown) return;

    dropdown.addEventListener('change', function () {
        const selectedYear = dropdown.value;

        if (selectedYear === '2025') {
            if (yearMessage) yearMessage.style.display = 'block';
            if (featuredSection) featuredSection.style.display = 'none';
            if (awardsSection) awardsSection.style.display = 'none';
        } else {
            if (yearMessage) yearMessage.style.display = 'none';
            if (featuredSection) featuredSection.style.display = '';
            if (awardsSection) awardsSection.style.display = '';
        }
    });
}

// ===== PRELOADER =====
$(document).ready(function () {
    // Start preloader fade-out after minimum display time
    setTimeout(function () {
        const preloader = document.getElementById('preloaded-intro');
        if (preloader) {
            preloader.style.opacity = '0';
            preloader.style.transition = 'opacity 400ms ease-out';
            setTimeout(function () {
                preloader.style.display = 'none';
            }, 400);
        }
    }, 1800);
});

// Also hide on window load (backup)
window.addEventListener('load', function () {
    const preloader = document.getElementById('preloaded-intro');
    if (preloader) {
        preloader.style.opacity = '0';
        preloader.style.transition = 'opacity 400ms ease-out';
        setTimeout(function () {
            preloader.style.display = 'none';
        }, 400);
    }
    // Load awards after everything is ready
    loadAwards();
    initYearDropdown();
    initViewCounter();
});

// ===== AWARDS DATA & RENDERING =====
async function loadAwards() {
    try {
        const awards = window.awardsData;
        if (!awards) {
            throw new Error('Failed to load awards data');
        }

        // Separate featured award from regular awards
        const featuredAward = awards.find(function (a) {
            return a.featured === true;
        });
        const regularAwards = awards.filter(function (a) {
            return !a.featured;
        });

        // Render featured award
        if (featuredAward) {
            renderFeaturedAward(featuredAward);
        }

        // Shuffle regular awards for random order on each refresh
        shuffleArray(regularAwards);

        // Render regular awards grid
        const grid = document.getElementById('awards-grid');
        if (grid) {
            regularAwards.forEach(function (award, index) {
                const card = createAwardCard(award, index);
                grid.appendChild(card);
            });
            
            // Initialize scroll animations after cards are rendered
            initScrollAnimations();
        }


    } catch (error) {
        console.error('Failed to load awards:', error);
        showErrorMessage();
    }
}

// ===== RENDER FEATURED AWARD =====
function renderFeaturedAward(award) {
    const container = document.getElementById('featured-award');
    if (!container) return;

    const profileUrl = award.link || '#';

    container.innerHTML =
        '<div class="featured-card sticker-rotate-1">' +
        '<span class="featured-badge">★ FEATURED ★</span>' +
        '<div class="featured-media">' +
        '<img src="' + award.gif + '" alt="' + escapeHtml(award.title) + ' Award" loading="eager">' +
        '</div>' +
        '<div class="featured-content">' +
        '<h2 class="featured-title">' + escapeHtml(award.title) + '</h2>' +
        '<p class="featured-desc">' + escapeHtml(award.description) + '</p>' +
        '<a href="' + profileUrl + '" target="_blank" rel="noopener noreferrer" class="neo-button">' +
        escapeHtml(award.name || 'VIEW PROFILE') + ' →' +
        '</a>' +
        '</div>' +
        '</div>';
}

// ===== CREATE AWARD CARD =====
function createAwardCard(award, index) {
    const card = document.createElement('div');
    card.className = 'award-card';
    card.setAttribute('role', 'article');
    card.setAttribute('aria-label', award.title);

    // Determine button type
    const discordIds = ['fan-fav-event', 'emoji', 'event-of-the-year', 'theme'];
    const duoIds = ['couple', 'lesbian-couple', 'buddies'];
    const isDiscordButton = discordIds.indexOf(award.id) !== -1;
    const isDuo = duoIds.indexOf(award.id) !== -1;

    // Build button HTML
    let buttonHtml = '';
    if (isDiscordButton) {
        const discordUrl = 'https://discord.com/invite/yessmartypie';
        buttonHtml = '<a href="' + discordUrl + '" target="_blank" rel="noopener noreferrer" class="neo-button">' +
            'JOIN DISCORD →' +
            '</a>';
    } else if (isDuo) {
        const profileUrl1 = award.link || '#';
        const profileUrl2 = award.link2 || '#';
        buttonHtml = '<div class="award-buttons">' +
            '<a href="' + profileUrl1 + '" target="_blank" rel="noopener noreferrer" class="neo-button-small">' +
            escapeHtml(award.name || 'PROFILE 1') + ' →' +
            '</a>' +
            '<a href="' + profileUrl2 + '" target="_blank" rel="noopener noreferrer" class="neo-button-small">' +
            escapeHtml(award.name2 || 'PROFILE 2') + ' →' +
            '</a>' +
            '</div>';
    } else {
        const profileUrl = award.link || '#';
        buttonHtml = '<a href="' + profileUrl + '" target="_blank" rel="noopener noreferrer" class="neo-button">' +
            escapeHtml(award.name || 'VIEW PROFILE') + ' →' +
            '</a>';
    }

    card.innerHTML =
        '<div class="award-media">' +
        '<img src="' + award.gif + '" alt="' + escapeHtml(award.title) + ' Award" loading="lazy">' +
        '</div>' +
        '<div class="award-content">' +
        '<h3 class="award-title">' + escapeHtml(award.title) + '</h3>' +
        '<p class="award-desc">' + escapeHtml(award.description) + '</p>' +
        buttonHtml +
        '</div>';

    // Confetti on hover with cooldown to prevent spam
    let confettiCooldown = false;
    card.addEventListener('mouseenter', function () {
        if (!confettiCooldown) {
            triggerConfetti(card);
            confettiCooldown = true;
            setTimeout(function () {
                confettiCooldown = false;
            }, 1200);
        }
    });

    // Click confetti (for mobile/touch)
    card.addEventListener('click', function () {
        if (!confettiCooldown) {
            triggerConfetti(card);
            confettiCooldown = true;
            setTimeout(function () {
                confettiCooldown = false;
            }, 1200);
        }
    });

    return card;
}


// ===== CONFETTI EFFECT =====
function triggerConfetti(element) {
    if (typeof JSConfetti === 'undefined') return;

    const rect = element.getBoundingClientRect();
    const jsConfetti = new JSConfetti();

    // Position confetti to originate from the card center
    jsConfetti.addConfetti({
        confettiRadius: 5,
        confettiNumber: 80,
        confettiColors: ['#FF6B6B', '#FFD93D', '#C4B5FD', '#000000', '#FFFDF5', '#FFFFFF']
    });
}

// ===== ERROR HANDLING =====
function showErrorMessage() {
    const grid = document.getElementById('awards-grid');
    if (grid) {
        grid.innerHTML =
            '<div class="award-card" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">' +
            '<h3 style="font-size: 1.5rem; margin-bottom: 1rem;">⚠ AWARDS UNAVAILABLE</h3>' +
            '<p>Could not load awards data. Please refresh the page.</p>' +
            '</div>';
    }
}

// ===== SCROLL ANIMATIONS =====
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry, index) {
            if (entry.isIntersecting) {
                // Stagger animation for cards entering viewport together
                const delay = index * 100;
                setTimeout(function() {
                    entry.target.classList.add('is-visible');
                }, delay);
            }
        });
    }, observerOptions);

    // Observe all award cards
    document.querySelectorAll('.award-card').forEach(function(card) {
        observer.observe(card);
    });

    // Animate featured card
    const featuredCard = document.querySelector('.featured-card');
    if (featuredCard) {
        setTimeout(function() {
            featuredCard.classList.add('is-visible');
        }, 500);
    }
}

// ===== VIEW COUNTER =====
function initViewCounter() {
    const counterEl = document.getElementById('view-count');
    if (!counterEl) return;

    // Use countapi.xyz for a free global hit counter
    // Namespace and key are unique to this project
    fetch('https://api.countapi.xyz/hit/ysp-excellence-awards/visits')
        .then(function (response) {
            if (!response.ok) throw new Error('Counter API failed');
            return response.json();
        })
        .then(function (data) {
            if (data && typeof data.value === 'number') {
                counterEl.textContent = data.value.toLocaleString();
            }
        })
        .catch(function (error) {
            console.warn('View counter failed to load:', error);
            counterEl.textContent = 'N/A';
        });
}

// ===== UTILITY: SHUFFLE ARRAY =====
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

// ===== UTILITY: HTML ESCAPE =====
function escapeHtml(text) {

    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
