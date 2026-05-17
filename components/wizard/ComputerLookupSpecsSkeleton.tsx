"use client";

import { useTranslations } from "next-intl";

const ROW_COUNT = 5;

type Props = {
  className?: string;
};

/**
 * Placeholder spec table while `POST /api/public/computer-lookup` is in flight.
 */
export function ComputerLookupSpecsSkeleton({ className = "" }: Props) {
  const w = useTranslations("palvelu.wizard");

  return (
    <div
      className={`overflow-x-auto rounded-xl border border-edge ${className}`.trim()}
      aria-busy="true"
      aria-live="polite"
      data-testid="computer-lookup-skeleton"
    >
      <p className="sr-only">{w("specsLoading")}</p>
      <table className="w-full min-w-[280px] border-collapse text-left text-sm">
        <tbody>
          {Array.from({ length: ROW_COUNT }, (_, i) => (
            <tr key={i} className="border-b border-edge last:border-0">
              <th scope="row" className="w-[38%] bg-sunken/60 px-4 py-3">
                <div className="sparkki-skeleton h-4 w-[70%] max-w-[8rem] rounded-md" />
              </th>
              <td className="px-4 py-3">
                <div
                  className={`sparkki-skeleton h-4 rounded-md ${
                    i % 2 === 0 ? "w-[85%]" : "w-[60%]"
                  }`}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
