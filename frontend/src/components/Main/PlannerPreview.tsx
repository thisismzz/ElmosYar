import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import TaskCard from '../Planner/TaskCard';
import TaskDetailModal from '../Planner/TaskDetailModal';
import PreviewSection from './PreviewSection';
import './PreviewSection.css';

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

const PlannerPreview: React.FC = () => {
  const [view, setView] = useState<'today' | 'week'>('today');
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed.tasks || [];
      }
    } catch (err) {
      console.error('Error loading tasks:', err);
    }
    return [];
  });
  const [viewingTask, setViewingTask] = useState<Task | null>(null);

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const getWeekDates = () => {
    const dates = [];
    const startOfWeek = new Date(today);
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 6 ? 0 : dayOfWeek + 1; // Saturday is 6
    startOfWeek.setDate(today.getDate() - diff);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const weekDates = getWeekDates();
  const todayTasks = tasks
    .filter((t) => t.date === todayStr)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
  const weekTasks = tasks
    .filter((t) => weekDates.includes(t.date))
    .sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.startTime.localeCompare(b.startTime);
    });

  const displayTasks = view === 'today' ? todayTasks.slice(0, 4) : weekTasks.slice(0, 10);

  return (
    <PreviewSection
      title="برنامه‌ریز"
      icon={<Calendar size={18} />}
      linkTo="/planner"
      linkLabel="مشاهده همه"
      toggle={{
        options: [
          { value: 'today', label: 'امروز' },
          { value: 'week', label: 'این هفته' },
        ],
        value: view,
        onChange: (val) => setView(val as 'today' | 'week'),
      }}
    >
      {displayTasks.length === 0 ? (
        <div className="preview-section-empty">
          <Calendar size={32} className="preview-section-empty-icon" />
          <p>
            {view === 'today'
              ? 'هیچ وظیفه‌ای برای امروز ثبت نشده است'
              : 'هیچ وظیفه‌ای برای این هفته ثبت نشده است'}
          </p>
        </div>
      ) : (
        <div className="preview-section-grid">
          {displayTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onView={setViewingTask}
              showActions={false}
              titlePreviewLimit={30}
              descriptionPreviewLimit={80}
            />
          ))}
        </div>
      )}

      {viewingTask && (
        <TaskDetailModal
          task={viewingTask}
          onClose={() => setViewingTask(null)}
          onEdit={() => {}}
          onDelete={() => {}}
          showActions={false}
        />
      )}
    </PreviewSection>
  );
};

export default PlannerPreview;
