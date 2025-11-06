import { useEffect, useRef } from 'react';
import { Application, ApplicationStatus } from '../types';
import { formatDate, formatRelativeDate } from '../utils/dateUtils';

interface DetailsDrawerProps {
  application: Application | null;
  onClose: () => void;
  onMarkSubmitted: (id: string) => void;
}

// Status timeline order
const STATUS_ORDER: ApplicationStatus[] = ['Draft', 'Ready', 'Submitted', 'Awarded', 'Lost'];

export default function DetailsDrawer({
  application,
  onClose,
  onMarkSubmitted,
}: DetailsDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Focus trap and ESC key handling
  useEffect(() => {
    if (!application) return;
    
    // Store previous focus
    previousFocusRef.current = document.activeElement as HTMLElement;
    
    // Focus first focusable element in drawer
    const firstFocusable = drawerRef.current?.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as HTMLElement;
    firstFocusable?.focus();

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Focus trap
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      const focusableElements = drawerRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (!focusableElements || focusableElements.length === 0) return;
      
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    document.addEventListener('keydown', handleTab);
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleTab);
      // Restore previous focus
      previousFocusRef.current?.focus();
    };
  }, [application, onClose]);

  if (!application) return null;

  const handleMarkSubmitted = () => {
    if (application.status === 'Ready') {
      onMarkSubmitted(application.id);
      // Don't close immediately - let user see the update
      setTimeout(() => {
        onClose();
      }, 500);
    }
  };

  // Generate status timeline
  const getStatusTimeline = () => {
    const currentStatusIndex = STATUS_ORDER.indexOf(application.status);
    return STATUS_ORDER.map((status, index) => ({
      status,
      isActive: index <= currentStatusIndex,
      isCurrent: index === currentStatusIndex,
    }));
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white dark:bg-gray-800 shadow-xl z-50 overflow-y-auto slide-in-right"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {application.title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="Close drawer"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Status and Key Info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Status</span>
              <div className="mt-1">
                <span
                  className={`px-3 py-1 rounded text-sm font-medium text-white ${
                    application.status === 'Draft'
                      ? 'bg-gray-500'
                      : application.status === 'Ready'
                      ? 'bg-blue-500'
                      : application.status === 'Submitted'
                      ? 'bg-green-500'
                      : application.status === 'Awarded'
                      ? 'bg-purple-500'
                      : 'bg-red-500'
                  }`}
                >
                  {application.status}
                </span>
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Fit Score</span>
              <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
                {application.fitScore}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4 mb-6">
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Agency</span>
              <p className="text-gray-900 dark:text-gray-100">{application.agency}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">NAICS</span>
              <p className="text-gray-900 dark:text-gray-100">
                {application.naics} {application.naicsDescription && `- ${application.naicsDescription}`}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Vehicle</span>
              <p className="text-gray-900 dark:text-gray-100">{application.vehicle}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Due Date</span>
              <p className="text-gray-900 dark:text-gray-100">
                {formatDate(application.dueDate)} ({formatRelativeDate(application.dueDate)})
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Set-Aside</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {application.setAside.map((sa) => (
                  <span key={sa} className="chip">
                    {sa}
                  </span>
                ))}
              </div>
            </div>
            {application.ceiling && (
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Ceiling</span>
                <p className="text-gray-900 dark:text-gray-100">
                  {typeof application.ceiling === 'number' 
                    ? `$${application.ceiling.toLocaleString()}`
                    : `$${application.ceiling.min.toLocaleString()} - $${application.ceiling.max.toLocaleString()}`
                  }
                </p>
              </div>
            )}
            {application.keywords && application.keywords.length > 0 && (
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Keywords</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {application.keywords.map((keyword) => (
                    <span key={keyword} className="chip">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {application.description && (
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</span>
                <p className="text-gray-900 dark:text-gray-100 mt-1">{application.description}</p>
              </div>
            )}
          </div>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-700 dark:text-gray-300">Progress</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {application.percentComplete}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
              <div
                className="bg-primary-600 h-4 rounded-full transition-all duration-300"
                style={{ width: `${application.percentComplete}%` }}
              />
            </div>
          </div>

          {/* Status Timeline */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Status Timeline
            </h3>
            <div className="space-y-3">
              {getStatusTimeline().map((item, index) => (
                <div key={item.status} className="flex items-center gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all duration-300 ${
                        item.isActive
                          ? item.isCurrent
                            ? 'bg-primary-600 text-white scale-110'
                            : 'bg-green-500 text-white'
                          : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {item.isActive ? (item.isCurrent ? '→' : '✓') : index + 1}
                    </div>
                    {index < STATUS_ORDER.length - 1 && (
                      <div
                        className={`w-0.5 h-8 mt-2 transition-colors duration-300 ${
                          item.isActive ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <div
                      className={`font-medium transition-colors duration-300 ${
                        item.isCurrent
                          ? 'text-primary-600 dark:text-primary-400 text-lg'
                          : item.isActive
                          ? 'text-gray-900 dark:text-gray-100'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {item.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Application Stages Timeline (if available) */}
          {application.stages && application.stages.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Application Stages
              </h3>
              <div className="space-y-4">
                {application.stages.map((stage, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                        stage.completed
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {stage.completed ? '✓' : index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {stage.stage}
                      </div>
                      {stage.date && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(stage.date)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {application.status === 'Ready' && (
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleMarkSubmitted}
                className="btn-primary w-full"
              >
                Mark as Submitted
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

