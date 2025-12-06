import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const Payment = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/orders/${orderId}`);
      const data = await response.json();
      
      if (data.success) {
        setOrder(data.data);
        if (data.data.OrderStatus !== 'ready') {
          setError('Order is not ready for payment');
        }
      } else {
        setError('Order not found');
      }
    } catch (err) {
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setProcessing(true);
    setError(null);

    try {
      // Call through Gateway → Ambassador → Payment Service
      const response = await fetch('http://localhost:3000/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          OrderID: parseInt(orderId),
          Amount: order.TotalPrice,
          PaymentMethod: 'BANK_TRANSFER'
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to mock bank
        navigate(`/bank/${data.data.TransactionID}`, {
          state: {
            orderId: orderId,
            amount: order.TotalPrice,
            transactionId: data.data.TransactionID
          }
        });
      } else {
        setError(data.error || 'Payment creation failed');
        setProcessing(false);
      }
    } catch (err) {
      setError('Failed to process payment');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">{error}</h2>
          <button onClick={() => navigate('/orders')} className="mt-4 bg-blue-600 text-white px-6 py-2 rounded">
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Payment</h1>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
          <h2 className="text-xl font-semibold mb-4">📋 Order Summary</h2>
          <div className="space-y-3 mb-6">
            <div className="flex justify-between py-2 border-b">
              <span>Order ID:</span>
              <span className="font-semibold">#{order.OrderID}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span>Customer:</span>
              <span className="font-semibold">{order.UserName}</span>
            </div>
          </div>

          <h3 className="font-semibold mb-3">Items:</h3>
          <div className="space-y-2 mb-6">
            {order.Items.map((item, idx) => (
              <div key={idx} className="flex justify-between py-2 bg-gray-50 px-4 rounded">
                <span>{item.ItemName} x{item.Quantity}</span>
                <span className="font-semibold">{(item.Price * item.Quantity).toLocaleString()}đ</span>
              </div>
            ))}
          </div>

          <div className="border-t-2 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold">Total:</span>
              <span className="text-2xl font-bold text-blue-600">{order.TotalPrice.toLocaleString()}đ</span>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
          <h2 className="text-xl font-semibold mb-4">💳 Payment Method</h2>
          <div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-50">
            <div className="flex items-center">
              <div className="text-3xl mr-4">🏦</div>
              <div>
                <h3 className="font-semibold">Bank Transfer</h3>
                <p className="text-sm text-gray-600">Secure payment</p>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button onClick={() => navigate('/orders')} className="flex-1 bg-gray-200 py-4 rounded-lg font-semibold" disabled={processing}>
            Cancel
          </button>
          <button onClick={handlePayment} disabled={processing} className="flex-1 bg-blue-600 text-white py-4 rounded-lg font-semibold disabled:bg-gray-400">
            {processing ? 'Processing...' : 'Proceed to Payment'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Payment;