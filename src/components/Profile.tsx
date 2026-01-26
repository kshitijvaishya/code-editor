'use client';

import { Mail, User, Shield, Calendar, Code2, Clock } from 'lucide-react';

export default function Profile() {
  const userData = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Developer',
    joinDate: 'January 2024',
    totalRuns: 142,
    languages: ['Python', 'JavaScript', 'C++', 'Java', 'C'],
  };

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
                    {userData.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="mb-4">
                  <h2 className="text-3xl font-bold text-white">{userData.name}</h2>
                  <p className="text-purple-400 font-medium">{userData.role}</p>
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
                    <p className="text-white font-medium">{userData.role}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Member Since</p>
                    <p className="text-white font-medium">{userData.joinDate}</p>
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
                    <p className="text-white font-medium text-2xl">{userData.totalRuns}</p>
                  </div>
                </div>

                <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Languages Used</p>
                  <div className="flex flex-wrap gap-2">
                    {userData.languages.map((lang) => (
                      <span
                        key={lang}
                        className="px-3 py-1 bg-purple-600/20 text-purple-300 border border-purple-500/30 rounded-full text-sm font-medium"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex gap-4">
              <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors">
                Edit Profile
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
