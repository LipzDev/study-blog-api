import React from "react";

/**
 * ESTE COMPONENTE É UM VALIDADOR PARA RESOLUÇÕES, SEMELHANTE AS MEDIA QUERYS
 * LESSTHAN = MENOR QUE (SE MENOR QUE X, ENTÃO O QUE ESTIVER DENTRO DA DIV MOSTRA)
 * GREATERTHAN = MAIOR QUE (SE MAIOR QUE X, ENTÃO O QUE ESTIVER DENTRO DA DIV MOSTRA)
 */

type breakpoint = "small" | "medium" | "large" | "huge";

export type MediaMatchProps = {
  lessThan?: breakpoint;
  greaterThan?: breakpoint;
  children: React.ReactNode;
  className?: string;
};

const MediaMatch: React.FC<MediaMatchProps> = ({
  lessThan,
  greaterThan,
  children,
  className = "",
}) => {
  const getResponsiveClasses = () => {
    let classes = "hidden";

    if (lessThan) {
      switch (lessThan) {
        case "small":
          classes = "block sm:hidden";
          break;
        case "medium":
          classes = "block md:hidden";
          break;
        case "large":
          classes = "block lg:hidden";
          break;
        case "huge":
          classes = "block xl:hidden";
          break;
      }
    }

    if (greaterThan) {
      switch (greaterThan) {
        case "small":
          classes = "hidden sm:block";
          break;
        case "medium":
          classes = "hidden md:block";
          break;
        case "large":
          classes = "hidden lg:block";
          break;
        case "huge":
          classes = "hidden xl:block";
          break;
      }
    }

    return classes;
  };

  return (
    <div className={`${getResponsiveClasses()} ${className}`}>
      {children}
    </div>
  );
};

export default MediaMatch;
