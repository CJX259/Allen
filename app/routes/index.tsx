import {
  LoaderFunction, redirect,
} from 'remix';

export const loader: LoaderFunction = async ({ request }) => {
  // 引流到home
  return redirect('/home');
};

export default function IndexPage() {
  return null;
}
