import type { Rule } from 'antd/lib/form';
import { UserJoinTag } from '.';

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
  label: Laebl;
  render: (user: UserJoinTag | null) => JSX.Element;
  rules?: Rule[];
  initialValue?: (user: UserJoinTag | null) => any;
};
