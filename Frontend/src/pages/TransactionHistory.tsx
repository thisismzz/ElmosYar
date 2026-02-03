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


export default function TransactionHistoryPage() {
	const [transactionHistory, setTransactionHistory] = useState<any[]>([]);

	useEffect(() => {
		const fetchTransactions = async () => {
			setTransactionHistory(await getUserTransactions());
		}

		fetchTransactions();
	}, []);

	return (
		<div className="min-h-screen bg-white dark:bg-gray-900">
			<div className="max-w-4xl mx-auto px-4 py-8">
				<div className="mb-8">
					<h1 className="text-gray-600 dark:text-gray-300 mb-2">
						 تراکنش های اخیر
					</h1>
				</div>

				<div className="space-y-3">
					{transactionHistory.length ? transactionHistory.map((transaction) => (
						<TransactionCard key={transaction.id} transaction={transaction} postId={transaction.postId} />
					)) : <div className="text-neutral-400 dark:text-neutral-500"> .تراکنشی برای شما یافت نشد</div>}
				</div>
			</div>
		</div>
	);
}
