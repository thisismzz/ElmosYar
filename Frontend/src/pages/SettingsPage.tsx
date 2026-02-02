import React, { useState, useEffect } from 'react';
import { ThemeToggle } from '../components/ThemeToggle';
import {
    linkLocalFolder,
    hasLinkedLocalFolder,
    loadNotesFromDisk,
    loadPlannerFromDisk,
} from '../services/localFileStorage';
import { Folder, FolderOpen, AlertCircle, Check, Upload, Download } from 'lucide-react';

const SettingsPage: React.FC = () => {
    const [hasFolder, setHasFolder] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [syncStatus, setSyncStatus] = useState<{
        notes: { count: number; hasData: boolean };
        planner: { count: number; hasData: boolean };
    } | null>(null);

    // Check if folder is already linked
    useEffect(() => {
        checkFolderStatus();
    }, []);

    const checkFolderStatus = async () => {
        try {
            const has = await hasLinkedLocalFolder();
            setHasFolder(has);
            if (has) {
                await checkSyncStatus();
            }
        } catch (err) {
            console.error('Error checking folder status:', err);
        }
    };

    const checkSyncStatus = async () => {
        try {
            const notesData = await loadNotesFromDisk();
            const plannerData = await loadPlannerFromDisk();

            setSyncStatus({
                notes: {
                    count: notesData?.notes?.length || 0,
                    hasData: !!notesData
                },
                planner: {
                    count: plannerData?.tasks?.length || 0,
                    hasData: !!plannerData
                }
            });
        } catch (err) {
            console.error('Error checking sync status:', err);
        }
    };

    const handleFolderLink = async () => {
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            await linkLocalFolder();
            setHasFolder(true);
            await checkSyncStatus();
            setSuccess('Folder successfully linked! Your notes and planner will sync to this location.');
        } catch (err: any) {
            console.error('Error linking folder:', err);

            if (err.message.includes('File System Access API not supported')) {
                setError('This feature is only supported in Chrome/Edge 86+ and Safari 15.4+. Please update your browser.');
            } else if (err.message.includes('permission')) {
                setError('Permission was denied. Please try again and grant the requested permissions.');
            } else {
                setError(`Failed to link folder: ${err.message}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearFolder = () => {
        // This would require additional logic in localFileStore.ts
        // For now, we'll just show a message
        setError('To change folder, please link a new folder above.');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        تنظیمات
                    </h1>
                </div>

                {/* Main Settings Container */}
                <div className="space-y-6">
                    {/* Folder Settings Card */}
                    <div className="bg-grey-100 dark:bg-gray-800 rounded-xl p-6">
                        <div className="flex justify-center items-center mb-6">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-700 dark:text-white">
                                    محل نگهداری نوت ها و پلنر
                                </h2>
                            </div>
                        </div>

                        {hasFolder && syncStatus && (
                            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                <div className="flex items-center mb-3">
                                    <Check className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                                    <span className="font-medium text-green-800 dark:text-green-300">
                                        پوشه متصل شده است
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    <div className="flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                                        <Upload className="w-5 h-5 text-gray-400 mr-3" />
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">یادداشت‌ها</p>
                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                {syncStatus.notes.count} یادداشت ذخیره شده
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                                        <Download className="w-5 h-5 text-gray-400 mr-3" />
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">برنامه‌ریزی</p>
                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                {syncStatus.planner.count} کار ذخیره شده
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                <div className="flex items-center">
                                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                                    <span className="text-red-800 dark:text-red-300">{error}</span>
                                </div>
                            </div>
                        )}

                        {success && (
                            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                <div className="flex items-center">
                                    <Check className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                                    <span className="text-green-800 dark:text-green-300">{success}</span>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={handleFolderLink}
                                disabled={isLoading}
                                className={`flex-1 flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-colors
                  ${isLoading
                                        ? 'bg-blue-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                                    } text-white`}
                            >
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                        در حال اتصال...
                                    </>
                                ) : hasFolder ? (
                                    <>
                                        تغییر پوشه ذخیره‌سازی
                                        <FolderOpen className="w-5 h-5 ml-3" />
                                    </>
                                ) : (
                                    <>
                                        انتخاب نشده
                                        <Folder className="w-5 h-5 ml-3" />
                                    </>
                                )}
                            </button>

                            {hasFolder && (
                                <button
                                    onClick={handleClearFolder}
                                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    قطع اتصال پوشه
                                </button>
                            )}
                        </div>


                    </div>

                    <div className="">
                        <ThemeToggle />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;