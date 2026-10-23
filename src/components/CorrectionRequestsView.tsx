import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AttendanceStatus, CorrectionRequest, Student } from '../types';
import {
  FileCheck2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Send,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';

export const CorrectionRequestsView: React.FC = () => {
  const {
    currentUser,
    correctionRequests,
    sessions,
    subjects,
    submitCorrectionRequest,
    reviewCorrectionRequest,
  } = useApp();

  const isStudent = currentUser.role === 'STUDENT';
  const studentUser = isStudent ? (currentUser as Student) : null;

  // Student Form State
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [requestedStatus, setRequestedStatus] = useState<AttendanceStatus>('PRESENT');
  const [reason, setReason] = useState<string>('');
  const [formNotification, setFormNotification] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Review Modal State
  const [reviewModalData, setReviewModalData] = useState<{
    request: CorrectionRequest;
    decision: 'APPROVED' | 'REJECTED';
  } | null>(null);
  const [reviewRemarks, setReviewRemarks] = useState<string>('');

  // Find sessions in which this student has records
  const studentEligibleSessions = isStudent && studentUser
    ? sessions.filter((s) => s.records.some((r) => r.studentId === studentUser.id))
    : [];

  const selectedSession = sessions.find((s) => s.id === selectedSessionId);
  const selectedRecord = selectedSession?.records.find((r) => r.studentId === studentUser?.id);
  const selectedSubject = subjects.find((sb) => sb.id === selectedSession?.subjectId);

  // Filter requests
  const visibleRequests = isStudent
    ? correctionRequests.filter((r) => r.studentId === currentUser.id)
    : correctionRequests;

  const pendingRequests = visibleRequests.filter((r) => r.status === 'PENDING');
  const resolvedRequests = visibleRequests.filter((r) => r.status !== 'PENDING');

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormNotification(null);

    if (!studentUser) return;
    if (!selectedSessionId) {
      setFormNotification({ type: 'error', text: 'Please select an attendance session.' });
      return;
    }
    if (!reason.trim()) {
      setFormNotification({ type: 'error', text: 'Please provide a clear reason for the correction.' });
      return;
    }
    if (!selectedSession || !selectedRecord) {
      setFormNotification({ type: 'error', text: 'Could not find your attendance record for this session.' });
      return;
    }

    const res = submitCorrectionRequest({
      studentId: studentUser.id,
      studentName: studentUser.fullName,
      rollNumber: studentUser.rollNumber,
      sessionId: selectedSession.id,
      subjectId: selectedSubject?.id || '',
      subjectName: selectedSubject?.name || 'Class Session',
      sessionDate: selectedSession.date,
      originalStatus: selectedRecord.status,
      requestedStatus,
      reason: reason.trim(),
    });

    if (res.success) {
      setFormNotification({ type: 'success', text: res.message });
      setReason('');
      setSelectedSessionId('');
    } else {
      setFormNotification({ type: 'error', text: res.message });
    }
  };

  const handleConfirmReview = () => {
    if (!reviewModalData) return;
    if (!reviewRemarks.trim()) {
      alert('Please enter a review justification or remarks.');
      return;
    }

    reviewCorrectionRequest(
      reviewModalData.request.id,
      reviewModalData.decision === 'APPROVED',
      reviewRemarks.trim()
    );

    setReviewModalData(null);
    setReviewRemarks('');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          {isStudent ? 'Attendance Correction Requests' : 'Review Attendance Corrections'}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {isStudent
            ? 'Submit formal verification requests for misplaced absences or official college leaves.'
            : 'Authorize or reject pending attendance dispute requests with audited decision logging.'}
        </p>
      </div>

      {/* Student: Submit Correction Request Form */}
      {isStudent && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 uppercase tracking-wider">
            <Send className="w-3.5 h-3.5 text-indigo-600" />
            <span>Submit New Correction Request</span>
          </div>

          {formNotification && (
            <div
              className={`p-3 rounded-lg text-xs flex items-center gap-2 border ${
                formNotification.type === 'success'
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  : 'bg-rose-50 text-rose-900 border-rose-200'
              }`}
            >
              {formNotification.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{formNotification.text}</span>
            </div>
          )}

          <form onSubmit={handleStudentSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Select Session */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Session Date & Subject *
                </label>
                <select
                  value={selectedSessionId}
                  onChange={(e) => setSelectedSessionId(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-slate-900 bg-white"
                >
                  <option value="">-- Choose a session --</option>
                  {studentEligibleSessions.map((s) => {
                    const subj = subjects.find((sb) => sb.id === s.subjectId);
                    const rec = s.records.find((r) => r.studentId === studentUser?.id);
                    return (
                      <option key={s.id} value={s.id}>
                        {s.date} - {subj?.code} (Currently: {rec?.status})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Current Status (Read only) */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Current Status in Record
                </label>
                <input
                  type="text"
                  readOnly
                  disabled
                  value={selectedRecord ? selectedRecord.status : 'Select session'}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 font-mono"
                />
              </div>

              {/* Requested Status */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Requested Correction *
                </label>
                <select
                  value={requestedStatus}
                  onChange={(e) => setRequestedStatus(e.target.value as AttendanceStatus)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-slate-900 bg-white"
                >
                  <option value="PRESENT">PRESENT (Present in class)</option>
                  <option value="LEAVE">LEAVE (Official / Medical Leave)</option>
                  <option value="LATE">LATE (Admitted late)</option>
                </select>
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Reason & Evidence Description *
              </label>
              <textarea
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain why the record should be corrected (e.g. submitted medical slip, college sports representation, biometric error)..."
                className="w-full text-xs p-3 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-slate-900 bg-white"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
              >
                Submit Correction Request
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Pending Queue */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Pending Requests ({pendingRequests.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isStudent
                ? 'Your submitted requests awaiting faculty review'
                : 'Awaiting your authorization'}
            </p>
          </div>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No pending correction requests.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:bg-slate-50/50 transition-colors"
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-slate-900">
                      {req.studentName}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      ({req.rollNumber})
                    </span>
                    <span className="text-[10px] font-medium bg-amber-50 text-amber-800 px-2 py-0.5 rounded">
                      PENDING
                    </span>
                  </div>

                  <div className="text-xs text-slate-700">
                    Subject: <span className="font-medium">{req.subjectName}</span> · Date:{' '}
                    <span className="font-mono">{req.sessionDate}</span>
                  </div>

                  <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-1">
                      <span>Status change:</span>
                      <span className="font-semibold text-rose-600 font-mono">
                        {req.originalStatus}
                      </span>
                      <span>→</span>
                      <span className="font-semibold text-emerald-600 font-mono">
                        {req.requestedStatus}
                      </span>
                    </div>
                    <p className="italic text-slate-800">&ldquo;{req.reason}&rdquo;</p>
                  </div>

                  <div className="text-[11px] text-slate-400">
                    Submitted: {new Date(req.createdAt).toLocaleString()}
                  </div>
                </div>

                {/* Reviewer Action Buttons (Faculty or Admin only) */}
                {!isStudent && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        setReviewModalData({
                          request: req,
                          decision: 'APPROVED',
                        })
                      }
                      className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setReviewModalData({
                          request: req,
                          decision: 'REJECTED',
                        })
                      }
                      className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resolved History */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900">
            Resolved Requests History ({resolvedRequests.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit history of approved and rejected decisions
          </p>
        </div>

        {resolvedRequests.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No resolved requests yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {resolvedRequests.map((req) => (
              <div key={req.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-slate-900">
                      {req.studentName} ({req.rollNumber})
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        req.status === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-800'
                          : 'bg-rose-50 text-rose-800'
                      }`}
                    >
                      {req.status}
                    </span>
                    <span className="text-xs text-slate-500">· {req.subjectName}</span>
                  </div>

                  <span className="text-[11px] text-slate-400">
                    Reviewed: {req.reviewedAt ? new Date(req.reviewedAt).toLocaleDateString() : '—'}
                  </span>
                </div>

                <div className="mt-2 text-xs text-slate-600 flex flex-wrap gap-4">
                  <div>
                    <span className="text-slate-400">Requested:</span> {req.originalStatus} →{' '}
                    <span className="font-semibold text-slate-800">{req.requestedStatus}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Reviewer:</span> {req.reviewerName || 'Faculty'}
                  </div>
                  {req.reviewRemarks && (
                    <div className="text-slate-700 italic">
                      Remarks: &ldquo;{req.reviewRemarks}&rdquo;
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Decision Review Modal */}
      {reviewModalData && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-5 space-y-4">
            <h3 className="text-base font-semibold text-slate-900">
              {reviewModalData.decision === 'APPROVED' ? 'Approve Request' : 'Reject Request'}
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              You are about to{' '}
              <strong className={reviewModalData.decision === 'APPROVED' ? 'text-emerald-700' : 'text-rose-700'}>
                {reviewModalData.decision}
              </strong>{' '}
              the correction for <strong>{reviewModalData.request.studentName}</strong> (
              {reviewModalData.request.rollNumber}) for session {reviewModalData.request.sessionDate}.
            </p>

            {reviewModalData.decision === 'APPROVED' && (
              <div className="p-3 bg-emerald-50 text-emerald-900 rounded-lg text-xs">
                Approving this request will immediately update the student&apos;s status to{' '}
                <strong>{reviewModalData.request.requestedStatus}</strong> and recalculate attendance metrics.
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Review Decision Remarks / Audit Note *
              </label>
              <textarea
                rows={3}
                value={reviewRemarks}
                onChange={(e) => setReviewRemarks(e.target.value)}
                placeholder="Enter justification (e.g., Medical certificate verified on file)..."
                className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-slate-900 bg-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReviewModalData(null)}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReview}
                className={`px-3.5 py-1.5 text-xs font-semibold text-white rounded-lg transition-colors ${
                  reviewModalData.decision === 'APPROVED'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                Confirm {reviewModalData.decision}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
