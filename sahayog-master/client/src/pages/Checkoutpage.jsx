import { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, Check, X, Printer, Download, Mail, Clock, AlertCircle, Smartphone, Building2, Wallet, QrCode } from 'lucide-react';

const CheckoutPage = ({ 
  campaignId,
  contributionAmount,
  campaignData,
  onBack 
}) => {
  const [paymentStep, setPaymentStep] = useState('form'); // 'form', 'processing', 'success', 'failed'
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [upiTimer, setUpiTimer] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    billingAddress: '',
    city: '',
    postalCode: '',
    country: 'United States',
    upiId: '',
    bankAccount: '',
    ifscCode: '',
    phoneNumber: ''
  });
  const [invoiceData, setInvoiceData] = useState(null);

  // Mock campaign data if not provided
  const defaultCampaign = {
    id: campaignId || '1',
    title: 'Help Build Clean Water Wells in Rural Communities',
    organizer: 'WaterForAll Foundation',
    category: 'Environment'
  };

  const campaign = campaignData || defaultCampaign;
  const amount = contributionAmount || 100;

  useEffect(() => {
    // Generate invoice data when component mounts
    const invoice = {
      invoiceNumber: `INV-${Date.now()}`,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      transactionId: null,
      paymentStatus: 'pending'
    };
    setInvoiceData(invoice);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    setFormData(prev => ({
      ...prev,
      cardNumber: formatted
    }));
  };

  const calculateFees = () => {
    const processingFee = amount * 0.029 + 0.30; // 2.9% + $0.30
    const platformFee = amount * 0.05; // 5% platform fee
    return {
      processingFee: Math.round(processingFee * 100) / 100,
      platformFee: Math.round(platformFee * 100) / 100,
      total: Math.round((amount + processingFee + platformFee) * 100) / 100
    };
  };

  const fees = calculateFees();

  const handleSubmitPayment = async () => {
    // Basic validation
    if (!formData.email || !formData.firstName || !formData.lastName) {
      alert('Please fill in all required fields');
      return;
    }

    // Payment method specific validation
    if (paymentMethod === 'card' && !formData.cardNumber) {
      alert('Please enter card details');
      return;
    }
    if (paymentMethod === 'upi' && !formData.upiId) {
      alert('Please enter UPI ID');
      return;
    }
    if (paymentMethod === 'netbanking' && !formData.bankAccount) {
      alert('Please enter bank details');
      return;
    }

    setIsProcessing(true);
    setPaymentStep('processing');

    // UPI specific handling
    if (paymentMethod === 'upi') {
      setShowQRCode(true);
      setUpiTimer(300); // 5 minutes
      
      // Start countdown timer
      const timer = setInterval(() => {
        setUpiTimer(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    // Update invoice with transaction ID
    const transactionId = `TXN-${Date.now()}`;
    setInvoiceData(prev => ({
      ...prev,
      transactionId,
      paymentStatus: 'processing'
    }));

    // Simulate payment processing with different timing for different methods
    const processingTime = paymentMethod === 'upi' ? 8000 : paymentMethod === 'wallet' ? 2000 : 3000;
    
    setTimeout(() => {
      // 90% success rate for demo
      const isSuccess = Math.random() > 0.1;
      
      if (isSuccess) {
        setPaymentStep('success');
        setInvoiceData(prev => ({
          ...prev,
          paymentStatus: 'completed',
          paymentMethod: paymentMethod,
          completedAt: new Date().toLocaleString()
        }));
      } else {
        setPaymentStep('failed');
        setInvoiceData(prev => ({
          ...prev,
          paymentStatus: 'failed',
          paymentMethod: paymentMethod,
          failedAt: new Date().toLocaleString()
        }));
      }
      setIsProcessing(false);
      setShowQRCode(false);
    }, processingTime);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // In a real app, this would generate and download a PDF
    alert('Invoice downloaded! (In a real app, this would download a PDF)');
  };

  const handleEmailReceipt = () => {
    alert(`Receipt sent to ${formData.email}! (In a real app, this would send an email)`);
  };

  const handleRetryPayment = () => {
    setPaymentStep('form');
    setIsProcessing(false);
    setShowQRCode(false);
    setUpiTimer(0);
  };

  const generateUPIQR = () => {
    // In real app, this would generate actual UPI QR code
    const upiString = `upi://pay?pa=merchant@paytm&pn=Campaign&am=${fees.total}&cu=INR&tn=Contribution-${invoiceData?.invoiceNumber}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiString)}`;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderPaymentForm = () => (
    <div className="space-y-6">
      {/* Contact Information */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div></div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Method</h3>
        <div className="space-y-4">
          {/* Credit/Debit Card */}
          <div className="flex items-center gap-3">
            <input
              type="radio"
              id="card"
              name="paymentMethod"
              value="card"
              checked={paymentMethod === 'card'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-4 h-4 text-blue-600"
            />
            <label htmlFor="card" className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <CreditCard className="w-4 h-4" />
              Credit/Debit Card
            </label>
          </div>

          {/* UPI */}
          <div className="flex items-center gap-3">
            <input
              type="radio"
              id="upi"
              name="paymentMethod"
              value="upi"
              checked={paymentMethod === 'upi'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-4 h-4 text-blue-600"
            />
            <label htmlFor="upi" className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Smartphone className="w-4 h-4" />
              UPI (GooglePay, PhonePe, Paytm)
            </label>
          </div>

          {/* Net Banking */}
          <div className="flex items-center gap-3">
            <input
              type="radio"
              id="netbanking"
              name="paymentMethod"
              value="netbanking"
              checked={paymentMethod === 'netbanking'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-4 h-4 text-blue-600"
            />
            <label htmlFor="netbanking" className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Building2 className="w-4 h-4" />
              Net Banking
            </label>
          </div>

          {/* Digital Wallet */}
          <div className="flex items-center gap-3">
            <input
              type="radio"
              id="wallet"
              name="paymentMethod"
              value="wallet"
              checked={paymentMethod === 'wallet'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-4 h-4 text-blue-600"
            />
            <label htmlFor="wallet" className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Wallet className="w-4 h-4" />
              Digital Wallet (PayPal, Amazon Pay)
            </label>
          </div>

          {/* Payment Method Forms */}
          {paymentMethod === 'card' && (
            <div className="ml-7 space-y-4 mt-4 p-4 bg-white rounded-lg border">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Card Number *</label>
                <input
                  type="text"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleCardNumberChange}
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date *</label>
                  <input
                    type="text"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    placeholder="MM/YY"
                    maxLength="5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CVV *</label>
                  <input
                    type="text"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleInputChange}
                    placeholder="123"
                    maxLength="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'upi' && (
            <div className="ml-7 space-y-4 mt-4 p-4 bg-white rounded-lg border">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">UPI ID *</label>
                <input
                  type="text"
                  name="upiId"
                  value={formData.upiId}
                  onChange={handleInputChange}
                  placeholder="yourname@paytm / yourname@googlepay"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-blue-800">
                  💡 You can use any UPI app like GooglePay, PhonePe, Paytm, or BHIM UPI to complete the payment
                </p>
              </div>
            </div>
          )}

          {paymentMethod === 'netbanking' && (
            <div className="ml-7 space-y-4 mt-4 p-4 bg-white rounded-lg border">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Your Bank</label>
                <select
                  name="bankAccount"
                  value={formData.bankAccount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Choose your bank</option>
                  <option value="sbi">State Bank of India</option>
                  <option value="hdfc">HDFC Bank</option>
                  <option value="icici">ICICI Bank</option>
                  <option value="axis">Axis Bank</option>
                  <option value="kotak">Kotak Mahindra Bank</option>
                  <option value="pnb">Punjab National Bank</option>
                  <option value="canara">Canara Bank</option>
                  <option value="bob">Bank of Baroda</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg">
                <p className="text-xs text-yellow-800">
                  🔒 You will be redirected to your bank's secure login page to complete the payment
                </p>
              </div>
            </div>
          )}

          {paymentMethod === 'wallet' && (
            <div className="ml-7 space-y-4 mt-4 p-4 bg-white rounded-lg border">
              <div className="grid grid-cols-2 gap-4">
                <button className="p-3 border-2 border-blue-200 rounded-lg hover:border-blue-400 transition-colors">
                  <div className="text-center">
                    <div className="w-8 h-8 bg-blue-600 rounded mx-auto mb-2 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">PP</span>
                    </div>
                    <span className="text-xs font-medium">PayPal</span>
                  </div>
                </button>
                <button className="p-3 border-2 border-orange-200 rounded-lg hover:border-orange-400 transition-colors">
                  <div className="text-center">
                    <div className="w-8 h-8 bg-orange-500 rounded mx-auto mb-2 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">AP</span>
                    </div>
                    <span className="text-xs font-medium">Amazon Pay</span>
                  </div>
                </button>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-xs text-green-800">
                  🚀 Quick and secure payment with your saved wallet information
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={handleSubmitPayment}
        disabled={isProcessing}
        className="w-full bg-green-600 text-white py-4 px-6 rounded-lg font-medium text-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
      >
        {isProcessing ? 'Processing...' : `Complete Payment - ${fees.total}`}
      </button>
    </div>
  );

  const renderProcessingStatus = () => {
    if (paymentMethod === 'upi' && showQRCode) {
      return (
        <div className="text-center py-8">
          <div className="bg-white border-2 border-dashed border-blue-300 rounded-lg p-6 mb-6 max-w-sm mx-auto">
            <QrCode className="w-6 h-6 text-blue-600 mx-auto mb-3" />
            <img 
              src={generateUPIQR()} 
              alt="UPI QR Code" 
              className="w-48 h-48 mx-auto mb-4 border rounded-lg"
            />
            <p className="text-sm text-gray-600 mb-2">Scan QR code with any UPI app</p>
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <Clock className="w-4 h-4" />
              Time remaining: {formatTime(upiTimer)}
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">Complete Payment via UPI</h3>
            <p className="text-gray-600">Scan the QR code above with your UPI app or use UPI ID: <strong>{formData.upiId}</strong></p>
            
            <div className="grid grid-cols-4 gap-2 max-w-xs mx-auto">
              <div className="bg-white p-2 rounded-lg shadow border text-center">
                <div className="w-8 h-8 bg-blue-600 rounded mx-auto mb-1"></div>
                <span className="text-xs">GooglePay</span>
              </div>
              <div className="bg-white p-2 rounded-lg shadow border text-center">
                <div className="w-8 h-8 bg-purple-600 rounded mx-auto mb-1"></div>
                <span className="text-xs">PhonePe</span>
              </div>
              <div className="bg-white p-2 rounded-lg shadow border text-center">
                <div className="w-8 h-8 bg-blue-400 rounded mx-auto mb-1"></div>
                <span className="text-xs">Paytm</span>
              </div>
              <div className="bg-white p-2 rounded-lg shadow border text-center">
                <div className="w-8 h-8 bg-green-600 rounded mx-auto mb-1"></div>
                <span className="text-xs">BHIM</span>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-blue-800">
                💡 <strong>How to pay:</strong><br />
                1. Open any UPI app on your phone<br />
                2. Scan the QR code or enter the UPI ID<br />
                3. Enter the amount: ₹{fees.total}<br />
                4. Complete the payment
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {paymentMethod === 'upi' ? 'Waiting for UPI Payment' :
           paymentMethod === 'netbanking' ? 'Redirecting to Bank' :
           paymentMethod === 'wallet' ? 'Processing Wallet Payment' :
           'Processing Your Payment'}
        </h3>
        <p className="text-gray-600 mb-4">
          {paymentMethod === 'upi' ? 'Complete the payment in your UPI app...' :
           paymentMethod === 'netbanking' ? 'You will be redirected to your bank\'s secure page...' :
           paymentMethod === 'wallet' ? 'Connecting to your wallet...' :
           'Please don\'t close this window. This may take a few moments...'}
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          Transaction ID: {invoiceData?.transactionId}
        </div>
      </div>
    );
  };

  const renderSuccessStatus = () => (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Check className="w-8 h-8 text-green-600" />
      </div>
      <h3 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h3>
      <p className="text-gray-600 mb-6">Thank you for your contribution to "{campaign.title}"</p>
      
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Printer className="w-4 h-4" />
          Print Receipt
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Download PDF
        </button>
        <button
          onClick={handleEmailReceipt}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Mail className="w-4 h-4" />
          Email Receipt
        </button>
      </div>

      {/* Invoice Details */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6 text-left max-w-2xl mx-auto invoice-print">
        <div className="border-b border-gray-200 pb-4 mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-xl font-bold text-gray-800">Payment Receipt</h4>
              <p className="text-sm text-gray-600">Invoice #{invoiceData?.invoiceNumber}</p>
            </div>
            <div className="text-right">
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                PAID
              </div>
              <p className="text-sm text-gray-600 mt-1">{invoiceData?.completedAt}</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <h5 className="font-semibold text-gray-800 mb-2">Donor Information</h5>
            <p className="text-sm text-gray-600">
              {formData.firstName} {formData.lastName}<br />
              {formData.email}<br />
              Payment Method: {paymentMethod === 'card' ? 'Credit/Debit Card' : 
                              paymentMethod === 'upi' ? 'UPI' :
                              paymentMethod === 'netbanking' ? 'Net Banking' : 
                              paymentMethod === 'wallet' ? 'Digital Wallet' : 'Card'}<br />
              {paymentMethod === 'upi' && formData.upiId && `UPI ID: ${formData.upiId}`}<br />
              Transaction ID: {invoiceData?.transactionId}
            </p>
          </div>
          <div>
            <h5 className="font-semibold text-gray-800 mb-2">Campaign Details</h5>
            <p className="text-sm text-gray-600">
              {campaign.title}<br />
              Organized by: {campaign.organizer}<br />
              Category: {campaign.category}
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h5 className="font-semibold text-gray-800 mb-3">Payment Breakdown</h5>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Contribution Amount:</span>
              <span className="text-gray-800">${amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Processing Fee:</span>
              <span className="text-gray-800">${fees.processingFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Platform Fee:</span>
              <span className="text-gray-800">${fees.platformFee.toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold">
              <span className="text-gray-800">Total Paid:</span>
              <span className="text-gray-800">${fees.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-800">
            Your contribution helps make this campaign possible. You will receive email updates on the campaign progress.
            For questions about your donation, please contact support with your transaction ID.
          </p>
        </div>
      </div>
    </div>
  );

  const renderFailedStatus = () => (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <X className="w-8 h-8 text-red-600" />
      </div>
      <h3 className="text-2xl font-bold text-gray-800 mb-2">Payment Failed</h3>
      <p className="text-gray-600 mb-6">We couldn't process your payment. Please try again.</p>
      
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div className="text-left">
            <p className="text-sm font-medium text-red-800">Common reasons for payment failure:</p>
            <ul className="text-xs text-red-700 mt-1 space-y-1">
              {paymentMethod === 'card' && (
                <>
                  <li>• Insufficient funds in account</li>
                  <li>• Incorrect card information</li>
                  <li>• Card expired or blocked</li>
                  <li>• International transaction blocked</li>
                </>
              )}
              {paymentMethod === 'upi' && (
                <>
                  <li>• UPI ID is incorrect or inactive</li>
                  <li>• UPI app transaction limit exceeded</li>
                  <li>• Bank server temporarily down</li>
                  <li>• Transaction timeout</li>
                </>
              )}
              {paymentMethod === 'netbanking' && (
                <>
                  <li>• Incorrect bank login credentials</li>
                  <li>• Bank server maintenance</li>
                  <li>• Account temporarily blocked</li>
                  <li>• Transaction session expired</li>
                </>
              )}
              {paymentMethod === 'wallet' && (
                <>
                  <li>• Insufficient wallet balance</li>
                  <li>• Wallet account verification needed</li>
                  <li>• Transaction limit exceeded</li>
                  <li>• Network connectivity issues</li>
                </>
              )}
              <li>• Network connectivity issues</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleRetryPayment}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
        <div>
          <p className="text-sm text-gray-600">
            Transaction ID: {invoiceData?.transactionId} | Failed at: {invoiceData?.failedAt}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button 
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Contribution
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            {paymentStep === 'success' ? 'Payment Complete' : 'Complete Your Contribution'}
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Summary - Always visible */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Campaign:</span>
                  <span className="text-gray-800 text-right text-xs">{campaign.title.substring(0, 30)}...</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Contribution:</span>
                  <span className="text-gray-800">${amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Processing Fee:</span>
                  <span className="text-gray-800">${fees.processingFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Platform Fee:</span>
                  <span className="text-gray-800">${fees.platformFee.toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between font-semibold text-lg">
                  <span className="text-gray-800">Total:</span>
                  <span className="text-gray-800">${fees.total.toFixed(2)}</span>
                </div>
              </div>

              {invoiceData && (
                <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                  <p>Invoice: {invoiceData.invoiceNumber}</p>
                  <p>Status: <span className={`capitalize ${
                    invoiceData.paymentStatus === 'completed' ? 'text-green-600' : 
                    invoiceData.paymentStatus === 'failed' ? 'text-red-600' : 'text-yellow-600'
                  }`}>{invoiceData.paymentStatus}</span></p>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              {paymentStep === 'form' && renderPaymentForm()}
              {paymentStep === 'processing' && renderProcessingStatus()}
              {paymentStep === 'success' && renderSuccessStatus()}
              {paymentStep === 'failed' && renderFailedStatus()}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .invoice-print, .invoice-print * {
            visibility: visible;
          }
          .invoice-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default CheckoutPage;