/* Wahid Wael portfolio. No framework; GSAP + ScrollTrigger + Lenis are loaded after first paint for the scroll work. */
(function () {
  "use strict";
  var d = document, root = d.documentElement, rtl = root.dir === "rtl";
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var base = ($("script[src$='app.js']").getAttribute("src") || "").replace(/app\.js$/, "");
  var lenis = null;

  /* ---------- mobile menu ---------- */
  var burger = $(".burger"), nav = $("#nav");
  function setMenu(open) {
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    burger.setAttribute("aria-label", open ? burger.dataset.close : burger.dataset.open);
    nav.classList.toggle("open", open);
    root.style.overflow = open ? "hidden" : "";
    if (lenis) open ? lenis.stop() : lenis.start();
    if (open) { var f = $("a", nav); f && f.focus(); }
  }
  burger.addEventListener("click", function () { setMenu(burger.getAttribute("aria-expanded") !== "true"); });
  nav.addEventListener("click", function (e) { if (e.target.closest("a") && nav.classList.contains("open")) setMenu(false); });
  d.addEventListener("keydown", function (e) { if (e.key === "Escape" && nav.classList.contains("open")) { setMenu(false); burger.focus(); } });

  /* ---------- header: solid after hero top, hides on scroll down ---------- */
  var hd = $("#hd"), lastY = 0, ticking = false;
  function onScroll() {
    var y = window.scrollY;
    hd.classList.toggle("solid", y > 40);
    hd.classList.toggle("away", y > 400 && y > lastY + 4 && !nav.classList.contains("open"));
    if (y < lastY - 4 || y < 400) hd.classList.remove("away");
    lastY = y; ticking = false;
  }
  addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
  hd.addEventListener("focusin", function () { hd.classList.remove("away"); });

  /* ---------- active section in nav ---------- */
  var links = $$(".nav ul a");
  if ("IntersectionObserver" in window) {
    var secIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.toggleAttribute("aria-current", a.getAttribute("href") === "#" + e.target.id); if (a.hasAttribute("aria-current")) a.setAttribute("aria-current", "true"); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    ["work", "experience", "toolbox", "contact"].forEach(function (id) { var s = d.getElementById(id); s && secIO.observe(s); });
  }

  /* ---------- copy email ---------- */
  var copy = $(".copy");
  if (copy) copy.addEventListener("click", function () {
    var txt = copy.dataset.copy, st = $("#copy-st"), lbl = $("span", copy), old = lbl.textContent;
    var done = function () { lbl.textContent = copy.dataset.done; st.textContent = copy.dataset.done; setTimeout(function () { lbl.textContent = old; st.textContent = ""; }, 2200); };
    if (navigator.clipboard) navigator.clipboard.writeText(txt).then(done, function () { location.href = "mailto:" + txt; });
    else location.href = "mailto:" + txt;
  });

  /* ---------- WhatsApp form: builds the message and opens WhatsApp ---------- */
  var waf = $("#waf");
  if (waf) waf.addEventListener("submit", function (e) {
    e.preventDefault();
    var f = waf.elements, err = $("#waf-err"), name = f.name.value.trim(), msg = f.msg.value.trim(), co = f.company.value.trim();
    f.name.setAttribute("aria-invalid", name ? "false" : "true");
    f.msg.setAttribute("aria-invalid", msg ? "false" : "true");
    if (!name || !msg) { err.textContent = waf.dataset.req; (name ? f.msg : f.name).focus(); return; }
    err.textContent = "";
    var type = (waf.querySelector("input[name=type]:checked") || {}).value || "";
    var text = waf.dataset.hi + "\n\n" + waf.dataset.lname + ": " + name + (co ? "\n" + waf.dataset.lco + ": " + co : "") + "\n" + waf.dataset.ltype + ": " + type + "\n\n" + msg;
    var url = "https://wa.me/" + waf.dataset.wa + "?text=" + encodeURIComponent(text);
    var w = window.open(url, "_blank", "noopener");
    if (!w) location.href = url;
  });

  /* ---------- project filter ---------- */
  var fbtns = $$(".filter button"), cards = $$(".card");
  fbtns.forEach(function (b) {
    b.addEventListener("click", function () {
      var f = b.dataset.f;
      fbtns.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      cards.forEach(function (c, i) {
        var show = f === "all" || c.dataset.t === f;
        c.hidden = !show;
        if (show && !reduce) { c.classList.remove("in"); c.style.setProperty("--d", (i % 6) * 0.05 + "s"); requestAnimationFrame(function () { requestAnimationFrame(function () { c.classList.add("in"); }); }); }
      });
    });
  });

  /* ---------- reveals ---------- */
  if (!reduce && "IntersectionObserver" in window) {
    var groups = [".sec-head .h2", ".more-head .h2", ".how-head .h2", ".exp-head .h2", ".certs-w .h2", ".lead", ".card", ".vals li", ".facts li", ".job", ".edu-l li", ".grp", ".certs li", ".ct-t", ".mail-row", ".ct-l li"];
    // clipped headings never intersect on their own, so they are watched through their parent
    var proxy = new Map();
    var rvIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        (proxy.get(e.target) || [e.target]).forEach(function (el) { el.classList.add("in"); });
        rvIO.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.01 });
    groups.forEach(function (sel) {
      $$(sel).forEach(function (el) {
        if (el.closest(".hero") || el.closest(".proj")) return;
        var sib = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
        el.classList.add("rv");
        el.style.setProperty("--d", Math.min(sib, 6) * 0.07 + "s");
        if (el.classList.contains("h2") || el.classList.contains("ct-t")) {
          var par = el.parentElement, list = proxy.get(par) || [];
          list.push(el); proxy.set(par, list); rvIO.observe(par);
        } else rvIO.observe(el);
      });
    });
  }

  /* ---------- load the scroll libraries after first paint ---------- */
  function load(src) {
    return new Promise(function (ok, no) { var s = d.createElement("script"); s.src = base + src; s.onload = ok; s.onerror = no; d.head.appendChild(s); });
  }
  function idle(fn) { ("requestIdleCallback" in window) ? requestIdleCallback(fn, { timeout: 1500 }) : setTimeout(fn, 300); }
  function boot() {
    if (reduce) return;
    load("gsap.min.js").then(function () { return Promise.all([load("ScrollTrigger.min.js"), load("lenis.min.js")]); }).then(start).catch(function () {});
  }
  /* ---------- hero wall of real project screenshots, added after the page has loaded ---------- */
  function wall() {
    var w = $(".wall"); if (!w) return;
    var list = w.dataset.list.split(","), cols = innerWidth < 721 ? 3 : 5, per = Math.ceil(list.length / cols), html = "";
    for (var c = 0; c < cols; c++) {
      var imgs = "";
      for (var k = 0; k < per; k++) { var n = list[(c * per + k) % list.length]; imgs += '<img src="' + w.dataset.src + n + '.webp" width="360" height="225" alt="" decoding="async">'; }
      html += '<div class="col">' + imgs + imgs + "</div>";
    }
    w.innerHTML = html;
    var first = $("img", w);
    var show = function () { requestAnimationFrame(function () { w.classList.add("on"); }); };
    first.complete ? show() : first.addEventListener("load", show);
  }
  function afterLoad() { idle(function () { wall(); boot(); }); }
  if (d.readyState === "complete") afterLoad(); else addEventListener("load", afterLoad);

  function start() {
    var gsap = window.gsap, ST = window.ScrollTrigger;
    gsap.registerPlugin(ST);
    lenis = new window.Lenis({ duration: 1.15, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }, wheelMultiplier: 1 });
    lenis.on("scroll", ST.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    root.classList.add("lenis");

    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href"); if (id.length < 2) { e.preventDefault(); lenis.scrollTo(0); return; }
        var t = $(id); if (!t) return;
        e.preventDefault();
        var off = id === "#top" ? 0 : -8, tries = 0;
        // sections below the fold are laid out lazily, so re-aim once they have real sizes
        var go = function (dur) { lenis.scrollTo(t, { offset: off, duration: dur, onComplete: function () { if (++tries < 4 && Math.abs(t.getBoundingClientRect().top + off) > 6) go(0.6); } }); };
        go(1.4);
        history.replaceState(null, "", id);
        setTimeout(function () { t.setAttribute("tabindex", "-1"); t.focus({ preventScroll: true }); }, 900);
      });
    });

    // hero: the two halves of the name pull apart, the portrait recedes, the wall speeds past
    var wide = matchMedia("(min-width: 721px)").matches, hs = { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.6 };
    if (wide) {
      gsap.to(".name .w1", { xPercent: rtl ? 28 : -28, ease: "none", scrollTrigger: hs });
      gsap.to(".name .w2", { xPercent: rtl ? -28 : 28, ease: "none", scrollTrigger: hs });
    }
    gsap.to(".portrait", { scale: 0.88, yPercent: 8, ease: "none", scrollTrigger: hs });
    gsap.to(".wall", { yPercent: -10, ease: "none", scrollTrigger: hs });
    gsap.to(".hfoot", { y: -40, opacity: 0, ease: "none", scrollTrigger: { trigger: ".hero", start: "20% top", end: "70% top", scrub: 0.6 } });

    idle(function () { theater(gsap, ST); ST.refresh(); });
  }

  /* ---------- the work theater ---------- */
  function theater(gsap, ST) {
    var stage = $("#stage"); if (!stage) return;
    var projs = $$(".proj", stage), n = projs.length, mm = gsap.matchMedia();

    // diagonal wipe that follows the slant of the W in the logo
    function wipe(dev, line, p) {
      if (p >= 1) { dev.style.clipPath = "none"; line.style.opacity = 0; return; }
      var top = 130 - p * 160, bot = top - 30;
      if (rtl) { top = 100 - top; bot = 100 - bot; }
      dev.style.clipPath = rtl
        ? "polygon(-5% -5%, " + top + "% -5%, " + bot + "% 105%, -5% 105%)"
        : "polygon(" + top + "% -5%, 105% -5%, 105% 105%, " + bot + "% 105%)";
      var x = (top + bot) / 2;
      line.style.opacity = p > 0.02 && p < 0.98 ? 1 : 0;
      line.style.transform = "translateX(" + (x / 100) * dev.offsetWidth + "px) skewX(" + (rtl ? 16 : -16) + "deg)";
    }

    mm.add("(min-width: 1024px)", function () {
      stage.classList.add("pinned");
      var rail = $$(".rail button", stage), bar = $(".bar i", stage);
      projs.forEach(function (p, i) { p.classList.toggle("on", i === 0); if (i) wipe($(".proj-dev", p), $(".wipe", p), 0); });

      var tl = gsap.timeline({ defaults: { ease: "none" } });
      for (var i = 1; i < n; i++) (function (i) {
        var prev = projs[i - 1], cur = projs[i], at = i - 1, pr = { p: 0 };
        var cd = $(".proj-dev", cur), line = $(".wipe", cur);
        tl.to($(".proj-dev", prev), { xPercent: rtl ? 6 : -6, scale: 0.92, opacity: 0, duration: 0.5, ease: "power2.in" }, at)
          .to($$(".proj-info > *", prev), { y: -40, opacity: 0, duration: 0.35, stagger: 0.02, ease: "power2.in" }, at)
          .to($(".proj-bg", prev), { yPercent: -30, opacity: 0, duration: 0.45, ease: "power2.in" }, at)
          .to($(".proj-glow", prev), { opacity: 0, scale: 0.85, duration: 0.5, ease: "power2.in" }, at)
          .fromTo($(".proj-glow", cur), { opacity: 0, scale: 1.2 }, { opacity: 1, scale: 1, duration: 0.8, ease: "power3.out" }, at + 0.2)
          .to(pr, { p: 1, duration: 0.7, ease: "power3.inOut", onUpdate: function () { wipe(cd, line, pr.p); } }, at + 0.1)
          .fromTo($(".laptop", cur), { xPercent: rtl ? -5 : 5, rotateY: rtl ? 8 : -8, transformPerspective: 1400 }, { xPercent: 0, rotateY: 0, duration: 0.75, ease: "power3.out" }, at + 0.1)
          .fromTo($(".phone", cur), { yPercent: 45, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.55, ease: "power3.out" }, at + 0.38)
          .fromTo($$(".proj-info > *", cur), { y: 46, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.045, ease: "power3.out" }, at + 0.32)
          .fromTo($(".proj-bg", cur), { yPercent: 35, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6, ease: "power3.out" }, at + 0.3)
          ;
      })(i);
      // a project is on stage from the moment the previous one starts leaving until it has fully left
      tl.eventCallback("onUpdate", function () {
        var t = tl.time();
        projs.forEach(function (p, i) { p.classList.toggle("on", t > i - 1 + 0.001 && (i === n - 1 || t < i + 0.999)); });
      });
      tl.to({}, { duration: 0.2 });

      var total = tl.duration(), snaps = [];
      for (var k = 0; k < n; k++) snaps.push(Math.min(1, k / total));
      var cur = -1;
      var st = ST.create({
        animation: tl, trigger: stage, start: "top top", end: function () { return "+=" + total * innerHeight * 0.9; },
        pin: true, scrub: 0.8, anticipatePin: 1, invalidateOnRefresh: true,
        snap: { snapTo: snaps, duration: { min: 0.3, max: 0.8 }, delay: 0.06, ease: "power2.inOut" },
        onUpdate: function (s) {
          bar.style.transform = "scaleX(" + s.progress + ")";
          var idx = Math.min(n - 1, Math.round(s.progress * total));
          if (idx !== cur) { cur = idx; rail.forEach(function (b, j) { b.classList.toggle("on", j === idx); if (j === idx) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current"); }); }
        }
      });
      rail.forEach(function (b) {
        b.onclick = function () { var y = st.start + (+b.dataset.go / total) * (st.end - st.start) + 2; lenis ? lenis.scrollTo(y, { duration: 1.2 }) : scrollTo(0, y); };
      });
      // keyboard users tabbing into a hidden project: bring it on stage
      projs.forEach(function (p, i) { p.addEventListener("focusin", function () { if (cur !== i) rail[i].click(); }); });

      // the active laptop leans toward the pointer
      var lean = function (e) {
        var nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5, on = projs[Math.max(cur, 0)];
        gsap.to($(".lid", on), { rotateY: nx * 7, rotateX: -ny * 5, transformPerspective: 1600, duration: 1, overwrite: "auto" });
      };
      stage.addEventListener("pointermove", lean);

      return function () {
        stage.classList.remove("pinned"); stage.removeEventListener("pointermove", lean);
        projs.forEach(function (p) { p.classList.remove("on"); var dv = $(".proj-dev", p); dv.style.clipPath = ""; });
        rail.forEach(function (b) { b.onclick = null; });
      };
    });

    mm.add("(max-width: 1023px)", function () {
      var tws = projs.map(function (p) {
        return gsap.timeline({ scrollTrigger: { trigger: p, start: "top 85%", once: true } })
          .from($(".laptop", p), { y: 50, opacity: 0, scale: 0.95, duration: 1.1, ease: "expo.out" })
          .from($(".phone", p), { y: 70, opacity: 0, duration: 1, ease: "expo.out" }, "<0.15")
          .from($$(".proj-info > *", p), { y: 26, opacity: 0, duration: 0.8, stagger: 0.06, ease: "power3.out" }, "<0.1");
      });
      return function () { tws.forEach(function (t) { t.scrollTrigger && t.scrollTrigger.kill(); t.progress(1).kill(); }); };
    });
  }
})();
