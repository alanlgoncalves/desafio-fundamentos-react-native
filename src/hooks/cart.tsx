import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const storagedProducts = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      );

      setProducts(storagedProducts ? JSON.parse(storagedProducts) : []);
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: Product) => {
      const productIndex = products.findIndex(item => item.id === product.id);

      if (productIndex === -1) {
        setProducts([...products, product]);
      } else {
        const incrementProducts = products.map<Product>(item => {
          if (item.id === product.id) {
            item.quantity++;
          }

          return item;
        });

        setProducts(incrementProducts);
      }

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const incrementProducts = products.map<Product>(product => {
        if (product.id === id) {
          product.quantity++;
        }

        return product;
      });

      setProducts(incrementProducts);

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(incrementProducts),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const decrementedProducts = products
        .map<Product>(product => {
          if (product.id === id && product.quantity > 1) {
            product.quantity--;
          }

          return product;
        })
        .filter(product => product.quantity > 0);

      setProducts(decrementedProducts);

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(decrementedProducts),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
