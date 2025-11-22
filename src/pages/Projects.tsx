import { useState } from 'react';
import { tasks } from '../data/mockData';
import TaskCard from '../components/Projects/TaskCard';
import TaskModal from '../components/Projects/TaskModal';
import type { Task } from '../data/mockData';

const columns = ['To Do', 'In Progress', 'Review', 'Done'];

export default function Projects() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const getTasksByStatus = (status: string) => {
    return tasks.filter((task) => task.status === status);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Project Management</h1>
          <p className="text-gray-600 mt-1">Track and manage your project tasks</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
          New Task
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map((column) => {
          const columnTasks = getTasksByStatus(column);
          return (
            <div key={column} className="flex flex-col">
              <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900">{column}</h2>
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                    {columnTasks.length}
                  </span>
                </div>
              </div>

              <div className="space-y-4 flex-1">
                {columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onClick={() => setSelectedTask(task)}
                  />
                ))}
                {columnTasks.length === 0 && (
                  <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <p className="text-gray-500 text-sm">No tasks</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedTask && (
        <TaskModal task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}
    </div>
  );
}
