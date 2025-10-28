import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowLeft, 
  CreditCard,
  Truck,
  Shield,
  CheckCircle
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/services/api";
import Layout from "@/components/Layout";
import Footer from "@/components/Footer";
import { CheckoutModal } from "@/components/CheckoutModal";
import { CouponSection } from "@/components/CouponSection";
import Header from "@/components/Header";

const Cart = () => {
  const navigate = useNavigate();
  const { state, removeItem, updateQuantity, clearCart } = useCart();
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = () => {
    setShowCheckoutModal(true);
  };

  const handleOrderSuccess = (orderId: string) => {
    navigate(`/orders/${orderId}`);
  };

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        
        <div className="container mx-auto px-4 py-12 sm:py-20">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-6 sm:mb-8">
              <ShoppingCart className="h-16 w-16 sm:h-24 sm:w-24 text-muted-foreground mx-auto mb-4 sm:mb-6" />
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 sm:mb-4">Your Cart is Empty</h1>
              <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 px-4">
                Looks like you haven't added any products to your cart yet. 
                Start shopping to find amazing sports health products!
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
              <Button 
                onClick={() => navigate('/shop')}
                className="w-full sm:w-auto bg-gradient-primary hover:opacity-90 text-primary-foreground px-6 sm:px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105"
              >
                Start Shopping
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => navigate('/')}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 rounded-lg"
              >
                Continue Browsing
              </Button>
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-0 mb-6 sm:mb-8">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="mr-3 sm:mr-4"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <h1 className="text-xl sm:text-3xl font-bold text-foreground">Shopping Cart</h1>
          </div>
          <Badge className="self-start sm:self-auto sm:ml-4 bg-primary text-primary-foreground">
            {state.itemCount} {state.itemCount === 1 ? 'item' : 'items'}
          </Badge>
        </div>

        {/* Mobile Order Summary - Show at top on mobile */}
        <div className="block lg:hidden mb-6">
          <GlassCard className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4 sm:mb-6">Order Summary</h2>
            
            {/* Summary Details */}
            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
              <div className="flex justify-between">
                <span className="text-sm sm:text-base text-muted-foreground">Subtotal ({state.itemCount} items)</span>
                <span className="text-sm sm:text-base text-foreground">{formatPrice(state.total)}</span>
              </div>
              
              {/* Coupon Section */}
              <CouponSection />
              
              {/* Coupon Discount Display */}
              {state.couponApplied && (
                <div className="flex justify-between text-green-600">
                  <span className="text-sm sm:text-base">Coupon ({state.couponApplied.code})</span>
                  <span className="text-sm sm:text-base">-₹{state.couponApplied.discountAmount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-sm sm:text-base text-muted-foreground">Shipping</span>
                <span className="text-sm sm:text-base text-green-600 dark:text-green-400">Free</span>
              </div>
              
              <div className="border-t border-border pt-3 sm:pt-4">
                <div className="flex justify-between">
                  <span className="text-base sm:text-lg font-semibold text-foreground">Total</span>
                  <span className="text-lg sm:text-xl font-bold text-primary">
                    {formatPrice(state.finalTotal)}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Checkout Button */}
            <Button
              onClick={handleCheckout}
              className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105"
            >
              <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Proceed to Checkout
            </Button>
          </GlassCard>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {state.items.map((item) => (
              <GlassCard key={item.product.id} className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Product Image and Details Row */}
                  <div className="flex items-start gap-3 sm:gap-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <img 
                        src={item.product.image} 
                        alt={item.product.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg"
                      />
                    </div>
                    
                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1">
                        {item.product.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                        {item.product.category}
                      </p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                        <span className="text-base sm:text-lg font-bold text-primary">
                          {formatPrice(item.product.price)}
                        </span>
                        {item.product.originalPrice && (
                          <span className="text-xs sm:text-sm text-muted-foreground line-through">
                            {formatPrice(item.product.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Controls Row */}
                  <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4">
                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                        className="h-8 w-8 sm:h-10 sm:w-10"
                      >
                        <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      
                      <span className="w-8 sm:w-12 text-center text-sm sm:text-base font-semibold text-foreground">
                        {item.quantity}
                      </span>
                      
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                        className="h-8 w-8 sm:h-10 sm:w-10"
                      >
                        <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                    
                    {/* Remove Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.product.id)}
                      className="h-8 w-8 sm:h-10 sm:w-10 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </div>
                </div>
                
                {/* Item Total */}
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base text-muted-foreground">Item Total:</span>
                    <span className="text-base sm:text-lg font-bold text-primary">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </GlassCard>
            ))}
            
            {/* Clear Cart Button */}
            <div className="flex justify-center sm:justify-end">
              <Button
                variant="outline"
                onClick={clearCart}
                className="border-destructive text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Cart
              </Button>
            </div>
          </div>

          {/* Desktop Order Summary - Hidden on mobile */}
          <div className="hidden lg:block lg:col-span-1">
            <GlassCard className="p-6 sticky top-24">
              <h2 className="text-xl font-bold text-foreground mb-6">Order Summary</h2>
              
              {/* Summary Details */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal ({state.itemCount} items)</span>
                  <span className="text-foreground">{formatPrice(state.total)}</span>
                </div>
                
                {/* Coupon Section */}
                <CouponSection />
                
                {/* Coupon Discount Display */}
                {state.couponApplied && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon ({state.couponApplied.code})</span>
                    <span>-₹{state.couponApplied.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-green-600 dark:text-green-400">Free</span>
                </div>
                
                <div className="border-t border-border pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-foreground">Total</span>
                    <span className="text-xl font-bold text-primary">
                      {formatPrice(state.finalTotal)}
                    </span>
                  </div>
                  <p className="text-gray-500">*Inclusive of all taxes</p>
                </div>
              </div>
              
              {/* Checkout Button */}
              <Button
                onClick={handleCheckout}
                className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105"
              >
                <CreditCard className="h-5 w-5 mr-2" />
                Proceed to Checkout
              </Button>
              
              {/* Benefits */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Truck className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
                  Free shipping on all orders
                </div>
                {/*                  <div className="flex items-center text-sm text-muted-foreground">
                   <Shield className="h-4 w-4 mr-2 text-primary" />
                   All sales final
                 </div> */}
                <div className="flex items-center text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
                  Secure checkout
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
      
      <Footer />
      
      <CheckoutModal 
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        onSuccess={handleOrderSuccess}
      />
    </Layout>
  );
};

export default Cart; 