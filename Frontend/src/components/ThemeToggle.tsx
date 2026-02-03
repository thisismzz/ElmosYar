// components/ThemeToggle.tsx (for your future settings page)
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 rounded-lg flex-row-reverse border border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div>
        <p className="font-medium text-gray-900 dark:text-gray-200">حالت تاریک</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {theme === 'dark' ? 'فعال' : 'غیرفعال'}
        </p>
      </div>
      <button
        onClick={toggleTheme}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200
                   ${theme === 'dark' ? 'bg-blue-500 dark:bg-blue-400' : 'bg-gray-300'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200
                        ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );
};