
import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email({ message: "Por favor, insira um email válido." }),
  password: z.string().min(1, { message: "Senha é obrigatória." }),
});

export const SignupSchemaPhase1 = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres."),
  email: z.string().email("Email inválido."),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres."),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "As senhas não coincidem.",
  path: ["confirmPassword"],
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email({ message: "Por favor, insira um email válido." }),
});

const EntitySchema = z.object({
  name: z.string().min(2, "Nome da entidade é obrigatório."),
  cnpj: z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, "CNPJ inválido. Use o formato XX.XXX.XXX/XXXX-XX."),
  municipalCode: z.string().optional(),
  address: z.string().min(5, "Endereço da entidade é obrigatório."),
});

export const ProponentProfileSchema = z.object({
  // id: z.string().optional(), // Opcional, usado se você quiser passar o ID do documento para atualização
  sex: z.string().optional(),
  race: z.string().optional(),
  address: z.string().min(5, "Endereço é obrigatório."),
  phone: z.string().min(10, "Telefone inválido.").regex(/^\(?\d{2}\)?[\s-]?\d{4,5}-?\d{4}$/, "Formato de telefone inválido."),
  areaOfExpertise: z.string().min(2, "Área de atuação é obrigatória."),
  entities: z.array(EntitySchema).min(0), // Permite zero entidades
});

export const EditalCreateSchema = z.object({
  name: z.string().min(5, "Nome do edital é obrigatório (mínimo 5 caracteres)."),
  description: z.string().min(20, "Descrição é obrigatória (mínimo 20 caracteres)."),
  detailedDescription: z.string().min(50, "Descrição detalhada é obrigatória (mínimo 50 caracteres)."),
  imageUrl: z.string().url("URL da imagem inválida").optional().or(z.literal("")),
  subscriptionStartDate: z.date({ required_error: "Data de início das inscrições é obrigatória." }),
  subscriptionEndDate: z.date({ required_error: "Data de fim das inscrições é obrigatória." }),
  votingStartDate: z.date({ required_error: "Data de início da votação é obrigatória." }),
  votingEndDate: z.date({ required_error: "Data de fim da votação é obrigatória." }),
}).refine(data => data.subscriptionEndDate > data.subscriptionStartDate, {
  message: "Data de fim das inscrições deve ser posterior à data de início.",
  path: ["subscriptionEndDate"],
}).refine(data => data.votingStartDate >= data.subscriptionEndDate, {
  message: "Data de início da votação deve ser posterior ou igual ao fim das inscrições.",
  path: ["votingStartDate"],
}).refine(data => data.votingEndDate > data.votingStartDate, {
  message: "Data de fim da votação deve ser posterior à data de início da votação.",
  path: ["votingEndDate"],
});

export const ProjectCategoryEnum = z.enum(["Cultura", "Educação", "Esporte", "Meio Ambiente", "Saúde", "Tecnologia", "Outros"]);

export const ProjectSubmitSchema = z.object({
  projectCategory: ProjectCategoryEnum,
  projectName: z.string().min(5, "Nome do projeto é obrigatório."),
  description: z.string().min(20, "Descrição do projeto é obrigatória."),
  location: z.string().min(5, "Localização do projeto é obrigatória."),
  beneficiaries: z.string().min(5, "Público-alvo / Beneficiários são obrigatórios."),
  value: z.preprocess(
    (a) => {
      if (typeof a === 'string') return parseFloat(a);
      if (typeof a === 'number') return a;
      return undefined; // ou lançar um erro/valor padrão
    },
    z.number({invalid_type_error: "Valor solicitado deve ser um número."}).positive("O valor do projeto deve ser positivo.")
  ),
  agreedToTerms: z.boolean().refine(val => val === true, {
    message: "Você deve concordar com os termos."
  }),
});


export const ProjectVoteSchema = z.object({
  fullName: z.string().min(3, "Nome completo é obrigatório."),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF inválido. Use o formato XXX.XXX.XXX-XX."),
  email: z.string().email("Email inválido."),
  phone: z.string().min(10, "Telefone inválido.").regex(/^\(?\d{2}\)?[\s-]?\d{4,5}-?\d{4}$/, "Formato de telefone inválido."),
});

export const ThemeConfigSchema = z.object({
  palette: z.enum(["blue", "green", "wine"]),
  heroTitle: z.string().min(3, "Título é obrigatório."),
  heroSubtitle: z.string().min(3, "Subtítulo é obrigatório."),
  heroImageUrl: z.string().url("URL inválida").optional().or(z.literal("")),
});

export type LoginFormData = z.infer<typeof LoginSchema>;
export type SignupFormDataPhase1 = z.infer<typeof SignupSchemaPhase1>;
export type ForgotPasswordFormData = z.infer<typeof ForgotPasswordSchema>;
export type ProponentProfileFormData = z.infer<typeof ProponentProfileSchema>;
export type EntityFormData = z.infer<typeof EntitySchema>;
export type EditalCreateFormData = z.infer<typeof EditalCreateSchema>;
export type ProjectSubmitFormData = z.infer<typeof ProjectSubmitSchema>;
export type ProjectVoteFormData = z.infer<typeof ProjectVoteSchema>;
export type ThemeConfigData = z.infer<typeof ThemeConfigSchema>;
