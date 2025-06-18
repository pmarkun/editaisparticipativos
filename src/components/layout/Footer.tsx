export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="border-t border-border/40 bg-background/95">
      <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
        <p>&copy; {currentYear} Edital Participativo. Todos os direitos reservados.</p>
        <p className="mt-1">Uma plataforma para engajamento cívico.</p>
      </div>
    </footer>
  );
}
