/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { PrimaryButton } from "../../atoms";
import timestamp from "time-stamp";
import { Clock } from "lucide-react";

type CardProps = {
  large?: boolean;
  image?: string;
  title?: string;
  author?: string | { name?: string; [key: string]: any };
  date?: number;
  hasDate?: boolean;
  children?: React.ReactNode;
  id?: string;
  slug?: string;
  isAdmin?: boolean;
  exclude?: () => void;
  edit?: () => void;
};

const Card = ({
  id,
  slug,
  large,
  hasDate,
  image,
  title,
  author,
  date,
  children,
  isAdmin,
  exclude,
  edit,
}: CardProps) => {
  const router = useRouter();
  const dateTime = new Date((date as any) * 1000);
  const formatedDate = timestamp("DD/MM/YYYY", dateTime);

  const handleReadMore = () => {
    // Prioriza slug, mas mantém compatibilidade com ID
    const route = `/post/${slug || id}`;
    router.push(route);
  };

  const linkHref = `/post/${slug || id}`;

  return large ? (
    <div className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-gray-200 transform hover:-translate-y-1">
      <div className="aspect-video overflow-hidden relative">
        <Link href={linkHref}>
          <div className="relative w-full h-full cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
          </div>
        </Link>
      </div>
      <div className="p-8">
        {hasDate && (
          <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
            <span className="font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              {typeof author === "string"
                ? author
                : author?.name || "Desconhecido"}
            </span>
            <span className="text-gray-300">•</span>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span title={formatedDate} className="text-gray-600">
                {formatedDate}
              </span>
            </div>
          </div>
        )}
        <Link href={linkHref}>
          <h1 className="text-2xl font-bold text-gray-900 mb-4 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300 cursor-pointer">
            {title}
          </h1>
        </Link>
        <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed">
          {children}
        </p>
        <PrimaryButton
          variant="outline"
          size="sm"
          onClick={handleReadMore}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-300"
        >
          LER MAIS
        </PrimaryButton>
      </div>
    </div>
  ) : (
    <div className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-400 border border-gray-100 hover:border-gray-200 transform hover:-translate-y-0.5">
      <div className="aspect-video overflow-hidden relative">
        <Link href={linkHref}>
          <div className="relative w-full h-full cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </Link>
      </div>

      <div className="p-5">
        {hasDate && (
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
            <span className="font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              {typeof author === "string"
                ? author
                : author?.name || "Autor não informado"}
            </span>
            <span className="text-gray-300">•</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-gray-400" />
              <span title={formatedDate} className="text-gray-600">
                {formatedDate}
              </span>
            </div>
          </div>
        )}
        <Link href={linkHref}>
          <h1 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300 cursor-pointer leading-tight">
            {title}
          </h1>
        </Link>
        <p className="text-gray-600 mb-4 line-clamp-2 text-sm leading-relaxed">
          {children}
        </p>

        {!isAdmin && (
          <div className="flex justify-start">
            <PrimaryButton
              variant="outline"
              size="sm"
              onClick={handleReadMore}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 hover:from-blue-600 hover:to-purple-600 shadow-sm hover:shadow-md transition-all duration-300 text-xs px-4 py-2"
            >
              LER MAIS
            </PrimaryButton>
          </div>
        )}

        {isAdmin && (
          <div className="flex gap-2">
            <PrimaryButton
              variant="secondary"
              size="sm"
              onClick={edit}
              className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-0 transition-colors duration-300"
            >
              Editar
            </PrimaryButton>
            <PrimaryButton
              variant="error"
              size="sm"
              onClick={exclude}
              className="bg-red-600 text-white hover:bg-red-700 active:bg-red-800 border-0 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Excluir
            </PrimaryButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default Card;
