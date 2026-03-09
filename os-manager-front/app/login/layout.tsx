export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center fixed inset-0 z-50">
      {children}
    </div>
  );
}