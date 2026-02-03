import { TransactionCard } from "../components/Transaction/TransactionCard"
import api from "./authService"

export const getWalletData = async () => {
  const response = await api.get('/wallet/mywallet');
  if (!response.data.error) return response.data.data;
  throw new Error(response.data.message || "خطا در دریافت اطلاعات کیف پول");
};

export const withdrawFromWallet = async (amount: number) => {
  const response = await api.post('/wallet/withdraw/', { amount });
  if (!response.data.error) return response.data.data;
  throw new Error(response.data.message || "برداشت ناموفق بود");
};

export const depositToWallet = async (amount: number) => {
  const response = await api.post('/wallet/deposit/', { amount });
  if (!response.data.error) return response.data.data;
  throw new Error(response.data.message || "واریز ناموفق بود");
};



interface TransactionCardDetails {
	title: string,
	amount: number,
	from: string,
	to: string,
	type: string,
    registered_in: string,
    status: string,
}

interface BackendTransaction {
	amount: number,
	status: string,
	type: string,
	from_user: string,
	to_user: string,
	registered_in: string,
}


export const getUserTransactions = async (): Promise<TransactionCardDetails[]> => {
	const response = await api.get(`/wallet/transactions/`);
	console.log(response.data.message)

	const backend_transactions: BackendTransaction[] = response.data.data
	var result: TransactionCardDetails[] = []
	if (backend_transactions && backend_transactions.length) {
		for (const t of backend_transactions) {
			result.push({
				title: "",
				amount: t.amount,
				from: t.from_user,
				to: t.to_user,
				type: t.type,
                registered_in: t.registered_in,
                status: t.status
			})
		}
	}

	return result
}


export const createPayment = async (postId: number) => {
  const response = await api.post(`/wallet/payment/create/${postId}/`);
  
  if (!response.data.error) {
    return response.data.data;
  }
  throw new Error(response.data.message || "خطا در ایجاد پرداخت");
};

export const verifyPayment = async (authority: string) => {
  const response = await api.post('/wallet/payment/verify/', { authority });
  
  return {
    successful: !response.data.error,
    message: response.data.message
  };
};

export const getSoldPosts = async () => {
    const response = await api.get(`/wallet/sales`);
    return response;
}

export const getPurchasedPosts = async () => {
    const response = await api.get(`/wallet/purchases`);
    return response;
}

export const getUserInfo = async (username: string) => {
    const response = await api.get(`/users/${username}/profile/`);
    return response.data.user;
}