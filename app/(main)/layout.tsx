import Header from "@/components/Header/Header";
import "@/components/Header/Header.css"; 

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      {/* children ở đây sẽ là các trang bên trong (main) */}
      {children} 
    </>
  );
}