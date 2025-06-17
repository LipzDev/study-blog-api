import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTransition } from "react-spring";
import Toast from "./Toast";
import { ToastMessage } from "../../../hooks/toast";

interface ToastContainerProps {
  messages: ToastMessage[];
}

const ToastContainer: React.FC<ToastContainerProps> = ({ messages }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Criar div específico para o toast se não existir
    let toastRoot = document.getElementById("toast-root");
    if (!toastRoot) {
      toastRoot = document.createElement("div");
      toastRoot.id = "toast-root";
      toastRoot.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        pointer-events: none !important;
        z-index: 999999 !important;
        isolation: isolate !important;
      `;
      document.body.appendChild(toastRoot);
    }

    return () => {
      const toastRoot = document.getElementById("toast-root");
      if (toastRoot && toastRoot.children.length === 0) {
        document.body.removeChild(toastRoot);
      }
    };
  }, []);

  const messagesWithTransition = useTransition(messages, {
    from: { transform: "translateX(100%)", opacity: 0 },
    enter: { transform: "translateX(0%)", opacity: 1 },
    leave: { transform: "translateX(100%)", opacity: 0 },
    config: { tension: 300, friction: 30 },
  });

  if (!mounted) return null;

  const toastRoot = document.getElementById("toast-root");
  if (!toastRoot) return null;

  return createPortal(
    <div
      data-toast-container
      className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
    >
      {messagesWithTransition((styles, item) => (
        <Toast
          key={item.id}
          message={item}
          style={styles as unknown as React.CSSProperties}
        />
      ))}
    </div>,
    toastRoot,
  );
};

export default ToastContainer;
