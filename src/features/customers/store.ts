import { create } from "zustand";
import { createSelectors } from "@/stores/create-selectors";
import type { BookingSlot, BookingStatus } from "@/types/models";

export type CustomerStatus = "active" | "inactive";
export type CustomerSource = "enquiry" | "direct" | "manual";

export interface CustomerBooking {
  id: string;
  eventName: string;
  space: string;
  date: string;
  slot: BookingSlot;
  amount: number;
  status: BookingStatus;
}
export interface CustomerPayment {
  id: string;
  date: string;
  amount: number;
  method: string;
}
export interface CustomerInvoice {
  id: string;
  date: string;
  amount: number;
  status: "paid" | "pending" | "overdue";
}
export interface CustomerQuote {
  id: string;
  date: string;
  amount: number;
  status: "sent" | "accepted" | "declined";
}
export interface CustomerReminder {
  id: string;
  date: string;
  channel: "WhatsApp" | "Email" | "SMS";
  about: string;
  status: "sent" | "scheduled";
}
export type ContractStatus = "draft" | "sent" | "signed";

export interface CustomerContract {
  id: string;
  title: string;
  date: string;
  status: ContractStatus;
  eventName?: string;
  value?: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  status: CustomerStatus;
  source: CustomerSource;
  createdAt: string;
  bookings: CustomerBooking[];
  payments: CustomerPayment[];
  invoices: CustomerInvoice[];
  quotes: CustomerQuote[];
  reminders: CustomerReminder[];
  contracts: CustomerContract[];
}

export interface NewCustomerInput {
  name: string;
  email: string;
  phone: string;
  company?: string;
  source: CustomerSource;
  status?: CustomerStatus;
}

const empty = {
  bookings: [] as CustomerBooking[],
  payments: [] as CustomerPayment[],
  invoices: [] as CustomerInvoice[],
  quotes: [] as CustomerQuote[],
  reminders: [] as CustomerReminder[],
  contracts: [] as CustomerContract[],
};

const INITIAL: Customer[] = [
  {
    id: "cu-1",
    name: "Olivia Bennett",
    email: "olivia.bennett@gmail.com",
    phone: "+14155550148",
    company: "Bennett & Co.",
    status: "active",
    source: "direct",
    createdAt: "2025-11-04",
    bookings: [
      {
        id: "BK-2041",
        eventName: "Bennett–Cole Wedding",
        space: "Grand Atrium Hall",
        date: "2026-06-28",
        slot: "EVENING",
        amount: 420000,
        status: "CONFIRMED",
      },
      {
        id: "BK-1988",
        eventName: "Anniversary Dinner",
        space: "The Glasshouse Loft",
        date: "2026-02-14",
        slot: "EVENING",
        amount: 180000,
        status: "COMPLETED",
      },
    ],
    payments: [
      { id: "RCPT-5012", date: "2026-06-10", amount: 105000, method: "UPI" },
      { id: "RCPT-5018", date: "2026-06-20", amount: 315000, method: "Card" },
      { id: "RCPT-4901", date: "2026-02-01", amount: 180000, method: "Bank transfer" },
    ],
    invoices: [
      { id: "INV-1043", date: "2026-06-10", amount: 495600, status: "paid" },
      { id: "INV-0991", date: "2026-02-14", amount: 212400, status: "paid" },
    ],
    quotes: [
      { id: "QT-2980", date: "2026-05-20", amount: 495600, status: "accepted" },
    ],
    reminders: [
      {
        id: "RM-77",
        date: "2026-06-24",
        channel: "WhatsApp",
        about: "Balance payment due in 4 days",
        status: "sent",
      },
      {
        id: "RM-81",
        date: "2026-06-27",
        channel: "Email",
        about: "Event day checklist",
        status: "scheduled",
      },
    ],
    contracts: [
      {
        id: "CT-401",
        title: "Wedding rental agreement",
        date: "2026-05-22",
        status: "signed",
      },
    ],
  },
  {
    id: "cu-2",
    name: "Marcus Reid",
    email: "marcus@northwind.io",
    phone: "+14155550172",
    company: "Northwind Inc.",
    status: "active",
    source: "enquiry",
    createdAt: "2026-05-18",
    bookings: [
      {
        id: "BK-2040",
        eventName: "Northwind Offsite",
        space: "Riverside Pavilion",
        date: "2026-06-27",
        slot: "MORNING",
        amount: 190000,
        status: "CONFIRMED",
      },
    ],
    payments: [
      { id: "RCPT-5021", date: "2026-06-18", amount: 47500, method: "UPI" },
    ],
    invoices: [
      { id: "INV-1042", date: "2026-06-14", amount: 224200, status: "pending" },
    ],
    quotes: [
      { id: "QT-3011", date: "2026-05-19", amount: 224200, status: "accepted" },
    ],
    reminders: [
      {
        id: "RM-90",
        date: "2026-06-25",
        channel: "Email",
        about: "Balance payment reminder",
        status: "scheduled",
      },
    ],
    contracts: [
      {
        id: "CT-410",
        title: "Corporate hire agreement",
        date: "2026-05-20",
        status: "sent",
      },
    ],
  },
  {
    id: "cu-3",
    name: "Priya Nair",
    email: "priya.nair@aurora.org",
    phone: "+14155550110",
    company: "Aurora Foundation",
    status: "active",
    source: "enquiry",
    createdAt: "2026-04-02",
    bookings: [
      {
        id: "BK-2039",
        eventName: "Aurora Foundation Gala",
        space: "The Glasshouse Loft",
        date: "2026-06-25",
        slot: "EVENING",
        amount: 260000,
        status: "PENDING",
      },
    ],
    payments: [],
    invoices: [],
    quotes: [
      { id: "QT-2955", date: "2026-04-05", amount: 306800, status: "sent" },
    ],
    reminders: [
      {
        id: "RM-64",
        date: "2026-06-15",
        channel: "WhatsApp",
        about: "Quote follow-up",
        status: "sent",
      },
    ],
    contracts: [],
  },
  {
    id: "cu-4",
    name: "Daniel Cho",
    email: "daniel.cho@brightlabs.io",
    phone: "+14155550191",
    company: "Bright Labs",
    status: "inactive",
    source: "direct",
    createdAt: "2025-09-30",
    bookings: [
      {
        id: "BK-1902",
        eventName: "Product Launch",
        space: "Skyline Rooftop",
        date: "2025-11-12",
        slot: "EVENING",
        amount: 310000,
        status: "COMPLETED",
      },
    ],
    payments: [
      { id: "RCPT-4410", date: "2025-11-01", amount: 310000, method: "Card" },
    ],
    invoices: [
      { id: "INV-0880", date: "2025-11-01", amount: 365800, status: "paid" },
    ],
    quotes: [],
    reminders: [],
    contracts: [
      {
        id: "CT-388",
        title: "Rooftop hire agreement",
        date: "2025-10-28",
        status: "signed",
      },
    ],
  },
  {
    id: "cu-5",
    name: "Theo Lambert",
    email: "theo@brightlabs.io",
    phone: "+14155550199",
    company: "Bright Labs",
    status: "inactive",
    source: "enquiry",
    createdAt: "2026-06-20",
    ...empty,
    quotes: [
      { id: "QT-3011", date: "2026-05-19", amount: 63720, status: "sent" },
    ],
  },
];

export interface NewContractInput {
  customerId: string;
  title: string;
  eventName?: string;
  value?: number;
  status?: ContractStatus;
}

interface CustomersState {
  customers: Customer[];
  addCustomer: (input: NewCustomerInput) => Customer;
  setStatus: (id: string, status: CustomerStatus) => void;
  addContract: (input: NewContractInput) => CustomerContract;
  setContractStatus: (
    customerId: string,
    contractId: string,
    status: ContractStatus,
  ) => void;
}

let customerCounter = 6;
let contractCounter = 500;

const useCustomersStoreBase = create<CustomersState>()((set) => ({
  customers: INITIAL,
  addCustomer: (input) => {
    const customer: Customer = {
      id: `cu-${customerCounter++}`,
      name: input.name,
      email: input.email,
      phone: input.phone,
      company: input.company,
      status: input.status ?? "active",
      source: input.source,
      createdAt: new Date().toISOString().slice(0, 10),
      ...empty,
    };
    set((s) => ({ customers: [customer, ...s.customers] }));
    return customer;
  },
  setStatus: (id, status) =>
    set((s) => ({
      customers: s.customers.map((c) =>
        c.id === id ? { ...c, status } : c,
      ),
    })),
  addContract: (input) => {
    const contract: CustomerContract = {
      id: `CT-${contractCounter++}`,
      title: input.title,
      date: new Date().toISOString().slice(0, 10),
      status: input.status ?? "draft",
      eventName: input.eventName,
      value: input.value,
    };
    set((s) => ({
      customers: s.customers.map((c) =>
        c.id === input.customerId
          ? { ...c, contracts: [contract, ...c.contracts] }
          : c,
      ),
    }));
    return contract;
  },
  setContractStatus: (customerId, contractId, status) =>
    set((s) => ({
      customers: s.customers.map((c) =>
        c.id === customerId
          ? {
              ...c,
              contracts: c.contracts.map((k) =>
                k.id === contractId ? { ...k, status } : k,
              ),
            }
          : c,
      ),
    })),
}));

export const useCustomersStore = createSelectors(useCustomersStoreBase);

/** Derived stats for a customer. */
export function customerStats(c: Customer) {
  const totalSpent = c.payments.reduce((s, p) => s + p.amount, 0);
  const outstanding = c.invoices
    .filter((i) => i.status !== "paid")
    .reduce((s, i) => s + i.amount, 0);
  const lastBooking = c.bookings
    .map((b) => b.date)
    .sort()
    .at(-1);
  return {
    totalSpent,
    outstanding,
    bookings: c.bookings.length,
    lastBooking,
  };
}
