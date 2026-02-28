import Link from "next/link";

type LogoSize = "sm" | "md" | "lg";

const sizeClasses: Record<LogoSize, { text: string; emoji: string }> = {
  sm: { text: "text-xl", emoji: "text-lg" },
  md: { text: "text-2xl", emoji: "text-xl" },
  lg: { text: "text-3xl", emoji: "text-2xl" },
};

interface LogoProps {
  size?: LogoSize;
  asLink?: boolean;
  className?: string;
}

export function Logo({
  size = "lg",
  asLink = false,
  className = "",
}: LogoProps) {
  const { text, emoji } = sizeClasses[size];

  const content = (
    <span className={`flex items-end gap-0 group ${className}`}>
      <span
        className={`${text} font-bold text-blue-600 dark:text-blue-400 lowercase`}
      >
        peter
      </span>
      <span
        className={`${text} font-medium text-zinc-500 dark:text-zinc-400 lowercase`}
      >
        finder
      </span>
      <span className={`${emoji} ml-1`}>🔍</span>
    </span>
  );

  if (asLink) {
    return (
      <Link
        href="/"
        className="flex items-center text-blue-600 dark:text-blue-400"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className={`flex items-center cursor-default ${className}`}>
      {content}
    </div>
  );
}
