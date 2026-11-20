export function createFilterState() {
  return {
    view: "all",
    grade: "all",
    kind: "all",
    search: "",
    missableOnly: false,
    earnedOnly: false,
    hideSpoilers: false
  };
}

// Switching views clears any stale grade filter and search text, so a view
// that matched nothing before can never hide the cards of the next view.
// In particular, opening the missable view always shows the missable cards,
// even when the previous grade view matched nothing.
export function changeView(state, view) {
  state.view = view;
  state.grade = "all";
  state.search = "";
  return state;
}

export function applyFilters(trophies, state, isEarned) {
  const needle = state.search.trim().toLowerCase();
  return trophies.filter((trophy) => {
    if (state.view === "missables" && !trophy.missable) {
      return false;
    }
    if (state.grade !== "all" && trophy.grade !== state.grade) {
      return false;
    }
    if (state.kind !== "all" && trophy.kind !== state.kind) {
      return false;
    }
    if (state.missableOnly && !trophy.missable) {
      return false;
    }
    if (state.earnedOnly && !isEarned(trophy.id)) {
      return false;
    }
    if (needle) {
      const haystack = [trophy.name, trophy.description, trophy.guide].join(" ").toLowerCase();
      if (!haystack.includes(needle)) {
        return false;
      }
    }
    return true;
  });
}

export function isSpoilerHidden(trophy, state, earned) {
  return state.hideSpoilers && trophy.kind === "story" && !earned;
}
