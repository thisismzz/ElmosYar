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

export const getUserTransactions = async () => {
	//TODO
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