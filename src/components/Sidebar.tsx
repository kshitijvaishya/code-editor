'use client';

import { User, Code2, Trophy, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

type View = 'profile' | 'editor';

interface SidebarProps {
  activeView?: View;
  onViewChange?: (view: View) => void;
}

interface UserData {
  username: string;
  email: string;
}

export default function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const [isContestsOpen, setIsContestsOpen] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const fetchUserData = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();

      if (data.success) {
        setUserData(data.user);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleNavigation = (view: View) => {
    // If we're on the main dashboard page, use the callback
    if (onViewChange && pathname === '/dashboard') {
      onViewChange(view);
    } else {
      // Otherwise, navigate to the dashboard with the view
      router.push(`/dashboard?view=${view}`);
    }
  };

  const isActive = (view: View) => {
    if (pathname === '/dashboard') {
      return activeView === view;
    }
    return false;
  };

  const navItems = [
    {
      id: 'profile' as View,
      label: 'Profile',
      icon: User,
    },
    {
      id: 'editor' as View,
      label: 'Code Editor',
      icon: Code2,
    },
  ];

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.jpeg"
            alt="TECHzHUT"
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-cover"
          />
          <span className="font-display text-xl font-bold tracking-wider text-foreground">TECHzHUT</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const itemIsActive = isActive(item.id);
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleNavigation(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all
                    ${
                      itemIsActive
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}

          {/* Contests Section */}
          <li className="pt-4">
            <button
              onClick={() => setIsContestsOpen(!isContestsOpen)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-lg font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
            >
              <div className="flex items-center gap-3">
                <Trophy className="h-5 w-5" />
                <span>Contests</span>
              </div>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  isContestsOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            
            {isContestsOpen && (
              <ul className="mt-2 ml-4 space-y-1">
                <li>
                  <button
                    onClick={() => router.push('/dashboard/contests/private')}
                    className={`
                      w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all
                      ${
                        pathname === '/dashboard/contests/private'
                          ? 'bg-primary/20 text-primary border-l-2 border-primary'
                          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                      }
                    `}
                  >
                    Private Contests
                  </button>
                </li>
              </ul>
            )}
          </li>
        </ul>
      </nav>

      {/* User Info at Bottom */}
      <div className="p-4 border-t border-border">
        {userData ? (
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">{getInitials(userData.username)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{userData.username}</p>
              <p className="text-xs text-muted-foreground truncate">{userData.email}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-secondary animate-pulse"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-secondary rounded animate-pulse"></div>
              <div className="h-3 bg-secondary rounded w-2/3 animate-pulse"></div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
