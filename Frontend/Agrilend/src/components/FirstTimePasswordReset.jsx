import React, { useState } from "react";
import { Lock, KeyRound, ArrowRight, ShieldAlert, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { resetUserPassword } from "../services/api";

export default function FirstTimePasswordReset({ user, tempPassword, onCompletePasswordReset, onBackToLogin }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!newPassword || newPassword.length < 6) {
      setErrorMsg("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword === tempPassword || newPassword === "bank@123") {
      setErrorMsg("Your new password cannot be the same as your temporary password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please re-enter.");
      return;
    }

    setIsSubmitting(true);

    const email = user?.email;
    const fullName = user?.fullName || user?.full_name || user?.name || (email ? email.split("@")[0] : "Officer");
    const role = user?.role || "bank";

    const activatedUser = {
      ...user,
      email,
      name: fullName,
      fullName: fullName,
      full_name: fullName,
      role: role,
      must_change_password: false
    };

    // Persist active user session
    localStorage.setItem("agrilend_user", JSON.stringify(activatedUser));

    // Persist to backend service if reachable
    try {
      if (email) {
        await resetUserPassword(email, newPassword);
      }
    } catch (err) {
      console.warn("Failed to persist reset password to backend:", err);
    }

    setIsSubmitting(false);
    if (onCompletePasswordReset) {
      onCompletePasswordReset(activatedUser);
    }
  };



  return (
    <div className="font-sans space-y-5">
      {/* Header Badge */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
          FIRST-TIME ACTIVATION
        </span>
        <button
          type="button"
          onClick={onBackToLogin}
          className="text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors"
        >
          Cancel
        </button>
      </div>

      <div>
        <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center mb-3">
          <ShieldAlert size={20} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 tracking-tight">Set Permanent Password</h3>
        <p className="text-xs text-gray-500 font-normal mt-1 leading-relaxed">
          Welcome <span className="font-semibold text-gray-800">{user?.email || "Officer"}</span>. You are logging in with a temporary password. Please set your permanent account password to continue.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Temporary Password Display */}
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 tracking-wide uppercase mb-1">
            CURRENT TEMPORARY PASSWORD
          </label>
          <input
            type="text"
            value={tempPassword || "••••••••"}
            disabled
            className="w-full px-3.5 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-xs font-mono text-gray-500 cursor-not-allowed"
          />
        </div>

        {/* New Password */}
        <div>
          <label htmlFor="new-perm-password" className="block text-[11px] font-semibold text-gray-700 tracking-wide uppercase mb-1.5">
            NEW PERMANENT PASSWORD
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3 text-gray-400" size={16} />
            <input
              id="new-perm-password"
              type={showPassword ? "text" : "password"}
              placeholder="Min. 6 characters"
              className="w-full pl-10 pr-10 py-2.5 bg-[#FAFBF7] border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1A532E]/20 focus:border-[#1A532E] outline-none text-xs font-medium text-gray-900 placeholder:text-gray-400 transition-all"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-700 p-1"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirm-perm-password" className="block text-[11px] font-semibold text-gray-700 tracking-wide uppercase mb-1.5">
            CONFIRM NEW PASSWORD
          </label>
          <div className="relative">
            <KeyRound className="absolute left-3.5 top-3 text-gray-400" size={16} />
            <input
              id="confirm-perm-password"
              type={showPassword ? "text" : "password"}
              placeholder="Re-enter new password"
              className="w-full pl-10 pr-10 py-2.5 bg-[#FAFBF7] border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1A532E]/20 focus:border-[#1A532E] outline-none text-xs font-medium text-gray-900 placeholder:text-gray-400 transition-all"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs font-medium text-red-600 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0"></span>
            {errorMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#1A532E] text-white py-3 rounded-xl font-bold tracking-wide hover:bg-[#144224] active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-xs shadow-md mt-4 cursor-pointer disabled:opacity-70"
        >
          {isSubmitting ? (
            <span>Activating Account...</span>
          ) : (
            <>
              <span>Save Password & Activate Account</span>
              <ArrowRight size={15} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
