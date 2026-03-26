'use client';
import Link from 'next/link';
import { PlusCircle, Menu } from 'lucide-react';
import { UserMenu } from '@/components/auth/UserMenu';

interface HeaderProps {
  onMenuClick?: () => void;
  showTitle?: boolean;
  showMenuButton?: boolean;
}

export function Header({ onMenuClick, showTitle = true, showMenuButton = false }: HeaderProps) {
  return (
    <header className="bg-white border-b sticky top-0 z-50 w-full shrink-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 relative">

          <div className="shrink-0 flex items-center gap-3">
            {showMenuButton && (
              <button
                onClick={onMenuClick}
                className="lg:hidden text-gray-500 hover:text-gray-900 focus:outline-none p-1 -ml-2 rounded-md hover:bg-gray-100"
                aria-label="Open sidebar"
              >
                <Menu className="w-6 h-6" />
              </button>
            )}
            {showTitle && <Link href="/dashboard" className="flex items-center">
              <span className="font-bold text-lg sm:text-xl text-indigo-900 tracking-tight">AI Planning Agent</span>
            </Link>}
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/plan/new"
              className="bg-primary text-white hover:bg-primary/90 rounded-md px-3 sm:px-4 py-2 text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">New Plan</span>
            </Link>
            <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
