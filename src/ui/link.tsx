export const Link = (props: any) => {
  return (
    <a {...props} href={props?.href || ""} onClick={props?.onClick}>
      {props?.children}
    </a>
  );
};

export const LinkButton = ({ children, href, className }: any) => {
  return (
    <Link
      href={href}
      target="_blank"
      className={`rounded-md mr-2 p-2 px-3 hidden md:flex ml-auto border-1 bg-transparent text-black text-xl font-normal hover:bg-gray-100 dark:bg-black dark:hover:bg-gray-800 dark:text-white ${
        className ? className : ""
      }`}
    >
      {children}
    </Link>
  );
};
