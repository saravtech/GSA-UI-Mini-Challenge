import { Application, ApplicationStatus } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

interface ProgressDashboardProps {
  applications: Application[];
}

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  Draft: '#94a3b8',
  Ready: '#3b82f6',
  Submitted: '#10b981',
  Awarded: '#8b5cf6',
  Lost: '#ef4444',
};

export default function ProgressDashboard({ applications }: ProgressDashboardProps) {
  const statusCounts = applications.reduce(
    (acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    },
    {} as Record<ApplicationStatus, number>
  );

  const statusData = Object.entries(statusCounts).map(([status, count]) => ({
    name: status,
    value: count,
    color: STATUS_COLORS[status as ApplicationStatus],
  }));

  const averageComplete =
    applications.length > 0
      ? Math.round(
          applications.reduce((sum, app) => sum + app.percentComplete, 0) /
            applications.length
        )
      : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Progress Dashboard
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Counts */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Status Distribution
          </h3>
          <div className="space-y-2 mb-4">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: STATUS_COLORS[status as ApplicationStatus] }}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{status}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {count}
                </span>
              </div>
            ))}
          </div>
          {statusData.length > 0 && (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Average Complete */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Average Completion
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-700 dark:text-gray-300">Overall Progress</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {averageComplete}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6">
                <div
                  className="bg-primary-600 h-6 rounded-full transition-all duration-300 flex items-center justify-center"
                  style={{ width: `${averageComplete}%` }}
                >
                  {averageComplete > 10 && (
                    <span className="text-xs text-white font-medium">{averageComplete}%</span>
                  )}
                </div>
              </div>
            </div>

            {/* Status Bar Chart */}
            {statusData.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Count by Status
                </h4>
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={statusData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6">
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

