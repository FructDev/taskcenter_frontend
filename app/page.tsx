// app/page.tsx
import { LoginForm } from "@/components/auth/LoginForm";

export default function RootPage() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-900 dark:to-slate-800">
      <LoginForm />
    </main>
  );
}
