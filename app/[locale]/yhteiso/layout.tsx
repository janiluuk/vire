import { AboutHubTabs } from "@/components/navigation/AboutHubTabs";

export default function YhteisoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="border-b border-edge bg-raised/80 backdrop-blur-lg">
        <div className="mx-auto max-w-3xl px-4">
          <AboutHubTabs />
        </div>
      </div>
      {children}
    </>
  );
}
