import Link from "next/link";

type ButtonVariant = "primary" | "secondary";

type ButtonProps = {
  children: React.ReactNode;
  variant?: ButtonVariant;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
};

const baseClasses =
  "inline-flex items-center justify-center rounded-md px-6 py-3 text-sm font-bold uppercase tracking-wide transition-colors";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--primary)] text-black hover:bg-[var(--primary-hover)] cursor-pointer",
  secondary:
    "border border-[var(--border)] bg-[var(--surface)] text-[var(--surface-foreground)] hover:bg-[var(--surface-hover)] cursor-pointer",
};

export const getButtonClassName = (variant: ButtonVariant = "primary") =>
  `${baseClasses} ${variantClasses[variant]}`;

const Button = ({
  children,
  variant = "primary",
  href,
  onClick,
  type = "button",
}: ButtonProps) => {
  const className = getButtonClassName(variant);

  if (href) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={className}
    >
      {children}
    </button>
  );
};

export default Button;
