import React, { useState } from "react";
import { Mail, Lock, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { loginUser, setStoredTokens } from "../services/api";

export default function LoginForm({ onLoginSuccess, onForgotPasswordClick, onRequirePasswordReset }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    setAuthError("");
    setIsSubmitting(true);

    try {
      // 1. Direct FastAPI Backend Authentication
      const res = await loginUser({ email: normalizedEmail, password });

      if (res.success && res.data) {
        const token = res.data.access_token || res.data.token;
        if (token) {
          setStoredTokens(token, res.data.refresh_token);
        }

        const userObj = res.data.user || {
          email: normalizedEmail,
          role: res.data.role || "bank",
          name: res.data.name || normalizedEmail.split("@")[0],
          fullName: res.data.full_name || res.data.name || normalizedEmail.split("@")[0],
          full_name: res.data.full_name || res.data.name || normalizedEmail.split("@")[0]
        };

        localStorage.setItem("agrilend_user", JSON.stringify(userObj));

        // Check if first-time password reset is required
        if (res.data.user?.must_change_password || password.startsWith("AgriLend#")) {
          setIsSubmitting(false);
          if (onRequirePasswordReset) {
            onRequirePasswordReset(userObj, password);
            return;
          }
        }

        setIsSubmitting(false);
        if (onLoginSuccess) {
          onLoginSuccess(userObj);
        }
        return;
      }
    } catch (err) {
      console.warn("FastAPI backend login attempt error:", err);
    }

    setIsSubmitting(false);
    setAuthError("Authentication failed. Invalid email or password.");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 font-sans">
      <div>
        <label htmlFor="email" className="block text-[11px] font-semibold text-gray-700 tracking-wide uppercase mb-1.5">
          OFFICER EMAIL
        </label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-3 text-gray-400" size={16} />
          <input
            id="email"
            type="email"
            placeholder="name@agrilend.com"
            className="w-full pl-10 pr-4 py-2.5 bg-[#FAFBF7] border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1A532E]/20 focus:border-[#1A532E] outline-none text-xs font-medium text-gray-900 placeholder:text-gray-400 placeholder:font-normal transition-all"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label htmlFor="password" className="block text-[11px] font-semibold text-gray-700 tracking-wide uppercase">
            PASSWORD
          </label>
          <button
            type="button"
            onClick={onForgotPasswordClick}
            className="text-xs font-semibold text-[#1A532E] hover:underline transition-colors cursor-pointer"
          >
            Forgot?
          </button>
        </div>
        <div className="relative">
          <Lock className="absolute left-3.5 top-3 text-gray-400" size={16} />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className="w-full pl-10 pr-10 py-2.5 bg-[#FAFBF7] border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1A532E]/20 focus:border-[#1A532E] outline-none text-xs font-medium text-gray-900 placeholder:text-gray-400 placeholder:font-normal transition-all"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isSubmitting}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-700 p-1 transition-colors"
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>

      {authError ? (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs font-medium text-red-600 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0"></span>
          {authError}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[#1A532E] text-white py-3 rounded-xl font-bold tracking-wide hover:bg-[#144224] active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-xs shadow-md mt-6 cursor-pointer disabled:opacity-60"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="animate-spin" size={15} />
            <span>Authenticating...</span>
          </>
        ) : (
          <>
            <span>Secure Sign In</span>
            <ArrowRight size={15} />
          </>
        )}
      </button>
    </form>
  );
}
