import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { axiosPrivate } from '../api/axios';
import toast from 'react-hot-toast';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';

const Cart = () => {
  const { items, updateQuantity, removeFromCart, totalAmount, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to place an order');
      navigate('/login', { state: { from: { pathname: '/cart' } } });
      return;
    }

    if (items.length === 0) return;

    setIsSubmitting(true);
    try {
      const orderItems = items.map(item => ({
        foodId: item.foodId,
        quantity: item.quantity
      }));

      await axiosPrivate.post('/orders', {
        orderItems
      });

      toast.success('Order placed successfully!');
      clearCart();
      navigate('/');
    } catch (error: any) {
      console.error('Checkout failed', error);
      toast.error(error.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-orange-100 text-orange-600 mb-6">
          <ShoppingBag className="h-12 w-12" />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Your cart is empty</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Looks like you haven't added any delicious meals to your cart yet.
        </p>
        <Link to="/menu" className="btn btn-primary px-8 py-3 text-lg">
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Your Cart</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="flex-1">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <ul className="divide-y divide-gray-200">
              {items.map((item) => (
                <li key={item.foodId} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center">
                  <div className="flex-shrink-0 h-24 w-24 bg-gray-200 rounded-md overflow-hidden mb-4 sm:mb-0">
                    {item.imageUrl ? (
                      <img
                        src={`http://localhost:8081${item.imageUrl}`}
                        alt={item.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-orange-100 text-orange-300">
                        <ShoppingBag />
                      </div>
                    )}
                  </div>
                  <div className="sm:ml-6 flex-1 flex flex-col justify-between">
                    <div className="flex justify-between">
                      <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                      <p className="text-lg font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">${item.price.toFixed(2)} each</p>
                    
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center border border-gray-300 rounded-md">
                        <button
                          type="button"
                          className="p-1 text-gray-600 hover:text-gray-900 transition-colors"
                          onClick={() => updateQuantity(item.foodId, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="px-3 py-1 text-gray-900 font-medium w-10 text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          className="p-1 text-gray-600 hover:text-gray-900 transition-colors"
                          onClick={() => updateQuantity(item.foodId, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <button
                        type="button"
                        className="text-red-600 hover:text-red-900 p-2 transition-colors"
                        onClick={() => removeFromCart(item.foodId)}
                        title="Remove item"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-96">
          <div className="bg-white shadow sm:rounded-lg p-6 sticky top-24">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm text-gray-600">
                <p>Subtotal</p>
                <p className="font-medium text-gray-900">${totalAmount.toFixed(2)}</p>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <p>Tax (Estimated)</p>
                <p className="font-medium text-gray-900">${(totalAmount * 0.08).toFixed(2)}</p>
              </div>
              <div className="border-t border-gray-200 pt-4 flex justify-between">
                <p className="text-base font-medium text-gray-900">Order Total</p>
                <p className="text-xl font-bold text-orange-600">${(totalAmount * 1.08).toFixed(2)}</p>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isSubmitting}
              className={`w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors ${
                isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Processing...' : 'Checkout Now'}
              {!isSubmitting && <ArrowRight className="ml-2 h-5 w-5" />}
            </button>
            
            {!isAuthenticated && (
              <p className="mt-4 text-sm text-center text-gray-500">
                You will be asked to log in to complete your order.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
