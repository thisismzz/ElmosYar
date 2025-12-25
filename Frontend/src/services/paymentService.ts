import { TransactionCard } from "../components/Transaction/TransactionCard"
import api from "./authService"

export const getWalletData = async () => {
	const response = await api.get('/wallet/mywallet')
	if (!response.data.error) {
		return response.data.data
	} else {
		console.log(response.data.message)
	}
}

export const withdrawFromWallet = async (amount: number) => {
	const response = await api.post('/wallet/withdraw/', {
		amount: amount
	})

	if (!response.data.error) {
		return response.data.data
	} else {
		console.log(response.data.message)
	}
}

export const depositToWallet = async (amount: number) => {
	const response = await api.post('/wallet/deposit/', {
		amount: amount
	})

	if (!response.data.error) {
		return response.data.data
	} else {
		console.log(response.data.message)
	}
}


interface TransactionCardDetails{
	title: string,
	amount: number, 
	from: string,
	to: string, 
	type: string,
}

interface BackendTransaction{
	amount: number,
	status: string,
	type: string,
	from: string,
	to: string,
}


export const getUserTransactions = async (): Promise<TransactionCardDetails[]> => {
	const response = await api.get(`/wallet/transactions/`);
	console.log(response.data.message)

	const backend_transactions: BackendTransaction[] = response.data.data
	var result: TransactionCardDetails[] = []
	for (const t of backend_transactions){
		result.push({
			title: "",
			amount: t.amount,
			from: t.from,
			to: t.to,
			type: t.type,
		})
	}

	return result
}

export const walletPurchase = async (postId: string) => {
	const response = await api.post(`/wallet/purchase/${postId}/`);

	//TODO: change so it returns the message and things
	console.log(response.data.message)
	return {
		successful: !response.data.error,
		message: response.data.message
	}
}