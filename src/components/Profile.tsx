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
      <div className="min-h-full bg-gray-950 p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
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
    <div className="min-h-full bg-gray-950 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Profile</h1>
          <p className="text-gray-400">Manage your account information</p>
        </div>

        {/* Profile Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-xl overflow-hidden">
          {/* Banner */}
          <div className="h-32 bg-gradient-to-r from-purple-600 to-blue-600"></div>

          {/* Avatar & Basic Info */}
          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16 mb-6">
              <div className="flex items-end gap-4">
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 border-4 border-gray-900 flex items-center justify-center shadow-2xl">
                  <span className="text-white font-bold text-4xl">
                    {initials}
                  </span>
                </div>
                <div className="mb-4">
                  <h2 className="text-3xl font-bold text-white">{userData.username}</h2>
                  <p className="text-purple-400 font-medium">Developer</p>
                </div>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-purple-400" />
                  Contact Information
                </h3>
                
                <div className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Email</p>
                    <p className="text-white font-medium">{userData.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <Shield className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Role</p>
                    <p className="text-white font-medium">Developer</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Member Since</p>
                    <p className="text-white font-medium">{formatDate(userData.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Coding Statistics */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Code2 className="h-5 w-5 text-purple-400" />
                  Coding Statistics
                </h3>

                <div className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Total Code Runs</p>
                    <p className="text-white font-medium text-2xl">0</p>
                  </div>
                </div>

                <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Languages Used</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-gray-700/50 text-gray-400 border border-gray-600/30 rounded-full text-sm">
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
                className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
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
              <button className="px-6 py-3 border border-gray-700 hover:bg-gray-800 text-white font-medium rounded-lg transition-colors">
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

