import Image from 'next/image';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Logo({ size = 'md', className = '' }: LogoProps) {
  // Size mappings
  const sizes = {
    sm: { width: 80, height: 80 },
    md: { width: 120, height: 120 },
    lg: { width: 160, height: 160 },
  };

  const { width, height } = sizes[size];

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Image
        src="/images/gauhati-high-court-logo.png"
        alt="Gauhati High Court Logo"
        width={width}
        height={height}
        priority
        className="object-contain"
      />
    </div>
  );
} 