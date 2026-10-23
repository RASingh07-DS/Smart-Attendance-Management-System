import React, { useState } from 'react';
import { X, Layers, Network, ArrowRight } from 'lucide-react';

interface UmlDiagramModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UmlDiagramModal: React.FC<UmlDiagramModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeView, setActiveView] = useState<'CLASS' | 'OBJECT'>('CLASS');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                UML Architecture Diagrams (OOP Syllabus)
              </h2>
              <p className="text-xs text-slate-500">
                Standard UML Notation: Class Relationships & Runtime Object Snapshot
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setActiveView('CLASS')}
                className={`px-3 py-1 font-medium rounded-md transition-colors ${
                  activeView === 'CLASS'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Class Diagram
              </button>
              <button
                type="button"
                onClick={() => setActiveView('OBJECT')}
                className={`px-3 py-1 font-medium rounded-md transition-colors ${
                  activeView === 'OBJECT'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Object Diagram
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {activeView === 'CLASS' ? (
            <div className="space-y-6">
              {/* Relationship Legend */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/60">
                  <div className="font-semibold text-slate-900">Generalization (&Delta;)</div>
                  <div className="text-[11px] text-slate-500">Inheritance: User &rarr; Student</div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/60">
                  <div className="font-semibold text-slate-900">Composition (&diams;)</div>
                  <div className="text-[11px] text-slate-500">Lifecycle: Session owns Records</div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/60">
                  <div className="font-semibold text-slate-900">Aggregation (&loz;)</div>
                  <div className="text-[11px] text-slate-500">Grouping: Department has Faculty</div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/60">
                  <div className="font-semibold text-slate-900">Realization (- - &Delta;)</div>
                  <div className="text-[11px] text-slate-500">Interface Implementation</div>
                </div>
              </div>

              {/* UML Class Diagram Visual Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* User Base Class */}
                <div className="border border-slate-300 rounded-lg overflow-hidden text-xs shadow-xs">
                  <div className="bg-slate-100 p-2 text-center border-b border-slate-300">
                    <div className="text-[10px] italic text-slate-500">&laquo;abstract&raquo;</div>
                    <div className="font-bold text-slate-900">User</div>
                  </div>
                  <div className="p-2.5 space-y-0.5 font-mono text-[11px] text-slate-700 bg-white border-b border-slate-200">
                    <div># id: String</div>
                    <div># username: String</div>
                    <div># fullName: String</div>
                    <div># email: String</div>
                    <div># role: UserRole</div>
                  </div>
                  <div className="p-2.5 font-mono text-[11px] text-slate-700 bg-white">
                    <div>+ getId(): String</div>
                    <div>+ getRole(): UserRole</div>
                    <div>+ {`getRoleDesc(): String`}*</div>
                  </div>
                </div>

                {/* Student Subclass */}
                <div className="border border-emerald-300 rounded-lg overflow-hidden text-xs shadow-xs">
                  <div className="bg-emerald-50 p-2 text-center border-b border-emerald-300">
                    <div className="text-[10px] text-emerald-700">extends User</div>
                    <div className="font-bold text-slate-900">Student</div>
                  </div>
                  <div className="p-2.5 space-y-0.5 font-mono text-[11px] text-slate-700 bg-white border-b border-slate-200">
                    <div>- rollNumber: String</div>
                    <div>- semester: int</div>
                    <div>- sectionId: String</div>
                  </div>
                  <div className="p-2.5 font-mono text-[11px] text-slate-700 bg-white">
                    <div>+ getRollNumber(): String</div>
                    <div>+ getRoleDesc(): String</div>
                    <div>+ compareTo(Student): int</div>
                  </div>
                </div>

                {/* Faculty Subclass */}
                <div className="border border-blue-300 rounded-lg overflow-hidden text-xs shadow-xs">
                  <div className="bg-blue-50 p-2 text-center border-b border-blue-300">
                    <div className="text-[10px] text-blue-700">extends User</div>
                    <div className="font-bold text-slate-900">Faculty</div>
                  </div>
                  <div className="p-2.5 space-y-0.5 font-mono text-[11px] text-slate-700 bg-white border-b border-slate-200">
                    <div>- employeeCode: String</div>
                    <div>- designation: String</div>
                    <div>- assignedSubjectIds: List&lt;String&gt;</div>
                  </div>
                  <div className="p-2.5 font-mono text-[11px] text-slate-700 bg-white">
                    <div>+ getEmployeeCode(): String</div>
                    <div>+ assignSubject(String): void</div>
                  </div>
                </div>
              </div>

              {/* Second Row: Session & Record (Composition) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* AttendanceSession */}
                <div className="border border-slate-300 rounded-lg overflow-hidden text-xs shadow-xs">
                  <div className="bg-slate-100 p-2 text-center border-b border-slate-300">
                    <div className="font-bold text-slate-900">AttendanceSession</div>
                    <div className="text-[10px] text-slate-500">Composite Parent</div>
                  </div>
                  <div className="p-2.5 space-y-0.5 font-mono text-[11px] text-slate-700 bg-white border-b border-slate-200">
                    <div>- sessionId: String</div>
                    <div>- subjectId: String</div>
                    <div>- date: LocalDate</div>
                    <div>- records: List&lt;AttendanceRecord&gt; &diams;</div>
                  </div>
                  <div className="p-2.5 font-mono text-[11px] text-slate-700 bg-white">
                    <div>+ addRecord(studentId, status): void</div>
                    <div>+ getRecords(): List&lt;AttendanceRecord&gt;</div>
                  </div>
                </div>

                {/* AttendanceRecord */}
                <div className="border border-slate-300 rounded-lg overflow-hidden text-xs shadow-xs">
                  <div className="bg-slate-100 p-2 text-center border-b border-slate-300">
                    <div className="font-bold text-slate-900">AttendanceRecord</div>
                    <div className="text-[10px] text-slate-500">Component Part (Composition)</div>
                  </div>
                  <div className="p-2.5 space-y-0.5 font-mono text-[11px] text-slate-700 bg-white border-b border-slate-200">
                    <div>- recordId: String</div>
                    <div>- studentId: String</div>
                    <div>- status: AttendanceStatus</div>
                    <div>- remarks: String</div>
                  </div>
                  <div className="p-2.5 font-mono text-[11px] text-slate-700 bg-white">
                    <div>+ getStatus(): AttendanceStatus</div>
                    <div>+ setStatus(status): void</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* OBJECT DIAGRAM VIEW */
            <div className="space-y-4">
              <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200/60">
                An <strong>UML Object Diagram</strong> represents a concrete runtime snapshot of instantiated objects and memory links at a specific instant during attendance session processing.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-slate-300 rounded-lg p-3 bg-white text-xs font-mono shadow-xs">
                  <div className="font-bold underline text-slate-900 pb-1 border-b border-slate-200">
                    <u>admin1 : Admin</u>
                  </div>
                  <div className="pt-2 text-[11px] text-slate-700 space-y-0.5">
                    <div>id = &quot;admin-1&quot;</div>
                    <div>username = &quot;admin&quot;</div>
                    <div>fullName = &quot;Dr. Alistair Vance&quot;</div>
                    <div>role = ADMIN</div>
                  </div>
                </div>

                <div className="border border-blue-300 rounded-lg p-3 bg-white text-xs font-mono shadow-xs">
                  <div className="font-bold underline text-blue-900 pb-1 border-b border-blue-200">
                    <u>fac1 : Faculty</u>
                  </div>
                  <div className="pt-2 text-[11px] text-slate-700 space-y-0.5">
                    <div>id = &quot;fac-1&quot;</div>
                    <div>fullName = &quot;Prof. Elena Rostova&quot;</div>
                    <div>empCode = &quot;FAC-2019-041&quot;</div>
                    <div>assigned = [&quot;subj-cs301&quot;]</div>
                  </div>
                </div>

                <div className="border border-emerald-300 rounded-lg p-3 bg-white text-xs font-mono shadow-xs">
                  <div className="font-bold underline text-emerald-900 pb-1 border-b border-emerald-200">
                    <u>stu1 : Student</u>
                  </div>
                  <div className="pt-2 text-[11px] text-slate-700 space-y-0.5">
                    <div>id = &quot;stu-1&quot;</div>
                    <div>fullName = &quot;Aarav Patel&quot;</div>
                    <div>rollNumber = &quot;2024CSE001&quot;</div>
                    <div>semester = 3</div>
                  </div>
                </div>
              </div>

              {/* Session Snapshot */}
              <div className="border border-indigo-200 rounded-lg p-4 bg-indigo-50/30 text-xs font-mono space-y-2">
                <div className="font-bold underline text-indigo-950 pb-1 border-b border-indigo-200">
                  <u>sess1 : AttendanceSession</u>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-800">
                  <div>sessionId = &quot;sess-cs301-8&quot;</div>
                  <div>subjectId = &quot;subj-cs301&quot;</div>
                  <div>date = 2026-10-21</div>
                  <div>topic = &quot;Java Multithreading&quot;</div>
                </div>
                <div className="pt-2 border-t border-indigo-100 text-slate-600 text-[11px]">
                  <strong>Contains (Composition):</strong> rec1: AttendanceRecord (studentId=&quot;stu-1&quot;, status=PRESENT)
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
