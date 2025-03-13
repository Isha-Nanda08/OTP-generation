import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Camera, AlertCircle, Loader, X, Lock } from 'lucide-react';
import { useDoctor } from '../context/DoctorContext';
import Navbar from '../components/NavBar';

function Home() {
  const [showScanner, setShowScanner] = useState(false);
  const [showPinVerification, setShowPinVerification] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scannedQRValue, setScannedQRValue] = useState('');
  const [pin, setPin] = useState(['', '', '', '']);
  const pinInputRefs = [useRef(), useRef(), useRef(), useRef()];
  const { setUserProfile } = useDoctor();

  const handleScan = async (result) => {
    if (!result || result.length === 0) return;
    setScannedQRValue(result[0].rawValue);
    setShowScanner(false);
    setShowPinVerification(true);
    setTimeout(() => pinInputRefs[0].current?.focus(), 100);
  };

  const handlePinChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    if (value && index < 3) pinInputRefs[index + 1].current?.focus();
  };

  const verifyPin = async () => {
    if (pin.join('').length !== 4) {
      setError('Please enter a 4-digit PIN');
      return;
    }
    try {
      setIsLoading(true);
      const res = await axios.post(
        'http://localhost:4000/api/doctor/qr-data',
        { pin: pin.join('') },
        { headers: { Authorization: scannedQRValue } }
      );
      setUserProfile(res.data.data);
      setShowPinVerification(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify PIN');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#e6f7ef]">
      <Navbar />
      <div className="max-w-6xl mx-auto p-6">
        <div className="mt-10 text-center">
          <button
            onClick={() => setShowScanner(true)}
            className="bg-green-500 text-white px-6 py-3 rounded-lg"
          >
            <Camera size={20} /> Scan Patient QR
          </button>
        </div>

        {showScanner && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg">
              <Scanner onScan={handleScan} />
              <button onClick={() => setShowScanner(false)}><X /></button>
            </div>
          </div>
        )}

        {showPinVerification && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg">
              <p>Enter Patient PIN</p>
              <div className="flex space-x-2">
                {pin.map((digit, index) => (
                  <input
                    key={index}
                    ref={pinInputRefs[index]}
                    type="password"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePinChange(index, e.target.value)}
                    className="w-12 h-12 text-center text-xl border"
                  />
                ))}
              </div>
              <button onClick={verifyPin} disabled={isLoading}>
                {isLoading ? <Loader size={16} className="animate-spin" /> : "Verify"}
              </button>
              {error && <p className="text-red-500">{error}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
