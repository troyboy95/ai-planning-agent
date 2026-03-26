'use client';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export function UserMenu() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    router.replace('/login');
  };

  const displayName = user.displayName || user.email || 'User';
  const truncatedName = displayName.length > 20 ? displayName.substring(0, 17) + '...' : displayName;
  const initials = displayName.substring(0, 2).toUpperCase();

  return (
    <div className="relative">
      <button 
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 hover:bg-gray-100 p-1.5 rounded-full transition-colors focus:outline-none"
      >
        {user.photoURL && !imgError ? (
          <Image 
            src={user.photoURL} 
            alt="Profile" 
            width={32} 
            height={32} 
            className="rounded-full object-cover border border-gray-200"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm border border-indigo-200">
            {initials}
          </div>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-md shadow-lg z-20 py-1 overflow-hidden">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900 truncate">{truncatedName}</p>
            </div>
            <button 
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              onClick={() => { setOpen(false); handleSignOut(); }}
            >
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
