/**
 * Dashboard Layout Component
 * Provides sidebar navigation and main content area
 */

import { useState } from 'react';
import { Sidebar } from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebarItems: Array<{
    id: string;
    label: string;
    icon: React.ReactNode;
    path?: string;
    onClick?: () => void;
    badge?: number;
  }>;
  title?: string;
  onItemClick?: (itemId: string) => void;
}

export function DashboardLayout({
  children,
  sidebarItems,
  title,
  onItemClick,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleItemClick = (itemId: string) => {
    // Close mobile sidebar when item is clicked
    setSidebarOpen(false);
    onItemClick?.(itemId);
  };

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Desktop Sidebar - Always visible, fixed */}
      <aside className="w-64 transition-all duration-300 ease-in-out hidden lg:block flex-shrink-0">
        <Sidebar items={sidebarItems} onItemClick={handleItemClick} />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-300 ease-in-out lg:hidden`}
      >
        <Sidebar items={sidebarItems} onItemClick={handleItemClick} />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0  overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 flex-shrink-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg
                    className="w-6 h-6 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
                {title && (
                  <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                )}
              </div>
              <div className="flex items-center gap-4">
                {/* Notifications */}
                <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
                  <svg
                    className="w-6 h-6 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto min-h-0">
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
