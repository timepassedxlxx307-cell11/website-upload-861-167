(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    document.querySelectorAll("img").forEach(function (image) {
      image.addEventListener("error", function () {
        image.classList.add("is-missing");
      });
    });

    var toggle = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");
    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
          if (location.pathname.split("/").pop() !== "search.html") {
            location.href = "search.html";
          }
        }
      });
    });

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }

      function start() {
        clearInterval(timer);
        timer = setInterval(function () {
          show(current + 1);
        }, 5200);
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          show(index);
          start();
        });
      });
      if (prev) {
        prev.addEventListener("click", function () {
          show(current - 1);
          start();
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          show(current + 1);
          start();
        });
      }
      show(0);
      start();
    }

    var filterList = document.querySelector("[data-filter-list]");
    var searchInput = document.querySelector("[data-search-input]");
    var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter-chip]"));
    var params = new URLSearchParams(location.search);
    var activeCategory = "all";

    if (searchInput && params.get("q")) {
      searchInput.value = params.get("q");
    }

    function applyFilter() {
      if (!filterList) {
        return;
      }
      var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
      var cards = Array.prototype.slice.call(filterList.querySelectorAll(".movie-card"));
      cards.forEach(function (card) {
        var terms = card.getAttribute("data-terms") || "";
        var category = card.getAttribute("data-category") || "";
        var matchesText = !query || terms.indexOf(query) !== -1;
        var matchesCategory = activeCategory === "all" || category === activeCategory;
        card.classList.toggle("is-hidden", !(matchesText && matchesCategory));
      });
    }

    if (searchInput) {
      searchInput.addEventListener("input", applyFilter);
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        activeCategory = chip.getAttribute("data-filter-chip") || "all";
        chips.forEach(function (item) {
          item.classList.toggle("is-active", item === chip);
        });
        applyFilter();
      });
    });

    applyFilter();
  });
})();
