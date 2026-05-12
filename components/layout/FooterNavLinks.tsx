"use client";

import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { dispatchBackgroundNavInteraction } from "@/lib/site/background-nav";

export function PulseLink({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => dispatchBackgroundNavInteraction()}
    >
      {children}
    </Link>
  );
}

const linkClass =
  "min-h-tap rounded-lg px-1 py-2 text-lg font-normal text-fog underline-offset-4 transition-colors duration-150 hover:text-ink hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-g";

export function FooterNavLinks({
  items,
}: {
  items: readonly { href: string; label: string }[];
}) {
  return (
    <>
      {items.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={linkClass}
          onClick={() => dispatchBackgroundNavInteraction()}
        >
          {label}
        </Link>
      ))}
    </>
  );
}
