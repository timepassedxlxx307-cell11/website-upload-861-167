(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  function setupHeader() {
    var header = document.querySelector('[data-header]');
    var toggle = document.querySelector('[data-nav-toggle]');
    var menu = document.querySelector('[data-nav-menu]');

    function updateHeader() {
      if (!header) {
        return;
      }
      header.classList.toggle('is-scrolled', window.scrollY > 12);
    }

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });

    if (toggle && menu) {
      toggle.addEventListener('click', function () {
        var isOpen = menu.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', String(isOpen));
      });
    }
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupCardFilter() {
    var input = document.querySelector('[data-filter-input]');
    if (!input) {
      return;
    }

    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

    input.addEventListener('input', function () {
      var query = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var haystack = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.category
        ].join(' ').toLowerCase();
        card.hidden = query !== '' && haystack.indexOf(query) === -1;
      });
    });
  }

  function getQueryValue(name) {
    return new URLSearchParams(window.location.search).get(name) || '';
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderSearchCard(movie) {
    var tags = (movie.tags || []).slice(0, 4).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return '' +
      '<article class="movie-card" data-card>' +
      '  <a class="poster-link" href="' + escapeHtml(movie.url) + '" aria-label="观看' + escapeHtml(movie.title) + '">' +
      '    <span class="poster-frame">' +
      '      <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + ' 海报" loading="lazy" onerror="this.hidden=true;">' +
      '      <span class="poster-badge">' + escapeHtml(movie.category) + '</span>' +
      '      <span class="poster-play">▶</span>' +
      '    </span>' +
      '  </a>' +
      '  <div class="movie-card-body">' +
      '    <a class="movie-title" href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a>' +
      '    <div class="movie-meta">' +
      '      <span>' + escapeHtml(movie.year) + '</span>' +
      '      <span>' + escapeHtml(movie.region) + '</span>' +
      '      <span>' + escapeHtml(movie.type) + '</span>' +
      '    </div>' +
      '    <p>' + escapeHtml(movie.oneLine) + '</p>' +
      '    <div class="tag-list small">' + tags + '</div>' +
      '  </div>' +
      '</article>';
  }

  function setupSearchPage() {
    var form = document.querySelector('[data-search-form]');
    var results = document.querySelector('[data-search-results]');
    var queryInput = document.querySelector('[data-search-query]');
    var categorySelect = document.querySelector('[data-search-category]');
    var yearSelect = document.querySelector('[data-search-year]');
    var empty = document.querySelector('[data-empty-state]');

    if (!form || !results || !window.MOVIE_INDEX) {
      return;
    }

    var years = Array.prototype.slice.call(new Set(window.MOVIE_INDEX.map(function (movie) {
      return movie.year;
    }))).filter(Boolean).sort().reverse();

    years.forEach(function (year) {
      var option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      yearSelect.appendChild(option);
    });

    queryInput.value = getQueryValue('q');
    categorySelect.value = getQueryValue('category');
    yearSelect.value = getQueryValue('year');

    function matches(movie, query, category, year) {
      var haystack = [
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.category,
        (movie.tags || []).join(' '),
        movie.oneLine
      ].join(' ').toLowerCase();

      return (!query || haystack.indexOf(query) !== -1) &&
        (!category || movie.category === category) &&
        (!year || movie.year === year);
    }

    function render() {
      var query = queryInput.value.trim().toLowerCase();
      var category = categorySelect.value;
      var year = yearSelect.value;
      var matched = window.MOVIE_INDEX.filter(function (movie) {
        return matches(movie, query, category, year);
      }).slice(0, 120);

      results.innerHTML = matched.map(renderSearchCard).join('');
      if (empty) {
        empty.hidden = matched.length > 0;
      }
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      render();
    });

    queryInput.addEventListener('input', render);
    categorySelect.addEventListener('change', render);
    yearSelect.addEventListener('change', render);
    render();
  }

  ready(function () {
    setupHeader();
    setupHero();
    setupCardFilter();
    setupSearchPage();
  });
})();
