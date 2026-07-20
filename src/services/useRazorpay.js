import { createRazorpayOrder, verifyRazorpayPayment } from './api'

export const initiatePayment = async ({ amount, name, description, onSuccess, onFailure }) => {
    try {
        const res = await createRazorpayOrder(amount)
        const { orderId, keyId } = res.data

        const options = {
            key: keyId,
            amount: amount * 100,
            currency: 'INR',
            name: 'Sportify',
            description: description,
            order_id: orderId,
            handler: async function (response) {
                try {
                    const verifyRes = await verifyRazorpayPayment({
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature
                    })
                    if (verifyRes.data.status === 'success') {
                        onSuccess(response)
                    } else {
                        onFailure('Payment verification failed')
                    }
                } catch (err) {
                    onFailure('Payment verification error')
                }
            },
            prefill: {
                name: 'Sportify User',
                email: 'user@sportify.com'
            },
            theme: {
                color: '#ff0033'
            },
            modal: {
                ondismiss: function () {
                    onFailure('Payment cancelled')
                }
            }
        }

        const rzp = new window.Razorpay(options)
        rzp.open()
    } catch (err) {
        onFailure('Failed to initiate payment')
    }
}