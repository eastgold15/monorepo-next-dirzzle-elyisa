import { Crown, Gem, Scissors } from "lucide-react";
import type React from "react";

const Heritage: React.FC = () => (
  <section className="border-gray-100 border-t bg-gray-50 py-24">
    <div className="mx-auto max-w-4xl px-6 text-center">
      <span className="mb-4 block font-bold text-gray-400 text-xs uppercase tracking-[0.2em]">
        The World of GINA
      </span>
      <h2 className="mb-8 font-serif text-4xl text-black md:text-5xl">
        Handmade in London
      </h2>
      <p className="mb-16 font-light text-gray-600 text-lg leading-relaxed">
        Established in 1954, GINA is the last remaining luxury footwear designer
        making shoes in London today. Celebrated for our exquisite craftsmanship
        and the finest Italian leathers and Swarovski crystals.
      </p>

      <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
        <div className="flex flex-col items-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-gray-200 bg-white">
            <Scissors className="h-6 w-6 text-black" strokeWidth={1} />
          </div>
          <h3 className="mb-2 font-bold text-sm uppercase tracking-widest">
            Master Craftsmanship
          </h3>
        </div>

        <div className="flex flex-col items-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-gray-200 bg-white">
            <Gem className="h-6 w-6 text-black" strokeWidth={1} />
          </div>
          <h3 className="mb-2 font-bold text-sm uppercase tracking-widest">
            Swarovski Crystals
          </h3>
        </div>

        <div className="flex flex-col items-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-gray-200 bg-white">
            <Crown className="h-6 w-6 text-black" strokeWidth={1} />
          </div>
          <h3 className="mb-2 font-bold text-sm uppercase tracking-widest">
            Royal Excellence
          </h3>
        </div>
      </div>
    </div>
  </section>
);

export default Heritage;
