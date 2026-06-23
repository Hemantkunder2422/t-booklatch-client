type IconProps = { className?: string };

export function StripeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="7" fill="#635BFF" />
      <path
        fill="#fff"
        d="M15.6 12.4c0-.62.51-.86 1.35-.86 1.2 0 2.72.37 3.93 1.02v-3.4a10.4 10.4 0 0 0-3.93-.72c-3.2 0-5.34 1.68-5.34 4.48 0 4.38 6.01 3.68 6.01 5.57 0 .73-.64.97-1.53.97-1.32 0-3-.54-4.33-1.27v3.45c1.47.63 2.95.9 4.33.9 3.29 0 5.55-1.63 5.55-4.46 0-4.73-6.04-3.89-6.04-5.69Z"
      />
    </svg>
  );
}

export function PaypalIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="7" fill="#F5F7FA" />
      <path
        fill="#002991"
        d="M13.4 24h-2.6l.4-2.5h1.9c3.5 0 5.9-1.7 6.6-5 .04-.2.08-.4.1-.58-.5-.26-1.1-.4-1.78-.4h-3.86c-.4 0-.74.3-.8.69L11.9 24Z"
      />
      <path
        fill="#0070E0"
        d="M19.8 11.3c-.06.18-.07.36-.1.55-.7 3.3-3.1 5-6.6 5h-1.9l-.83 5.27a.5.5 0 0 0 .5.58h2.2c.34 0 .64-.25.7-.6l.03-.16.55-3.46.03-.19c.05-.34.35-.6.7-.6h.44c2.85 0 5.08-1.16 5.73-4.51.27-1.4.13-2.57-.59-3.39a2.8 2.8 0 0 0-.8-.62l-.46.06"
      />
      <path
        fill="#003087"
        d="M19.1 11.04c-.4-.12-.83-.18-1.27-.21A11.6 11.6 0 0 0 16.1 10.7h-3.83c-.36 0-.66.26-.72.6l-.81 5.16-.02.15c.06-.4.4-.69.8-.69h3.86c3.5 0 5.9-1.7 6.6-5 .03-.19.05-.37.1-.55a4 4 0 0 0-1-.41l-.07-.02"
      />
    </svg>
  );
}

export function RazorpayIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="7" fill="#0C2451" />
      <path fill="#3395FF" d="m18.7 8-5.2 9.1 1.1-4.3 3.1-5.4h2.3l-6 22h-2.3l2.3-8.7L18.7 8Z" />
      <path fill="#fff" d="m21.6 8-4.8 18h-2.4l4-15.2-1.8 3.2 1-3.8L20.5 8h1.1Z" />
    </svg>
  );
}

export function SquareIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="7" fill="#1A1A1A" />
      <path
        fill="#fff"
        fillRule="evenodd"
        d="M11 9.5A1.5 1.5 0 0 0 9.5 11v10a1.5 1.5 0 0 0 1.5 1.5h10a1.5 1.5 0 0 0 1.5-1.5V11A1.5 1.5 0 0 0 21 9.5H11Zm1.8 3.3a.6.6 0 0 0-.6.6v5.2c0 .33.27.6.6.6h5.2a.6.6 0 0 0 .6-.6v-5.2a.6.6 0 0 0-.6-.6h-5.2Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function WhatsappIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="7" fill="#25D366" />
      <path
        fill="#fff"
        d="M22 10a8.2 8.2 0 0 0-13 9.9L8 24l4.2-1a8.2 8.2 0 0 0 12-7.2A8.1 8.1 0 0 0 22 10Zm-6 12.5c-1.2 0-2.4-.32-3.44-.93l-.25-.15-2.55.67.68-2.48-.16-.26A6.6 6.6 0 1 1 16 22.5Zm3.62-4.94c-.2-.1-1.17-.58-1.35-.64-.18-.07-.31-.1-.44.1-.13.2-.5.64-.62.77-.11.13-.23.15-.43.05a5.4 5.4 0 0 1-2.7-2.36c-.2-.35.2-.32.58-1.08.06-.13.03-.24-.02-.34-.05-.1-.44-1.07-.6-1.46-.16-.38-.32-.33-.44-.34h-.38a.73.73 0 0 0-.53.25c-.18.2-.7.68-.7 1.65 0 .97.71 1.91.81 2.05.1.13 1.4 2.13 3.39 2.99 1.26.54 1.76.59 2.39.5.39-.06 1.17-.48 1.33-.94.17-.46.17-.85.12-.94-.05-.08-.18-.13-.38-.23Z"
      />
    </svg>
  );
}

export function SlackIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="7" fill="#F5F7FA" />
      <g transform="translate(8 8)">
        <path fill="#36C5F0" d="M3.4 10a1.7 1.7 0 1 1-1.7-1.7h1.7V10Zm.9 0a1.7 1.7 0 0 1 3.4 0v4.3a1.7 1.7 0 1 1-3.4 0V10Z" />
        <path fill="#2EB67D" d="M6 3.4A1.7 1.7 0 1 1 7.7 1.7v1.7H6Zm0 .9a1.7 1.7 0 0 1 0 3.4H1.7a1.7 1.7 0 1 1 0-3.4H6Z" />
        <path fill="#ECB22E" d="M12.6 6a1.7 1.7 0 1 1 1.7 1.7h-1.7V6Zm-.9 0a1.7 1.7 0 0 1-3.4 0V1.7a1.7 1.7 0 1 1 3.4 0V6Z" />
        <path fill="#E01E5A" d="M10 12.6a1.7 1.7 0 1 1-1.7 1.7v-1.7H10Zm0-.9a1.7 1.7 0 0 1 0-3.4h4.3a1.7 1.7 0 1 1 0 3.4H10Z" />
      </g>
    </svg>
  );
}
