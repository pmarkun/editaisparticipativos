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

/**
 * Valida CPF verificando os dígitos verificadores.
 * Aceita formato XXX.XXX.XXX-XX ou apenas números.
 */
export function validateCPF(cpf: string): boolean {
  const digits = cpf.replace(/[^0-9]/g, "");
  if (digits.length !== 11 || /(\d)\1{10}/.test(digits)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits.charAt(i)) * (10 - i);
  let firstCheck = (sum * 10) % 11;
  if (firstCheck === 10) firstCheck = 0;
  if (firstCheck !== parseInt(digits.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits.charAt(i)) * (11 - i);
  let secondCheck = (sum * 10) % 11;
  if (secondCheck === 10) secondCheck = 0;

  return secondCheck === parseInt(digits.charAt(10));
}
