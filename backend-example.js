// Backend API Example (Node.js/Express)
// This is a reference implementation showing how the frontend connects to the backend

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Mock database
let products = [
  {
    id: '1',
    name: 'Cryo Recovery Gel',
    price: 149.99,
    originalPrice: 199.99,
    image: '/api/images/robot-toy-premium.jpg',
    category: 'Recovery Products',
    description: 'Advanced cooling gel that provides instant relief for sore muscles and reduces inflammation after intense workouts.',
    features: [
      'Instant cooling sensation',
      'Reduces muscle inflammation',
      'Non-greasy formula',
      'Long-lasting relief (6+ hours)',
      'Athlete-safe ingredients',
      'Easy application and absorption'
    ],
    rating: 5,
    reviews: 127,
    isNew: true,
  },
  {
    id: '2',
    name: 'Thermo Warm-up Balm',
    price: 89.99,
    image: '/api/images/cat-toy-premium.jpg',
    category: 'Warm-up Products',
    description: 'Professional-grade warming balm designed to activate muscles and improve blood circulation before workouts.',
    features: [
      'Deep muscle warming',
      'Improved blood circulation',
      'Prevents muscle strains',
      'Quick absorption',
      'Natural menthol formula',
      'Portable and convenient'
    ],
    rating: 5,
    reviews: 89,
  },
  // Add more products...
];

let userCarts = new Map(); // In production, use a real database

// Authentication middleware (simplified)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  // In production, verify JWT token with Supabase
  // For demo, we'll extract user info from token
  try {
    // Simple token validation - in production, verify with Supabase
    if (token === 'test-token') {
      req.userId = 'user123';
    } else {
      // Extract user ID from token (this would be the actual user ID from Supabase)
      req.userId = token.split('.')[0] || 'user123';
    }
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Routes

// GET /api/products - Get all products
app.get('/api/products', (req, res) => {
  try {
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
});

// GET /api/products/search - Search products
app.get('/api/products/search', (req, res) => {
  try {
    const query = req.query.q?.toLowerCase();
    if (!query) {
      return res.json(products);
    }

    const filteredProducts = products.filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      product.description?.toLowerCase().includes(query)
    );

    res.json(filteredProducts);
  } catch (error) {
    res.status(500).json({ message: 'Error searching products', error: error.message });
  }
});

// GET /api/products/:id - Get product by ID
app.get('/api/products/:id', (req, res) => {
  try {
    const product = products.find(p => p.id === req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
});

// GET /api/cart - Get user's cart
app.get('/api/cart', authenticateToken, (req, res) => {
  try {
    const userCart = userCarts.get(req.userId) || { items: [] };
    res.json(userCart);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cart', error: error.message });
  }
});

// POST /api/cart/sync - Sync cart with backend
app.post('/api/cart/sync', authenticateToken, (req, res) => {
  try {
    const { items } = req.body;
    userCarts.set(req.userId, { items: items || [] });
    res.json({ message: 'Cart synced successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error syncing cart', error: error.message });
  }
});

// POST /api/cart/add - Add item to cart
app.post('/api/cart/add', authenticateToken, (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userCart = userCarts.get(req.userId) || { items: [] };
    
    const existingItem = userCart.items.find(item => item.productId === productId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      userCart.items.push({ productId, quantity });
    }
    
    userCarts.set(req.userId, userCart);
    res.json({ message: 'Item added to cart', cart: userCart });
  } catch (error) {
    res.status(500).json({ message: 'Error adding to cart', error: error.message });
  }
});

// PUT /api/cart/update - Update cart item quantity
app.put('/api/cart/update', authenticateToken, (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userCart = userCarts.get(req.userId) || { items: [] };
    
    const item = userCart.items.find(item => item.productId === productId);
    if (item) {
      if (quantity <= 0) {
        userCart.items = userCart.items.filter(item => item.productId !== productId);
      } else {
        item.quantity = quantity;
      }
    }
    
    userCarts.set(req.userId, userCart);
    res.json({ message: 'Cart updated', cart: userCart });
  } catch (error) {
    res.status(500).json({ message: 'Error updating cart', error: error.message });
  }
});

// DELETE /api/cart/remove - Remove item from cart
app.delete('/api/cart/remove', authenticateToken, (req, res) => {
  try {
    const { productId } = req.body;
    const userCart = userCarts.get(req.userId) || { items: [] };
    
    userCart.items = userCart.items.filter(item => item.productId !== productId);
    userCarts.set(req.userId, userCart);
    
    res.json({ message: 'Item removed from cart', cart: userCart });
  } catch (error) {
    res.status(500).json({ message: 'Error removing from cart', error: error.message });
  }
});

// DELETE /api/cart/clear - Clear user's cart
app.delete('/api/cart/clear', authenticateToken, (req, res) => {
  try {
    userCarts.set(req.userId, { items: [] });
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ message: 'Error clearing cart', error: error.message });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(error.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});

export default app; 