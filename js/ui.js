function renderBottomNav(activePage, isAdmin = false) {
  const base = getBasePath();
  const items = [
    { href: `${base}home.html`, icon: "🏠", label: "Today", id: "home" },
    { href: `${base}week.html`, icon: "📅", label: "Week", id: "week" },
  ];

  if (isAdmin) {
    const adminBase = base ? "index.html" : "admin/index.html";
    items.push({ href: `${base}${adminBase}`, icon: "⚙️", label: "Admin", id: "admin" });
  }

  items.push({ href: "#", icon: "🚪", label: "Logout", id: "logout", action: "logout" });

  const nav = document.createElement("nav");
  nav.className = "bottom-nav";
  nav.innerHTML = `
    <div class="bottom-nav__inner">
      ${items
        .map(
          (item) => `
        <a href="${item.href}" class="bottom-nav__item${activePage === item.id ? " bottom-nav__item--active" : ""}"
           ${item.action ? `data-action="${item.action}"` : ""}>
          <span class="bottom-nav__icon">${item.icon}</span>
          <span>${item.label}</span>
        </a>`
        )
        .join("")}
    </div>
  `;

  nav.querySelector('[data-action="logout"]')?.addEventListener("click", async (e) => {
    e.preventDefault();
    await signOut();
    window.location.href = `${getBasePath()}login.html`;
  });

  return nav;
}

function mountBottomNav(activePage, profile) {
  const existing = document.querySelector(".bottom-nav");
  if (existing) existing.remove();
  document.body.appendChild(renderBottomNav(activePage, profile?.role === "admin"));
}

function renderWorkoutMeta(workout) {
  const parts = [];
  if (workout.type) {
    parts.push(`<span class="type-badge type-badge--${workout.type}">${escapeHtml(getWorkoutTypeLabel(workout.type))}</span>`);
  }
  if (workout.focus) {
    parts.push(`<span class="focus-badge">${escapeHtml(getFocusLabel(workout.focus))}</span>`);
  }
  return parts.length ? `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px">${parts.join("")}</div>` : "";
}

function renderExerciseThumb(exercise, size = "md") {
  const name = escapeHtml(exercise.name || "Exercise");
  const initials = escapeHtml(getExerciseInitials(exercise.name));
  const sizeClass = size === "sm" ? "exercise-thumb--sm" : "";

  if (exercise.imageUrl) {
    return `
      <div class="exercise-thumb ${sizeClass}" title="${name}">
        <img src="${escapeHtml(exercise.imageUrl)}" alt="${name}" loading="lazy"
             onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
        <span class="exercise-thumb__fallback" style="display:none">${initials}</span>
      </div>`;
  }

  return `
    <div class="exercise-thumb exercise-thumb--placeholder ${sizeClass}" title="${name}">
      <span class="exercise-thumb__fallback">${initials}</span>
    </div>`;
}

function renderExerciseVideoBlock(exercise, index) {
  const videoId = parseYoutubeId(exercise.youtubeUrl);
  if (!videoId) return "";

  return `
    <button type="button" class="exercise-video-toggle" data-video-index="${index}" data-video-id="${videoId}" aria-expanded="false">
      ▶ Watch demo
    </button>
    <div class="exercise-video" id="exercise-video-${index}" hidden>
      <div class="exercise-video__frame">
        <iframe
          data-src="${getYoutubeEmbedUrl(videoId)}"
          title="${escapeHtml(exercise.name)} demo video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          loading="lazy"></iframe>
      </div>
    </div>`;
}

function initExerciseListMedia(container) {
  if (!container) return;

  container.querySelectorAll(".exercise-video-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = btn.dataset.videoIndex;
      const panel = container.querySelector(`#exercise-video-${index}`);
      if (!panel) return;

      const isOpen = !panel.hidden;
      if (isOpen) {
        panel.hidden = true;
        btn.setAttribute("aria-expanded", "false");
        btn.textContent = "▶ Watch demo";
        const iframe = panel.querySelector("iframe");
        if (iframe) {
          iframe.removeAttribute("src");
        }
        return;
      }

      panel.hidden = false;
      btn.setAttribute("aria-expanded", "true");
      btn.textContent = "▼ Hide video";
      const iframe = panel.querySelector("iframe");
      if (iframe && iframe.dataset.src && !iframe.src) {
        iframe.src = iframe.dataset.src;
      }
    });
  });
}

function mountExerciseList(container, html) {
  container.innerHTML = html;
  initExerciseListMedia(container);
}

function renderExerciseDetail(item, workoutType) {
  if (workoutType === "cardio") {
    const parts = [];
    if (item.durationMin) parts.push(`${item.durationMin} min`);
    if (item.intensity) parts.push(escapeHtml(String(item.intensity)));
    if (item.distance) parts.push(`${escapeHtml(String(item.distance))}`);
    return parts.join(" · ") || "Cardio session";
  }
  const detail = `${item.sets || 0} sets × ${escapeHtml(String(item.reps || ""))}`;
  return item.restSec ? `${detail} · ${item.restSec}s rest` : detail;
}

function renderExerciseList(exercises, emptyMessage = "No exercises scheduled.", workoutType = "weight") {
  if (!exercises.length) {
    return `<div class="empty-state"><div class="empty-state__icon">💪</div><p>${emptyMessage}</p></div>`;
  }

  return exercises
    .map(
      (item, i) => `
    <div class="exercise-item">
      ${renderExerciseThumb(item.exercise)}
      <div class="exercise-item__body">
        <div class="exercise-item__header">
          <div class="exercise-item__name">${escapeHtml(item.exercise.name)}</div>
          <span class="exercise-item__num">${i + 1}</span>
        </div>
        <div class="exercise-item__detail">${renderExerciseDetail(item, workoutType)}</div>
        <div class="exercise-item__tags">
          <span class="tag">${escapeHtml(item.exercise.muscleGroup)}</span>
          <span class="tag">${escapeHtml(item.exercise.equipment)}</span>
        </div>
        ${item.exercise.notes ? `<div class="exercise-item__detail" style="margin-top:4px">${escapeHtml(item.exercise.notes)}</div>` : ""}
        ${renderExerciseVideoBlock(item.exercise, i)}
      </div>
    </div>`
    )
    .join("");
}

function showFirebaseSetupBanner() {
  if (typeof FIREBASE_CONFIGURED !== "undefined" && FIREBASE_CONFIGURED) return;

  const banner = document.createElement("div");
  banner.className = "alert alert--info";
  banner.style.cssText = "position:fixed;top:0;left:0;right:0;z-index:999;border-radius:0;margin:0;";
  banner.textContent = "Firebase not configured — edit js/firebase-config.js with your project details.";
  document.body.prepend(banner);
}

function renderFocusOptions(selected = "") {
  return WORKOUT_FOCUSES.map(
    (f) => `<option value="${f.id}"${f.id === selected ? " selected" : ""}>${f.label}</option>`
  ).join("");
}

function renderTypeOptions(selected = "weight") {
  return WORKOUT_TYPES.map(
    (t) => `<option value="${t.id}"${t.id === selected ? " selected" : ""}>${t.label}</option>`
  ).join("");
}
