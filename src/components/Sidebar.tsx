import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  CheckSquare,
  History,
  FileCheck2,
  BarChart3,
  UserCheck,
  Settings,
  BookOpen,
  User,
  GraduationCap,
  Users,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { currentUser, activeNavTab, setActiveNavTab, correctionRequests } = useApp();

  const pendingCount = correctionRequests.filter((r) => r.status === 'PENDING').length;

  const isAdmin = currentUser.role === 'ADMIN';
  const isFaculty = currentUser.role === 'FACULTY';
  const isStudent = currentUser.role === 'STUDENT';

  interface NavItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    badge?: number;
    roles: ('ADMIN' | 'FACULTY' | 'STUDENT')[];
  }

  const navItems: NavItem[] = [
    {
      id: 'teacher-portal',
      label: 'Teacher Portal',
      icon: <Users className="w-4 h-4 text-indigo-500" />,
      roles: ['FACULTY', 'ADMIN'],
    },
    {
      id: 'student-portal',
      label: 'Student Portal',
      icon: <GraduationCap className="w-4 h-4 text-emerald-500" />,
      roles: ['STUDENT', 'ADMIN'],
    },
    {
      id: 'dashboard',
      label: 'College Analytics',
      icon: <LayoutDashboard className="w-4 h-4" />,
      roles: ['ADMIN'],
    },
    {
      id: 'mark-attendance',
      label: 'Mark Attendance',
      icon: <CheckSquare className="w-4 h-4" />,
      roles: ['ADMIN', 'FACULTY'],
    },
    {
      id: 'history',
      label: 'Attendance Registers',
      icon: <History className="w-4 h-4" />,
      roles: ['ADMIN', 'FACULTY'],
    },
    {
      id: 'correction-requests',
      label: isStudent ? 'Leave & Correction Requests' : 'Review Student Disputes',
      icon: <FileCheck2 className="w-4 h-4" />,
      badge: isStudent ? undefined : pendingCount > 0 ? pendingCount : undefined,
      roles: ['ADMIN', 'FACULTY', 'STUDENT'],
    },
    {
      id: 'reports',
      label: 'Reports & CSV Export',
      icon: <BarChart3 className="w-4 h-4" />,
      roles: ['ADMIN', 'FACULTY', 'STUDENT'],
    },
    {
      id: 'admin-management',
      label: 'Administration Hub',
      icon: <UserCheck className="w-4 h-4" />,
      roles: ['ADMIN'],
    },
    {
      id: 'subjects-catalog',
      label: 'All Subjects & Courses',
      icon: <BookOpen className="w-4 h-4 text-indigo-500" />,
      roles: ['ADMIN', 'FACULTY', 'STUDENT'],
    },
  ];

  const visibleItems = navItems.filter((item) =>
    item.roles.includes(currentUser.role)
  );

  return (
    <aside className="w-64 bg-white/80 backdrop-blur-sm border-r border-slate-200/80 shrink-0 hidden md:flex flex-col justify-between py-4 shadow-xs">
      <div className="px-3 space-y-1">
        <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          {currentUser.role === 'ADMIN'
            ? 'Administrator Controls'
            : currentUser.role === 'FACULTY'
            ? 'Teacher Navigation'
            : 'Student Navigation'}
        </div>

        {visibleItems.map((item) => {
          const isActive = activeNavTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveNavTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={isActive ? 'text-white' : 'text-slate-500'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full tabular-nums ${
                    isActive
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* User profile footer card */}
      <div className="px-3 pt-3 border-t border-slate-100">
        <div className="p-3 bg-slate-50/90 rounded-xl border border-slate-200/60 shadow-2xs">
          <div className="text-xs font-bold text-slate-900 truncate">
            {currentUser.fullName}
          </div>
          <div className="text-[11px] text-slate-500 truncate mt-0.5">
            {currentUser.email}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-500">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
            <span>Local Database Synced</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
