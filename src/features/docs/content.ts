import type {
  Concept,
  NavGroup,
  NavItem,
  Role,
  RoleId,
  Scenario,
} from "./types";

/**
 * BookLatch documentation content — "Run your venue".
 *
 * Organized around real venue moments (jobs-to-be-done) rather than the
 * product's own menu. Each scenario threads through whatever features the
 * job touches, in the order you'd actually do them.
 */

/* ── The domain, taught once ──────────────────────────────────────── */

export const CONCEPTS: Concept[] = [
  {
    id: "venue",
    name: "Venue",
    short: "A property you manage.",
    detail:
      "The top-level thing you run — a banquet hall, a hotel, a farmhouse. Everything else lives inside a venue, and if you manage more than one, you switch between them from the venue picker.",
  },
  {
    id: "space",
    name: "Space",
    short: "A bookable area inside a venue.",
    detail:
      "The Grand Ballroom, the Garden Lawn, the Rooftop. A space is what actually gets reserved on a date — pricing, capacity and availability are tracked per space, not per venue.",
  },
  {
    id: "contact",
    name: "Contact / Customer",
    short: "The person or company you're dealing with.",
    detail:
      "Everyone you talk to lives in Contacts. Once they book, they're a customer — but it's one record, so a repeat client's enquiries, quotes, bookings and payments all stay in one place.",
  },
  {
    id: "enquiry",
    name: "Enquiry",
    short: "An inbound request — a lead.",
    detail:
      "Someone asking 'are you free on the 12th?'. An enquiry is the start of everything and blocks nothing on your calendar. It's a question to answer, not a commitment.",
  },
  {
    id: "quote",
    name: "Quote",
    short: "A priced proposal.",
    detail:
      "What you send back to turn interest into a decision — spaces, line items, taxes, a total. A quote can be accepted or declined, but accepting it still isn't a booking.",
  },
  {
    id: "package",
    name: "Package",
    short: "A reusable bundle of inclusions and pricing.",
    detail:
      "'Silver Wedding', 'Corporate Half-Day'. Build a package once and drop it into any quote or booking instead of retyping the same line items every time.",
  },
  {
    id: "booking",
    name: "Booking",
    short: "A confirmed reservation that blocks the calendar.",
    detail:
      "The moment a space is actually held for a date and time. A booking is the ONLY thing that makes the calendar say 'taken' — everything before it leaves the date open.",
  },
  {
    id: "invoice",
    name: "Invoice",
    short: "The bill for a booking.",
    detail:
      "What the customer owes, and when. You'll usually raise one for the deposit and one for the balance. Invoices carry their own status so you always know what's paid.",
  },
  {
    id: "payment",
    name: "Payment",
    short: "Money received against an invoice.",
    detail:
      "A deposit, a balance, a part-payment — recorded against an invoice so the outstanding amount updates automatically. Take it online (UPI / gateway) or record one that arrived offline.",
  },
  {
    id: "contract",
    name: "Contract",
    short: "The signed agreement for a booking.",
    detail:
      "The terms both sides agreed to, attached to the booking so the paperwork lives next to the reservation it belongs to.",
  },
  {
    id: "staff",
    name: "Staff & roles",
    short: "Your team and what they're allowed to do.",
    detail:
      "The people you invite in. A role decides what each person can see and change — so your front desk isn't editing payout settings and your accountant isn't reshaping packages.",
  },
];

/* ── Scenarios (jobs-to-be-done) ──────────────────────────────────── */

export const SCENARIOS: Scenario[] = [
  {
    slug: "an-enquiry-just-came-in",
    title: "An enquiry just came in",
    tagline:
      "A prospective client just asked if you're free. Capture it so nothing slips.",
    time: "3 min",
    roles: ["coordinator", "owner"],
    touches: ["Enquiries", "Contacts", "Calendar"],
    blocks: [
      {
        kind: "prose",
        text: "Every booking starts as a question. At this stage the goal isn't to close — it's to capture the details and reply fast, because response time is the single biggest predictor of whether an enquiry turns into a booking.",
      },
      { kind: "heading", text: "Log the enquiry" },
      {
        kind: "steps",
        items: [
          {
            title: "Open Enquiries and start a new one",
            detail:
              "From the sidebar, then New enquiry. If someone phoned or messaged you, log it here first — the tool only helps once it knows the lead exists.",
          },
          {
            title: "Record who's asking",
            detail:
              "Name, phone, email. If they've contacted you before, pick the existing contact instead of retyping — their whole history stays on one record.",
          },
          {
            title: "Capture the ask",
            detail:
              "Which space, the date, rough headcount (pax) and the type of event. Approximate is fine; you'll firm it up in the quote.",
          },
          {
            title: "Set the status",
            detail:
              "New enquiries start as New. Move them to Contacted once you've replied, and Qualified when it's a real opportunity worth quoting.",
          },
        ],
      },
      {
        kind: "callout",
        tone: "tip",
        title: "Treat it like an inbox, not an archive",
        text: "The enquiry list puts the freshest requests on top on purpose. Aim to reply within the hour — a same-day 'yes, and here's a quote' beats a perfect reply that lands two days later.",
      },
      { kind: "heading", text: "Check you can actually host it" },
      {
        kind: "steps",
        items: [
          {
            title: "Glance at the calendar",
            detail:
              "Before you promise anything, confirm the space is open on that date. See 'Is the space free?' for the fast way to check.",
          },
          {
            title: "Reply with a next step",
            detail:
              "If it's viable, the natural next move is a quote. Don't leave the customer with 'we'll get back to you' — give them something to say yes to.",
          },
        ],
      },
      {
        kind: "keypoints",
        title: "Remember",
        items: [
          "An enquiry is a lead — it blocks nothing on your calendar yet.",
          "Always link an enquiry to a contact so repeat clients build a history.",
          "Speed beats polish here. Capture, check, respond.",
        ],
      },
    ],
    related: ["is-the-space-free", "turn-an-enquiry-into-a-quote"],
  },
  {
    slug: "turn-an-enquiry-into-a-quote",
    title: "Turn an enquiry into a quote",
    tagline:
      "They're interested. Put a number on it — clearly enough that they can say yes.",
    time: "4 min",
    roles: ["coordinator", "owner"],
    touches: ["Quotes", "Packages", "Spaces"],
    blocks: [
      {
        kind: "prose",
        text: "A quote is where a vague 'how much would it be?' becomes a concrete decision. A good quote is easy to read, itemized enough to be trusted, and quick to build — which is exactly what packages are for.",
      },
      { kind: "heading", text: "Build the quote" },
      {
        kind: "steps",
        items: [
          {
            title: "Start from the enquiry or contact",
            detail:
              "Create a quote for the same customer so it stays attached to their history. Pick the space and the date you're quoting for.",
          },
          {
            title: "Drop in a package, or add line items",
            detail:
              "If the event fits a package you've built (e.g. 'Silver Wedding'), add it and adjust. Otherwise add line items — description, quantity, unit price — and let the total add up for you.",
          },
          {
            title: "Set taxes and any notes",
            detail:
              "Apply the right GST rate and add terms or inclusions the customer should see. What you write here is what they'll read.",
          },
          {
            title: "Review the total",
            detail:
              "Sanity-check the number before it leaves your hands. The quote total is the promise you're making.",
          },
        ],
      },
      {
        kind: "callout",
        tone: "tip",
        title: "Build packages once, quote in seconds",
        text: "If you find yourself typing the same line items on every quote, stop and make a package instead. Every future quote for that kind of event becomes a two-click job.",
      },
      { kind: "heading", text: "Send it and track the reply" },
      {
        kind: "steps",
        items: [
          {
            title: "Send the quote",
            detail:
              "Share it with the customer. The quote moves from Draft to Sent so you know it's out there.",
          },
          {
            title: "Watch the status",
            detail:
              "Sent → Accepted or Declined. An accepted quote is your green light to confirm the booking.",
          },
        ],
      },
      {
        kind: "callout",
        tone: "note",
        title: "A quote is not a booking",
        text: "Even an accepted quote leaves the date open on your calendar. Acceptance signals intent; you still confirm the booking to actually hold the space.",
      },
      {
        kind: "keypoints",
        items: [
          "Quote against a space and date, for a specific customer.",
          "Packages are reusable — use them to keep quotes fast and consistent.",
          "Accepted ≠ booked. Confirm the booking to hold the date.",
        ],
      },
    ],
    related: ["an-enquiry-just-came-in", "confirm-the-booking"],
  },
  {
    slug: "confirm-the-booking",
    title: "Confirm the booking",
    tagline:
      "The quote's accepted. Lock the date so no one can double-book it.",
    time: "3 min",
    roles: ["coordinator", "owner"],
    touches: ["Bookings", "Calendar", "Contracts"],
    blocks: [
      {
        kind: "prose",
        text: "This is the moment the deal becomes real. Confirming a booking is the one action that reserves the space on your calendar — until you do it, the date is fair game for anyone else who enquires.",
      },
      { kind: "heading", text: "Create and confirm" },
      {
        kind: "steps",
        items: [
          {
            title: "Create the booking from the accepted quote",
            detail:
              "The customer, space, date and pricing carry over — no retyping — so the booking matches what they agreed to.",
          },
          {
            title: "Confirm the details",
            detail:
              "Double-check space, date and time. This is what will show on the calendar and what your team will run the event from.",
          },
          {
            title: "Set the status to Confirmed",
            detail:
              "A confirmed booking blocks the calendar slot. Held/tentative bookings can be used to pencil in a date while you wait on a deposit.",
          },
          {
            title: "Attach the contract",
            detail:
              "Keep the signed agreement on the booking so the paperwork lives next to the reservation it covers.",
          },
        ],
      },
      {
        kind: "callout",
        tone: "warning",
        title: "Only a booking blocks the calendar",
        text: "Enquiries and quotes never reserve a date. If you tell a client 'you're all set' but never confirm the booking, the slot stays open — and the next enquiry can take it.",
      },
      {
        kind: "keypoints",
        items: [
          "Confirming a booking is what actually holds the date.",
          "Bookings inherit everything from the accepted quote.",
          "Next step: secure it with a deposit.",
        ],
      },
    ],
    related: ["turn-an-enquiry-into-a-quote", "collect-a-deposit", "is-the-space-free"],
  },
  {
    slug: "collect-a-deposit",
    title: "Collect a deposit",
    tagline: "Hold the date with money, not just a promise.",
    time: "3 min",
    roles: ["finance", "coordinator"],
    touches: ["Invoices", "Payments"],
    blocks: [
      {
        kind: "prose",
        text: "A deposit is what turns 'confirmed' into 'committed'. It's usually the first invoice you raise against a booking, and taking it early protects the date for both of you.",
      },
      { kind: "heading", text: "Raise it and get paid" },
      {
        kind: "steps",
        items: [
          {
            title: "Raise a deposit invoice against the booking",
            detail:
              "The customer and booking details carry over. Set the deposit amount — a percentage of the total, or a flat figure.",
          },
          {
            title: "Send the payment link",
            detail:
              "The customer can pay online — UPI (scan the QR) or a card/gateway. No chasing bank transfers if you don't want to.",
          },
          {
            title: "Record the payment",
            detail:
              "Online payments log themselves. If money arrives offline (cash, direct transfer), record it manually so the invoice reflects reality.",
          },
          {
            title: "Watch the balance update",
            detail:
              "The invoice moves toward Paid and the outstanding balance drops. What's left is the balance you'll invoice closer to the event.",
          },
        ],
      },
      {
        kind: "callout",
        tone: "tip",
        title: "Set your default deposit once",
        text: "In Settings you can set a default deposit percentage and your payout details, so every deposit invoice starts with the right number instead of you doing the math each time.",
      },
      {
        kind: "keypoints",
        items: [
          "A deposit is the first invoice against a booking.",
          "Payments record against invoices, so balances stay accurate on their own.",
          "The balance invoice comes later — see month-end.",
        ],
      },
    ],
    related: ["confirm-the-booking", "close-the-month"],
  },
  {
    slug: "is-the-space-free",
    title: "Is the space free?",
    tagline: "“Is the lawn open on the 12th?” — answer it in five seconds.",
    time: "2 min",
    roles: ["coordinator", "owner"],
    touches: ["Calendar", "Spaces"],
    blocks: [
      {
        kind: "prose",
        text: "You'll answer this question more than any other. The calendar exists to make it instant — so you never promise a date you can't keep, and never turn away one you could.",
      },
      { kind: "heading", text: "Read the calendar" },
      {
        kind: "steps",
        items: [
          {
            title: "Open the calendar",
            detail:
              "Switch to the venue and space in question. If you run several spaces, check the specific one the customer wants — availability is per space.",
          },
          {
            title: "Find the date",
            detail:
              "Use the week view to see the day at a glance. A blocked slot means a confirmed booking already holds it.",
          },
          {
            title: "Tell holds apart from confirmed",
            detail:
              "The legend shows what each colour means. A tentative hold can sometimes be worked around; a confirmed booking is taken.",
          },
        ],
      },
      {
        kind: "callout",
        tone: "note",
        title: "Empty means available",
        text: "If nothing sits on the date for that space, it's open — because only bookings ever fill the calendar. Quotes and enquiries never show up here.",
      },
      {
        kind: "keypoints",
        items: [
          "Availability is tracked per space, not per venue.",
          "Only confirmed bookings block a slot.",
          "Check before you promise — then confirm to hold it.",
        ],
      },
    ],
    related: ["an-enquiry-just-came-in", "confirm-the-booking"],
  },
  {
    slug: "set-up-a-new-venue",
    title: "Set up a new venue",
    tagline:
      "Get a new property live — the spaces, packages and settings everything else depends on.",
    time: "6 min",
    roles: ["owner"],
    touches: ["Onboarding", "Spaces", "Packages", "Settings"],
    blocks: [
      {
        kind: "prose",
        text: "Setup is the one time it pays to go in order. Spaces come first because bookings reserve spaces; packages come next because quotes lean on them; payment settings come last so deposits work the day you go live.",
      },
      { kind: "heading", text: "Walk the setup" },
      {
        kind: "steps",
        items: [
          {
            title: "Start the venue wizard",
            detail:
              "Add the venue's name, location and the basics. This is the container everything else lives in.",
          },
          {
            title: "Add your spaces",
            detail:
              "Create every bookable area — ballroom, lawn, terrace — with its capacity and pricing. Do this first: you can't book what doesn't exist.",
          },
          {
            title: "Build a package or two",
            detail:
              "Bundle your common offerings so your team can quote them in seconds later. You can always add more.",
          },
          {
            title: "Connect payments and integrations",
            detail:
              "Set your payout details, default deposit and any integrations, so the first deposit invoice you raise just works.",
          },
        ],
      },
      {
        kind: "callout",
        tone: "tip",
        title: "Spaces first, always",
        text: "Everything downstream — quotes, bookings, the calendar — hangs off spaces. Fifteen minutes getting them right saves re-doing quotes later.",
      },
      {
        kind: "keypoints",
        items: [
          "Order matters: spaces → packages → payment settings.",
          "Availability and pricing live on spaces.",
          "Once payments are set, you're ready to take real bookings.",
        ],
      },
    ],
    related: ["invite-your-team", "turn-an-enquiry-into-a-quote"],
  },
  {
    slug: "close-the-month",
    title: "Close the month",
    tagline: "Bill the balances, record what came in, see where you stand.",
    time: "5 min",
    roles: ["finance", "owner"],
    touches: ["Invoices", "Payments", "Dashboard"],
    blocks: [
      {
        kind: "prose",
        text: "Month-end is reconciliation, not data entry. If deposits and payments were recorded as they happened, closing the month is mostly checking, billing the balances, and reading the numbers.",
      },
      { kind: "heading", text: "Reconcile and bill" },
      {
        kind: "steps",
        items: [
          {
            title: "Review outstanding balances",
            detail:
              "Scan invoices for what's still owed. Bookings that took a deposit but not the balance are your priority list.",
          },
          {
            title: "Raise the balance invoices",
            detail:
              "For events that have happened (or are about to), invoice the remaining amount and send the payment link.",
          },
          {
            title: "Record offline payments",
            detail:
              "Log any cash or direct transfers that didn't come through online, so every invoice reflects what actually landed.",
          },
          {
            title: "Read the dashboard",
            detail:
              "Revenue, bookings and occupancy for the period give you the health check — and the story to tell whoever you report to.",
          },
        ],
      },
      {
        kind: "callout",
        tone: "tip",
        title: "The best month-end is a boring one",
        text: "Record payments the day they arrive and reconciliation becomes a five-minute review. The work is in the habit, not the last day.",
      },
      {
        kind: "keypoints",
        items: [
          "Deposit first, balance at month-end — two invoices per booking.",
          "Payments recorded on time keep balances self-updating.",
          "The dashboard is your period-level health check.",
        ],
      },
    ],
    related: ["collect-a-deposit"],
  },
  {
    slug: "invite-your-team",
    title: "Invite your team",
    tagline: "Bring your staff in — and decide who can see and do what.",
    time: "3 min",
    roles: ["owner"],
    touches: ["Staff", "Settings", "Invites"],
    blocks: [
      {
        kind: "prose",
        text: "BookLatch is better shared. Inviting your team means enquiries get answered when you're not looking — and roles mean everyone has exactly the access their job needs, and no more.",
      },
      { kind: "heading", text: "Add people and set access" },
      {
        kind: "steps",
        items: [
          {
            title: "Open Staff and invite by email",
            detail:
              "Send an invite to each team member. They get a link to accept and set up their own login.",
          },
          {
            title: "Assign a role",
            detail:
              "Pick the role that matches the job — front desk, finance, owner. The role decides what they can see and change.",
          },
          {
            title: "They accept the invite",
            detail:
              "The link is single-purpose and tied to them. Once accepted, they land in your venue with the right access.",
          },
          {
            title: "Adjust access as things change",
            detail:
              "Roles aren't permanent. Promote, restrict or remove access from Staff whenever the team shifts.",
          },
        ],
      },
      {
        kind: "callout",
        tone: "warning",
        title: "Give the least access that lets the job get done",
        text: "Your front desk doesn't need payout settings; your accountant doesn't need to reshape packages. Matching roles to jobs keeps mistakes rare and accountability clear.",
      },
      {
        kind: "keypoints",
        items: [
          "Invites are per-person and sent by email.",
          "Roles decide visibility and permissions — choose deliberately.",
          "Access is easy to change later.",
        ],
      },
    ],
    related: ["set-up-a-new-venue"],
  },
];

/* ── Role paths ("start here") ────────────────────────────────────── */

export const ROLES: Role[] = [
  {
    id: "owner",
    name: "Owner / Manager",
    tagline: "You run the business.",
    intro:
      "Set the venue up, bring your team in, and keep an eye on the numbers. Start here and you'll have a working venue that others can run day to day.",
    path: [
      "set-up-a-new-venue",
      "invite-your-team",
      "confirm-the-booking",
      "close-the-month",
    ],
  },
  {
    id: "coordinator",
    name: "Coordinator / Front desk",
    tagline: "You handle guests, day to day.",
    intro:
      "Enquiries, quotes, bookings, deposits — the daily flow of turning interest into confirmed events. This path is the loop you'll live in.",
    path: [
      "an-enquiry-just-came-in",
      "is-the-space-free",
      "turn-an-enquiry-into-a-quote",
      "confirm-the-booking",
      "collect-a-deposit",
    ],
  },
  {
    id: "finance",
    name: "Finance",
    tagline: "You handle the money.",
    intro:
      "Deposits, balances, reconciliation. This path covers taking payment and closing the books without chasing paper.",
    path: ["collect-a-deposit", "close-the-month"],
  },
];

/* ── Lookups ──────────────────────────────────────────────────────── */

export function getScenario(slug: string): Scenario | undefined {
  return SCENARIOS.find((s) => s.slug === slug);
}

export function getRole(id: string): Role | undefined {
  return ROLES.find((r) => r.id === id);
}

export const ROLE_LABEL: Record<RoleId, string> = {
  owner: "Owner",
  coordinator: "Coordinator",
  finance: "Finance",
};

/* ── Navigation + search (derived once, shared by sidebar and ⌘K) ─── */

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Start here",
    items: [
      {
        title: "Overview",
        href: "/docs",
        description: "What BookLatch is, and how to read these docs.",
        keywords: ["home", "start", "intro", "getting started"],
      },
      {
        title: "How it fits together",
        href: "/docs/concepts",
        description: "The one mental model that makes everything click.",
        keywords: ["concepts", "model", "glossary", "terms", "diagram"],
      },
    ],
  },
  {
    label: "Guides by role",
    items: ROLES.map<NavItem>((r) => ({
      title: r.name,
      href: `/docs/roles/${r.id}`,
      description: r.tagline,
      keywords: [r.id, "role", "path", "start here"],
    })),
  },
  {
    label: "Scenarios",
    items: SCENARIOS.map<NavItem>((s) => ({
      title: s.title,
      href: `/docs/scenarios/${s.slug}`,
      description: s.tagline,
      keywords: [...s.touches.map((t) => t.toLowerCase()), ...s.roles],
    })),
  },
];

/** Flat index for the ⌘K palette. */
export const SEARCH_INDEX: (NavItem & { group: string })[] = NAV_GROUPS.flatMap(
  (group) => group.items.map((item) => ({ ...item, group: group.label })),
);
