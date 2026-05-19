/*
========================================================================
   TALKING TOO MUCH - PREMIUM DEBATING PLATFORM MAIN JAVASCRIPT
   Handles: Scroll effects, search, live voting engine, interactive debates
========================================================================
*/

document.addEventListener('DOMContentLoaded', function() {
    
    // ==========================================
    // 1. STICKY GLASS NAVBAR ON SCROLL
    // ==========================================
    const navbar = document.querySelector('.navbar-premium');
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 20) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
        
        // Trigger once on load in case page starts scrolled
        if (window.scrollY > 20) {
            navbar.classList.add('scrolled');
        }
    }

    // ==========================================
    // 2. LIVE VOTING SYSTEM (PRO vs CON ENGINE)
    // ==========================================
    // Attach event listeners to debate cards and detail vote buttons
    const voteButtons = document.querySelectorAll('.btn-vote-pro, .btn-vote-con');
    
    voteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Prevent double-voting in the same session easily
            const card = this.closest('.glass-card') || this.closest('.debate-header-card') || document.body;
            const proBtn = card.querySelector('.btn-vote-pro');
            const conBtn = card.querySelector('.btn-vote-con');
            const sentimentBar = card.querySelector('.sentiment-bar');
            
            if (!sentimentBar) return;
            
            const proBar = sentimentBar.querySelector('.sentiment-pro');
            const conBar = sentimentBar.querySelector('.sentiment-con');
            const proLabel = card.querySelector('.sentiment-label span:first-child');
            const conLabel = card.querySelector('.sentiment-label span:last-child');
            
            // Current percentages (parse or default to 50%)
            let proPct = parseInt(proBar.style.width) || 50;
            let conPct = parseInt(conBar.style.width) || 50;
            
            // Check which button was clicked
            const isPro = this.classList.contains('btn-vote-pro');
            
            if (isPro) {
                if (proBtn.classList.contains('active')) {
                    // Undo vote
                    proBtn.classList.remove('active');
                    proPct -= 1;
                    conPct += 1;
                } else {
                    // Cast Pro vote
                    proBtn.classList.add('active');
                    if (conBtn.classList.contains('active')) {
                        conBtn.classList.remove('active');
                        conPct -= 1;
                    }
                    proPct += 1;
                    conPct -= 1;
                }
            } else {
                if (conBtn.classList.contains('active')) {
                    // Undo vote
                    conBtn.classList.remove('active');
                    conPct -= 1;
                    proPct += 1;
                } else {
                    // Cast Con vote
                    conBtn.classList.add('active');
                    if (proBtn.classList.contains('active')) {
                        proBtn.classList.remove('active');
                        proPct -= 1;
                    }
                    conPct += 1;
                    proPct -= 1;
                }
            }
            
            // Keep bounds and total to 100%
            proPct = Math.max(0, Math.min(100, proPct));
            conPct = 100 - proPct;
            
            // Update styling and width
            proBar.style.width = proPct + '%';
            conBar.style.width = conPct + '%';
            
            if (proLabel) proLabel.textContent = `PRO: ${proPct}%`;
            if (conLabel) conLabel.textContent = `CON: ${conPct}%`;
            
            // Add subtle ripple / success glow effect on click
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });

    // ==========================================
    // 3. SEARCH AND CATEGORY FILTERING (DEBATES PAGE)
    // ==========================================
    const debateSearchInput = document.getElementById('debateSearch');
    const categoryFilters = document.querySelectorAll('.category-filter-btn');
    const debateCards = document.querySelectorAll('.debate-search-item');
    
    let activeCategory = 'all';
    let searchQuery = '';

    function filterDebates() {
        if (!debateCards.length) return;
        
        debateCards.forEach(card => {
            const title = card.querySelector('.debate-title').textContent.toLowerCase();
            const desc = card.querySelector('.debate-desc').textContent.toLowerCase();
            const category = card.getAttribute('data-category').toLowerCase();
            
            const matchesSearch = title.includes(searchQuery) || desc.includes(searchQuery);
            const matchesCategory = activeCategory === 'all' || category === activeCategory;
            
            if (matchesSearch && matchesCategory) {
                card.style.display = '';
                card.classList.add('fade-in');
            } else {
                card.style.display = 'none';
            }
        });
    }

    if (debateSearchInput) {
        debateSearchInput.addEventListener('input', function(e) {
            searchQuery = e.target.value.toLowerCase();
            filterDebates();
        });
    }

    if (categoryFilters.length) {
        categoryFilters.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                categoryFilters.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                activeCategory = this.getAttribute('data-filter').toLowerCase();
                filterDebates();
            });
        });
    }

    // ==========================================
    // 4. ADD DYNAMIC ARGUMENT (DEBATES DETAILS PAGE)
    // ==========================================
    const argumentForm = document.getElementById('addArgumentForm');
    if (argumentForm) {
        argumentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const authorNameInput = document.getElementById('argAuthor');
            const sideSelect = document.getElementById('argSide');
            const textInput = document.getElementById('argText');
            
            const author = authorNameInput.value.trim() || 'Anonymous Debater';
            const side = sideSelect.value; // 'pro' or 'con'
            const text = textInput.value.trim();
            
            if (!text) {
                textInput.classList.add('is-invalid');
                return;
            } else {
                textInput.classList.remove('is-invalid');
            }
            
            // Build the argument node HTML
            const argContainer = side === 'pro' 
                ? document.getElementById('proArgumentsContainer')
                : document.getElementById('conArgumentsContainer');
                
            if (!argContainer) return;
            
            const initial = author.charAt(0).toUpperCase();
            const cardClass = side === 'pro' ? 'arg-pro' : 'arg-con';
            
            const argumentHtml = `
                <div class="argument-card ${cardClass} animate-fade-in" style="opacity: 0; transform: translateY(10px); transition: all 0.5s ease;">
                    <div class="arg-meta">
                        <div class="arg-author">
                            <div class="arg-author-avatar">${initial}</div>
                            <span>${author}</span>
                            <span class="badge bg-secondary ms-1 fs-xs" style="font-size: 0.65rem;">Just Now</span>
                        </div>
                        <div class="arg-upvotes text-muted">
                            <i class="bi bi-hand-thumbs-up-fill me-1"></i> <span class="vote-count">0</span>
                        </div>
                    </div>
                    <p class="mb-0 text-primary-dim text-justify" style="font-size: 0.95rem;">${text}</p>
                </div>
            `;
            
            // Prepend new argument card
            argContainer.insertAdjacentHTML('afterbegin', argumentHtml);
            
            // Trigger animation frame to apply styles
            const newCard = argContainer.firstElementChild;
            requestAnimationFrame(() => {
                newCard.style.opacity = '1';
                newCard.style.transform = 'translateY(0)';
            });
            
            // Bind upvote click event to the newly created element
            const upvoteBtn = newCard.querySelector('.arg-upvotes');
            upvoteBtn.addEventListener('click', function() {
                const countSpan = this.querySelector('.vote-count');
                let count = parseInt(countSpan.textContent);
                
                if (this.classList.contains('text-success') || this.classList.contains('text-danger')) {
                    count -= 1;
                    countSpan.textContent = count;
                    this.classList.remove('text-success', 'text-danger');
                } else {
                    count += 1;
                    countSpan.textContent = count;
                    this.classList.add(side === 'pro' ? 'text-success' : 'text-danger');
                }
            });
            
            // Reset input fields except author
            textInput.value = '';
            
            // Show custom premium toast or notice of successful submission
            showSuccessNotification("Argument submitted successfully to the " + side.toUpperCase() + " column!");
        });
    }

    // ==========================================
    // 5. MOCK NEWSLETTER SUBSCRIPTION
    // ==========================================
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            if (emailInput && emailInput.value.trim()) {
                showSuccessNotification("Success! Welcome to Talking Too Much newsletter.");
                emailInput.value = '';
            }
        });
    }

    // Interactive upvoting for preloaded argument nodes
    const upvotes = document.querySelectorAll('.arg-upvotes');
    upvotes.forEach(btn => {
        btn.addEventListener('click', function() {
            const countSpan = this.querySelector('.vote-count');
            let count = parseInt(countSpan.textContent);
            
            if (this.classList.contains('active-vote')) {
                count -= 1;
                countSpan.textContent = count;
                this.classList.remove('active-vote');
                this.style.color = '';
            } else {
                count += 1;
                countSpan.textContent = count;
                this.classList.add('active-vote');
                // Use debate column color
                const parent = this.closest('.argument-card');
                if (parent.classList.contains('arg-pro')) {
                    this.style.color = 'var(--pro-color)';
                } else {
                    this.style.color = 'var(--con-color)';
                }
            }
        });
    });

    // Custom alert indicator
    function showSuccessNotification(message) {
        // Check if old notification exists
        const oldNotify = document.querySelector('.premium-toast');
        if (oldNotify) oldNotify.remove();
        
        const notify = document.createElement('div');
        notify.className = 'premium-toast';
        notify.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: rgba(255, 255, 255, 0.98);
            border: 1px solid var(--brand-primary);
            color: var(--text-light);
            padding: 1rem 1.5rem;
            border-radius: 10px;
            box-shadow: var(--neon-shadow-strong);
            z-index: 9999;
            font-family: var(--font-body);
            font-size: 0.9rem;
            display: flex;
            align-items: center;
            gap: 10px;
            transform: translateY(100px);
            opacity: 0;
            transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        `;
        
        notify.innerHTML = `
            <i class="bi bi-check2-circle" style="color: var(--brand-primary); font-size: 1.25rem;"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notify);
        
        // Trigger animation
        requestAnimationFrame(() => {
            notify.style.transform = 'translateY(0)';
            notify.style.opacity = '1';
        });
        
        // Auto remove
        setTimeout(() => {
            notify.style.transform = 'translateY(100px)';
            notify.style.opacity = '0';
            setTimeout(() => notify.remove(), 500);
        }, 3500);
    }
});
