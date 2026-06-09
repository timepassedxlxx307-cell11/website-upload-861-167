(function () {
  const toggle = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-site-nav]");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  const slider = document.querySelector("[data-hero-slider]");

  if (slider) {
    const slides = Array.from(slider.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(slider.querySelectorAll("[data-hero-dot]"));
    let active = 0;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle("is-active", current === active);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle("is-active", current === active);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(active + 1);
      }, 5600);
    }
  }

  const searchInput = document.querySelector("[data-search-input]");
  const categoryFilter = document.querySelector("[data-filter-category]");
  const regionFilter = document.querySelector("[data-filter-region]");
  const yearFilter = document.querySelector("[data-filter-year]");
  const cards = Array.from(document.querySelectorAll("[data-movie-card]"));
  const emptyState = document.querySelector("[data-empty-state]");

  function valueOf(control) {
    return control ? control.value.trim() : "";
  }

  function matchesSelect(value, selected, allLabel) {
    return !selected || selected === allLabel || value === selected;
  }

  function filterCards() {
    if (!cards.length) {
      return;
    }

    const query = valueOf(searchInput).toLowerCase();
    const selectedCategory = valueOf(categoryFilter);
    const selectedRegion = valueOf(regionFilter);
    const selectedYear = valueOf(yearFilter);
    let visible = 0;

    cards.forEach(function (card) {
      const title = (card.dataset.title || "").toLowerCase();
      const tags = (card.dataset.tags || "").toLowerCase();
      const region = card.dataset.region || "";
      const year = card.dataset.year || "";
      const category = card.dataset.category || "";
      const haystack = [title, tags, region.toLowerCase(), year, category.toLowerCase()].join(" ");
      const passQuery = !query || haystack.includes(query);
      const passCategory = matchesSelect(category, selectedCategory, "全部分类");
      const passRegion = matchesSelect(region, selectedRegion, "全部地区");
      const passYear = matchesSelect(year, selectedYear, "全部年份");
      const pass = passQuery && passCategory && passRegion && passYear;

      card.hidden = !pass;

      if (pass) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.hidden = visible !== 0;
    }
  }

  [searchInput, categoryFilter, regionFilter, yearFilter].forEach(function (control) {
    if (control) {
      control.addEventListener("input", filterCards);
      control.addEventListener("change", filterCards);
    }
  });
})();
