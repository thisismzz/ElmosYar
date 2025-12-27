import React from 'react';
import { Trash2, Edit2, Check, Clock } from 'lucide-react';
import './TaskCard.css';

type Task = {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  completed: boolean;
};

type TaskCardProps = {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onView: (task: Task) => void;
  titlePreviewLimit?: number;
  descriptionPreviewLimit?: number;
};

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onToggleComplete,
  onView,
  titlePreviewLimit = 50,
  descriptionPreviewLimit = 100,
}) => {
  const getPreview = (text: string, limit: number) => {
    if (!text) return { displayed: '', isLong: false };
    const isLong = text.length > limit;
    const displayed = isLong ? text.slice(0, limit) : text;
    return { displayed, isLong };
  };

  const titlePreview = getPreview(task.title, titlePreviewLimit);
  const descPreview = getPreview(task.description, descriptionPreviewLimit);

  return (
    <div 
      className={`planner-task-card ${task.completed ? 'planner-task-completed' : ''}`}
      onClick={() => onView(task)}
    >
      <div className="planner-task-content">
        <div className="planner-task-header">
          <div className="planner-task-actions" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onDelete(task.id)}
              className="planner-btn planner-icon-btn"
            >
              <Trash2 size={16} />
            </button>
            <button
              onClick={() => onEdit(task)}
              className="planner-btn planner-icon-btn"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => onToggleComplete(task.id)}
              className="planner-btn planner-icon-btn planner-checkbox-btn"
            >
              {task.completed ? <Check size={16} /> : <div className="planner-checkbox-empty" />}
            </button>
          </div>
          <h4 className="planner-task-title">
            {titlePreview.displayed}{titlePreview.isLong ? '...' : ''}
          </h4>
        </div>
        
        <div className="planner-task-time">
          <Clock size={14} />
          <span>{task.startTime} - {task.endTime}</span>
        </div>
        
        {task.description && (
          <p className="planner-task-description">
            {descPreview.displayed}{descPreview.isLong ? '...' : ''}
          </p>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
