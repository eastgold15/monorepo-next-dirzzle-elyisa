"use client";
import { useEffect, useState } from "react";

const page: React.FC = () => {
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="relative min-h-screen bg-white font-sans text-black selection:bg-black selection:text-white">
      sss{" "}
    </div>
  );
};
export default page;
