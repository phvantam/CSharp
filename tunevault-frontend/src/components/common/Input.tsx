import { type InputHTMLAttributes, type ReactNode, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-sm font-medium text-[#b3b3b3]">{label}</label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b6b6b]">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            {...props}
            className={[
              'w-full bg-[#242424] text-white rounded-md px-3 py-2.5 text-sm',
              'border border-transparent outline-none transition-colors duration-150',
              'placeholder:text-[#6b6b6b]',
              'focus:border-white focus:bg-[#2a2a2a]',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error ? 'border-[#e91429]' : '',
              icon ? 'pl-9' : '',
              className,
            ].join(' ')}
          />
        </div>
        {error && <p className="text-xs text-[#e91429]">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
