import React from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const StripePaymentForm = ({ amount, onSubmit, loading, darkMode, returnUrl }) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    try {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
      });

      if (error) {
        throw new Error(error.message);
      }

      // Call the onSubmit handler with payment method ID and returnUrl
      await onSubmit(paymentMethod.id);
    } catch (error) {
      console.error('Payment error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto w-full">
      <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} transition-colors duration-200`}>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: darkMode ? '#ffffff' : '#32325d',
                '::placeholder': {
                  color: darkMode ? '#a0aec0' : '#aab7c4',
                },
                fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                lineHeight: '24px',
              },
              invalid: {
                color: '#fa755a',
              },
            },
            hidePostalCode: true, // Better for mobile as it reduces fields
          }}
          className="min-h-[40px] md:min-h-[50px]" // Better visibility on mobile
        />
      </div>
      <button
        type="submit"
        className={`
          w-full py-3 px-4 rounded-lg shadow transition-all duration-200
          ${darkMode ?
            'bg-[#3390d5] hover:bg-blue-700 focus:bg-blue-700' :
            'bg-[#3390d5] hover:bg-blue-700 focus:bg-blue-700'}
          text-white font-medium
           'hover:shadow-lg'}
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
          active:scale-[0.98] // subtle press effect
        `}
      >
        Deposit
    </button>
    </form>
  );
};

export default StripePaymentForm;