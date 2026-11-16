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
  const stageSticky = document.querySelector(".stage-sticky");
  const handViewport = document.querySelector(".hand-viewport");
  const cards = Array.from(document.querySelectorAll(".playing-card"));
  const pills = Array.from(document.querySelectorAll(".pill"));
  const tunnelLayers = Array.from(document.querySelectorAll(".bg-tunnel-layer"));
  const tunnelFrames = Array.from(document.querySelectorAll(".bg-tunnel-frame"));
  const progressFill = document.getElementById("progressFill");
  const activeCounter = document.getElementById("activeCounter");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const selectionToast = document.getElementById("selectionToast");

  const CARD_COUNT = cards.length;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let targetProgress = 0;
  let currentProgress = 0;
  let prevProgress = 0;
  let targetBgX = 0;
  let targetBgY = 0;
  let currentBgX = 0;
  let currentBgY = 0;
  let tunnelClock = 0;
  let warpIntensity = 0;
  let lastFrameTime = performance.now();
  let lastClosestIndex = -1;
  let toastTimer = null;

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
    }

    targetProgress = clamp(scrollTop / maxScroll, 0, 1);
  }

  function scrollToStep(stepDelta) {
    const maxScroll = getMaxScroll();
    const currentStep = Math.round(currentProgress * CARD_COUNT);
    let desiredStep = currentStep + stepDelta;

    if (desiredStep < 0) {
      // Wrap silently to bottom cycle before smooth-scrolling backward
      const wrapTop = maxScroll - 6;
      window.scrollTo({ top: wrapTop, behavior: "instant" });
      currentProgress += 1;
      prevProgress += 1;
      desiredStep += CARD_COUNT;
    } else if (desiredStep > CARD_COUNT) {
      const wrapTop = 4;
      window.scrollTo({ top: wrapTop, behavior: "instant" });
      currentProgress -= 1;
      prevProgress -= 1;
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

  function animateTunnel(dt, scrollDelta) {
    if (reducedMotion) return;

    // Continuous deep-sinking speed + extra warp acceleration while scrolling
    const instantSpeed = Math.min(2.2, Math.abs(scrollDelta) * 32);
    warpIntensity += (instantSpeed - warpIntensity) * 0.12;
    tunnelClock = (tunnelClock + dt * (0.16 + warpIntensity)) % 1000;

    stageSticky.style.setProperty("--bg-warp", Math.min(1, warpIntensity).toFixed(3));

    tunnelLayers.forEach((layer) => {
      const basePhase = Number(layer.dataset.phase) || 0;
      const p = (basePhase + tunnelClock) % 1;

      // Exponential perspective scale: emerges tiny from center portal, rushes past screen edges
      const scale = 0.24 * Math.pow(9.6, p);
      const fadeIn = smoothstep(0.0, 0.16, p);
      const fadeOut = 1 - smoothstep(0.84, 1.0, p);
      const opacity = fadeIn * fadeOut;
      const rot = Math.sin((p + tunnelClock * 0.35) * Math.PI * 2) * 0.35;

      layer.style.zIndex = String(Math.round(p * 100));
      layer.style.opacity = opacity.toFixed(3);
      layer.style.transform = `scale(${scale.toFixed(4)}) rotate(${rot.toFixed(2)}deg)`;
    });

    tunnelFrames.forEach((frame) => {
      const baseFrame = Number(frame.dataset.frame) || 0;
      const fp = (baseFrame + tunnelClock * 1.18) % 1;

      const fScale = 0.14 * Math.pow(13, fp);
      const fOp = smoothstep(0.02, 0.22, fp) * (1 - smoothstep(0.74, 1.0, fp)) * 0.65;

      frame.style.zIndex = String(Math.round(fp * 100) + 1);
      frame.style.opacity = fOp.toFixed(3);
      frame.style.transform = `scale(${fScale.toFixed(4)})`;
    });
  }

  function renderHand(progress) {
    const wrappedProgress = ((progress % 1) + 1) % 1;
    stageSticky.style.setProperty("--scroll-p", wrappedProgress.toFixed(4));
    progressFill.style.transform = `scaleX(${wrappedProgress.toFixed(4)})`;

    // Full 5-card cycle: 0..5 where 5 wraps seamlessly back to 0 (Profile)
    const activePos = progress * CARD_COUNT;
    const closestIdx = ((Math.round(activePos) % CARD_COUNT) + CARD_COUNT) % CARD_COUNT;
    updateHeaderAndPills(closestIdx);

    const cardWidth = cards[0] ? cards[0].offsetWidth : 240;
    const viewportW = window.innerWidth;
    const spread = clamp((viewportW - cardWidth * 0.72) * 0.44, 104, cardWidth * 1.18);
    const maxRot = viewportW < 640 ? 14 : 22;

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
      const tz = depth * 120 - 60;
      const rot = fanCurve * maxRot;
      const ry = -fanCurve * 12;
      const scale = 0.76 + 0.28 * Math.pow(depth, 1.35);
      const zIndex = Math.round(depth * 100);
      const bright = 0.7 + 0.3 * Math.pow(depth, 0.8);
      const activeStrength = Math.pow(clamp(1 - Math.abs(offset) * 1.35, 0, 1), 1.5);

      card.style.setProperty("--tx", `${tx.toFixed(2)}px`);
      card.style.setProperty("--ty", `${ty.toFixed(2)}px`);
      card.style.setProperty("--tz", `${tz.toFixed(2)}px`);
      card.style.setProperty("--rot", `${rot.toFixed(2)}deg`);
      card.style.setProperty("--ry", `${ry.toFixed(2)}deg`);
      card.style.setProperty("--scale", scale.toFixed(4));
      card.style.setProperty("--z", String(zIndex));
      card.style.setProperty("--bright", bright.toFixed(3));
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
      currentProgress += (targetProgress - currentProgress) * 0.14;
      if (Math.abs(targetProgress - currentProgress) < 0.0002) {
        currentProgress = targetProgress;
      }
      currentBgX += (targetBgX - currentBgX) * 0.08;
      currentBgY += (targetBgY - currentBgY) * 0.08;
      stageSticky.style.setProperty("--bg-px", `${currentBgX.toFixed(2)}px`);
      stageSticky.style.setProperty("--bg-py", `${currentBgY.toFixed(2)}px`);
    }

    const scrollDelta = currentProgress - prevProgress;
    prevProgress = currentProgress;

    animateTunnel(dt, scrollDelta);
    renderHand(currentProgress);
    requestAnimationFrame(tick);
  }

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
      }
    },
    { passive: true }
  );

  // Subtle Pointer Parallax on Background Tunnel
  window.addEventListener(
    "pointermove",
    (e) => {
      if (reducedMotion) return;
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      targetBgX = -nx * 24;
      targetBgY = -ny * 14;
    },
    { passive: true }
  );

  function enhanceCardEffects(card) {
    const rimBeam = document.createElement("div");
    rimBeam.className = "card-rim-beam";
    rimBeam.setAttribute("aria-hidden", "true");
    card.prepend(rimBeam);

    const cardInner = card.querySelector(".card-inner");
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

    card.addEventListener("pointerenter", () => {
      if (reducedMotion) return;
      card.classList.add("is-tilting");
    });

    card.addEventListener("pointermove", (e) => {
      if (reducedMotion) return;
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

  // Horizontal touch swipe support on the card hand area
  let touchStartX = null;
  let touchStartScroll = 0;

  handViewport.addEventListener(
    "touchstart",
    (e) => {
      if (e.touches.length !== 1) return;
      touchStartX = e.touches[0].clientX;
      touchStartScroll = window.scrollY;
    },
    { passive: true }
  );

  handViewport.addEventListener(
    "touchmove",
    (e) => {
      if (touchStartX === null || e.touches.length !== 1) return;
      const dx = touchStartX - e.touches[0].clientX;
      const sensitivity = getMaxScroll() / (window.innerWidth * 1.4);
      const nextTop = touchStartScroll + dx * sensitivity;
      const maxScroll = getMaxScroll();

      if (nextTop >= maxScroll - 3) {
        window.scrollTo({ top: 4, behavior: "instant" });
        touchStartScroll = 4 - dx * sensitivity;
        currentProgress -= 1;
        prevProgress -= 1;
      } else if (nextTop <= 2 && dx < 0) {
        window.scrollTo({ top: maxScroll - 6, behavior: "instant" });
        touchStartScroll = maxScroll - 6 - dx * sensitivity;
        currentProgress += 1;
        prevProgress += 1;
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
    },
    { passive: true }
  );

  // Initialize
  readScrollProgress();
  currentProgress = targetProgress;
  prevProgress = currentProgress;
  animateTunnel(0.016, 0);
  renderHand(currentProgress);
  requestAnimationFrame(tick);
})();
