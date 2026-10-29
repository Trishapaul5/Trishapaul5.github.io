
(function () {
  'use strict';

  /* ---------- Helpers ---------- */
  var root = document.documentElement;

  var $ = function (sel, scope) {
    return (scope || document).querySelector(sel);
  };

  var $$ = function (sel, scope) {
    return Array.prototype.slice.call(
      (scope || document).querySelectorAll(sel)
    );
  };

  var supportsIO = 'IntersectionObserver' in window;

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function observeOnce(elements, options, callback) {
    if (!supportsIO) {
      elements.forEach(function (el) {
        callback(el);
      });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          callback(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, options);

    elements.forEach(function (el) {
      io.observe(el);
    });
  }

  /* ---------- Theme ---------- */
  function initTheme() {
    var btn = $('#theme');

    function apply(theme) {
      root.setAttribute('data-theme', theme);

      if (btn) {
        btn.textContent =
          theme === 'dark' ? 'Light mode' : 'Dark mode';
      }
    }

    var savedTheme = null;

    try {
      savedTheme = localStorage.getItem('tp-theme');
    } catch (e) {}

    apply(
      savedTheme ||
      root.getAttribute('data-theme') ||
      'light'
    );

    if (!btn) return;

    btn.addEventListener('click', function () {
      var next =
        root.getAttribute('data-theme') === 'dark'
          ? 'light'
          : 'dark';

      apply(next);

      try {
        localStorage.setItem('tp-theme', next);
      } catch (e) {}
    });
  }

  /* ---------- Mobile menu ---------- */
  function initMenu() {
    var burger = $('#burger');
    var menu = $('#menu');

    if (!burger || !menu) return;

    function setOpen(open) {
      menu.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', String(open));
    }

    burger.addEventListener('click', function () {
      setOpen(!menu.classList.contains('open'));
    });

    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        setOpen(false);
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    });
  }

  /* ---------- Footer year ---------- */
  function initYear() {
    var el = $('#year');

    if (el) {
      el.textContent = new Date().getFullYear();
    }
  }

  /* ---------- Rotating role words ---------- */
  function initTyped() {
    var el = $('#typed');

    if (!el || reduceMotion) return;

    var words = [
      'SQL',
      'Python',
      'Excel',
      'Power BI',
      'Data Validation'
    ];

    var w = 0;
    var c = 0;
    var deleting = false;

    (function tick() {
      var word = words[w];

      el.textContent = word.slice(0, c);

      var wait = deleting ? 45 : 90;

      if (!deleting && c === word.length) {
        deleting = true;
        wait = 1400;
      } else if (deleting && c === 0) {
        deleting = false;
        w = (w + 1) % words.length;
        wait = 350;
      } else {
        c += deleting ? -1 : 1;
      }

      setTimeout(tick, wait);
    })();
  }

  /* ---------- Tabs (About section) ---------- */
  function initTabs() {
    var tabs = $$('.tab');

    if (!tabs.length) return;

    function select(tab) {
      tabs.forEach(function (t) {
        var on = t === tab;

        t.classList.toggle('on', on);
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;

        var panel = document.getElementById(
          t.getAttribute('aria-controls')
        );

        if (panel) {
          panel.hidden = !on;
        }
      });
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () {
        select(tab);
      });

      tab.addEventListener('keydown', function (e) {
        var target = null;

        if (e.key === 'ArrowRight') {
          target = tabs[(i + 1) % tabs.length];
        } else if (e.key === 'ArrowLeft') {
          target = tabs[
            (i - 1 + tabs.length) % tabs.length
          ];
        } else if (e.key === 'Home') {
          target = tabs[0];
        } else if (e.key === 'End') {
          target = tabs[tabs.length - 1];
        }

        if (target) {
          e.preventDefault();
          select(target);
          target.focus();
        }
      });
    });
  }

  /* ---------- Scroll reveal ---------- */
  function initReveal() {
    observeOnce(
      $$('.reveal'),
      { threshold: 0.12 },
      function (el) {
        el.classList.add('in');
      }
    );
  }

  /* ---------- Count-up numbers ---------- */
  function initCounters() {
    var format = function (n) {
      return n.toLocaleString('en-IN');
    };

    function run(el) {
      var end = parseInt(el.getAttribute('data-count'), 10);
      var suffix = el.getAttribute('data-suffix') || '';

      if (isNaN(end)) return;

      if (reduceMotion) {
        el.textContent = format(end) + suffix;
        return;
      }

      var start = null;
      var duration = 1200;

      function step(ts) {
        if (start === null) {
          start = ts;
        }

        var p = Math.min((ts - start) / duration, 1);

        el.textContent =
          format(Math.round(end * p)) +
          (p === 1 ? suffix : '');

        if (p < 1) {
          requestAnimationFrame(step);
        }
      }

      requestAnimationFrame(step);
    }

    observeOnce(
      $$('[data-count]'),
      { threshold: 0.5 },
      run
    );
  }

  /* ---------- Navigation scroll spy ---------- */
  function initScrollSpy() {
    var links = $$('.links a[href^="#"]');

    if (!links.length || !supportsIO) return;

    var byId = {};

    links.forEach(function (a) {
      byId[a.getAttribute('href').slice(1)] = a;
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = byId[entry.target.id];

        if (entry.isIntersecting && link) {
          links.forEach(function (a) {
            a.classList.remove('on');
          });

          link.classList.add('on');
        }
      });
    }, {
      rootMargin: '-45% 0px -50% 0px'
    });

    Object.keys(byId).forEach(function (id) {
      var section = document.getElementById(id);

      if (section) {
        io.observe(section);
      }
    });
  }

  /* ---------- Project filters ---------- */
  function initFilters() {
    var buttons = $$('.fbtn');
    var cards = $$('#plist .card');

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var filter = btn.getAttribute('data-filter');

        buttons.forEach(function (b) {
          b.classList.toggle('on', b === btn);
        });

        cards.forEach(function (card) {
          card.hidden = !(
            filter === 'all' ||
            card.getAttribute('data-cat') === filter
          );
        });
      });
    });
  }

  /* ---------- Contact form: Web3Forms ---------- */
  function initContactForm() {
    var form = $('#cform');

    if (!form) return;

    /*
      Web3Forms handles the form submission.
      Do not intercept submit with preventDefault().
      Do not redirect to a mailto: link.
    */

    form.setAttribute(
      'action',
      'https://api.web3forms.com/submit'
    );

    form.setAttribute('method', 'POST');

    // Ensure browser validation is enabled.
    form.removeAttribute('novalidate');
  }

  /* ---------- Start everything ---------- */
  root.classList.add('js');

  [
    initTheme,
    initMenu,
    initYear,
    initTyped,
    initTabs,
    initReveal,
    initCounters,
    initScrollSpy,
    initFilters,
    initContactForm
  ].forEach(function (fn) {
    fn();
  });

})();
