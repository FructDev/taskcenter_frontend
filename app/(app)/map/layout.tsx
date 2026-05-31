// Layout específico para el mapa — saca el contenido del scroll/padding del layout principal
export default function MapLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {children}
    </div>
  );
}
