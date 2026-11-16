(() => {
  const CARD_DATA = [
    {
      key: "profile",
      index: "01",
      title: "Profile",
      desc: "ข้อมูลตัวตน แนวคิดการทำงาน และเบื้องหลังการสร้างสรรค์ผลงาน",
    },
    {
      key: "product",
      index: "02",
      title: "Product",
      desc: "รวมผลิตภัณฑ์ โซลูชัน และงานออกแบบที่พัฒนาอย่างพิถีพิถัน",
    },
    {
      key: "test",
      index: "03",
      title: "Test",
      desc: "ห้องทดลอง ทดสอบประสิทธิภาพ และตรวจสอบมาตรฐานระบบแบบเรียลไทม์",
    },
    {
      key: "download",
      index: "04",
      title: "Download",
      desc: "ดาวน์โหลดไฟล์ติดตั้ง เอกสารคู่มือ และแพ็กเกจเวอร์ชันล่าสุด",
    },
    {
      key: "contact",
      index: "05",
      title: "Contact",
      desc: "ช่องทางติดต่อ สอบถามข้อมูล นัดหมาย และเริ่มต้นโปรเจกต์ร่วมกัน",
    },
  ];

  const scrollTrack = document.getElementById("scrollTrack");
  const handViewport = document.querySelector(".hand-viewport");
  const cards = Array.from(document.querySelectorAll(".playing-card"));
  const pills = Array.from(document.querySelectorAll(".pill"));
  const tunnelCanvas = document.getElementById("tunnelCanvas");
  const progressFill = document.getElementById("progressFill");
  const activeCounter = document.getElementById("activeCounter");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const selectionToast = document.getElementById("selectionToast");

  const CARD_COUNT = cards.length;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouchOnly = window.matchMedia("(hover: none)").matches;

  let targetProgress = 0;
  let currentProgress = 0;
  let prevProgress = 0;
  let lastRenderedProgress = -1;
  let forceHandRender = true;
  let targetBgX = 0;
  let targetBgY = 0;
  let currentBgX = 0;
  let currentBgY = 0;
  let tunnelClock = 0;
  let warpIntensity = 0;
  let lastFrameTime = performance.now();
  let lastClosestIndex = -1;
  let toastTimer = null;

  // --- GPU-Balanced Canvas Deep-Sinking Tunnel Engine ---
  const ctx = tunnelCanvas ? tunnelCanvas.getContext("2d", { alpha: false }) : null;
  const bgImg = new Image();
  let spriteCanvas = null;
  let spriteW = 0;
  let spriteH = 0;
  let canvasW = 0;
  let canvasH = 0;
  let canvasDpr = 1;
  let needsCanvasResize = true;

  function buildHollowTunnelSprite() {
    if (!bgImg.naturalWidth || !bgImg.naturalHeight) return;
    const maxW = isTouchOnly || window.innerWidth <= 768 ? 720 : 1024;
    const scale = Math.min(1, maxW / bgImg.naturalWidth);
    spriteW = Math.round(bgImg.naturalWidth * scale);
    spriteH = Math.round(bgImg.naturalHeight * scale);

    spriteCanvas = document.createElement("canvas");
    spriteCanvas.width = spriteW;
    spriteCanvas.height = spriteH;
    const sctx = spriteCanvas.getContext("2d");

    sctx.drawImage(bgImg, 0, 0, spriteW, spriteH);

    // Pre-bake hollow center portal cutout ONCE at startup (zero per-frame mask cost)
    sctx.save();
    sctx.globalCompositeOperation = "destination-out";
    const cx = spriteW * 0.5;
    const cy = spriteH * 0.5;
    const radius = Math.max(spriteW, spriteH) * 0.2;
    const grad = sctx.createRadialGradient(cx, cy, radius * 0.36, cx, cy, radius);
    grad.addColorStop(0, "rgba(0, 0, 0, 1)");
    grad.addColorStop(0.55, "rgba(0, 0, 0, 0.88)");
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, spriteW, spriteH);
    sctx.restore();
  }

  bgImg.onload = buildHollowTunnelSprite;
  bgImg.src = "images/bg-tunnel.jpg";

  function syncCanvasSize() {
    if (!tunnelCanvas || !ctx) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    // Cap DPR at 1 on mobile for buttery 60fps fill rate without block stutter
    canvasDpr = vw <= 768 || isTouchOnly ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);
    canvasW = vw;
    canvasH = vh;
    tunnelCanvas.width = Math.max(1, Math.round(vw * canvasDpr));
    tunnelCanvas.height = Math.max(1, Math.round(vh * canvasDpr));
    ctx.setTransform(canvasDpr, 0, 0, canvasDpr, 0, 0);
    needsCanvasResize = false;
  }

  function clamp(val, min, max) {
    return Math.min(max, Math.max(min, val));
  }

  function smoothstep(edge0, edge1, x) {
    const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
  }

  function getMaxScroll() {
    return Math.max(1, scrollTrack.offsetHeight - window.innerHeight);
  }

  function readScrollProgress() {
    const maxScroll = getMaxScroll();
    let scrollTop = window.scrollY || window.pageYOffset || 0;

    // Infinite scroll loop: when scrolled all the way to the end (5.0 == 0.0),
    // seamlessly wrap back to the top without any visual jump
    if (scrollTop >= maxScroll - 3) {
      const wrapTop = 4;
      window.scrollTo({ top: wrapTop, behavior: "instant" });
      scrollTop = wrapTop;
      currentProgress -= 1;
      prevProgress -= 1;
      lastRenderedProgress -= 1;
    }

    targetProgress = clamp(scrollTop / maxScroll, 0, 1);
  }

  function scrollToStep(stepDelta) {
    const maxScroll = getMaxScroll();
    const currentStep = Math.round(currentProgress * CARD_COUNT);
    let desiredStep = currentStep + stepDelta;

    if (desiredStep < 0) {
      const wrapTop = maxScroll - 6;
      window.scrollTo({ top: wrapTop, behavior: "instant" });
      currentProgress += 1;
      prevProgress += 1;
      lastRenderedProgress += 1;
      desiredStep += CARD_COUNT;
    } else if (desiredStep > CARD_COUNT) {
      const wrapTop = 4;
      window.scrollTo({ top: wrapTop, behavior: "instant" });
      currentProgress -= 1;
      prevProgress -= 1;
      lastRenderedProgress -= 1;
      desiredStep -= CARD_COUNT;
    }

    const targetY = clamp((desiredStep / CARD_COUNT) * maxScroll, 0, maxScroll);
    window.scrollTo({
      top: targetY,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }

  function scrollToCardIndex(targetIndex) {
    const safeIdx = ((targetIndex % CARD_COUNT) + CARD_COUNT) % CARD_COUNT;
    const currentStep = ((Math.round(currentProgress * CARD_COUNT) % CARD_COUNT) + CARD_COUNT) % CARD_COUNT;

    let delta = safeIdx - currentStep;
    if (delta > CARD_COUNT / 2) delta -= CARD_COUNT;
    if (delta < -CARD_COUNT / 2) delta += CARD_COUNT;

    if (delta === 0) return;
    scrollToStep(delta);
  }

  function showToast(message) {
    selectionToast.textContent = message;
    selectionToast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      selectionToast.classList.remove("is-visible");
    }, 2200);
  }

  function updateHeaderAndPills(closestIdx) {
    if (closestIdx === lastClosestIndex) return;
    lastClosestIndex = closestIdx;

    const item = CARD_DATA[closestIdx];
    activeCounter.textContent = `${item.index} / 0${CARD_COUNT}`;

    pills.forEach((pill, i) => {
      const isActive = i === closestIdx;
      pill.classList.toggle("is-active", isActive);
      pill.setAttribute("aria-selected", String(isActive));
    });

    cards.forEach((card, i) => {
      card.classList.toggle("is-active", i === closestIdx);
    });
  }

  function renderTunnelCanvas(dt, scrollDelta) {
    if (reducedMotion || !ctx || !spriteCanvas) return;
    if (needsCanvasResize) syncCanvasSize();

    const instantSpeed = Math.min(2.0, Math.abs(scrollDelta) * 30);
    warpIntensity += (instantSpeed - warpIntensity) * 0.12;
    tunnelClock = (tunnelClock + dt * (0.16 + warpIntensity)) % 1000;

    const coverScale = Math.max(canvasW / spriteW, canvasH / spriteH);
    const warpZoom = 1 + Math.min(0.14, warpIntensity * 0.08);
    const cx = canvasW * 0.5;
    const cy = canvasH * 0.5;

    ctx.fillStyle = "#04080e";
    ctx.fillRect(0, 0, canvasW, canvasH);

    // Subtle full-bleed base layer so far corners always stay seamless
    const baseScale = coverScale * 1.06 * warpZoom;
    const bw = spriteW * baseScale;
    const bh = spriteH * baseScale;
    ctx.globalAlpha = 0.66;
    ctx.drawImage(bgImg, cx - bw * 0.5 + currentBgX * 0.4, cy - bh * 0.5 + currentBgY * 0.4, bw, bh);

    // 3 telescoping depth layers sorted back-to-front
    const layers = [];
    for (let i = 0; i < 3; i++) {
      layers.push((i / 3 + tunnelClock) % 1);
    }
    layers.sort((a, b) => a - b);

    for (let i = 0; i < 3; i++) {
      const p = layers[i];
      const scale = 0.24 * Math.pow(9.6, p) * coverScale * warpZoom;
      const alpha = smoothstep(0.0, 0.16, p) * (1 - smoothstep(0.84, 1.0, p));
      if (alpha <= 0.005) continue;

      const rot = Math.sin((p + tunnelClock * 0.35) * Math.PI * 2) * 0.006;
      const dw = spriteW * scale;
      const dh = spriteH * scale;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(cx + currentBgX * p, cy + currentBgY * p);
      ctx.rotate(rot);
      ctx.drawImage(spriteCanvas, -dw * 0.5, -dh * 0.5, dw, dh);
      ctx.restore();
    }

    // 3 crisp neon perspective corridor frames (vector strokes = near-zero GPU cost)
    const frameWBase = canvasW * 0.86;
    const frameHBase = canvasH * 0.86;
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) {
      const fp = (i / 3 + tunnelClock * 1.18) % 1;
      const fScale = 0.14 * Math.pow(13, fp);
      const fOp = smoothstep(0.02, 0.22, fp) * (1 - smoothstep(0.74, 1.0, fp)) * 0.46;
      if (fOp <= 0.01) continue;

      const fw = frameWBase * fScale;
      const fh = frameHBase * fScale;
      ctx.strokeStyle = `rgba(56, 226, 255, ${fOp.toFixed(3)})`;
      ctx.strokeRect(
        cx + currentBgX * fp - fw * 0.5,
        cy + currentBgY * fp - fh * 0.5,
        fw,
        fh
      );
    }

    ctx.globalAlpha = 1;
  }

  function renderHand(progress) {
    const wrappedProgress = ((progress % 1) + 1) % 1;
    progressFill.style.transform = `scaleX(${wrappedProgress.toFixed(4)})`;

    // Full 5-card cycle: 0..5 where 5 wraps seamlessly back to 0 (Profile)
    const activePos = progress * CARD_COUNT;
    const closestIdx = ((Math.round(activePos) % CARD_COUNT) + CARD_COUNT) % CARD_COUNT;
    updateHeaderAndPills(closestIdx);

    const cardWidth = cards[0] ? cards[0].offsetWidth : 240;
    const viewportW = window.innerWidth;
    const isNarrow = viewportW < 640;
    const spread = clamp((viewportW - cardWidth * 0.72) * 0.44, 104, cardWidth * 1.18);
    const maxRot = isNarrow ? 14 : 22;
    const maxRy = isNarrow ? 4 : 12;
    const maxTz = isNarrow ? 0 : 60;

    cards.forEach((card, i) => {
      let offset = i - activePos;
      offset =
        ((((offset % CARD_COUNT) + CARD_COUNT + CARD_COUNT / 2) % CARD_COUNT) -
          CARD_COUNT / 2);

      const theta = (offset / CARD_COUNT) * Math.PI * 2;
      const cosT = Math.cos(theta);
      const depth = (cosT + 1) * 0.5;

      const fanCurve = 0.72 * Math.sin(theta) - 0.55 * Math.sin(2 * theta);

      const tx = fanCurve * spread;
      const ty = 26 * (1 - cosT) - 22 * Math.pow(Math.max(0, cosT), 3);
      const tz = maxTz ? depth * (maxTz * 2) - maxTz : 0;
      const rot = fanCurve * maxRot;
      const ry = -fanCurve * maxRy;
      const scale = 0.76 + 0.28 * Math.pow(depth, 1.35);
      const zIndex = Math.round(depth * 100);
      const dim = (1 - Math.pow(depth, 0.85)) * 0.34;
      const activeStrength = Math.pow(clamp(1 - Math.abs(offset) * 1.35, 0, 1), 1.5);

      card.style.setProperty("--tx", `${tx.toFixed(2)}px`);
      card.style.setProperty("--ty", `${ty.toFixed(2)}px`);
      card.style.setProperty("--tz", `${tz.toFixed(2)}px`);
      card.style.setProperty("--rot", `${rot.toFixed(2)}deg`);
      card.style.setProperty("--ry", `${ry.toFixed(2)}deg`);
      card.style.setProperty("--scale", scale.toFixed(4));
      card.style.setProperty("--z", String(zIndex));
      card.style.setProperty("--dim", dim.toFixed(3));
      card.style.setProperty("--active-strength", activeStrength.toFixed(3));
    });
  }

  function tick(now) {
    const dt = Math.min(0.05, Math.max(0.001, (now - lastFrameTime) / 1000));
    lastFrameTime = now;

    readScrollProgress();

    if (reducedMotion) {
      currentProgress = targetProgress;
    } else {
      const diff = targetProgress - currentProgress;
      if (Math.abs(diff) < 0.0002) {
        currentProgress = targetProgress;
      } else {
        currentProgress += diff * 0.16;
      }
      if (!isTouchOnly) {
        currentBgX += (targetBgX - currentBgX) * 0.08;
        currentBgY += (targetBgY - currentBgY) * 0.08;
      }
    }

    const scrollDelta = currentProgress - prevProgress;
    prevProgress = currentProgress;

    renderTunnelCanvas(dt, scrollDelta);

    if (forceHandRender || Math.abs(currentProgress - lastRenderedProgress) > 0.00005) {
      renderHand(currentProgress);
      lastRenderedProgress = currentProgress;
      forceHandRender = false;
    }

    requestAnimationFrame(tick);
  }

  window.addEventListener(
    "resize",
    () => {
      needsCanvasResize = true;
      forceHandRender = true;
      if (bgImg.complete) buildHollowTunnelSprite();
    },
    { passive: true }
  );

  // Allow seamless reverse loop when scrolling UP past the very top
  window.addEventListener(
    "wheel",
    (e) => {
      const scrollTop = window.scrollY || window.pageYOffset || 0;
      if (scrollTop <= 3 && e.deltaY < 0) {
        const maxScroll = getMaxScroll();
        const wrapTop = maxScroll - 6;
        window.scrollTo({ top: wrapTop, behavior: "instant" });
        currentProgress += 1;
        prevProgress += 1;
        lastRenderedProgress += 1;
      }
    },
    { passive: true }
  );

  // Subtle Pointer Parallax on Desktop Mouse Only
  if (!isTouchOnly) {
    window.addEventListener(
      "pointermove",
      (e) => {
        if (reducedMotion || e.pointerType !== "mouse") return;
        const nx = e.clientX / window.innerWidth - 0.5;
        const ny = e.clientY / window.innerHeight - 0.5;
        targetBgX = -nx * 24;
        targetBgY = -ny * 14;
      },
      { passive: true }
    );
  }

  function enhanceCardEffects(card) {
    const cardInner = card.querySelector(".card-inner");
    if (cardInner) {
      const dimOverlay = document.createElement("div");
      dimOverlay.className = "card-dim";
      dimOverlay.setAttribute("aria-hidden", "true");
      cardInner.appendChild(dimOverlay);
    }

    if (isTouchOnly) return;

    const rimBeam = document.createElement("div");
    rimBeam.className = "card-rim-beam";
    rimBeam.setAttribute("aria-hidden", "true");
    card.prepend(rimBeam);

    if (cardInner) {
      const holo = document.createElement("div");
      holo.className = "card-holo";
      holo.setAttribute("aria-hidden", "true");
      cardInner.prepend(holo);
    }

    const cardArt = card.querySelector(".card-art");
    if (cardArt) {
      const corners = document.createElement("div");
      corners.className = "art-corners";
      corners.setAttribute("aria-hidden", "true");
      ["tl", "tr", "bl", "br"].forEach((pos) => {
        const bracket = document.createElement("span");
        bracket.className = `art-bracket ${pos}`;
        corners.appendChild(bracket);
      });
      cardArt.appendChild(corners);
    }
  }

  // Card Hover Spectacle & Click Handling
  cards.forEach((card, index) => {
    enhanceCardEffects(card);

    card.addEventListener("click", () => {
      if (index !== lastClosestIndex) {
        scrollToCardIndex(index);
      } else {
        card.classList.remove("is-selected");
        void card.offsetWidth;
        card.classList.add("is-selected");
        const item = CARD_DATA[index];
        showToast(`เลือกการ์ด ${item.index}: ${item.title}`);
      }
    });

    if (!isTouchOnly) {
      card.addEventListener("pointerenter", (e) => {
        if (reducedMotion || e.pointerType !== "mouse") return;
        card.classList.add("is-tilting");
      });

      card.addEventListener("pointermove", (e) => {
        if (reducedMotion || e.pointerType !== "mouse") return;
        const rect = card.getBoundingClientRect();
        const px = clamp((e.clientX - rect.left) / rect.width, 0, 1);
        const py = clamp((e.clientY - rect.top) / rect.height, 0, 1);

        const tiltY = (px - 0.5) * 14;
        const tiltX = (0.5 - py) * 14;
        const imgPx = (0.5 - px) * 16;
        const imgPy = (0.5 - py) * 12;

        card.style.setProperty("--tilt-x", `${tiltX.toFixed(2)}deg`);
        card.style.setProperty("--tilt-y", `${tiltY.toFixed(2)}deg`);
        card.style.setProperty("--glare-x", `${(px * 100).toFixed(1)}%`);
        card.style.setProperty("--glare-y", `${(py * 100).toFixed(1)}%`);
        card.style.setProperty("--holo-x", `${(px * 100).toFixed(1)}%`);
        card.style.setProperty("--holo-y", `${(py * 100).toFixed(1)}%`);
        card.style.setProperty("--img-px", `${imgPx.toFixed(2)}px`);
        card.style.setProperty("--img-py", `${imgPy.toFixed(2)}px`);
      });

      card.addEventListener("pointerleave", () => {
        card.classList.remove("is-tilting");
        card.style.setProperty("--tilt-x", "0deg");
        card.style.setProperty("--tilt-y", "0deg");
        card.style.setProperty("--glare-x", "50%");
        card.style.setProperty("--glare-y", "30%");
        card.style.setProperty("--holo-x", "50%");
        card.style.setProperty("--holo-y", "50%");
        card.style.setProperty("--img-px", "0px");
        card.style.setProperty("--img-py", "0px");
      });
    }

    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        card.click();
      }
    });
  });

  // Pill navigation
  pills.forEach((pill) => {
    pill.addEventListener("click", () => {
      const targetIdx = Number(pill.dataset.target);
      scrollToCardIndex(targetIdx);
    });
  });

  // Prev / Next step buttons (loop seamlessly in both directions)
  prevBtn.addEventListener("click", () => {
    scrollToStep(-1);
  });

  nextBtn.addEventListener("click", () => {
    scrollToStep(1);
  });

  // Keyboard arrow navigation
  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") {
      scrollToStep(1);
    } else if (e.key === "ArrowLeft") {
      scrollToStep(-1);
    }
  });

  // Horizontal-only touch swipe support (never fights native vertical scroll)
  let touchStartX = null;
  let touchStartY = null;
  let touchStartScroll = 0;
  let swipeLocked = false;

  handViewport.addEventListener(
    "touchstart",
    (e) => {
      if (e.touches.length !== 1) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartScroll = window.scrollY;
      swipeLocked = false;
    },
    { passive: true }
  );

  handViewport.addEventListener(
    "touchmove",
    (e) => {
      if (touchStartX === null || e.touches.length !== 1) return;
      const dx = touchStartX - e.touches[0].clientX;
      const dy = touchStartY - e.touches[0].clientY;

      if (!swipeLocked) {
        if (Math.abs(dx) > Math.abs(dy) * 1.4 && Math.abs(dx) > 10) {
          swipeLocked = true;
        } else {
          return;
        }
      }

      const sensitivity = getMaxScroll() / (window.innerWidth * 1.4);
      const nextTop = touchStartScroll + dx * sensitivity;
      const maxScroll = getMaxScroll();

      if (nextTop >= maxScroll - 3) {
        window.scrollTo({ top: 4, behavior: "instant" });
        touchStartScroll = 4 - dx * sensitivity;
        currentProgress -= 1;
        prevProgress -= 1;
        lastRenderedProgress -= 1;
      } else if (nextTop <= 2 && dx < 0) {
        window.scrollTo({ top: maxScroll - 6, behavior: "instant" });
        touchStartScroll = maxScroll - 6 - dx * sensitivity;
        currentProgress += 1;
        prevProgress += 1;
        lastRenderedProgress += 1;
      } else {
        window.scrollTo({
          top: clamp(nextTop, 0, maxScroll),
          behavior: "auto",
        });
      }
    },
    { passive: true }
  );

  handViewport.addEventListener(
    "touchend",
    () => {
      touchStartX = null;
      touchStartY = null;
      swipeLocked = false;
    },
    { passive: true }
  );

  // Initialize
  if (bgImg.complete) buildHollowTunnelSprite();
  syncCanvasSize();
  readScrollProgress();
  currentProgress = targetProgress;
  prevProgress = currentProgress;
  renderHand(currentProgress);
  lastRenderedProgress = currentProgress;
  forceHandRender = false;
  requestAnimationFrame(tick);
})();
