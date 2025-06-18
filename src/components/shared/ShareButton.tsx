"use client";

import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShareButtonProps {
  url?: string;
  title?: string;
}

export default function ShareButton({ url, title }: ShareButtonProps) {
  const { toast } = useToast();

  const handleShare = async () => {
    const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
    const shareTitle = title || "Confira este projeto";

    try {
      if (navigator.share) {
        // Use native share API if available
        await navigator.share({
          title: shareTitle,
          url: shareUrl,
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link copiado!",
          description: "O link do projeto foi copiado para a área de transferência.",
        });
      }
    } catch (error) {
      console.error("Erro ao compartilhar:", error);
      toast({
        title: "Erro ao compartilhar",
        description: "Não foi possível compartilhar o projeto.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button variant="outline" size="lg" className="w-full" onClick={handleShare}>
      <Share2 className="mr-2 h-4 w-4" /> Compartilhar Projeto
    </Button>
  );
}
