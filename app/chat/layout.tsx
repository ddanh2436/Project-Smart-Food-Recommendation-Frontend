// app/(chat)/layout.tsx
export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Không có Header, không có Footer, không có ChatWidget
    <section className="w-full h-screen bg-gray-900">
      {children}
    </section>
  );
}