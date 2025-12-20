import { ArrowRight, X } from "lucide-react";
import type React from "react";
import { useState } from "react";

interface SubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SubscribeModal: React.FC<SubscribeModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => {
        onClose();
        setSubscribed(false);
        setEmail("");
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg animate-fade-in-up bg-white p-12 text-center shadow-2xl">
        <button
          className="absolute top-4 right-4 text-gray-400 transition-colors hover:text-black"
          onClick={onClose}
          type="button"
        >
          <X className="h-5 w-5" />
        </button>

        {subscribed ? (
          <div className="py-10">
            <h3 className="mb-4 font-serif text-3xl text-black italic">
              Welcome to GINA
            </h3>
            <p className="text-gray-500 text-sm">
              Thank you for subscribing to our world.
            </p>
          </div>
        ) : (
          <>
            <h2 className="mb-4 font-serif text-3xl text-black italic md:text-4xl">
              The World of GINA
            </h2>
            <p className="mb-8 font-light text-gray-500 text-sm leading-relaxed">
              Subscribe to receive updates on new arrivals, exclusive events and
              behind the scenes access.
            </p>

            <form className="w-full" onSubmit={handleSubmit}>
              <div className="relative border-black border-b">
                <input
                  className="w-full bg-white py-3 text-center text-black text-sm placeholder-gray-400 focus:outline-none"
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  type="email"
                  value={email}
                />
                <button
                  className="absolute top-1/2 right-0 -translate-y-1/2 text-black hover:opacity-70"
                  type="submit"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-6 text-[10px] text-gray-400">
                By signing up, you agree to our Privacy Policy.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default SubscribeModal;
