import { InfoHubLayout } from "@/components/navigation/InfoHubLayout";

export default function TietoaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[50vh]">
      <InfoHubLayout>{children}</InfoHubLayout>
    </div>
  );
}
