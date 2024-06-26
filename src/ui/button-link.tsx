import { Button } from "./button";

export const ButtonLink = ({ children, className, ...rest }: any) => {
  return (
    <Button
      {...rest}
      className={`hover:bg-transparent text-left text-md p-0 m-0 leading-normal h-auto cursor-pointer underline border-0 bg-transparent inline text-black font-normal dark:text-white ${className}`}
    >
      {children}
    </Button>
  );
};
