import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type ButtonReturnProps = {
  returnTo: string;
  className?: string;
  text?: string;
};

const ButtonReturn = ({
  returnTo,
  className,
  text = "Início",
}: ButtonReturnProps) => {
  const defaultClasses =
    "inline-flex items-center gap-2 text-sm text-blue-500 hover:text-blue-600 font-medium transition-colors py-2 px-0 no-underline cursor-pointer";
  const finalClasses = className ? className : defaultClasses;

  return (
    <Link href={returnTo}>
      <span className={finalClasses}>
        <ArrowLeft className="w-4 h-4" />
        {text}
      </span>
    </Link>
  );
};

export default ButtonReturn;
