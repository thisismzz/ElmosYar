import { useEffect, useState } from "react";
import { TransactionCard } from "../components/Transaction/TransactionCard";
import { getUserTransactions } from "../services/paymentService";

interface Transaction {
  id: string;
  amount: number;
  title: string;
  user: string;
  type: 'deposit' | 'withdrawal';
  date: string;
}

// const mockTransactions: Transaction[] = [
//   {
//     id: '1',
//     amount: 1250.00,
//     title: '',
//     user: 'Sarah Johnson',
//     type: 'deposit',
//     date: '2025-12-17',
//   },
//   {
//     id: '2',
//     amount: 85.50,
//     title: '',
//     user: 'Local Cafe',
//     type: 'withdrawal',
//     date: '2025-12-16',
//   },
// ];


export default function TransactionHistoryPage() {
	const [transactionHistory, setTransactionHistory] = useState<any[]>([]);
		useEffect(() => {
			const fetchTransactions = async () => {
				setTransactionHistory(await getUserTransactions());
			}

			fetchTransactions();
		}, []);
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-gray-600 mb-2">تراکنش های اخیر</h1>
        </div>

        <div className="space-y-3">
          {transactionHistory.map((transaction) => (
            <TransactionCard key={transaction.id} transaction={transaction} />
          ))}
        </div>
      </div>
    </div>
  );
}
