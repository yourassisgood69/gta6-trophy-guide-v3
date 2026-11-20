import { loadTrophies, gradeLabel, kindLabel } from "./data.js";
import { createStore, exportProgress, importProgressFile } from "./store.js";
import { createFilterState, changeView, applyFilters } from "./filters.js";
import { buildTrophyCard, renderRoadmap, missableWhyText } from "./views.js";

const store = createStore();
const state = createFilterState();
let trophies = [];
let currentDialogTrophy = null;

const listElement = document.getElementById("trophy-list");
const missablesElement = document.getElementById("missables-list");
const resultLine = document.getElementById("result-line");
const emptyNote = document.getElementById("empty-note");
const progressBar = document.getElementById("progress-bar");
const progressFill = document.getElementById("progress-fill");
const progressText = document.getElementById("progress-text");
const searchInput = document.getElementById("search-input");
const gradeSelect = document.getElementById("grade-select");
const kindSelect = document.getElementById("kind-select");
const missableOnlyBox = document.getElementById("missable-only");
const spoilerToggle = document.getElementById("spoiler-toggle");
const earnedOnlyBox = document.getElementById("earned-only");
const roadmapSection = document.getElementById("roadmap-section");
const missablesSection = document.getElementById("missables-section");
const saveNote = document.getElementById("save-note");
const dialog = document.getElementById("detail-dialog");

function updateProgress() {
  const earned = store.earnedCount();
  const total = trophies.length;
  progressBar.setAttribute("aria-valuemax", String(total));
  progressBar.setAttribute("aria-valuenow", String(earned));
  progressBar.setAttribute("aria-valuetext", earned + " of " + total + " trophies earned");
  progressFill.style.width = total ? (earned / total) * 100 + "%" : "0%";
  progressText.textContent = earned + " of " + total + " earned";
}

function renderList() {
  const shown = applyFilters(trophies, state, (id) => store.isEarned(id));
  listElement.textContent = "";
  shown.forEach((trophy) => {
    listElement.appendChild(buildTrophyCard(trophy, state, store, openGuide));
  });
  const word = shown.length === 1 ? "trophy" : "trophies";
  resultLine.textContent = "Showing " + shown.length + " of " + trophies.length + " " + word + ".";
  emptyNote.hidden = shown.length !== 0;
  updateProgress();
}

function renderMissables() {
  missablesElement.textContent = "";
  trophies
    .filter((trophy) => trophy.missable)
    .forEach((trophy) => {
      missablesElement.appendChild(buildTrophyCard(trophy, state, store, openGuide));
    });
}

function setView(view) {
  changeView(state, view);
  gradeSelect.value = "all";
  searchInput.value = "";
  missableOnlyBox.checked = false;
  state.missableOnly = false;
  document.querySelectorAll(".view-button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.view === view);
  });
  roadmapSection.hidden = view !== "roadmap";
  // The roadmap view shows the missable cards beneath the stages, so the
  // three trophies that can be missed are visible beside the plan.
  missablesSection.hidden = view !== "missables" && view !== "roadmap";
  listElement.parentElement.hidden = view === "roadmap";
  resultLine.hidden = view === "roadmap";
  if (view === "missables" || view === "roadmap") {
    renderMissables();
  }
  renderList();
}

function openGuide(trophy) {
  currentDialogTrophy = trophy;
  document.getElementById("dialog-title").textContent = trophy.name;
  document.getElementById("dialog-meta").textContent =
    gradeLabel(trophy.grade) + " · " + kindLabel(trophy.kind) +
    (trophy.hidden ? " · Hidden" : "") +
    (trophy.missable ? " · Missable" : "") +
    (trophy.unconfirmed ? " · Method unconfirmed" : "");
  document.getElementById("dialog-desc").textContent = trophy.description;
  document.getElementById("dialog-guide").textContent = trophy.guide;
  const why = document.getElementById("dialog-why");
  if (trophy.missable) {
    why.hidden = false;
    why.textContent = missableWhyText(trophy);
  } else {
    why.hidden = true;
    why.textContent = "";
  }
  const earnedButton = document.getElementById("dialog-earned");
  earnedButton.textContent = store.isEarned(trophy.id) ? "Mark not earned" : "Mark earned";
  if (typeof dialog.showModal === "function") {
    dialog.showModal();
  }
}

document.querySelectorAll(".view-button").forEach((button) => {
  button.addEventListener("click", () => setView(button.dataset.view));
});
searchInput.addEventListener("input", () => {
  state.search = searchInput.value;
  renderList();
});
gradeSelect.addEventListener("change", () => {
  state.grade = gradeSelect.value;
  renderList();
});
kindSelect.addEventListener("change", () => {
  state.kind = kindSelect.value;
  renderList();
});
missableOnlyBox.addEventListener("change", () => {
  state.missableOnly = missableOnlyBox.checked;
  renderList();
});
spoilerToggle.addEventListener("change", () => {
  state.hideSpoilers = spoilerToggle.checked;
  renderList();
});
earnedOnlyBox.addEventListener("change", () => {
  state.earnedOnly = earnedOnlyBox.checked;
  renderList();
});
document.addEventListener("progress-changed", () => {
  updateProgress();
  if (state.earnedOnly) {
    renderList();
  }
  if (state.hideSpoilers) {
    renderList();
  }
});
document.getElementById("export-button").addEventListener("click", () => {
  exportProgress(store.earnedIds(), trophies.length);
  saveNote.textContent = "Progress exported as a file.";
});
document.getElementById("import-button").addEventListener("click", () => {
  document.getElementById("import-file").click();
});
document.getElementById("import-file").addEventListener("change", (event) => {
  const file = event.target.files && event.target.files[0];
  if (!file) {
    return;
  }
  importProgressFile(file)
    .then((ids) => {
      const valid = ids.filter((id) => trophies.some((trophy) => trophy.id === id));
      store.replaceEarned(valid);
      saveNote.textContent = "Imported " + valid.length + " earned trophies.";
      renderList();
      renderMissables();
    })
    .catch(() => {
      saveNote.textContent = "That file could not be imported. It must hold a progress list.";
    });
  event.target.value = "";
});
document.getElementById("reset-button").addEventListener("click", () => {
  store.clearAll();
  saveNote.textContent = "Progress reset.";
  renderList();
  renderMissables();
});
document.getElementById("dialog-close").addEventListener("click", () => {
  dialog.close();
});
document.getElementById("dialog-earned").addEventListener("click", () => {
  if (!currentDialogTrophy) {
    return;
  }
  const earned = store.toggleEarned(currentDialogTrophy.id);
  document.getElementById("dialog-earned").textContent = earned ? "Mark not earned" : "Mark earned";
  renderList();
  renderMissables();
});

loadTrophies()
  .then((loaded) => {
    trophies = loaded;
    renderRoadmap(document.getElementById("roadmap-list"), trophies);
    renderMissables();
    renderList();
  })
  .catch(() => {
    resultLine.textContent = "The trophy list could not be loaded. Reload the page to try again.";
  });
