import React from "react";
import { useRouter } from "next/router";

const Logo = () => {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/")}
      className="flex items-center cursor-pointer bg-transparent border-none p-0"
    >
      <img
        src="../img/logo.png"
        alt="Logomarca"
        className="h-8 w-auto hover:opacity-80 transition-opacity"
      />
    </button>
  );
};

export default Logo;
