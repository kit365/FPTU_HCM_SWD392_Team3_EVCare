export interface FormField {
    name: string;
    label: string;
    placeholder?: string;
    type?: string;
    component: "input" | "select";
    fullWidth?: string;
    options?: { label: string; value: string }[];
}