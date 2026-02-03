import { useEffect, useState } from "react";
import { TransactionCard } from "../components/Transaction/TransactionCard";

interface TransactionDetail {
  amount: number;
  title: string;
  from: string;
  to: string;
  type: string;
  registered_in: string;
  status: string;
}

export default function TransactionHistoryPage() {
  const [transactions, setTransactions] = useState<TransactionDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const { getUserTransactions } = await import("../services/paymentService");
        const data = await getUserTransactions();
        setTransactions(data);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            تاریخچه تراکنش‌ها
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            تمام تراکنش‌های مالی شما در یک نگاه
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                  </div>
                  <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="h-3 w-48 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-4"></div>
                <div className="flex justify-between">
                  <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Transaction List */
          <div className="space-y-4">
            {transactions.length > 0 ? (
              transactions.map((transaction, index) => (
                <TransactionCard 
                  key={index} 
                  transaction={transaction}
                />
              ))
            ) : (
              /* Empty State */
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <svg 
                    className="w-12 h-12 text-gray-400 dark:text-gray-500" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1.5} 
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                  تراکنشی یافت نشد
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  هنوز هیچ تراکنشی در حساب شما ثبت نشده است.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
