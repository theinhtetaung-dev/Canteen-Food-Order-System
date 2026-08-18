import { Link } from 'react-router-dom';
import { ArrowRight, Utensils, Clock, Truck } from 'lucide-react';

const Home = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-orange-50 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-orange-50 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Delicious food delivered</span>{' '}
                  <span className="block text-orange-600 xl:inline">to your desk</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Order your favorite meals from the canteen without the wait. Fresh, hot, and ready when you are.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link
                      to="/menu"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 md:py-4 md:text-lg md:px-10 transition-colors"
                    >
                      View Menu
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <img
            className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
            alt="Delicious food spread"
          />
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-orange-600 font-semibold tracking-wide uppercase">Why choose us</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              A better way to order lunch
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center p-6 bg-gray-50 rounded-lg text-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-orange-100 text-orange-600 mb-4">
                  <Utensils className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Wide Variety</h3>
                <p className="mt-2 text-base text-gray-500">
                  From healthy salads to hearty meals, we have something for everyone.
                </p>
              </div>

              <div className="flex flex-col items-center p-6 bg-gray-50 rounded-lg text-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-orange-100 text-orange-600 mb-4">
                  <Clock className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Save Time</h3>
                <p className="mt-2 text-base text-gray-500">
                  Skip the line. Order ahead and pick up your food when it's ready.
                </p>
              </div>

              <div className="flex flex-col items-center p-6 bg-gray-50 rounded-lg text-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-orange-100 text-orange-600 mb-4">
                  <Truck className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Office Delivery</h3>
                <p className="mt-2 text-base text-gray-500">
                  We'll deliver right to your desk or a designated pickup point.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
