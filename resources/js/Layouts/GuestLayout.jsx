// resources/js/Layouts/GuestLayout.jsx
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
  return (
    <div className="min-h-screen bg-bgSoft sm:pt-0 pt-6 flex flex-col items-center sm:justify-center">
      <div className="mb-3">
        <Link href="/">
          <ApplicationLogo className="h-24 w-auto" />
        </Link>
      </div>

      <div className="w-full sm:max-w-md bg-white/95 backdrop-blur px-6 py-5 rounded-lg shadow-lg ring-1 ring-primary/10">
        {children}
      </div>
    </div>
  );
}