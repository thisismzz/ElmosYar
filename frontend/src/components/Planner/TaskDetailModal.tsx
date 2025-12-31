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
  showActions?: boolean;
};

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  onClose,
  onEdit,
  onDelete,
  showActions = true,
}) => {
  const handleEdit = () => {
    onEdit && onEdit(task);
    onClose();
  };

  const handleDelete = () => {
    onDelete && onDelete(task.id);
    onClose();
  };

  return (
    <div className="planner-modal-overlay" onClick={onClose}>
      <div className="planner-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="planner-modal-header">
          <div className="planner-modal-header-actions">
            {showActions && (
              <>
                <button
                  onClick={handleEdit}
                  className="planner-modal-icon-btn"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={handleDelete}
                  className="planner-modal-icon-btn"
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="planner-modal-icon-btn"
            >
              <X size={20} />
            </button>
          </div>
          <h3>جزئیات وظیفه</h3>
        </div>
        
        <div className="planner-modal-body">
          <div className="planner-detail-section">
            <h4 className="planner-detail-label">عنوان</h4>
            <p className="planner-detail-value">{task.title}</p>
          </div>
          
          <div className="planner-detail-row">
            <div className="planner-detail-section planner-detail-section-half">
              <h4 className="planner-detail-label">تاریخ</h4>
              <p className="planner-detail-value">{new Date(task.date).toLocaleDateString('fa-IR')}</p>
            </div>
            
            <div className="planner-detail-section planner-detail-section-half">
              <h4 className="planner-detail-label">زمان</h4>
              <p className="planner-detail-value">{task.endTime} - {task.startTime}</p>
            </div>
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
      </div>
    </div>
  );
};

export default TaskDetailModal;
