import { gradeLabel, kindLabel } from "./data.js";
import { isSpoilerHidden } from "./filters.js";

export const ROADMAP_STAGES = [
  {
    title: "Stage 1 — Play the story",
    text: "Chapters 1 to 4, the named missions, and the final mission. Every story trophy lands here, and the three missable moments happen during this stage, so keep a save before big decisions.",
    stage: 1
  },
  {
    title: "Stage 2 — Strangers and side missions",
    text: "Finish the stranger strands for Andy, Kenton, Billy, Randy and Tyrone, plus the hunt for Bret, until eight stranger strands are complete.",
    stage: 2
  },
  {
    title: "Stage 3 — Activities and skills",
    text: "Stunts, the shooting range, races, drone races, fishing, the arcade and bowling. Sample every activity type early, then gold the range and win the races.",
    stage: 3
  },
  {
    title: "Stage 4 — Collectibles and exploration",
    text: "Meditation spots, card sets, WAiNK locations, vehicles, garage properties and every area of Leonida. Sweep the map area by area so nothing is left behind.",
    stage: 4
  },
  {
    title: "Stage 5 — Combat, heists and money",
    text: "Robberies, wanted escapes, combat focus and gang operations, then laundering, spending and vehicle registration. Finish with 100 percent completion, and the platinum follows.",
    stage: 5
  }
];

function tagElement(text, className) {
  const tag = document.createElement("span");
  tag.className = "tag " + className;
  tag.textContent = text;
  return tag;
}

export function buildTrophyCard(trophy, state, store, onOpenGuide) {
  const card = document.createElement("article");
  card.className = "trophy-card";
  card.tabIndex = 0;
  card.setAttribute("role", "button");
  card.dataset.trophyId = String(trophy.id);
  card.setAttribute("aria-label", trophy.name + ", " + trophy.grade + " trophy");
  if (store.isEarned(trophy.id)) {
    card.classList.add("is-earned");
  }

  const badge = document.createElement("span");
  badge.className = "grade-badge grade-" + trophy.grade;
  badge.textContent = gradeLabel(trophy.grade);
  card.appendChild(badge);

  const heading = document.createElement("h3");
  const hiddenSpoiler = isSpoilerHidden(trophy, state, store.isEarned(trophy.id));
  heading.textContent = hiddenSpoiler ? "Hidden story trophy" : trophy.name;
  card.appendChild(heading);

  const desc = document.createElement("p");
  desc.className = "card-desc";
  desc.textContent = hiddenSpoiler ? "Earn this trophy to reveal its name and description." : trophy.description;
  card.appendChild(desc);

  const tags = document.createElement("p");
  tags.appendChild(tagElement(kindLabel(trophy.kind), ""));
  if (trophy.hidden) {
    tags.appendChild(tagElement("Hidden", "tag-hidden"));
  }
  if (trophy.count) {
    tags.appendChild(tagElement("Target: " + trophy.count, ""));
  }
  if (trophy.missable) {
    tags.appendChild(tagElement("Missable", "tag-missable"));
  }
  if (trophy.unconfirmed) {
    tags.appendChild(tagElement("Method unconfirmed", "tag-unconfirmed"));
  }
  card.appendChild(tags);

  if (!hiddenSpoiler) {
    const guide = document.createElement("p");
    guide.className = "card-guide";
    guide.textContent = trophy.guide;
    card.appendChild(guide);
  }

  const foot = document.createElement("div");
  foot.className = "card-foot";
  const earnedBox = document.createElement("input");
  earnedBox.type = "checkbox";
  earnedBox.checked = store.isEarned(trophy.id);
  earnedBox.setAttribute("aria-label", "Mark " + trophy.name + " earned");
  earnedBox.addEventListener("click", (event) => {
    event.stopPropagation();
  });
  earnedBox.addEventListener("change", () => {
    store.setEarned(trophy.id, earnedBox.checked);
    card.classList.toggle("is-earned", earnedBox.checked);
    document.dispatchEvent(new CustomEvent("progress-changed"));
  });
  const earnedLabel = document.createElement("label");
  earnedLabel.className = "earned-label";
  earnedLabel.appendChild(earnedBox);
  earnedLabel.appendChild(document.createTextNode(" Earned"));
  // A click on the label must only toggle the box, never open the guide:
  // the label sits inside the card, so its click would bubble to the card.
  earnedLabel.addEventListener("click", (event) => {
    event.stopPropagation();
  });
  foot.appendChild(earnedLabel);
  if (!hiddenSpoiler) {
    const guideButton = document.createElement("button");
    guideButton.type = "button";
    guideButton.className = "guide-button";
    guideButton.textContent = "Open guide";
    guideButton.addEventListener("click", (event) => {
      event.stopPropagation();
      onOpenGuide(trophy);
    });
    foot.appendChild(guideButton);
  }
  card.appendChild(foot);

  function open() {
    if (!isSpoilerHidden(trophy, state, store.isEarned(trophy.id))) {
      onOpenGuide(trophy);
    }
  }
  card.addEventListener("click", open);
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      open();
    }
  });
  return card;
}

export function renderRoadmap(listElement, trophies) {
  listElement.textContent = "";
  ROADMAP_STAGES.forEach((stage) => {
    const item = document.createElement("li");
    const heading = document.createElement("h3");
    heading.textContent = stage.title;
    item.appendChild(heading);
    const text = document.createElement("p");
    text.textContent = stage.text;
    item.appendChild(text);
    const names = document.createElement("p");
    names.className = "roadmap-trophies";
    names.textContent = trophies
      .filter((trophy) => trophy.stage === stage.stage)
      .map((trophy) => trophy.name + " (" + gradeLabel(trophy.grade) + ")")
      .join(" · ");
    item.appendChild(names);
    listElement.appendChild(item);
  });
}

export function missableWhyText(trophy) {
  if (trophy.id === 48) {
    return "Why it can be missed: a story choice, once made, cannot be taken back on that save.";
  }
  if (trophy.id === 49) {
    return "Why it can be missed: a second chance may only be offered once, so succeeding first time or walking away can close it.";
  }
  if (trophy.id === 50) {
    return "Why it can be missed: a strange one-off event may only trigger once, so leaving the area can mean it never comes again.";
  }
  return "Why it can be missed: a one-time story moment can be locked out by progress.";
}
