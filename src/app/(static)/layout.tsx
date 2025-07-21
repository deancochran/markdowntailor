import AppFooter from "@/components/AppFooter";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-full w-full items-center justify-between">
      <div className="max-w-2xl w-full p-4">{children}</div>

      <AppFooter />
    </div>
  );
}
