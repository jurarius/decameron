import logoUrl from '@/images/logo.png';

export default function ApplicationLogo({ className = '', ...props }) {
  return (
    <img
      src={logoUrl}
      alt="Decameron"
      className={`h-16 w-auto object-contain ${className}`} 
      {...props}
    />
  );
}