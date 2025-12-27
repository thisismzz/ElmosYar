import React from 'react';
import { Clock } from 'lucide-react';
import './AllTasksSidebar.css';

type Task = {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  completed: boolean;
};

type AllTasksSidebarProps = {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  titlePreviewLimit?: number;
};

const AllTasksSidebar: React.FC<AllTasksSidebarProps> = ({
  tasks,
  onTaskClick,
  titlePreviewLimit = 40,
}) => {
  const getTitlePreview = (title: string) => {
    return title.length > titlePreviewLimit 
      ? title.slice(0, titlePreviewLimit) + '...' 
      : title;
  };

  return (
    <div className="planner-sidebar">
      <div className="planner-sidebar-box">
        <h3>همه وظایف</h3>
        <div className="planner-all-tasks-list">
          {tasks.length === 0 ? (
            <p className="planner-empty-text">هیچ وظیفه‌ای ثبت نشده است</p>
          ) : (
            tasks.map(task => (
              <div 
                key={task.id} 
                className={`planner-task-item ${task.completed ? 'planner-task-item-completed' : ''}`}
                onClick={() => onTaskClick(task)}
              >
                <div className="planner-task-item-header">
                  <span className="planner-task-date">{new Date(task.date).toLocaleDateString('fa-IR')}</span>
                  <h4 className="planner-task-item-title">{getTitlePreview(task.title)}</h4>
                </div>
                <div className="planner-task-item-time">
                  <Clock size={12} />
                  <span>{task.startTime} - {task.endTime}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AllTasksSidebar;
