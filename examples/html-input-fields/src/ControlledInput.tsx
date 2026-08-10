import {
  useRef,
  useState,
  useEffect,
  type ChangeEvent,
  type InputHTMLAttributes,
} from "react";

interface ControlledInputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const ControlledInput = (props: ControlledInputProps) => {
  const { value, onChange, ...rest } = props;
  const [cursor, setCursor] = useState<number | null>(null);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const input = ref.current;
    if (input) input.setSelectionRange(cursor, cursor);
  }, [ref, cursor, value]);
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCursor(e.target.selectionStart);
    onChange && onChange(e);
  };
  return <input ref={ref} value={value} onChange={handleChange} {...rest} />;
};
