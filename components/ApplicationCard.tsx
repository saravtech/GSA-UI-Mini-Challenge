import { Application } from '../types';
import { formatDate, formatRelativeDate } from '../utils/dateUtils';

interface ApplicationCardProps {
  application: Application;
  onClick: () => void;
  onAskAI?: () => void;
}

export default function ApplicationCard({ application, onClick, onAskAI }: ApplicationCardProps) {
  const statusColors: Record<Application['status'], string> = {
    Draft: 'bg-gray-500',
    Ready: 'bg-blue-500',
    Submitted: 'bg-green-500',
    Awarded: 'bg-purple-500',
    Lost: 'bg-red-500',
  };

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick();
        }
      }}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex-1">
          {application.title}
        </h3>
        <span
          className={`px-2 py-1 rounded text-xs font-medium text-white ${statusColors[application.status]}`}
        >
          {application.status}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium">Agency:</span>
          <span>{application.agency}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium">NAICS:</span>
          <span>{application.naics}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium">Vehicle:</span>
          <span>{application.vehicle}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium">Due:</span>
          <span>
            {formatDate(application.dueDate)} ({formatRelativeDate(application.dueDate)})
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {application.setAside.map((sa) => (
          <span key={sa} className="chip">
            {sa}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400">Progress</span>
            <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
              <div
                className="bg-primary-600 h-2 rounded-full"
                style={{ width: `${application.percentComplete}%` }}
              />
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {application.percentComplete}%
            </span>
          </div>
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400">Fit Score</span>
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {application.fitScore}
            </div>
          </div>
        </div>
        {onAskAI && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAskAI();
            }}
            className="btn-secondary text-sm flex items-center gap-2"
            aria-label="Ask AI about this opportunity"
          >
            <span>🤖</span>
            <span>Ask AI</span>
          </button>
        )}
      </div>
    </div>
  );
}

