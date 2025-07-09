// app/(wallboard)/layout.tsx
// Este layout simple solo renderiza a sus hijos, sin la sidebar ni el header.
export default function WallboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
