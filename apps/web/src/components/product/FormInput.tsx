import { cn } from "@/lib/utils";

// --- 子组件 1：表单输入框封装 (减少重复代码) ---
export const FormInput = ({
  name,
  placeholder,
  value,
  error,
  type = "text",
  onChange,
}: {
  name: string;
  placeholder: string;
  value: string;
  error?: string;
  type?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div className="relative">
    <input
      className={cn(
        "w-full border-b bg-white py-2 text-sm placeholder-gray-400 transition-colors focus:border-black focus:outline-none",
        error ? "border-red-500" : "border-gray-200"
      )}
      name={name}
      onChange={onChange}
      placeholder={placeholder}
      type={type}
      value={value}
    />
    {error && (
      <p className="absolute -bottom-5 left-0 animate-fade-in text-[10px] text-red-500">
        {error}
      </p>
    )}
  </div>
);
