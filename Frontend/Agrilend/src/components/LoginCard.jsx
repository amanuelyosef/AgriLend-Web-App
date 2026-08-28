import React, { useState } from 'react';
import LoginForm from './LoginForm.jsx';
import ForgotPassword from './ForgotPassword.jsx';
import FirstTimePasswordReset from './FirstTimePasswordReset.jsx';
import Footer from './Footer.jsx';

export default function LoginCard({ onLoginSuccess }) {
  const [viewMode, setViewMode] = useState('login'); // 'login' | 'forgot' | 'firstTimeReset'
  const [resetUser, setResetUser] = useState(null);
  const [tempPassUsed, setTempPassUsed] = useState("");

  const handleRequirePasswordReset = (user, tempPass) => {
    setResetUser(user);
    setTempPassUsed(tempPass);
    setViewMode('firstTimeReset');
  };

  return (
    <div className="w-full bg-white border border-gray-200/80 rounded-2xl p-8 lg:p-9 shadow-[0_8px_30px_rgba(0,0,0,0.04)] font-sans antialiased">
      {viewMode === 'login' && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Portal Access</h2>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#1A532E] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
              SECURE PORTAL
            </span>
          </div>
          <p className="text-xs text-gray-500 font-normal leading-relaxed mb-6">
            Sign in to manage farmer applications and risk profiles.
          </p>

          <LoginForm
            onLoginSuccess={onLoginSuccess}
            onForgotPasswordClick={() => setViewMode('forgot')}
            onRequirePasswordReset={handleRequirePasswordReset}
          />
        </div>
      )}

      {viewMode === 'forgot' && (
        <ForgotPassword
          onBackToLogin={() => setViewMode('login')}
          onResetSuccess={onLoginSuccess}
        />
      )}

      {viewMode === 'firstTimeReset' && (
        <FirstTimePasswordReset
          user={resetUser}
          tempPassword={tempPassUsed}
          onCompletePasswordReset={(updatedUser) => {
            if (onLoginSuccess) {
              onLoginSuccess(updatedUser);
            }
          }}
          onBackToLogin={() => setViewMode('login')}
        />
      )}

      <div className="mt-7">
        <div className="border-t border-gray-100 pt-5 text-center text-xs text-gray-500 font-normal">
          <span className="text-gray-400">Institutional Access & Identity Management — accounts are provisioned by the AgriLend platform admin.</span>
        </div>
        <Footer />
      </div>
    </div>
  );
}