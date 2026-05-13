import { ServiceHubTabs } from "@/components/navigation/ServiceHubTabs";

export default function CareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col">
      <ServiceHubTabs />
      <div className="flex-1">{children}</div>
    </div>
  );
}
