(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "")
      .trim()
      .toLowerCase();
  }

  function bindMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
      toggle.classList.toggle("is-open");
    });
  }

  function bindHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(
      root.querySelectorAll("[data-hero-slide]"),
    );
    var dots = Array.prototype.slice.call(
      root.querySelectorAll("[data-hero-dot]"),
    );
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
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

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function bindFilters() {
    var input = document.querySelector("[data-filter-input]");
    var year = document.querySelector("[data-year-filter]");
    var list = document.querySelector("[data-filter-list]");
    if (!list) {
      return;
    }
    var cards = Array.prototype.slice.call(
      list.querySelectorAll(".searchable-card"),
    );

    function apply() {
      var query = normalize(input ? input.value : "");
      var selectedYear = year ? year.value : "";
      cards.forEach(function (card) {
        var text = normalize(
          (card.dataset.title || "") + " " + (card.dataset.meta || ""),
        );
        var matchesText = !query || text.indexOf(query) !== -1;
        var matchesYear = !selectedYear || text.indexOf(selectedYear) !== -1;
        card.hidden = !(matchesText && matchesYear);
      });
    }

    if (input) {
      input.addEventListener("input", apply);
    }
    if (year) {
      year.addEventListener("change", apply);
    }
  }

  function getQuery() {
    var params = new URLSearchParams(window.location.search);
    return params.get("q") || "";
  }

  function createCard(movie) {
    var tags = Array.isArray(movie.tags) ? movie.tags.slice(0, 3) : [];
    return [
      '<article class="movie-card searchable-card">',
      '<a class="poster-link" href="' +
        movie.url +
        '" aria-label="' +
        escapeHtml(movie.title) +
        '">',
      '<img src="' +
        movie.cover +
        '" alt="' +
        escapeHtml(movie.title) +
        '" loading="lazy" />',
      '<span class="year-badge">' + escapeHtml(movie.year) + "</span>",
      "</a>",
      '<div class="card-body">',
      '<h3><a href="' +
        movie.url +
        '">' +
        escapeHtml(movie.title) +
        "</a></h3>",
      "<p>" + escapeHtml(movie.oneLine || "") + "</p>",
      '<div class="meta-line"><span>' +
        escapeHtml(movie.region) +
        "</span><span>" +
        escapeHtml(movie.type) +
        "</span></div>",
      '<div class="tag-line">' +
        tags
          .map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
          })
          .join("") +
        "</div>",
      "</div>",
      "</article>",
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function bindSearchPage() {
    var results = document.querySelector("[data-search-results]");
    var title = document.querySelector("[data-search-title]");
    var input = document.querySelector("[data-search-input]");
    if (!results || !window.SITE_MOVIES) {
      return;
    }
    var query = getQuery();
    if (input) {
      input.value = query;
    }
    if (!query) {
      return;
    }
    var normalized = normalize(query);
    var matched = window.SITE_MOVIES.filter(function (movie) {
      var text = normalize(
        [
          movie.title,
          movie.year,
          movie.region,
          movie.type,
          movie.genre,
          movie.category,
          Array.isArray(movie.tags) ? movie.tags.join(" ") : "",
          movie.oneLine,
        ].join(" "),
      );
      return text.indexOf(normalized) !== -1;
    });
    if (title) {
      title.textContent = matched.length ? "搜索结果" : "未找到相关影片";
    }
    results.innerHTML = matched.slice(0, 120).map(createCard).join("");
  }

  ready(function () {
    bindMenu();
    bindHero();
    bindFilters();
    bindSearchPage();
  });
})();
