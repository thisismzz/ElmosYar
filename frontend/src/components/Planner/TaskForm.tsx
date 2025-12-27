import React from 'react';
import { X } from 'lucide-react';
import './TaskForm.css';

type TaskFormProps = {
  isEditing: boolean;
  formData: {
    title: string;
    startTime: string;
    endTime: string;
    description: string;
  };
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onChange: (field: string, value: string) => void;
};

// Generate time options in 15-minute intervals
const generateTimeOptions = () => {
  const times: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const hourStr = hour.toString().padStart(2, '0');
      const minuteStr = minute.toString().padStart(2, '0');
      times.push(`${hourStr}:${minuteStr}`);
    }
  }
  return times;
};

const generateEndTimeOptions = () => {
  const times = generateTimeOptions();
  times.push('00:00');
  return times;
};

const TaskForm: React.FC<TaskFormProps> = ({
  isEditing,
  formData,
  onSubmit,
  onCancel,
  onChange,
}) => {
  const timeOptions = generateTimeOptions();
  const endTimeOptions = generateEndTimeOptions();

  // Filter end time options to only show times after start time
  const getEndTimeOptions = () => {
    if (!formData.startTime) return endTimeOptions;
    const startIndex = timeOptions.indexOf(formData.startTime);
    return startIndex >= 0 ? endTimeOptions.slice(startIndex + 1) : endTimeOptions;
  };

  const handleStartTimeChange = (value: string) => {
    onChange('startTime', value);
    // If end time is now before or equal to new start time, reset it
    if (formData.endTime && formData.endTime <= value) {
      onChange('endTime', '');
    }
  };
  return (
    <form onSubmit={onSubmit} className="planner-task-form">
      <div className="planner-form-header">
        <button
          type="button"
          onClick={onCancel}
          className="planner-btn planner-icon-btn"
        >
          <X size={18} />
        </button>
        <h4>{isEditing ? 'ویرایش وظیفه' : 'وظیفه جدید'}</h4>
      </div>
      
      <div className="planner-form-group">
        <input
          type="text"
          placeholder="عنوان وظیفه"
          value={formData.title}
          onChange={(e) => onChange('title', e.target.value)}
          required
        />
      </div>

      <div className="planner-form-row">
        <div className="planner-form-group">
          <label>زمان پایان</label>
          <select
            value={formData.endTime}
            onChange={(e) => onChange('endTime', e.target.value)}
            required
          >
            <option value="">انتخاب کنید</option>
            {getEndTimeOptions().map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>
        <div className="planner-form-group">
          <label>زمان شروع</label>
          <select
            value={formData.startTime}
            onChange={(e) => handleStartTimeChange(e.target.value)}
            required
          >
            <option value="">انتخاب کنید</option>
            {timeOptions.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="planner-form-group">
        <textarea
          placeholder="توضیحات (اختیاری)"
          value={formData.description}
          onChange={(e) => onChange('description', e.target.value)}
          rows={3}
        />
      </div>

      <div className="planner-form-actions">
        <button type="button" onClick={onCancel} className="planner-btn planner-btn-secondary">
          لغو
        </button>
        <button type="submit" className="planner-btn planner-btn-primary">
          {isEditing ? 'ذخیره تغییرات' : 'افزودن'}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;
