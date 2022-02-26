import type { Rule } from 'antd/lib/form';

export interface SessionRegisterData {
  phone: string;
};
export interface Laebl{
  anchor?: string;
  company?: string;
  all?: string;
}
export interface FormRenderInfo {
  name: string;
  required: boolean;
  label: Laebl;
  render: () => JSX.Element;
  rules?: Rule[];
};
