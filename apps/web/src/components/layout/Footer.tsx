import { Facebook, Instagram, Twitter } from "lucide-react";
import type React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="border-gray-200 border-t bg-white pt-20 pb-10">
      <div className="mx-auto max-w-[1400px] px-6">
        {/* Newsletter */}
        <div className="mx-auto mb-20 max-w-xl text-center">
          <h4 className="mb-4 font-serif text-2xl">Join the World of GINA</h4>
          <p className="mb-8 text-gray-500 text-sm">
            Be the first to know about new collections and exclusive events.
          </p>
          <div className="flex border-black border-b pb-2">
            <input
              className="flex-1 bg-transparent text-sm placeholder-gray-400 focus:outline-none"
              placeholder="E-mail Address"
              type="email"
            />
            <button className="font-bold text-xs uppercase tracking-widest hover:text-gray-600">
              Subscribe
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-12 text-center md:grid-cols-4 md:text-left">
          <div>
            <h5 className="mb-6 font-bold text-xs uppercase tracking-widest">
              Customer Care
            </h5>
            <ul className="space-y-3 text-gray-500 text-sm">
              <li>
                <a className="hover:text-black" href="#">
                  Contact Us
                </a>
              </li>
              <li>
                <a className="hover:text-black" href="#">
                  Shipping & Returns
                </a>
              </li>
              <li>
                <a className="hover:text-black" href="#">
                  Size Guide
                </a>
              </li>
              <li>
                <a className="hover:text-black" href="#">
                  My Account
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="mb-6 font-bold text-xs uppercase tracking-widest">
              The Brand
            </h5>
            <ul className="space-y-3 text-gray-500 text-sm">
              <li>
                <a className="hover:text-black" href="#">
                  About GINA
                </a>
              </li>
              <li>
                <a className="hover:text-black" href="#">
                  Couture
                </a>
              </li>
              <li>
                <a className="hover:text-black" href="#">
                  Press
                </a>
              </li>
              <li>
                <a className="hover:text-black" href="#">
                  Careers
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="mb-6 font-bold text-xs uppercase tracking-widest">
              Legal
            </h5>
            <ul className="space-y-3 text-gray-500 text-sm">
              <li>
                <a className="hover:text-black" href="#">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a className="hover:text-black" href="#">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a className="hover:text-black" href="#">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="mb-6 font-bold text-xs uppercase tracking-widest">
              Follow Us
            </h5>
            <div className="flex justify-center space-x-6 text-gray-900 md:justify-start">
              <a className="hover:text-gray-500" href="#">
                <Instagram className="h-5 w-5" />
              </a>
              <a className="hover:text-gray-500" href="#">
                <Facebook className="h-5 w-5" />
              </a>
              <a className="hover:text-gray-500" href="#">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-20 flex flex-col items-center justify-between border-gray-100 border-t pt-8 text-center text-gray-400 text-xs uppercase tracking-wider md:flex-row">
          <p>&copy; {new Date().getFullYear()} GINA Shoes Ltd.</p>
          <div className="mt-4 flex space-x-4 md:mt-0">
            <span>United Kingdom (£)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
