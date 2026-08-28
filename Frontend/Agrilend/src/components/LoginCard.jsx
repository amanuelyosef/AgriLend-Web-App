import React from 'react';
import LoginForm from './LoginForm.jsx';
import Footer from './Footer.jsx';

// Destructure the onLoginSuccess function passed down from App.jsx
export default function LoginCard({ onLoginSuccess }) {
  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl p-7 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
      <div>
        <h2 className="text-lg font-bold text-gray-900 tracking-tight">Portal Access</h2>
        <p className="text-[11px] text-gray-400 mt-0.5 mb-6">
          Sign in to manage farmer applications and risk profiles.
        </p>
        
        {/* Pass the function forward down to your form component */}
        <LoginForm onLoginSuccess={onLoginSuccess} />
      </div>

      <div className="mt-6">
        <div className="border-t border-gray-100 pt-5 text-center text-[11px] text-gray-500">
          New officer?{' '}
          <button type="button" className="font-semibold text-gray-700 hover:underline">
            Contact Agri-Lend Admin to register
          </button>
        </div>
        <Footer />
      </div>
    </div>
  );
}