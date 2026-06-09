(function () {
  var form = document.querySelector('[data-search-page-form]');
  var input = document.querySelector('[data-search-page-input]');
  var results = document.querySelector('[data-search-results]');
  var title = document.querySelector('[data-search-title]');
  var subtitle = document.querySelector('[data-search-subtitle]');
  var index = window.movieIndex || [];

  if (!form || !input || !results) {
    return;
  }

  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get('q') || '';
  input.value = initialQuery;

  var createCard = function (movie) {
    var article = document.createElement('article');
    article.className = 'movie-card';

    var link = document.createElement('a');
    link.className = 'poster-wrap';
    link.href = movie.url;
    link.setAttribute('aria-label', movie.title + ' 在线观看');

    var img = document.createElement('img');
    img.src = movie.cover;
    img.alt = movie.title;
    img.loading = 'lazy';

    var shade = document.createElement('span');
    shade.className = 'poster-shade';

    var pill = document.createElement('span');
    pill.className = 'watch-pill';
    pill.textContent = '观看';

    link.appendChild(img);
    link.appendChild(shade);
    link.appendChild(pill);

    var body = document.createElement('div');
    body.className = 'movie-card-body';

    var meta = document.createElement('div');
    meta.className = 'movie-meta-line';
    [movie.year, movie.type, movie.region].forEach(function (item) {
      var span = document.createElement('span');
      span.textContent = item;
      meta.appendChild(span);
    });

    var h3 = document.createElement('h3');
    var titleLink = document.createElement('a');
    titleLink.href = movie.url;
    titleLink.textContent = movie.title;
    h3.appendChild(titleLink);

    var desc = document.createElement('p');
    desc.textContent = movie.oneLine;

    var tags = document.createElement('div');
    tags.className = 'card-tags';
    (movie.tags || []).slice(0, 3).forEach(function (item) {
      var span = document.createElement('span');
      span.textContent = item;
      tags.appendChild(span);
    });

    body.appendChild(meta);
    body.appendChild(h3);
    body.appendChild(desc);
    body.appendChild(tags);
    article.appendChild(link);
    article.appendChild(body);
    return article;
  };

  var render = function (query) {
    var keyword = query.trim().toLowerCase();
    results.innerHTML = '';

    var matches = index.filter(function (movie) {
      if (!keyword) {
        return true;
      }

      var haystack = [
        movie.title,
        movie.category,
        movie.genre,
        movie.year,
        movie.region,
        movie.type,
        (movie.tags || []).join(' '),
        movie.oneLine
      ].join(' ').toLowerCase();

      return haystack.indexOf(keyword) !== -1;
    }).slice(0, 80);

    if (title) {
      title.textContent = keyword ? '搜索结果' : '热门推荐';
    }

    if (subtitle) {
      subtitle.textContent = keyword ? '以下内容与当前关键词匹配。' : '输入关键词后将显示匹配的影视作品。';
    }

    if (!matches.length) {
      var empty = document.createElement('div');
      empty.className = 'empty-state is-visible';
      empty.textContent = '没有找到匹配内容';
      results.appendChild(empty);
      return;
    }

    matches.forEach(function (movie) {
      results.appendChild(createCard(movie));
    });
  };

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var query = input.value.trim();
    var url = query ? './search.html?q=' + encodeURIComponent(query) : './search.html';
    window.history.replaceState(null, '', url);
    render(query);
  });

  input.addEventListener('input', function () {
    render(input.value);
  });

  render(initialQuery);
})();
