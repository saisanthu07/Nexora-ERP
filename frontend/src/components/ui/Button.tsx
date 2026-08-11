import { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'brass' | 'felt' | 'danger' | 'ghost';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'sm' | 'md';
}

export function Button({ variant = 'primary', size = 'md', className = '', ...rest }: Props) {
  const cls = `btn btn-${variant} ${size === 'sm' ? 'btn-sm' : ''} ${className}`.trim();
  return <button className={cls} {...rest} />;
}
