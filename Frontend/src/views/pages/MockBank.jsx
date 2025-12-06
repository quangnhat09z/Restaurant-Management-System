import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

const MockBank = () => {
  const { transactionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [processing, setProcessing] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 minutes

  const { orderId, amount } = location.state || {};

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleCancel();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleConfirm = async () => {
    setProcessing(true);

    try {
      // Call Ambassador callback
      const response = await fetch('http://localhost:3000/api/payments/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: transactionId,
          status: 'completed'
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Success - redirect to orders
        navigate('/orders', {
          state: { 
            message: 'Payment completed successfully!',
            type: 'success'
          }
        });
      } else {
        alert('Payment processing failed');
        setProcessing(false);
      }
    } catch (err) {
      alert('Payment processing error');
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    try {
      await fetch('http://localhost:3000/api/payments/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: transactionId,
          status: 'cancelled'
        }),
      });

      navigate('/orders', {
        state: { 
          message: 'Payment cancelled',
          type: 'warning'
        }
      });
    } catch (err) {
      navigate('/orders');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold">VNBank</h1>
            <div className="text-xs bg-blue-700 px-3 py-1 rounded">DEMO</div>
          </div>
          <p className="text-blue-100 text-sm">Secure Online Payment</p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Countdown Timer */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6 flex items-center">
            <span className="text-yellow-600 text-xl mr-3">⏱️</span>
            <div>
              <p className="text-sm text-yellow-800 font-semibold">Session expires in</p>
              <p className="text-2xl font-bold text-yellow-600">{formatTime(countdown)}</p>
            </div>
          </div>

          {/* Transaction Info */}
          <div className="space-y-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Transaction ID</p>
              <p className="font-mono font-semibold text-sm">{transactionId}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Merchant</p>
              <p className="font-semibold">MyApp Restaurant</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Order ID</p>
              <p className="font-semibold">#{orderId}</p>
            </div>

            <div className="bg-blue-50 border-2 border-blue-500 rounded-lg p-4">
              <p className="text-sm text-blue-600 mb-1">Payment Amount</p>
              <p className="text-3xl font-bold text-blue-600">{amount?.toLocaleString()}đ</p>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-6">
            <p className="text-xs text-orange-800">
              ⚠️ This is a demo payment page. No real transaction will be processed.
            </p>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleConfirm}
              disabled={processing}
              className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400"
            >
              {processing ? 'Processing...' : '✓ Confirm Payment'}
            </button>
            <button
              onClick={handleCancel}
              disabled={processing}
              className="w-full bg-gray-200 text-gray-700 py-4 rounded-lg font-semibold hover:bg-gray-300 transition disabled:bg-gray-100"
            >
              ✕ Cancel
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-100 p-4 text-center">
          <p className="text-xs text-gray-600">
            🔒 Secured by VNBank SSL 256-bit Encryption
          </p>
        </div>
      </div>
    </div>
  );
};

export default MockBank;