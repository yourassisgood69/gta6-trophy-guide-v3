export async function loadTrophies() {
  const response = await fetch("data/trophies.json");
  if (!response.ok) {
    throw new Error("Could not load the trophy list.");
  }
  const data = await response.json();
  return Array.isArray(data) ? data : data.trophies;
}

export function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

export function kindLabel(kind) {
  const labels = {
    activity: "Activities",
    combat: "Combat and heists",
    collectible: "Collectibles",
    economy: "Economy",
    exploration: "Exploration",
    other: "Other moments",
    story: "Story"
  };
  return labels[kind] || kind;
}
