(function () {
  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var button = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      var open = panel.classList.toggle("open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
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
      slides.forEach(function (slide, position) {
        slide.classList.toggle("active", position === current);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle("active", position === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, position) {
      dot.addEventListener("click", function () {
        show(position);
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

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function normalize(text) {
    return String(text || "").toLowerCase().trim();
  }

  function initCatalogFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll(".catalog-filter"));
    inputs.forEach(function (input) {
      var section = input.closest("section") || document;
      var cards = Array.prototype.slice.call(section.querySelectorAll(".movie-card"));
      var chips = Array.prototype.slice.call(section.querySelectorAll(".filter-chip"));
      var activeType = "all";

      function apply() {
        var keyword = normalize(input.value);
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year")
          ].join(" "));
          var type = card.getAttribute("data-type") || "";
          var keywordPass = !keyword || haystack.indexOf(keyword) !== -1;
          var typePass = activeType === "all" || type === activeType;
          card.style.display = keywordPass && typePass ? "" : "none";
        });
      }

      input.addEventListener("input", apply);
      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          chips.forEach(function (item) {
            item.classList.remove("active");
          });
          chip.classList.add("active");
          activeType = chip.getAttribute("data-filter-value") || "all";
          apply();
        });
      });
    });
  }

  function initPlayer() {
    var shells = Array.prototype.slice.call(document.querySelectorAll(".video-shell"));
    shells.forEach(function (shell) {
      var video = shell.querySelector("video");
      var button = shell.querySelector(".player-start");
      var streamUrl = shell.getAttribute("data-stream");
      var prepared = false;

      function prepare() {
        if (prepared || !video || !streamUrl) {
          return;
        }
        prepared = true;
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
          video._hlsPlayer = hls;
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
        } else {
          video.src = streamUrl;
        }
      }

      function start() {
        prepare();
        shell.classList.add("playing");
        var result = video.play();
        if (result && typeof result.catch === "function") {
          result.catch(function () {});
        }
      }

      if (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          event.stopPropagation();
          start();
        });
      }

      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            start();
          }
        });
        video.addEventListener("play", function () {
          shell.classList.add("playing");
        });
        video.addEventListener("pause", function () {
          if (!video.currentTime) {
            shell.classList.remove("playing");
          }
        });
      }
    });
  }

  function renderSearchCard(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return [
      "<article class=\"movie-card\">",
      "<a class=\"card-link\" href=\"" + escapeHtml(item.url) + "\" aria-label=\"" + escapeHtml(item.title) + "\">",
      "<div class=\"card-cover\"><img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\"><span class=\"type-badge\">" + escapeHtml(item.type) + "</span></div>",
      "<div class=\"card-body\"><h3>" + escapeHtml(item.title) + "</h3><p>" + escapeHtml(item.oneLine) + "</p><div class=\"tag-row\">" + tags + "</div><div class=\"card-meta\"><span>" + escapeHtml(item.region) + "</span><span>" + escapeHtml(item.year) + "</span></div></div>",
      "</a>",
      "</article>"
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initSearchPage() {
    var form = document.getElementById("searchForm");
    var input = document.getElementById("searchInput");
    var results = document.getElementById("searchResults");
    var status = document.getElementById("searchStatus");
    if (!form || !input || !results || !status || !window.SEARCH_INDEX) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;

    function search(query) {
      var keyword = normalize(query);
      if (!keyword) {
        status.textContent = "输入关键词开始搜索";
        results.innerHTML = "";
        return;
      }
      var matched = window.SEARCH_INDEX.filter(function (item) {
        var haystack = normalize([
          item.title,
          item.region,
          item.type,
          item.year,
          item.genre,
          item.oneLine,
          item.summary,
          (item.tags || []).join(" ")
        ].join(" "));
        return haystack.indexOf(keyword) !== -1;
      }).slice(0, 120);
      status.textContent = matched.length ? "搜索结果" : "未找到相关内容";
      results.innerHTML = matched.map(renderSearchCard).join("");
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var query = input.value.trim();
      var url = query ? "search.html?q=" + encodeURIComponent(query) : "search.html";
      window.history.replaceState(null, "", url);
      search(query);
    });

    input.addEventListener("input", function () {
      search(input.value);
    });

    search(initial);
  }

  onReady(function () {
    initMenu();
    initHero();
    initCatalogFilters();
    initPlayer();
    initSearchPage();
  });
})();
