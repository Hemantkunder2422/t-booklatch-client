import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { createSelectors } from "./create-selectors";

interface UIState {
  /** Currently active venue id (drives the venue switcher). */
  activeVenueId: string | null;
  /** Persisted command-palette / global search open state, etc. */
  commandOpen: boolean;

  setActiveVenue: (id: string | null) => void;
  setCommandOpen: (open: boolean) => void;
  toggleCommand: () => void;
}

/**
 * Example client-only UI store. Use for cross-component UI state that isn't
 * server data (active venue, modals, command palette, layout prefs…).
 */
const useUIStoreBase = create<UIState>()(
  devtools(
    persist(
      (set) => ({
        activeVenueId: null,
        commandOpen: false,

        setActiveVenue: (id) =>
          set({ activeVenueId: id }, false, "ui/setActiveVenue"),
        setCommandOpen: (open) =>
          set({ commandOpen: open }, false, "ui/setCommandOpen"),
        toggleCommand: () =>
          set((s) => ({ commandOpen: !s.commandOpen }), false, "ui/toggleCommand"),
      }),
      {
        name: "booklatch.ui",
        partialize: (state) => ({ activeVenueId: state.activeVenueId }),
      },
    ),
    { name: "UIStore" },
  ),
);

export const useUIStore = createSelectors(useUIStoreBase);
