import React from 'react';
import { cn } from '@/lib/utils';

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {}

const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ className, ...props }, ref) => (
    <form
      ref={ref}
      className={cn("space-y-6", className)}
      {...props}
    />
  )
);
Form.displayName = "Form";

interface FormFieldProps {
  children: React.ReactNode;
  className?: string;
}

const FormField = ({ children, className }: FormFieldProps) => {
  return <div className={cn("space-y-2", className)}>{children}</div>;
};
FormField.displayName = "FormField";

interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

const FormLabel = React.forwardRef<HTMLLabelElement, FormLabelProps>(
  ({ className, children, required, ...props }, ref) => (
    <label
      ref={ref}
      className={cn('block text-sm font-medium text-black', className)}
      style={{ color: 'black !important' }}
      {...props}
    >
      {children}
      {required && <span className="ml-1 text-red-600">*</span>}
    </label>
  )
);
FormLabel.displayName = "FormLabel";

export { Form, FormField, FormLabel }; 