import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldAlert,
  GraduationCap,
  Users,
  ChevronDown,
  RotateCcw,
  Code2,
  FileDown,
  Calendar,
  Sparkles,
  Palette,
} from 'lucide-react';

interface TopNavProps {
  onOpenJavaModal: () => void;
  onOpenUmlModal: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ onOpenJavaModal, onOpenUmlModal }) => {
  const { currentUser, switchUser, allUsers, resetToDemoData, setActiveNavTab, activeNavTab, backgroundTheme, setBackgroundTheme } = useApp();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const isTeacher = currentUser.role === 'FACULTY';
  const isStudent = currentUser.role === 'STUDENT';
  const isAdmin = currentUser.role === 'ADMIN';

  const roleLabel = isAdmin
    ? 'Administrator'
    : isTeacher
    ? 'Faculty Instructor'
    : 'Enrolled Student';

  const roleIcon = isAdmin ? (
    <ShieldAlert className="w-3.5 h-3.5 text-slate-700" />
  ) : isTeacher ? (
    <Users className="w-3.5 h-3.5 text-indigo-700" />
  ) : (
    <GraduationCap className="w-3.5 h-3.5 text-emerald-700" />
  );

  const todayStr = 'Oct 23, 2026';

  // Fast switch to teacher or student persona
  const handleQuickRole = (role: 'FACULTY' | 'STUDENT' | 'ADMIN') => {
    const target = allUsers.find((u) => u.role === role);
    if (target) {
      switchUser(target.id);
      if (role === 'FACULTY') setActiveNavTab('teacher-portal');
      else if (role === 'STUDENT') setActiveNavTab('student-portal');
      else setActiveNavTab('dashboard');
    }
  };

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 lg:gap-8">
        {/* Zone 1: Brand Title */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-sm border border-slate-800">
            SA
          </div>
          <div>
            <span className="text-base font-bold text-slate-900 tracking-tight whitespace-nowrap block">
              SmartAttend
            </span>
            <span className="text-[11px] text-slate-500 whitespace-nowrap hidden sm:block">
              Attendance System for Teachers & Students
            </span>
          </div>
        </div>

        {/* Zone 2: Dedicated Dual Experience Mode Segmented Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/60 overflow-x-auto shrink-0">
          <button
            onClick={() => handleQuickRole('FACULTY')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              isTeacher && (activeNavTab === 'teacher-portal' || activeNavTab === 'mark-attendance')
                ? 'bg-white text-indigo-950 shadow-xs border border-slate-200/60 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            <span>Teacher Portal</span>
          </button>

          <button
            onClick={() => handleQuickRole('STUDENT')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              isStudent && activeNavTab === 'student-portal'
                ? 'bg-white text-emerald-950 shadow-xs border border-slate-200/60 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
            <span>Student Portal</span>
          </button>

          <button
            onClick={() => handleQuickRole('ADMIN')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              isAdmin && activeNavTab === 'dashboard'
                ? 'bg-white text-slate-950 shadow-xs border border-slate-200/60 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-slate-600" />
            <span>Admin</span>
          </button>
        </div>

        {/* Zone 3: Profile Badge & Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {/* User selector dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-lg transition-colors whitespace-nowrap shrink-0"
              title="Change individual user account"
            >
              {roleIcon}
              <span className="font-semibold text-slate-900 max-w-[120px] truncate hidden sm:inline">
                {currentUser.fullName}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 text-xs">
                <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Select User Account
                </div>

                <div className="px-3 py-1 text-[11px] text-slate-500 font-medium">Faculty / Teachers</div>
                {allUsers
                  .filter((u) => u.role === 'FACULTY')
                  .map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        switchUser(u.id);
                        setActiveNavTab('teacher-portal');
                        setShowUserDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-indigo-50 ${
                        currentUser.id === u.id ? 'bg-indigo-50/80 font-bold text-indigo-950' : 'text-slate-700'
                      }`}
                    >
                      <div className="truncate">
                        <div>{u.fullName}</div>
                        <div className="text-[10px] text-slate-500">{u.email}</div>
                      </div>
                      <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded">Teacher</span>
                    </button>
                  ))}

                <div className="border-t border-slate-100 my-1" />

                <div className="px-3 py-1 text-[11px] text-slate-500 font-medium">Students</div>
                {allUsers
                  .filter((u) => u.role === 'STUDENT')
                  .slice(0, 5)
                  .map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        switchUser(u.id);
                        setActiveNavTab('student-portal');
                        setShowUserDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-emerald-50 ${
                        currentUser.id === u.id ? 'bg-emerald-50/80 font-bold text-emerald-950' : 'text-slate-700'
                      }`}
                    >
                      <div className="truncate">
                        <div>{u.fullName}</div>
                        <div className="text-[10px] text-slate-500">Roll: {(u as any).rollNumber}</div>
                      </div>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">Student</span>
                    </button>
                  ))}

                <div className="border-t border-slate-100 my-1" />

                <div className="px-3 py-1 text-[11px] text-slate-500 font-medium">Administrator</div>
                {allUsers
                  .filter((u) => u.role === 'ADMIN')
                  .map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        switchUser(u.id);
                        setActiveNavTab('dashboard');
                        setShowUserDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-slate-100 ${
                        currentUser.id === u.id ? 'bg-slate-100 font-bold text-slate-900' : 'text-slate-700'
                      }`}
                    >
                      <div>
                        <div>{u.fullName}</div>
                        <div className="text-[10px] text-slate-500">Chief Admin</div>
                      </div>
                      <span className="text-[10px] bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded">Admin</span>
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Background Theme Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowThemeDropdown(!showThemeDropdown)}
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 text-xs"
              title="Change Background Atmosphere"
            >
              <Palette className="w-4 h-4 text-indigo-600" />
            </button>

            {showThemeDropdown && (
              <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 text-xs">
                <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Select Background Style
                </div>

                <button
                  onClick={() => {
                    setBackgroundTheme('theme-indigo-mesh');
                    setShowThemeDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 ${
                    backgroundTheme === 'theme-indigo-mesh' ? 'font-bold text-indigo-700 bg-indigo-50/70' : 'text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-gradient-to-tr from-indigo-500 to-sky-400 shrink-0" />
                    <span>Indigo Tech Mesh</span>
                  </div>
                  {backgroundTheme === 'theme-indigo-mesh' && <span className="text-[10px]">Active</span>}
                </button>

                <button
                  onClick={() => {
                    setBackgroundTheme('theme-campus-aurora');
                    setShowThemeDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 ${
                    backgroundTheme === 'theme-campus-aurora' ? 'font-bold text-emerald-700 bg-emerald-50/70' : 'text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 shrink-0" />
                    <span>Campus Aurora</span>
                  </div>
                  {backgroundTheme === 'theme-campus-aurora' && <span className="text-[10px]">Active</span>}
                </button>

                <button
                  onClick={() => {
                    setBackgroundTheme('theme-blueprint-grid');
                    setShowThemeDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 ${
                    backgroundTheme === 'theme-blueprint-grid' ? 'font-bold text-slate-900 bg-slate-100' : 'text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-slate-400 shrink-0" />
                    <span>Blueprint Grid</span>
                  </div>
                  {backgroundTheme === 'theme-blueprint-grid' && <span className="text-[10px]">Active</span>}
                </button>

                <button
                  onClick={() => {
                    setBackgroundTheme('theme-sunset-glow');
                    setShowThemeDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 ${
                    backgroundTheme === 'theme-sunset-glow' ? 'font-bold text-amber-700 bg-amber-50/70' : 'text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-gradient-to-tr from-amber-500 to-rose-400 shrink-0" />
                    <span>Sunset Warm Glow</span>
                  </div>
                  {backgroundTheme === 'theme-sunset-glow' && <span className="text-[10px]">Active</span>}
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowConfirmReset(true)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="Reset dataset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      {showConfirmReset && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-sm w-full p-5">
            <h3 className="text-base font-semibold text-slate-900">Reset Demo Data?</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              This will restore the database to its pristine sample state with 24 students, 3 faculty members, and default attendance sessions.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetToDemoData();
                  setShowConfirmReset(false);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors"
              >
                Reset Database
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
