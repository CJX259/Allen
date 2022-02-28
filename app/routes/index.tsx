import {
  LoaderFunction, redirect,
} from 'remix';

export const loader: LoaderFunction = async ({ request }) => {
  // index不能设置子路由，所以引流到home
  return redirect('/home');
};
