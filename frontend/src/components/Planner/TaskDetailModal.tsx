import React from 'react';
import { X, Edit2, Trash2 } from 'lucide-react';
import './TaskDetailModal.css';

type Task = {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  completed: boolean;
};

type TaskDetailModalProps = {
  task: Task;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
};

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  onClose,
  onEdit,
  onDelete,
}) => {
  const handleEdit = () => {
    onEdit(task);
    onClose();
  };

  const handleDelete = () => {
    onDelete(task.id);
    onClose();
  };

  return (
    <div className="planner-modal-overlay" onClick={onClose}>
      <div className="planner-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="planner-modal-header">
          <button
            onClick={onClose}
            className="planner-btn planner-icon-btn"
          >
            <X size={20} />
          </button>
          <h3>جزئیات وظیفه</h3>
        </div>
        
        <div className="planner-modal-body">
          <div className="planner-detail-section">
            <h4 className="planner-detail-label">عنوان</h4>
            <p className="planner-detail-value">{task.title}</p>
          </div>
          
          <div className="planner-detail-section">
            <h4 className="planner-detail-label">تاریخ</h4>
            <p className="planner-detail-value">{new Date(task.date).toLocaleDateString('fa-IR')}</p>
          </div>
          
          <div className="planner-detail-section">
            <h4 className="planner-detail-label">زمان</h4>
            <p className="planner-detail-value">{task.startTime} - {task.endTime}</p>
          </div>
          
          {task.description && (
            <div className="planner-detail-section">
              <h4 className="planner-detail-label">توضیحات</h4>
              <p className="planner-detail-value">{task.description}</p>
            </div>
          )}
          
          <div className="planner-detail-section">
            <h4 className="planner-detail-label">وضعیت</h4>
            <p className="planner-detail-value">
              {task.completed ? '✓ انجام شده' : '○ در انتظار انجام'}
            </p>
          </div>
        </div>
        
        <div className="planner-modal-actions">
          <button
            onClick={handleEdit}
            className="planner-btn planner-btn-primary"
          >
            <Edit2 size={16} />
            ویرایش
          </button>
          <button
            onClick={handleDelete}
            className="planner-btn planner-btn-secondary"
          >
            <Trash2 size={16} />
            حذف
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
