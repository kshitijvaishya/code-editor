'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, User, Shield, Calendar, Code2, Clock, LogOut, Loader2 } from 'lucide-react';

interface UserData {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

export default function Profile() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  const fetchUserData = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();

      if (data.success) {
        setUserData(data.user);
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setLoggingOut(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long'
    });
  };

  if (loading) {
    return (
      <div className="min-h-full bg-background p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  const initials = userData.username
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-full bg-background p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Profile</h1>
          <p className="text-muted-foreground">Manage your account information</p>
        </div>

        {/* Profile Card */}
        <div className="bg-card border border-border rounded-xl shadow-xl overflow-hidden">
          {/* Banner */}
          <div className="h-32 bg-gradient-to-r from-primary/80 to-accent/60"></div>

          {/* Avatar & Basic Info */}
          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16 mb-6">
              <div className="flex items-end gap-4">
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary to-accent border-4 border-card flex items-center justify-center shadow-2xl">
                  <span className="text-primary-foreground font-bold text-4xl">
                    {initials}
                  </span>
                </div>
                <div className="mb-4">
                  <h2 className="text-3xl font-bold text-foreground">{userData.username}</h2>
                  <p className="text-primary font-medium">Developer</p>
                </div>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Contact Information
                </h3>
                
                <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-lg border border-border">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Email</p>
                    <p className="text-foreground font-medium">{userData.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-lg border border-border">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Role</p>
                    <p className="text-foreground font-medium">Developer</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-lg border border-border">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Member Since</p>
                    <p className="text-foreground font-medium">{formatDate(userData.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Coding Statistics */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Code2 className="h-5 w-5 text-primary" />
                  Coding Statistics
                </h3>

                <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-lg border border-border">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Code Runs</p>
                    <p className="text-foreground font-medium text-2xl">0</p>
                  </div>
                </div>

                <div className="p-4 bg-secondary/50 rounded-lg border border-border">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Languages Used</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-muted text-muted-foreground border border-border rounded-full text-sm">
                      Start coding to see stats
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex gap-4">
              <button 
                onClick={handleLogout}
                disabled={loggingOut}
                className="px-6 py-3 bg-destructive hover:brightness-110 disabled:opacity-50 text-destructive-foreground font-medium rounded-lg transition-all flex items-center gap-2"
              >
                {loggingOut ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Signing Out...
                  </>
                ) : (
                  <>
                    <LogOut className="h-5 w-5" />
                    Sign Out
                  </>
                )}
              </button>
              <button className="px-6 py-3 border border-border hover:bg-secondary text-foreground font-medium rounded-lg transition-colors">
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

