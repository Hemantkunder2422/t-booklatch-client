import {
  Building,
  Hotel,
  Landmark,
  Mail,
  MessageSquare,
  PartyPopper,
  Trees,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import {
  PaypalIcon,
  RazorpayIcon,
  SlackIcon,
  SquareIcon,
  StripeIcon,
  WhatsappIcon,
} from "./brand-icons";

export const SPACE_TYPES: { value: string; label: string; icon: LucideIcon }[] =
  [
    { value: "ballroom", label: "Ballroom", icon: PartyPopper },
    { value: "conference", label: "Conference", icon: Landmark },
    { value: "garden", label: "Garden", icon: Trees },
    { value: "rooftop", label: "Rooftop", icon: Building },
    { value: "suite", label: "Suite", icon: Hotel },
    { value: "dining", label: "Dining", icon: UtensilsCrossed },
  ];

export const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "India",
  "United Arab Emirates",
  "Singapore",
  "Germany",
];

export const AMENITIES = [
  "Wi-Fi",
  "Parking",
  "A/V Equipment",
  "Stage",
  "In-house Catering",
  "Air Conditioning",
  "Wheelchair Access",
  "Bar Service",
  "Dance Floor",
  "Outdoor Area",
];

export type IconComponent = (props: { className?: string }) => React.ReactNode;

export const PAYMENT_GATEWAYS: {
  value: string;
  name: string;
  description: string;
  icon: IconComponent;
}[] = [
  {
    value: "stripe",
    name: "Stripe",
    description: "Cards, wallets & global payouts",
    icon: StripeIcon,
  },
  {
    value: "paypal",
    name: "PayPal",
    description: "Trusted checkout worldwide",
    icon: PaypalIcon,
  },
  {
    value: "razorpay",
    name: "Razorpay",
    description: "UPI, cards & netbanking (India)",
    icon: RazorpayIcon,
  },
  {
    value: "square",
    name: "Square",
    description: "In-person & online payments",
    icon: SquareIcon,
  },
];

export const COMMUNICATION_CHANNELS: {
  value: string;
  name: string;
  description: string;
  icon: IconComponent;
  accent: string;
}[] = [
  {
    value: "email",
    name: "Email",
    description: "Transactional & marketing emails",
    icon: Mail,
    accent: "text-primary",
  },
  {
    value: "sms",
    name: "SMS",
    description: "Text reminders via Twilio",
    icon: MessageSquare,
    accent: "text-chart-2",
  },
  {
    value: "whatsapp",
    name: "WhatsApp",
    description: "Booking confirmations & reminders",
    icon: WhatsappIcon,
    accent: "text-[#25D366]",
  },
  {
    value: "slack",
    name: "Slack",
    description: "Internal team notifications",
    icon: SlackIcon,
    accent: "text-foreground",
  },
];
