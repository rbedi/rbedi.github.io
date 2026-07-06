/* Auto table-of-contents for post pages.
   Progressive enhancement: builds a sidebar nav from the article's h2/h3
   headings and highlights the section currently being read. The nav is
   hidden by CSS on narrow screens, so with JS off (or on mobile) the post
   is completely unaffected.

   To give a heading a shorter TOC label than its full text, add a
   data-toc attribute, e.g. <h3 data-toc="Reason #1">Reason #1: ...</h3>. */
(function () {
  var prose = document.querySelector(".prose");
  if (!prose) return;

  // Collect headings, skipping the footnotes/"Notes" section.
  var headings = Array.prototype.filter.call(
    prose.querySelectorAll("h2, h3"),
    function (h) {
      return !h.closest(".footnotes");
    }
  );
  if (headings.length < 2) return; // not worth a TOC

  function slugify(s) {
    return (
      s
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 60) || "section"
    );
  }

  // Ensure every heading has a unique id to anchor to.
  var counts = {};
  headings.forEach(function (h) {
    if (h.id) return;
    var base = slugify(h.getAttribute("data-toc") || h.textContent);
    var id = base;
    while (counts[id] || document.getElementById(id)) {
      counts[base] = (counts[base] || 1) + 1;
      id = base + "-" + counts[base];
    }
    counts[id] = 1;
    h.id = id;
  });

  // Build the nav.
  var nav = document.createElement("nav");
  nav.className = "post-toc";
  nav.setAttribute("aria-label", "Table of contents");

  var title = document.createElement("div");
  title.className = "post-toc-title";
  title.textContent = "Contents";
  nav.appendChild(title);

  var ul = document.createElement("ul");
  var links = [];
  headings.forEach(function (h) {
    var li = document.createElement("li");
    li.className = "toc-" + h.tagName.toLowerCase();
    var a = document.createElement("a");
    a.href = "#" + h.id;
    a.textContent = h.getAttribute("data-toc") || h.textContent;
    li.appendChild(a);
    ul.appendChild(li);
    links.push({ heading: h, li: li });
  });
  nav.appendChild(ul);
  document.body.appendChild(nav);

  // Scroll-spy: highlight the last heading scrolled above a threshold.
  function setActive(activeLi) {
    for (var i = 0; i < links.length; i++) {
      links[i].li.classList.toggle("active", links[i].li === activeLi);
    }
  }

  var ticking = false;
  function update() {
    ticking = false;
    var offset = 120; // px from the top of the viewport
    var current = links[0];
    for (var i = 0; i < links.length; i++) {
      if (links[i].heading.getBoundingClientRect().top <= offset) {
        current = links[i];
      } else {
        break;
      }
    }
    setActive(current.li);
  }
  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  update();
})();
