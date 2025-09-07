import { z } from 'zod';

export const NavigateArgsSchema = z.object({
  url: z.string().url('Invalid URL format'),
});

export const AnalyzePageArgsSchema = z.object({
  includeContent: z.boolean().default(true),
  includeForms: z.boolean().default(true),
  includeLinks: z.boolean().default(true),
  maxDepth: z.number().min(1).max(5).default(2),
});

export const ExtractTextArgsSchema = z.object({
  selector: z.string().optional(),
  includeHidden: z.boolean().default(false),
});

export const GetElementsArgsSchema = z.object({
  selector: z.string(),
  includeAttributes: z.boolean().default(true),
  maxResults: z.number().min(1).max(100).default(20),
});

export interface PageElement {
  tag: string;
  text?: string;
  attributes: Record<string, string>;
  role?: string;
  accessible_name?: string;
}

export interface PageStructure {
  title: string;
  url: string;
  elements: PageElement[];
  forms: Array<{
    action?: string;
    method?: string;
    fields: Array<{
      name: string;
      type: string;
      label?: string;
      required?: boolean;
    }>;
  }>;
  links: Array<{
    text: string;
    href: string;
    target?: string;
  }>;
}

export type NavigateArgs = z.infer<typeof NavigateArgsSchema>;
export type AnalyzePageArgs = z.infer<typeof AnalyzePageArgsSchema>;
export type ExtractTextArgs = z.infer<typeof ExtractTextArgsSchema>;
export type GetElementsArgs = z.infer<typeof GetElementsArgsSchema>;