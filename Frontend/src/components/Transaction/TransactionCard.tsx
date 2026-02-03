import { ArrowDownLeft, ArrowUpRight, Wallet, CreditCard } from 'lucide-react';

interface TransactionCardProps {
    transaction: {
        amount: number;
        title: string;
        from: string;
        to: string;
        type: string;
        registered_in: string;
        status: string;
    };
}

export function TransactionCard({ transaction }: TransactionCardProps) {
    const isPositive = transaction.type === "deposit";
    const isPayment = transaction.type === "payment";

    // Format the date in Persian
    const formatPersianDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fa-IR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Get type display text in Persian
    const getTypeText = () => {
        switch (transaction.type) {
            case "deposit": return "واریز";
            case "withdraw": return "برداشت";
            case "payment": return "پرداخت";
            default: return transaction.type;
        }
    };

    // Get status color
    const getStatusColor = () => {
        switch (transaction.status?.toLowerCase()) {
            case "success": return "text-green-600 dark:text-green-400";
            case "failed": return "text-red-600 dark:text-red-400";
            case "pending": return "text-yellow-600 dark:text-yellow-400";
            default: return "text-gray-600 dark:text-gray-400";
        }
    };

    console.log("trans", transaction);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md dark:hover:shadow-gray-900/30 transition-all duration-300">
            <div className="flex flex-col space-y-4">
                {/* Top row: Amount and Type */}
                <div className="flex items-center justify-between flex-row-reverse">
                    <div className="flex items-center flex-row-reverse gap-3">
                        <div className={`rounded-full p-2 ${isPositive
                                ? 'bg-green-100 dark:bg-green-900/30'
                                : 'bg-red-100 dark:bg-red-900/30'
                            }`}>
                            {isPayment ? (
                                <CreditCard className={`w-5 h-5 ${isPositive
                                        ? 'text-green-600 dark:text-green-400'
                                        : 'text-red-600 dark:text-red-400'
                                    }`} />
                            ) : isPositive ? (
                                <ArrowDownLeft className="w-5 h-5 text-green-600 dark:text-green-400" />
                            ) : (
                                <ArrowUpRight className="w-5 h-5 text-red-600 dark:text-red-400" />
                            )}
                        </div>
                        <div>
                            <span className={`text-lg font-semibold ${isPositive
                                    ? 'text-green-700 dark:text-green-300'
                                    : 'text-red-700 dark:text-red-300'
                                }`}>
                                {isPositive ? '+' : '-'}{transaction.amount.toLocaleString('fa-IR')}
                            </span>
                            <div className="mt-1">
                                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                    {getTypeText()}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="text-right">
                        <span className={`text-sm font-medium ${getStatusColor()}`}>
                            {transaction.status || "نامشخص"}
                        </span>
                    </div>
                </div>

                {/* Center: Date */}
                <div className="text-center">
                    <div className="inline-block px-4 py-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                        <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                            {formatPersianDate(transaction.registered_in)}
                        </span>
                    </div>
                </div>

                {/* Bottom: User information */}
                {/* <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-100 dark:border-gray-700">
          <div className="flex-1 text-right">
            {transaction.from && (
              <div className="mb-2">
                <span className="text-gray-500 dark:text-gray-400">از: </span>
                <span className="text-gray-800 dark:text-gray-200 font-medium">
                  {transaction.from}
                </span>
              </div>
            )}
            {transaction.to && (
              <div>
                <span className="text-gray-500 dark:text-gray-400">به: </span>
                <span className="text-gray-800 dark:text-gray-200 font-medium">
                  {transaction.to}
                </span>
              </div>
            )}
          </div>
          
          {transaction.title && (
            <div className="flex-1 text-left pr-4">
              <span className="text-gray-700 dark:text-gray-300">
                {transaction.title}
              </span>
            </div>
          )}
        </div> */}
            </div>
        </div>
    );
}

// Export interface for backward compatibility
export interface Transaction {
    id: string;
    amount: number;
    title: string;
    user: string;
    type: 'withdraw' | 'deposit' | 'payment';
    date: string;
}