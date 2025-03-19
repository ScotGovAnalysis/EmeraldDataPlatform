import Dataset from './pages/Dataset';
import Datasets from './pages/Datasets';
import Home from './pages/Home';

const routes = [

  { path: '/datasets', element: <Datasets /> },
  { path: '/dataset/:id', element: <Dataset /> },
  { path: '/home', element: <Home /> },
  { path: '/', element: <Home /> },

];

export default routes;