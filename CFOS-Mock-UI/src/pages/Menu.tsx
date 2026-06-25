import { useState, useEffect } from 'react';
import { axiosPrivate } from '../api/axios';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import { Search, ShoppingCart } from 'lucide-react';

interface FoodCategory {
  id: number;
  name: string;
  description: string;
}

interface Food {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
  categoryName: string;
  categoryId: number;
}

const Menu = () => {
  const [foods, setFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<FoodCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const { addToCart } = useCart();

  useEffect(() => {
    fetchCategories();
    fetchFoods();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axiosPrivate.get('/food-categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories', error);
      toast.error('Failed to load categories');
    }
  };

  const fetchFoods = async (categoryId?: number | null) => {
    setIsLoading(true);
    try {
      let url = '/foods';
      if (categoryId) {
        url = `/foods/category/${categoryId}`;
      } else if (searchQuery) {
        url = `/foods/search?keyword=${searchQuery}`;
      }
      
      const response = await axiosPrivate.get(url);
      setFoods(response.data);
    } catch (error) {
      console.error('Failed to fetch foods', error);
      toast.error('Failed to load menu items');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery) {
        fetchFoods();
      } else {
        fetchFoods(activeCategory);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, activeCategory]);

  const handleCategoryClick = (categoryId: number | null) => {
    setActiveCategory(categoryId);
    setSearchQuery('');
    fetchFoods(categoryId);
  };

  const handleAddToCart = (food: Food) => {
    addToCart({
      foodId: food.id,
      name: food.name,
      price: food.price,
      quantity: 1,
      imageUrl: food.imageUrl
    });
    toast.success(`Added ${food.name} to cart`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Our Menu</h1>
          <p className="mt-2 text-sm text-gray-500">Discover delicious meals for your day</p>
        </div>
        
        <div className="mt-4 md:mt-0 relative max-w-md w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
            placeholder="Search for food..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Categories Horizontal Scroll */}
      <div className="mb-8 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex space-x-2 min-w-max">
          <button
            onClick={() => handleCategoryClick(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === null
                ? 'bg-orange-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            All Items
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === category.id
                  ? 'bg-orange-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Food Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      ) : foods.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg border border-gray-200 border-dashed">
          <p className="text-gray-500 text-lg">No food items found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {foods.map((food) => (
            <div key={food.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
              <div className="h-48 bg-gray-200 relative">
                {food.imageUrl ? (
                  <img
                    src={`http://localhost:8081${food.imageUrl}`}
                    alt={food.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-orange-100 text-orange-300">
                    <UtensilsIcon />
                  </div>
                )}
                {!food.isAvailable && (
                  <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                    Sold Out
                  </div>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{food.name}</h3>
                  <span className="text-lg font-extrabold text-orange-600">${food.price.toFixed(2)}</span>
                </div>
                <p className="text-xs text-orange-600 font-medium mb-2">{food.categoryName}</p>
                <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">{food.description}</p>
                
                <button
                  onClick={() => handleAddToCart(food)}
                  disabled={!food.isAvailable}
                  className={`w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    food.isAvailable
                      ? 'bg-orange-600 hover:bg-orange-700'
                      : 'bg-gray-400 cursor-not-allowed'
                  } transition-colors`}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const UtensilsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path>
    <path d="M7 2v20"></path>
    <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path>
  </svg>
);

export default Menu;
