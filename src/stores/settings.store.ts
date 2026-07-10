import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { createSelectors } from "./create-selectors";

/**
 * Venue payment settings. This is the single source of truth for how the venue
 * collects money — read by the Settings screen (to edit) and by the payment
 * collection page (to build the UPI QR, apply the default deposit %, etc.).
 */
export interface PaymentSettings {
  /** Payee/business name shown on the UPI QR + receipts. */
  payeeName: string;
  gateway: string;
  connected: boolean;
  upiEnabled: boolean;
  upiId: string;
  posConnected: boolean;
  posProvider: string;
  posTerminalId: string;
  /** Default advance/deposit percentage (kept as a string for the input). */
  depositPct: string;
  payoutSchedule: string;
}

const DEFAULT_PAYMENTS: PaymentSettings = {
  payeeName: "Aurora Events",
  gateway: "stripe",
  connected: true,
  upiEnabled: true,
  upiId: "aurora-events@okhdfcbank",
  posConnected: false,
  posProvider: "square",
  posTerminalId: "",
  depositPct: "25",
  payoutSchedule: "weekly",
};

interface SettingsState {
  payments: PaymentSettings;
  setPayments: (patch: Partial<PaymentSettings>) => void;
}

const useSettingsStoreBase = create<SettingsState>()(
  devtools(
    persist(
      (set) => ({
        payments: DEFAULT_PAYMENTS,
        setPayments: (patch) =>
          set(
            (s) => ({ payments: { ...s.payments, ...patch } }),
            false,
            "settings/setPayments",
          ),
      }),
      { name: "booklatch.settings" },
    ),
    { name: "SettingsStore" },
  ),
);

export const useSettingsStore = createSelectors(useSettingsStoreBase);

/** Non-reactive accessor for use outside React. */
export const settingsStore = {
  getPayments: () => useSettingsStoreBase.getState().payments,
};
