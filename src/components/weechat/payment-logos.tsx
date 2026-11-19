type PaymentLogoProps = {
  name: string;
  height?: number;
};

function BrandDrawing({ name }: { name: string }) {
  switch (name) {
    case 'Visa':
      return <text x="60" y="24" textAnchor="middle" fill="#1A1F71" fontFamily="Arial, sans-serif" fontSize="27" fontStyle="italic" fontWeight="800" letterSpacing="1">VISA</text>;
    case 'Mastercard':
      return <>
        <circle cx="48" cy="16" r="13" fill="#EB001B" />
        <circle cx="70" cy="16" r="13" fill="#F79E1B" />
        <path d="M59 5.2a13 13 0 0 1 0 21.6 13 13 0 0 1 0-21.6Z" fill="#FF5F00" />
      </>;
    case 'Airtel Money':
      return <>
        <path d="M19 6C8 11 8 24 20 27c-7-5-5-13 4-17-3 4-2 9 4 12-1-8 4-13 12-14-8-5-15-5-21-2Z" fill="#E40000" />
        <text x="45" y="23" fill="#E40000" fontFamily="Arial, sans-serif" fontSize="22" fontStyle="italic" fontWeight="800">airtel</text>
      </>;
    case 'MTN MoMo':
      return <>
        <ellipse cx="60" cy="16" rx="46" ry="14" fill="none" stroke="#111111" strokeWidth="2" />
        <text x="60" y="23" textAnchor="middle" fill="#111111" fontFamily="Arial, sans-serif" fontSize="23" fontWeight="900">MTN</text>
      </>;
    case 'Orange Money':
      return <>
        <rect x="20" y="2" width="29" height="29" rx="1" fill="#FF7900" />
        <text x="34.5" y="24" textAnchor="middle" fill="#FFFFFF" fontFamily="Arial, sans-serif" fontSize="18" fontWeight="800">●</text>
        <text x="55" y="22" fill="#111111" fontFamily="Arial, sans-serif" fontSize="19" fontWeight="700">orange</text>
      </>;
    case 'Moov Money':
      return <>
        <circle cx="29" cy="16" r="13" fill="#0067B1" />
        <path d="M20 21V11l9 7 9-7v10" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <text x="49" y="22" fill="#0067B1" fontFamily="Arial, sans-serif" fontSize="21" fontWeight="800">moov</text>
      </>;
    case 'Wave':
      return <>
        <path d="M12 18c7-12 14 12 22 0s15 12 23 0" fill="none" stroke="#1DC8FF" strokeWidth="4" strokeLinecap="round" />
        <text x="62" y="24" fill="#1DC8FF" fontFamily="Arial, sans-serif" fontSize="25" fontWeight="800">wave</text>
      </>;
    default:
      return <text x="60" y="21" textAnchor="middle" fill="currentColor" fontFamily="Arial, sans-serif" fontSize="16" fontWeight="700">{name}</text>;
  }
}

export function PaymentLogo({ name, height = 26 }: PaymentLogoProps) {
  return (
    <svg
      aria-label={name}
      role="img"
      viewBox="0 0 120 32"
      width={height * 3.75}
      height={height}
      className="payment-logo"
    >
      <BrandDrawing name={name} />
    </svg>
  );
}
