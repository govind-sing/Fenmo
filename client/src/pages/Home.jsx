import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Welcome to Fenmo App</h1>
      <div className="space-x-4">
        <Link 
          to="/auth?mode=login" 
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Login
        </Link>
        <Link 
          to="/auth?mode=signup" 
          className="px-6 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition"
        >
          Sign Up
        </Link>
      </div>
    </div>
  );
};

export default Home;