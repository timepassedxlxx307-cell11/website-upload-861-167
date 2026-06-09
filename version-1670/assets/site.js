function ready(callback) {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", callback);
        return;
    }

    callback();
}

ready(function() {
    const menuToggle = document.querySelector("[data-menu-toggle]");
    const mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener("click", function() {
            mobileNav.classList.toggle("is-open");
        });
    }

    const hero = document.querySelector("[data-hero]");

    if (hero) {
        const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
        let activeIndex = 0;

        function showSlide(index) {
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === activeIndex);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === activeIndex);
            });
        }

        dots.forEach(function(dot) {
            dot.addEventListener("click", function() {
                const index = Number(dot.getAttribute("data-hero-dot"));
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function() {
                showSlide(activeIndex + 1);
            }, 5200);
        }
    }

    const scopes = Array.from(document.querySelectorAll("[data-filter-scope]"));

    scopes.forEach(function(scope) {
        const inputs = Array.from(scope.querySelectorAll("[data-site-search]"));
        const buttons = Array.from(scope.querySelectorAll("[data-filter-button]"));
        const cards = Array.from(scope.querySelectorAll("[data-movie-card], .compact-card, .ranking-card"));
        let activeFilter = "";

        function getQuery() {
            const input = inputs[0];
            return input ? input.value.trim().toLowerCase() : "";
        }

        function cardText(card) {
            return [
                card.getAttribute("data-search") || "",
                card.getAttribute("data-genre") || "",
                card.getAttribute("data-type") || "",
                card.getAttribute("data-region") || "",
                card.textContent || ""
            ].join(" ").toLowerCase();
        }

        function applyFilter() {
            const query = getQuery();
            cards.forEach(function(card) {
                const text = cardText(card);
                const queryMatch = !query || text.includes(query);
                const filterMatch = !activeFilter || text.includes(activeFilter.toLowerCase());
                card.classList.toggle("is-hidden", !(queryMatch && filterMatch));
            });
        }

        inputs.forEach(function(input) {
            input.addEventListener("input", applyFilter);
        });

        buttons.forEach(function(button) {
            button.addEventListener("click", function() {
                activeFilter = button.getAttribute("data-filter-value") || "";
                buttons.forEach(function(item) {
                    item.classList.toggle("is-active", item === button);
                });
                applyFilter();
            });
        });
    });

    const urlQuery = new URLSearchParams(window.location.search).get("q");

    if (urlQuery) {
        document.querySelectorAll("[data-site-search]").forEach(function(input) {
            input.value = urlQuery;
            input.dispatchEvent(new Event("input", { bubbles: true }));
        });
    }
});
