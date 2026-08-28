import React, { useRef } from 'react';

export default function OTPInput({ value = "", onChange }) {
  const inputs = useRef([]);
  const digits = (value || "").padEnd(6, "").split("").slice(0, 6);

  const handleChange = (e, index) => {
    const val = e.target.value;
    const newDigits = [...digits];
    newDigits[index] = val.slice(-1);
    const combined = newDigits.join("");
    if (onChange) onChange(combined);

    if (val && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex gap-1.5 justify-between">
      {[...Array(6)].map((_, i) => (
        <input
          key={i}
          ref={(el) => (inputs.current[i] = el)}
          type="text"
          maxLength={1}
          value={digits[i] || ""}
          className="w-10 h-10 text-center text-sm font-semibold bg-[#F9FAF5] border border-gray-200 rounded-md focus:ring-1 focus:ring-[#1A532E] focus:border-[#1A532E] outline-none transition-all text-gray-800"
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          aria-label={`Digit ${i + 1}`}
        />
      ))}
    </div>
  );
}