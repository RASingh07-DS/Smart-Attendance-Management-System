import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { TopNav } from './components/TopNav';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { TeacherPortalView } from './components/TeacherPortalView';
import { StudentPortalView } from './components/StudentPortalView';
import { MarkAttendanceView } from './components/MarkAttendanceView';
import { AttendanceHistoryView } from './components/AttendanceHistoryView';
import { CorrectionRequestsView } from './components/CorrectionRequestsView';
import { ReportsView } from './components/ReportsView';
import { AdminManagementView } from './components/AdminManagementView';
import { SubjectsCatalogView } from './components/SubjectsCatalogView';
import {
  LayoutDashboard,
  CheckSquare,
  FileCheck2,
  BarChart3,
  Users,
  GraduationCap,
  BookOpen,
} from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeNavTab, setActiveNavTab, currentUser, backgroundTheme } = useApp();

  const isTeacher = currentUser.role === 'FACULTY';
  const isStudent = currentUser.role === 'STUDENT';

  return (
    <div className={`min-h-screen flex flex-col text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] relative ${backgroundTheme} transition-all duration-500`}>
      {/* Ambient background light orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10" aria-hidden="true">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-indigo-500/12 blur-3xl" />
        <div className="absolute top-1/4 -right-32 w-96 h-96 rounded-full bg-sky-400/14 blur-3xl" />
        <div className="absolute bottom-10 left-1/4 w-[30rem] h-[30rem] rounded-full bg-violet-400/10 blur-3xl" />
      </div>

      {/* Top Navigation */}
      <TopNav />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto pb-16 md:pb-6">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Main Viewport Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeNavTab === 'teacher-portal' && <TeacherPortalView />}
          {activeNavTab === 'student-portal' && <StudentPortalView />}
          {activeNavTab === 'dashboard' && <DashboardView />}
          {activeNavTab === 'mark-attendance' && <MarkAttendanceView />}
          {activeNavTab === 'history' && <AttendanceHistoryView />}
          {activeNavTab === 'correction-requests' && <CorrectionRequestsView />}
          {activeNavTab === 'reports' && <ReportsView />}
          {activeNavTab === 'admin-management' && <AdminManagementView />}
          {activeNavTab === 'settings' && <AdminManagementView />}
          {activeNavTab === 'subjects-catalog' && <SubjectsCatalogView />}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around z-40 text-[10px] shadow-lg">
        {isStudent ? (
          <>
            <button
              onClick={() => setActiveNavTab('student-portal')}
              className={`flex flex-col items-center gap-0.5 p-1 ${
                activeNavTab === 'student-portal' ? 'text-emerald-700 font-bold' : 'text-slate-500'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student</span>
            </button>
            <button
              onClick={() => setActiveNavTab('correction-requests')}
              className={`flex flex-col items-center gap-0.5 p-1 ${
                activeNavTab === 'correction-requests' ? 'text-emerald-700 font-bold' : 'text-slate-500'
              }`}
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Requests</span>
            </button>
          </>
        ) : isTeacher ? (
          <>
            <button
              onClick={() => setActiveNavTab('teacher-portal')}
              className={`flex flex-col items-center gap-0.5 p-1 ${
                activeNavTab === 'teacher-portal' ? 'text-indigo-700 font-bold' : 'text-slate-500'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Teacher</span>
            </button>
            <button
              onClick={() => setActiveNavTab('mark-attendance')}
              className={`flex flex-col items-center gap-0.5 p-1 ${
                activeNavTab === 'mark-attendance' ? 'text-indigo-700 font-bold' : 'text-slate-500'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>Mark</span>
            </button>
            <button
              onClick={() => setActiveNavTab('correction-requests')}
              className={`flex flex-col items-center gap-0.5 p-1 ${
                activeNavTab === 'correction-requests' ? 'text-indigo-700 font-bold' : 'text-slate-500'
              }`}
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Review</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setActiveNavTab('dashboard')}
              className={`flex flex-col items-center gap-0.5 p-1 ${
                activeNavTab === 'dashboard' ? 'text-slate-900 font-bold' : 'text-slate-500'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Admin</span>
            </button>
            <button
              onClick={() => setActiveNavTab('mark-attendance')}
              className={`flex flex-col items-center gap-0.5 p-1 ${
                activeNavTab === 'mark-attendance' ? 'text-slate-900 font-bold' : 'text-slate-500'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>Mark</span>
            </button>
          </>
        )}

        <button
          onClick={() => setActiveNavTab('reports')}
          className={`flex flex-col items-center gap-0.5 p-1 ${
            activeNavTab === 'reports' ? 'text-slate-900 font-bold' : 'text-slate-500'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Reports</span>
        </button>

        <button
          onClick={() => setActiveNavTab('subjects-catalog')}
          className={`flex flex-col items-center gap-0.5 p-1 ${
            activeNavTab === 'subjects-catalog' ? 'text-slate-900 font-bold' : 'text-slate-500'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Courses</span>
        </button>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
