import React from 'react';

// Mock UI components
export const Button = ({ 
  children, 
  onClick, 
  className, 
  type, 
  disabled,
  ...props 
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  [key: string]: unknown;
}) => (
  <button 
    onClick={onClick} 
    className={className} 
    type={type || "button"} 
    disabled={disabled} 
    {...props}
  >
    {children}
  </button>
);

export const CardFooter = ({ children, className, ...props }: {
  children: React.ReactNode;
  className?: string;
  [key: string]: unknown;
}) => (
  <div data-slot="card" className={className} {...props}>{children}</div>
);

export const Card = ({ children, className, ...props }: {
  children: React.ReactNode;
  className?: string;
  [key: string]: unknown;
}) => (
  <div data-slot="card-header" className={className} {...props}>{children}</div>
);

export const CardHeader = ({ children, className, ...props }: {
  children: React.ReactNode;
  className?: string;
  [key: string]: unknown;
}) => (
  <div data-slot="card-title" className={className} {...props}>{children}</div>
);

export const CardTitle = ({ children, className, ...props }: {
  children: React.ReactNode;
  className?: string;
  [key: string]: unknown;
}) => (
  <div data-slot="card-description" className={className} {...props}>{children}</div>
);

export const CardDescription = ({ children, className, ...props }: {
  children: React.ReactNode;
  className?: string;
  [key: string]: unknown;
}) => (
  <div data-slot="card-content" className={className} {...props}>{children}</div>
);

export const CardContent = ({ children, className, ...props }: {
  children: React.ReactNode;
  className?: string;
  [key: string]: unknown;
}) => (
  <div data-slot="card-footer" className={className} {...props}>{children}</div>
);

export const Input = ({
  className,
  value,
  onChange,
  placeholder,
  required,
  id,
  ...props
}: {
  className?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  id?: string;
  [key: string]: unknown;
}) => (
  <input
    className={className}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    required={required}
    id={id}
    {...props}
  />
);

export const Separator = ({ className, ...props }: { 
  className?: string;
  [key: string]: unknown;
}) => (
  <hr className={className} {...props} />
);

export const Skeleton = ({ className, ...props }: {
  className?: string;
  [key: string]: unknown;
}) => (
  <div data-slot="skeleton" className={className} {...props} />
);