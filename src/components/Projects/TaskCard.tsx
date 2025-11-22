import { Clock, User } from 'lucide-react';
import { Task } from '../../data/mockData';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

export default function TaskCard({ task, onClick }: TaskCardProps) {
  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'Done';

  const priorityColors = {
    High: 'bg-red-100 text-red-700 border-red-200',
    Medium: 'bg-orange-100 text-orange-700 border-orange-200',
    Low: 'bg-green-100 text-green-700 border-green-200',
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-900 text-sm flex-1">{task.title}</h3>
        <span className={`px-2 py-1 rounded text-xs font-medium border ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
          <span>Progress</span>
          <span className="font-semibold">{task.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${task.progress}%` }}
          ></div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-xs font-medium text-blue-700">{task.assignee.avatar}</span>
          </div>
          <span className="text-gray-600">{task.assignee.name}</span>
        </div>

        <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
          <Clock className="w-3 h-3" />
          <span>{new Date(task.dueDate).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}</span>
        </div>
      </div>
    </div>
  );
}
