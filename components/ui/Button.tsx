import Link from "next/link";

type ButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  href?: string;
  newTab?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
};

const Button = ({
  children,
  variant = "primary",
  href,
  newTab,
  onClick,
  type = "button",
}: ButtonProps) => {
  const baseClasses =
    "inline-flex items-center justify-center rounded-md px-6 py-3 text-sm font-bold uppercase tracking-wide transition-colors";

  const variantClasses = {
    primary:
      "bg-[var(--primary)] text-black hover:bg-[var(--primary-hover)] cursor-pointer",
    secondary:
      "border border-[var(--border)] bg-[var(--surface)] text-[var(--surface-foreground)] hover:bg-[var(--surface-hover)] cursor-pointer",
  };

  if (href) {
    return (
      <Link
        href={href}
        target={newTab ? "_blank" : undefined}
        className={`${baseClasses} ${variantClasses[variant]}`}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]}`}
    >
      {children}
    </button>
  );
};

export default Button;
