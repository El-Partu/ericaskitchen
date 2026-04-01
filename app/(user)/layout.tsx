import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { CartProvider } from "@/lib/cart-context";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </CartProvider>
  );
}
