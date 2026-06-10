import { Navbar } from "@/components/layout/Navbar";
import { AuthGuard } from "@/components/AuthGuard";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container max-w-3xl mx-auto px-4 py-8">{children}</main>
      </div>
    </AuthGuard>
  );
}
