import {
  ActionFunction,
  LoaderFunction, redirect,
} from 'remix';

export const loader: LoaderFunction = async ({ request }) => {
  // index不能设置子路由，所以引流到home
  return redirect('/home');
};

export const action: ActionFunction = async ({request}) => {
  return null;
};

export default function IndexPage() {
  return null;
}
