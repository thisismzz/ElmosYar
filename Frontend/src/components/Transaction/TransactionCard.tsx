import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';

interface Transaction {
  id: string;
  amount: number;
  title: string;
  user: string;
  type: 'payment' | 'recieve';
  date: string;
}

interface TransactionCardProps {
  transaction: Transaction;
}

export function TransactionCard({ transaction }: TransactionCardProps) {
  const isDeposit = transaction.type === 'payment';
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          <div className={`rounded-full p-2.5 ${
            isDeposit ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {isDeposit ? (
              <ArrowDownLeft className="w-5 h-5 text-green-600" />
            ) : (
              <ArrowUpRight className="w-5 h-5 text-red-600" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="flex text-gray-900 mb-1">{transaction.title}</h3>
            <p className="text-gray-600 text-sm mb-1">
              {transaction.user} :{isDeposit ? 'از' : 'به'}
            <p className="text-gray-500 text-sm">
              {formatDate(transaction.date)}
            </p>
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className={`mb-1 ${
            isDeposit ? 'text-green-600' : 'text-red-600'
          }`}>
            {isDeposit ? '+' : '-'}${transaction.amount.toFixed(2)}
          </p>
          <span className={`inline-block px-2.5 py-1 rounded-full text-xs ${
            isDeposit 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {isDeposit ? 'دریافت' : 'واریز'}
          </span>
        </div>
      </div>
    </div>
  );
}
