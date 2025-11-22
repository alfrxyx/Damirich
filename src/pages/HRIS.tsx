import { Mail, Calendar, Clock } from 'lucide-react';
import { employees } from '../data/mockData';
import { useState } from 'react';

export default function HRIS() {
  const [checkInTime, setCheckInTime] = useState<string | null>(null);

  const handleClockIn = () => {
    const now = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    setCheckInTime(now);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">HRIS</h1>
          <p className="text-gray-600 mt-1">Human Resource Information System</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Attendance</h2>
              <p className="text-sm text-gray-600">
                {checkInTime ? `Checked in at ${checkInTime}` : 'Click to check in'}
              </p>
            </div>
          </div>
          {!checkInTime && (
            <button
              onClick={handleClockIn}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Clock In
            </button>
          )}
          {checkInTime && (
            <div className="px-6 py-2 bg-green-100 text-green-700 rounded-lg font-medium">
              Present
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Employee Directory</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Total: {employees.length} employees</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.map((employee) => (
            <div
              key={employee.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-bold text-white">{employee.avatar}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {employee.name}
                  </h3>
                  <p className="text-sm text-gray-600">{employee.position}</p>
                  <div className="mt-2">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                        employee.status === 'Active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      {employee.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{employee.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {new Date(employee.joinDate).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium">Division:</span>
                  <span>{employee.division}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
