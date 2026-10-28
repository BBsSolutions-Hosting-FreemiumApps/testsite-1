(function () {
  "use strict";

  /* ---------- Mobiel menu ---------- */
  var navToggle = document.getElementById("nav-toggle");
  var siteNav = document.getElementById("sitenav");
  if (navToggle && siteNav) {
    navToggle.addEventListener("click", function () {
      var open = siteNav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    siteNav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        siteNav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Scroll-spy voor navigatie ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".sitenav a"));
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);

  function updateSpy() {
    var pos = window.scrollY + 90;
    var current = null;
    sections.forEach(function (sec) {
      if (sec.offsetTop <= pos) current = sec.id;
    });
    navLinks.forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("href") === "#" + current);
    });
  }
  window.addEventListener("scroll", updateSpy, { passive: true });
  updateSpy();

  /* ---------- Typ-animatie in hero ---------- */
  var typeEl = document.getElementById("type-line");
  var words = ["volledig ingericht.", "klaar voor gebruik.", "precies zoals jij wilt."];
  if (typeEl && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var wi = 0, ci = 0, deleting = false;
    (function typeLoop() {
      var word = words[wi];
      ci = deleting ? ci - 1 : ci + 1;
      typeEl.textContent = word.slice(0, ci);
      var delay = deleting ? 45 : 85;
      if (!deleting && ci === word.length) { delay = 1600; deleting = true; }
      else if (deleting && ci === 0) { deleting = false; wi = (wi + 1) % words.length; delay = 350; }
      setTimeout(typeLoop, delay);
    })();
  } else if (typeEl) {
    typeEl.textContent = words[0];
  }

  /* ---------- Uitklapbare dienstkaarten ---------- */
  document.querySelectorAll(".card.expandable").forEach(function (card) {
    card.addEventListener("click", function () {
      var open = card.getAttribute("aria-expanded") === "true";
      card.setAttribute("aria-expanded", open ? "false" : "true");
      var more = card.querySelector(".card-more");
      if (more) more.textContent = open ? more.getAttribute("data-open") : more.getAttribute("data-close");
    });
  });

  /* ---------- Stappen (accordion) ---------- */
  document.querySelectorAll(".step-head").forEach(function (head) {
    head.addEventListener("click", function () {
      var step = head.parentElement;
      var open = head.getAttribute("aria-expanded") === "true";
      head.setAttribute("aria-expanded", open ? "false" : "true");
      step.classList.toggle("open", !open);
    });
  });

  /* ---------- Simulator ---------- */
  var simForm = document.getElementById("sim-form");
  var planSteps = document.getElementById("plan-steps");
  var planFoot = document.getElementById("plan-foot");
  var consoleOut = document.getElementById("console-out");

  function checkedValue(name) {
    var el = simForm.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : "";
  }
  function checkedValues(name) {
    return Array.prototype.slice
      .call(simForm.querySelectorAll('input[name="' + name + '"]:checked'))
      .map(function (el) { return el.value; });
  }

  function buildPlan() {
    var doel = checkedValue("doel");
    var onderdelen = checkedValues("onderdeel");
    var tijd = checkedValue("tijd");
    if (!planSteps) return;

    var steps = [];
    steps.push("Account aangemaakt met veilige basisinstellingen");
    if (doel === "Vaste taken automatiseren") {
      steps.push("Bots ingericht voor vaste, terugkerende taken");
    } else if (doel === "Beter met e-mail en agenda omgaan") {
      steps.push("Bots ingericht voor e-mail- en agenda-overzicht");
    } else {
      steps.push("Bots ingericht voor overzicht en tijdbesparing");
    }
    if (onderdelen.length) {
      steps.push("Koppelingen met: " + onderdelen.join(", "));
    } else {
      steps.push("Advies over welke koppelingen voor jou zinvol zijn");
    }
    if (tijd === "Zo min mogelijk") {
      steps.push("Routines zo ingericht dat je er zelf weinig mee hoeft te doen");
    } else {
      steps.push("Routines op een schema dat je zelf makkelijk kunt bijsturen");
    }
    steps.push("Uitleg en referentiekaart, zodat je het zelf kunt beheren");

    planSteps.innerHTML = "";
    steps.forEach(function (text, i) {
      var li = document.createElement("li");
      li.textContent = text;
      li.className = "new";
      li.style.animationDelay = i * 40 + "ms";
      planSteps.appendChild(li);
    });
    if (planFoot) {
      planFoot.textContent =
        "Doel: " + doel.toLowerCase() + " · Onderdelen: " +
        (onderdelen.length ? onderdelen.join(", ").toLowerCase() : "nog te kiezen") +
        " · Tijd: " + tijd.toLowerCase() +
        ". Dit is een voorbeeld; het echte plan maken we samen.";
    }
    if (consoleOut) {
      var lines = [
        "$ bbss plan --doel \"" + doel + "\"",
        "> account: ok",
        "> bots: " + (doel === "Vaste taken automatiseren" ? "routines-set" : "overzicht-set"),
        "> koppelingen: " + (onderdelen.length ? onderdelen.join(" + ").toLowerCase() : "advies"),
        "> schema: " + (tijd === "Zo min mogelijk" ? "volledig automatisch" : "zelf bij te sturen"),
        "> status: voorbeeld gereed — niets verzonden"
      ];
      consoleOut.textContent = lines.join("\n");
    }
  }

  if (simForm) {
    simForm.addEventListener("change", buildPlan);
    buildPlan();
  }

  /* ---------- Chatdemo ---------- */
  var chatLog = document.getElementById("chat-log");
  var chatForm = document.getElementById("chat-form");
  var chatField = document.getElementById("chat-field");

  var chatAnswers = [
    { match: /wat kun jij|wat kun je|kun je/i, reply: "In deze demo laat ik zien hoe een bot antwoordt. In het echt help ik met het inrichten van bots die jouw vaste taken overnemen." },
    { match: /plan|week|agenda/i, reply: "Voorbeeld: ik kan je week samenstellen uit je agenda, met herinneringen voor vaste momenten. Precies hoe, leg ik tijdens de inrichting uit." },
    { match: /mail|e-mail|samenvat/i, reply: "Voorbeeld: elke ochtend een korte samenvatting van wat er in je inbox kwam. Zo'n routine zetten we samen op en testen we." },
    { match: /herinner|taak|take/i, reply: "Voorbeeld: vaste taken krijg je op afgesproken momenten terug — bijvoorbeeld een wekelijks overzicht op maandagochtend." },
    { match: /haal|bericht|bericht lezen/i, reply: "Samenvatten, herinneringen en schema's: dat zijn de typische taken die we inrichten. Stel gerust een vervolgvraag in deze demo." }
  ];
  var chatFallback = "Goede vraag. In deze demo kan ik alleen met vaste voorbeeldzinnen antwoorden, maar in het echt richten we samen bots in die precies dit soort vragen voor jou beantwoorden.";

  function addMsg(text, who) {
    var div = document.createElement("div");
    div.className = "msg " + who;
    div.textContent = text;
    chatLog.appendChild(div);
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  function botReply(q) {
    var typing = document.createElement("div");
    typing.className = "msg bot typing";
    typing.textContent = "…";
    chatLog.appendChild(typing);
    chatLog.scrollTop = chatLog.scrollHeight;
    setTimeout(function () {
      typing.remove();
      var found = chatAnswers.find(function (a) { return a.match.test(q); });
      addMsg(found ? found.reply : chatFallback, "bot");
    }, 650);
  }

  function sendChat(q) {
    if (!q || !chatLog) return;
    addMsg(q, "user");
    botReply(q);
  }

  if (chatLog && chatForm) {
    addMsg("Hoi! Ik ben een demo-bot van BBsS. Stel een vraag of kies een suggestie hieronder.", "bot");
    chatForm.addEventListener("submit", function (e) {
      e.preventDefault();
      sendChat(chatField.value.trim());
      chatField.value = "";
    });
    document.querySelectorAll("#chat-suggest button").forEach(function (btn) {
      btn.addEventListener("click", function () { sendChat(btn.getAttribute("data-q")); });
    });
  }

  /* ---------- FAQ zoeken ---------- */
  var faqSearch = document.getElementById("faq-search");
  var faqItems = Array.prototype.slice.call(document.querySelectorAll("#faq-list details"));
  var faqCount = document.getElementById("faq-count");

  if (faqSearch && faqItems.length) {
    faqSearch.addEventListener("input", function () {
      var q = faqSearch.value.trim().toLowerCase();
      var shown = 0;
      faqItems.forEach(function (item) {
        var hit = !q || item.textContent.toLowerCase().indexOf(q) !== -1;
        item.classList.toggle("hidden", !hit);
        if (hit) shown++;
      });
      if (faqCount) {
        faqCount.textContent = q
          ? shown + " van " + faqItems.length + " vragen gevonden"
          : faqItems.length + " vragen";
      }
    });
    if (faqCount) faqCount.textContent = faqItems.length + " vragen";
  }

  /* ---------- Canvas "video" speler ---------- */
  var canvas = document.getElementById("demo-video");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  var overlay = document.getElementById("player-overlay");
  var bigPlay = document.getElementById("big-play");
  var playpause = document.getElementById("playpause");
  var restart = document.getElementById("restart");
  var track = document.getElementById("track");
  var trackFill = document.getElementById("track-fill");
  var timeNow = document.getElementById("time-now");
  var timeTotal = document.getElementById("time-total");
  var caption = document.getElementById("scene-caption");

  var DURATION = 45; // seconden
  var t = 0;
  var playing = false;
  var rafId = null;
  var lastTs = null;

  var W = canvas.width, H = canvas.height;

  var scenes = [
    { name: "Scène 1 — Account aanmaken", start: 0, end: 15 },
    { name: "Scène 2 — Bots en koppelingen", start: 15, end: 30 },
    { name: "Scène 3 — Routines actief", start: 30, end: 45 }
  ];

  function ease(x) { return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; }
  function clamp01(x) { return Math.max(0, Math.min(1, x)); }
  function fmt(s) {
    s = Math.max(0, Math.round(s));
    return Math.floor(s / 60) + ":" + (s % 60 < 10 ? "0" : "") + (s % 60);
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  var accent = "#4da3ff", accent2 = "#7ee0c0", bgDeep = "#060b15", panel = "#16233c", line = "#26364f", text = "#e9eefb", muted = "#aab8d1";

  function drawChrome(progress, title, badge) {
    ctx.fillStyle = bgDeep;
    ctx.fillRect(0, 0, W, H);
    // venster
    ctx.fillStyle = panel;
    roundRect(90, 60, W - 180, H - 130, 16);
    ctx.fill();
    // titelbalk
    ctx.fillStyle = "#101a2e";
    roundRect(90, 60, W - 180, 44, 16);
    ctx.fill();
    ctx.fillStyle = "#101a2e";
    ctx.fillRect(90, 82, W - 180, 22);
    ["#ff8f8f", "#ffd98f", "#9fe8a0"].forEach(function (c, i) {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(120 + i * 24, 82, 6, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = muted;
    ctx.font = "600 15px system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(title, 200, 87);
    // badge rechtsboven
    ctx.fillStyle = accent;
    roundRect(W - 260, 70, 150, 26, 13);
    ctx.fill();
    ctx.fillStyle = "#06111f";
    ctx.font = "700 13px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(badge, W - 185, 87);
    // voortgangsbalk onderaan
    ctx.fillStyle = line;
    roundRect(90, H - 46, W - 180, 8, 4);
    ctx.fill();
    ctx.fillStyle = accent2;
    roundRect(90, H - 46, (W - 180) * clamp01(progress), 8, 4);
    ctx.fill();
  }

  function drawScene1(time) {
    var p = clamp01(time / 12);
    drawChrome(p, "account.inrichten", "stap 1/3");
    ctx.textAlign = "left";
    // velden vullen zich
    var fields = [
      { label: "Accountnaam", value: "jouw-naam" },
      { label: "Profiel", value: "persoonlijk" },
      { label: "Voorkeuren", value: "nederlands, rustig" }
    ];
    fields.forEach(function (f, i) {
      var y = 150 + i * 78;
      ctx.fillStyle = muted;
      ctx.font = "600 15px system-ui, sans-serif";
      ctx.fillText(f.label, 130, y);
      ctx.fillStyle = bgDeep;
      roundRect(130, y + 10, 380, 40, 10);
      ctx.fill();
      var fillP = clamp01(p * 3 - i * 0.6);
      if (fillP > 0) {
        ctx.fillStyle = "rgba(77,163,255,0.25)";
        roundRect(130, y + 10, 380 * fillP, 40, 10);
        ctx.fill();
        ctx.fillStyle = text;
        ctx.font = "15px ui-monospace, monospace";
        ctx.fillText(f.value.slice(0, Math.ceil(f.value.length * fillP)), 145, y + 35);
      }
    });
    // vinkjes rechts
    var checks = ["account aangemaakt", "instellingen opgeslagen", "dashboard klaar"];
    checks.forEach(function (c, i) {
      var done = p > 0.3 + i * 0.25;
      ctx.globalAlpha = done ? 1 : 0.35;
      ctx.fillStyle = done ? accent2 : line;
      ctx.beginPath();
      ctx.arc(600, 165 + i * 60, 14, 0, Math.PI * 2);
      ctx.fill();
      if (done) {
        ctx.strokeStyle = "#06111f";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(593, 165 + i * 60);
        ctx.lineTo(599, 172 + i * 60);
        ctx.lineTo(608, 158 + i * 60);
        ctx.stroke();
      }
      ctx.fillStyle = done ? text : muted;
      ctx.font = "600 15px system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(c, 625, 170 + i * 60);
      ctx.globalAlpha = 1;
    });
  }

  function drawScene2(time) {
    var p = clamp01((time - 15) / 12);
    drawChrome(p, "bots & koppelingen", "stap 2/3");
    // bots als kaarten
    var bots = [
      { name: "Mail-bot", taak: "inbox overzicht" },
      { name: "Agenda-bot", taak: "week plannen" },
      { name: "Herinner-bot", taak: "vaste taken" }
    ];
    bots.forEach(function (b, i) {
      var appear = clamp01(p * 3 - i * 0.5);
      var x = 130 + i * 240;
      var y = 140 + (1 - ease(appear)) * 30;
      ctx.globalAlpha = appear;
      ctx.fillStyle = bgDeep;
      roundRect(x, y, 210, 110, 12);
      ctx.fill();
      ctx.strokeStyle = appear >= 1 ? accent : line;
      ctx.lineWidth = 2;
      roundRect(x, y, 210, 110, 12);
      ctx.stroke();
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(x + 30, y + 30, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = text;
      ctx.font = "700 15px system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(b.name, x + 50, y + 35);
      ctx.fillStyle = muted;
      ctx.font = "13px system-ui, sans-serif";
      ctx.fillText(b.taak, x + 20, y + 75);
      ctx.globalAlpha = 1;
    });
    // koppelingslijnen onderaan
    var koppelingen = ["E-mail", "Agenda", "Notities"];
    koppelingen.forEach(function (k, i) {
      var connect = clamp01(p * 2.5 - 0.8 - i * 0.3);
      var x1 = 235 + i * 240, x2 = 320 + i * 240;
      ctx.globalAlpha = connect;
      ctx.strokeStyle = accent2;
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(x1, 290);
      ctx.lineTo(x2, 340);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = accent2;
      ctx.beginPath();
      ctx.arc(x2, 340, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = text;
      ctx.font = "600 13px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(k + " verbonden", x2, 368);
      ctx.globalAlpha = 1;
    });
  }

  function drawScene3(time) {
    var p = clamp01((time - 30) / 12);
    drawChrome(p, "routines.actief", "stap 3/3");
    // wekelijks schema
    var days = ["ma", "di", "wo", "do", "vr"];
    days.forEach(function (d, i) {
      var x = 130 + i * 150;
      ctx.fillStyle = bgDeep;
      roundRect(x, 140, 130, 160, 12);
      ctx.fill();
      ctx.fillStyle = muted;
      ctx.font = "700 15px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(d, x + 65, 168);
      var bars = [2, 1, 2, 1, 1];
      for (var b = 0; b < bars[i]; b++) {
        var appear = clamp01(p * 4 - (i + b * 2));
        ctx.globalAlpha = appear;
        ctx.fillStyle = b === 0 ? accent : accent2;
        roundRect(x + 20, 190 + b * 50, 90, 34, 8);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    });
    // statusregel
    var msg = "3 routines draaien op schema · overzicht wordt elke ochtend ververst";
    var chars = Math.ceil(msg.length * clamp01(p * 1.6));
    ctx.fillStyle = accent2;
    ctx.font = "600 15px ui-monospace, monospace";
    ctx.textAlign = "center";
    ctx.fillText("✔ " + msg.slice(0, chars), W / 2, 348);
    // slot-regel
    if (p > 0.85) {
      ctx.fillStyle = text;
      ctx.font = "700 18px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.globalAlpha = (p - 0.85) / 0.15;
      ctx.fillText("Klaar — en jij kunt het zelf beheren.", W / 2, 400);
      ctx.globalAlpha = 1;
    }
  }

  function drawStart() {
    ctx.fillStyle = bgDeep;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = text;
    ctx.font = "700 30px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Demonstratie: zo richt ik je Grok Bot-account in", W / 2, H / 2 - 30);
    ctx.fillStyle = muted;
    ctx.font = "16px system-ui, sans-serif";
    ctx.fillText("Account → Bots & koppelingen → Routines", W / 2, H / 2 + 20);
    ctx.fillStyle = accent;
    ctx.font = "700 18px system-ui, sans-serif";
    ctx.fillText("▶ Druk op afspelen", W / 2, H / 2 + 70);
  }

  function currentScene(time) {
    return scenes.find(function (s) { return time >= s.start && time < s.end; }) || scenes[scenes.length - 1];
  }

  function render(time) {
    if (time < 15) drawScene1(time);
    else if (time < 30) drawScene2(time);
    else drawScene3(time);
  }

  function updateUI() {
    var pct = (t / DURATION) * 100;
    trackFill.style.width = pct + "%";
    track.setAttribute("aria-valuenow", Math.round(pct));
    timeNow.textContent = fmt(t);
    if (caption) caption.textContent = playing
      ? currentScene(t).name
      : (t === 0 ? "Druk op afspelen om de demonstratie te starten." : "Gepauzeerd bij " + currentScene(t).name.toLowerCase());
  }

  function setPlaying(on) {
    playing = on;
    playpause.textContent = on ? "❚❚" : "▶";
    overlay.hidden = on || t > 0 && t < DURATION ? true : !on && t !== 0;
    if (on) overlay.hidden = true;
    else if (t === 0 || t >= DURATION) overlay.hidden = false;
  }

  function loop(ts) {
    if (!playing) return;
    if (lastTs === null) lastTs = ts;
    t += (ts - lastTs) / 1000;
    lastTs = ts;
    if (t >= DURATION) {
      t = DURATION;
      playing = false;
      lastTs = null;
      setPlaying(false);
      overlay.hidden = false;
      bigPlay.textContent = "▶ Opnieuw afspelen";
      updateUI();
      render(t);
      return;
    }
    render(t);
    updateUI();
    rafId = requestAnimationFrame(loop);
  }

  function play() {
    if (t >= DURATION) { t = 0; }
    setPlaying(true);
    lastTs = null;
    rafId = requestAnimationFrame(loop);
  }
  function pause() {
    playing = false;
    cancelAnimationFrame(rafId);
    setPlaying(false);
    updateUI();
  }

  bigPlay.addEventListener("click", function () {
    if (playing) pause(); else play();
  });
  playpause.addEventListener("click", function () {
    if (playing) pause(); else play();
  });
  restart.addEventListener("click", function () {
    pause();
    t = 0;
    bigPlay.textContent = "▶ Video afspelen";
    overlay.hidden = false;
    render(0.001);
    updateUI();
  });

  function seek(clientX) {
    var rect = track.getBoundingClientRect();
    var pct = clamp01((clientX - rect.left) / rect.width);
    t = pct * DURATION;
    playing = false;
    cancelAnimationFrame(rafId);
    lastTs = null;
    setPlaying(false);
    render(t);
    updateUI();
    if (t === 0) { drawStart(); }
  }
  track.addEventListener("click", function (e) { seek(e.clientX); });
  track.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") { t = Math.min(DURATION, t + 2); render(t); updateUI(); e.preventDefault(); }
    if (e.key === "ArrowLeft") { t = Math.max(0, t - 2); render(t); updateUI(); e.preventDefault(); }
  });

  timeTotal.textContent = fmt(DURATION);
  drawStart();
  updateUI();
})();
