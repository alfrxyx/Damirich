import { X, User, Calendar, Flag, CheckCircle2, Circle } from 'lucide-react';
import { Task } from '../../data/mockData';

interface TaskModalProps {
  task: Task;
  onClose: () => void;
}

export default function TaskModal({ task, onClose }: TaskModalProps) {
  const priorityColors = {
    High: 'text-red-600 bg-red-50',
    Medium: 'text-orange-600 bg-orange-50',
    Low: 'text-green-600 bg-green-50',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{task.title}</h2>
            <div className="flex items-center gap-4 mt-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${priorityColors[task.priority]}`}>
                <Flag className="w-4 h-4 inline mr-1" />
                {task.priority} Priority
              </span>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                {task.status}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
            <p className="text-gray-600">{task.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Assignee
              </h3>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-700">{task.assignee.avatar}</span>
                </div>
                <span className="font-medium text-gray-900">{task.assignee.name}</span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Due Date
              </h3>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">
                  {new Date(task.dueDate).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Progress</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Overall Completion</span>
                <span className="font-semibold text-blue-600">{task.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all"
                  style={{ width: `${task.progress}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Checklist</h3>
            <div className="space-y-2">
              {task.checklist.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {item.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                  <span className={`flex-1 ${item.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                    {item.item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
