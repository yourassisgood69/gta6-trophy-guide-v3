const STORAGE_KEY = "leonida-trophy-guide-earned-v4";

export function createStore() {
  let earned = new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        earned = new Set(parsed.filter((id) => Number.isInteger(id)));
      }
    }
  } catch (error) {
    earned = new Set();
  }

  function save() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
    } catch (error) {
      // Storage may be unavailable; progress still works for this visit.
    }
  }

  function isEarned(id) {
    return earned.has(id);
  }

  function toggleEarned(id) {
    if (earned.has(id)) {
      earned.delete(id);
    } else {
      earned.add(id);
    }
    save();
    return earned.has(id);
  }

  function setEarned(id, value) {
    if (value) {
      earned.add(id);
    } else {
      earned.delete(id);
    }
    save();
  }

  function earnedIds() {
    return [...earned].sort((a, b) => a - b);
  }

  function earnedCount() {
    return earned.size;
  }

  function replaceEarned(ids) {
    earned = new Set(ids.filter((id) => Number.isInteger(id)));
    save();
  }

  function clearAll() {
    earned = new Set();
    save();
  }

  return { isEarned, toggleEarned, setEarned, earnedIds, earnedCount, replaceEarned, clearAll };
}

export function exportProgress(earnedIds, total) {
  const payload = {
    app: "Leonida Trophy Guide",
    exportedAt: new Date().toISOString(),
    total,
    earned: earnedIds
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "gta6-trophy-progress.json";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function importProgressFile(file) {
  return file.text().then((text) => {
    const parsed = JSON.parse(text);
    const ids = Array.isArray(parsed) ? parsed : parsed.earned;
    if (!Array.isArray(ids)) {
      throw new Error("That file does not hold a progress list.");
    }
    return ids;
  });
}
