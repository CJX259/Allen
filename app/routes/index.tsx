import {
  LoaderFunction, redirect,
} from 'remix';

export const loader: LoaderFunction = async ({ request }) => {
  // index不能设置子路由，所以引流到home
  return redirect('/home');
};


export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);
  return (
    <div>
      <h1>500</h1>
      <h2>服务器出错</h2>
      <h3>{error.message}</h3>
    </div>
  );
};
