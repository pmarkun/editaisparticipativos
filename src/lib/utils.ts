import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Gera um slug amigável a partir de um título
 * @param title - O título a ser convertido em slug
 * @returns O slug gerado
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    // Remove acentos e caracteres especiais
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Remove caracteres que não são letras, números ou espaços
    .replace(/[^a-z0-9\s-]/g, '')
    // Substitui espaços múltiplos por um só
    .replace(/\s+/g, ' ')
    // Substitui espaços por hífens
    .replace(/\s/g, '-')
    // Remove hífens múltiplos
    .replace(/-+/g, '-')
    // Remove hífens do início e fim
    .replace(/^-|-$/g, '');
}
