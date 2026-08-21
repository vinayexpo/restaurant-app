export function useRazorpay() {
  const openCheckout = ({ rzpOrderId, amountPaise, currency, keyId, prefill, onSuccess, onFailure }) => {
    if (!window.Razorpay) {
      onFailure?.()
      return
    }

    const options = {
      key: keyId,
      amount: amountPaise,
      currency,
      order_id: rzpOrderId,
      name: 'RestaurantApp',
      description: 'Order Payment',
      prefill: {
        name: prefill?.name,
        email: prefill?.email,
        contact: prefill?.phone,
      },
      theme: { color: '#F97316' },
      modal: {
        ondismiss: onFailure,
      },
      handler: (response) => {
        onSuccess(response)
      },
    }

    const rzp = new window.Razorpay(options)
    rzp.open()
  }

  return { openCheckout }
}
