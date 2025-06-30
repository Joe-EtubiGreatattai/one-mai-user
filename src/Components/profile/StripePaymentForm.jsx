import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';

const StripePaymentForm = ({ amount, onPaymentSuccess, loading, darkMode, returnUrl }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      toast.error('Stripe not loaded. Please try again.');
      return;
    }

    setIsProcessing(true);

    try {
      // First, check if there's already a payment intent
      const { error: submitError } = await elements.submit();
      if (submitError) {
        toast.error(submitError.message || 'Payment submission failed');
        return;
      }

      // Confirm the payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl,
        },
        redirect: 'if_required'
      });

      if (error) {
        // Check if it's the "already succeeded" error
        if (error.code === 'payment_intent_unexpected_state' && 
            error.payment_intent && 
            error.payment_intent.status === 'succeeded') {
          // Payment actually succeeded, treat as success
          if (onPaymentSuccess) {
            await onPaymentSuccess(error.payment_intent.id);
          }
        } else {
          // Other payment errors
          toast.error(error.message || 'Payment failed');
          console.error('Payment error:', error);
        }
      } else if (paymentIntent) {
        // Payment succeeded normally
        if (paymentIntent.status === 'succeeded') {
          if (onPaymentSuccess) {
            await onPaymentSuccess(paymentIntent.id);
          }
        } else if (paymentIntent.status === 'requires_action') {
          // Handle 3D Secure or other actions
          toast.info('Please complete the authentication to finish your payment.');
        } else if (paymentIntent.status === 'processing') {
          toast.info('Payment is being processed. Please wait...');
          // You might want to poll for status updates here
        } else {
          toast.error('Payment status: ' + paymentIntent.status);
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('An unexpected error occurred during payment.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto w-full">
      <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors duration-200`}>
        <PaymentElement 
          options={{
            layout: 'tabs',
            defaultValues: {
              billingDetails: {
                name: '',
                email: '',
              }
            }
          }}
        />
      </div>
      
      <button
        type="submit"
        disabled={!stripe || !elements || isProcessing || loading}
        className={`
          w-full py-3 px-4 rounded-lg shadow transition-all duration-200
          ${darkMode ?
            'bg-[#3390d5] hover:bg-blue-700 focus:bg-blue-700' :
            'bg-[#3390d5] hover:bg-blue-700 focus:bg-blue-700'}
          text-white font-medium
          disabled:opacity-50 disabled:cursor-not-allowed
          hover:shadow-lg
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
          active:scale-[0.98]
        `}
      >
        {isProcessing || loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Processing...
          </div>
        ) : (
          `Pay €${amount}`
        )}
      </button>
    </form>
  );
};

export default StripePaymentForm;