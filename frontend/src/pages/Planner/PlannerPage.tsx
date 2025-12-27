import React, { useState, useEffect } from 'react';
import './PlannerPage.css';
import Calendar from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import { Plus } from 'lucide-react';
import type { Value } from 'react-multi-date-picker';
import TaskForm from '../../components/Planner/TaskForm';
import TaskCard from '../../components/Planner/TaskCard';
import TaskDetailModal from '../../components/Planner/TaskDetailModal';
import AllTasksSidebar from '../../components/Planner/AllTasksSidebar';

type Task = {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  completed: boolean;
};

const STORAGE_KEY = 'elmosyar_planner_v1';

const PlannerPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<Value>(new Date());
  const [isCreating, setIsCreating] = useState(false);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    startTime: '',
    endTime: '',
    description: '',
  });

  // Load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setTasks(parsed.tasks || []);
      }
    } catch (err) {
      console.error('Error loading tasks:', err);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ tasks }));
    } catch (err) {
      console.error('Error saving tasks:', err);
    }
  }, [tasks]);

  const getSelectedDateString = (): string => {
    if (!selectedDate) return '';
    const date = Array.isArray(selectedDate) ? selectedDate[0] : selectedDate;
    if (!date) return '';
    
    // Convert to Gregorian date string
    const jsDate = date.toDate?.() || new Date();
    return jsDate.toISOString().split('T')[0];
  };

  const getTasksForSelectedDate = () => {
    const dateStr = getSelectedDateString();
    return tasks
      .filter(t => t.date === dateStr)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.startTime || !formData.endTime) return;

    const dateStr = getSelectedDateString();
    if (!dateStr) return;

    if (editingTask) {
      setTasks(prev => prev.map(t => 
        t.id === editingTask 
          ? { ...t, ...formData, date: dateStr } 
          : t
      ));
      setEditingTask(null);
    } else {
      const newTask: Task = {
        id: Date.now().toString(),
        ...formData,
        date: dateStr,
        completed: false,
      };
      setTasks(prev => [...prev, newTask]);
      setIsCreating(false);
    }

    setFormData({ title: '', startTime: '', endTime: '', description: '' });
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEdit = (task: Task) => {
    setFormData({
      title: task.title,
      startTime: task.startTime,
      endTime: task.endTime,
      description: task.description,
    });
    setEditingTask(task.id);
    setIsCreating(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('آیا از حذف این وظیفه اطمینان دارید؟')) {
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingTask(null);
    setFormData({ title: '', startTime: '', endTime: '', description: '' });
  };

  const toggleComplete = (id: string) => {
    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  const handleViewTask = (task: Task) => {
    setViewingTask(task);
  };

  const handleSidebarTaskClick = (task: Task) => {
    const taskDate = new Date(task.date);
    setSelectedDate(taskDate);
  };

  const dayTasks = getTasksForSelectedDate();
  const allTasks = tasks.sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date);
    if (dateCompare !== 0) return dateCompare;
    return a.startTime.localeCompare(b.startTime);
  });

  return (
    <div className="planner-page">
      <div className="planner-container">
        <div className="planner-layout">
          <div className="planner-main">
            <div className="planner-header">
              <h2>برنامه‌ریز</h2>
            </div>

            <div className="planner-calendar-section">
              <Calendar
                value={selectedDate}
                onChange={setSelectedDate}
                calendar={persian}
                locale={persian_fa}
                className="planner-custom-calendar"
              />
            </div>

            <div className="planner-day-schedule">
              <div className="planner-day-schedule-header">
                <button
                  onClick={() => setIsCreating(true)}
                  className="planner-btn planner-btn-primary"
                >
                  <Plus size={18} />
                  وظیفه جدید
                </button>
                <h3>برنامه روز</h3>
              </div>

              {(isCreating || editingTask) && (
                <TaskForm
                  isEditing={!!editingTask}
                  formData={formData}
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                  onChange={handleFormChange}
                />
              )}

              <div className="planner-tasks-timeline">
                {dayTasks.length === 0 && !isCreating && !editingTask ? (
                  <div className="planner-empty-task-state">
                    <p>هیچ وظیفه‌ای برای این روز ثبت نشده است</p>
                  </div>
                ) : (
                  dayTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onToggleComplete={toggleComplete}
                      onView={handleViewTask}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          <AllTasksSidebar
            tasks={allTasks}
            onTaskClick={handleSidebarTaskClick}
          />
        </div>
      </div>

      {viewingTask && (
        <TaskDetailModal
          task={viewingTask}
          onClose={() => setViewingTask(null)}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default PlannerPage;
