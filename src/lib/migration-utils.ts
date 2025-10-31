import { buttonVariants } from '@/components/ui/button';
import { type VariantProps } from 'class-variance-authority';

type ButtonVariantProps = VariantProps<typeof buttonVariants>;

// Primer React variant -> Shadcn/UI variant mapping
export function mapPrimerVariant(
  primerVariant?: string
): ButtonVariantProps['variant'] {
  switch (primerVariant) {
    case 'primary':
      return 'default';
    case 'secondary':
      return 'secondary';
    case 'danger':
      return 'destructive';
    case 'invisible':
      return 'ghost';
    case 'outline':
      return 'outline';
    default:
      return 'default';
  }
}

// Primer React size -> Shadcn/UI size mapping
export function mapPrimerSize(primerSize?: string): ButtonVariantProps['size'] {
  switch (primerSize) {
    case 'small':
      return 'sm';
    case 'medium':
      return 'default';
    case 'large':
      return 'lg';
    default:
      return 'default';
  }
}

// Migration compatibility interface
export interface MigrationButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'size'>,
    ButtonVariantProps {
  // Primer React compatibility props
  primerVariant?: 'primary' | 'secondary' | 'danger' | 'invisible' | 'outline';
  primerSize?: 'small' | 'medium' | 'large';
}

// Helper to extract Shadcn/UI props from migration props
export function extractShadcnProps(props: MigrationButtonProps) {
  const { primerVariant, primerSize, variant, size, ...rest } = props;

  return {
    variant: variant || mapPrimerVariant(primerVariant),
    size: size || mapPrimerSize(primerSize),
    ...rest,
  };
}
