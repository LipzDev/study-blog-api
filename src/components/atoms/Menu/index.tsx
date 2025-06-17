import React, { useContext } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { UserContext } from "../../../context/user";
import { useAdmin } from "../../../hooks/useAdmin";

type MenuProps = {
  expanded?: boolean;
};

const Menu = ({ expanded }: MenuProps) => {
  const route = useRouter();
  const { signed, logout } = useContext(UserContext);
  const { isAdmin } = useAdmin();

  return (
    <nav
      className={`${
        expanded
          ? "flex flex-col absolute top-full left-0 w-full bg-white shadow-lg border-t md:relative md:top-auto md:left-auto md:w-auto md:bg-transparent md:shadow-none md:border-none"
          : "hidden md:flex"
      } md:flex-row md:items-center`}
    >
      <ul className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 p-4 md:p-0 list-none">
        <li>
          <Link href="/">
            <span className="text-gray-700 hover:text-blue-600 font-medium transition-colors no-underline cursor-pointer">
              Início
            </span>
          </Link>
        </li>
        <li>
          <Link href="/blog">
            <span className="text-gray-700 hover:text-blue-600 font-medium transition-colors no-underline cursor-pointer">
              Blog
            </span>
          </Link>
        </li>

        {!signed && (
          <li>
            <Link href="/login">
              <span className="text-gray-700 hover:text-blue-600 font-medium transition-colors no-underline cursor-pointer">
                Login
              </span>
            </Link>
          </li>
        )}

        {signed && (
          <li className="relative group">
            <div className="flex flex-col md:flex-row gap-2 md:gap-4">
              {/* Botão Gerenciar - apenas para admins e super admins */}
              {isAdmin && (
                <button
                  onClick={() => route.push("/admin")}
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors bg-transparent border-none cursor-pointer"
                >
                  Gerenciar
                </button>
              )}
              <button
                onClick={() => logout()}
                className="text-gray-700 hover:text-red-600 font-medium transition-colors bg-transparent border-none cursor-pointer"
              >
                Sair
              </button>
            </div>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Menu;
