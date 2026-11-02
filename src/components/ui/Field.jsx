import { Children, isValidElement } from 'react';
import { Label as ShadLabel } from './label.jsx';
import { Input as ShadInput } from './input.jsx';
import { Textarea as ShadTextarea } from './textarea.jsx';
import {
  Select as ShadSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select.jsx';

export function Label({ children, htmlFor, className = '' }) {
  return (
    <ShadLabel htmlFor={htmlFor} className={`mb-1.5 ${className}`}>
      {children}
    </ShadLabel>
  );
}

export function Input({ className = '', ...props }) {
  return <ShadInput className={`h-10 ${className}`} {...props} />;
}

export function Textarea({ className = '', rows = 3, ...props }) {
  return <ShadTextarea rows={rows} className={className} {...props} />;
}

// Keeps the plain <option>-children API the rest of the app already uses,
// backed by the shadcn/Radix Select underneath.
export function Select({ id, value, onChange, children, className = '', disabled, placeholder = 'Select…' }) {
  const options = Children.toArray(children).filter(isValidElement);
  return (
    <ShadSelect
      value={value != null ? String(value) : undefined}
      onValueChange={(next) => onChange?.({ target: { value: next } })}
      disabled={disabled}
    >
      <SelectTrigger id={id} className={`h-10 w-full ${className}`}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.props.value} value={String(opt.props.value)}>
            {opt.props.children}
          </SelectItem>
        ))}
      </SelectContent>
    </ShadSelect>
  );
}

export function FieldGroup({ label, children, htmlFor, hint }) {
  return (
    <div>
      {label && <Label htmlFor={htmlFor}>{label}</Label>}
      {children}
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
