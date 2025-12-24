import { Check } from "lucide-react";

export function SuccessView() {
  return (
    <div className="zoom-in animate-in py-12 text-center duration-300">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-black text-white">
        <Check className="h-8 w-8" />
      </div>
      <h4 className="mb-2 font-serif text-2xl italic">Inquiry Sent!</h4>
      <p className="text-gray-500 text-sm">We will get back to you shortly.</p>
    </div>
  );
}
