'use client';

import { useState } from "react";
import { db } from "@/firebase";
import { collection, addDoc } from 'firebase/firestore';
import Image from "next/image";

import Pizza from '../images/pizza.jpg';

// Initial product data
const products = [
  {
    id: 1,
    name: 'Pizza',
    image: Pizza,
    price: 12.99,
  },
  {
    id: 2,
    name: 'Burger',
    image: '/burger.jpg',
    price: 9.99,
  },
];

export default function Waitress() {
  const [order, setOrder] = useState([]);
  const [customization, setCustomization] = useState({});
  const [isCustomizing, setIsCustomizing] = useState(null);

  // Function to handle quantity changes
  const handleQuantityChange = (productId, type) => {
    setOrder(prevOrder => {
      const existingItem = prevOrder.find(item => item.id === productId);
      if (existingItem) {
        return prevOrder.map(item => 
          item.id === productId 
            ? { ...item, quantity: type === 'increment' ? item.quantity + 1 : Math.max(0, item.quantity - 1) }
            : item
        ).filter(item => item.quantity > 0);
      } else {
        const product = products.find(p => p.id === productId);
        return [...prevOrder, { ...product, quantity: 1 }];
      }
    });
  };

  // Function to handle customization
  const handleCustomization = (productId, value) => {
    setCustomization(prev => ({ ...prev, [productId]: value }));
  };

  // Calculate total price of the order
  const totalPrice = order.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Function to send order to Firebase
  const sendOrder = async () => {
    try {
      await addDoc(collection(db, 'orders'), {
        items: order.map(item => ({
          product: item.name,
          customization: customization[item.id] || '',
          quantity: item.quantity,
          price: item.price * item.quantity,
        })),
        totalPrice,
        status: 'pending',
        createdAt: new Date(),
      });
      setOrder([]);
      setCustomization({});
      setIsCustomizing(null);
      alert('Order sent to the cook!');
    } catch (e) {
      console.error('Error adding document: ', e);
      alert('An error occurred, please try again later.');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Take Order</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {products.map((product) => {
          const orderItem = order.find(item => item.id === product.id);
          const quantity = orderItem ? orderItem.quantity : 0;

          return (
            <div key={product.id} className="card p-4 border rounded-md shadow-md">
              <Image
                src={product.image} 
                alt={product.name} 
                width={400} 
                height={160} 
                className="w-full h-40 object-cover mb-2" 
              />
              <h2 className="text-xl font-semibold">{product.name}</h2>
              <p className="text-lg">Price: ${product.price.toFixed(2)}</p>

              {/* Quantity Control */}
              <div className="flex items-center justify-between my-2">
                <button
                  onClick={() => handleQuantityChange(product.id, 'decrement')}
                  className="px-3 py-1 bg-red-500 text-white rounded"
                >
                  -
                </button>
                <span>{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(product.id, 'increment')}
                  className="px-3 py-1 bg-green-500 text-white rounded"
                >
                  +
                </button>
              </div>

              {/* Show Item Total Price */}
              <p className="text-lg">Total: ${(quantity * product.price).toFixed(2)}</p>

              {/* Customize Button */}
              <button
                onClick={() => setIsCustomizing(isCustomizing === product.id ? null : product.id)}
                className="w-full bg-blue-500 text-white py-2 mt-2 rounded"
              >
                {isCustomizing === product.id ? 'Hide Customization' : 'Customize'}
              </button>

              {/* If customizing, show the customization text area */}
              {isCustomizing === product.id && (
                <div className="mt-4">
                  <textarea
                    className="w-full p-2 border rounded text-blue-700"
                    placeholder="Enter customization..."
                    value={customization[product.id] || ''}
                    onChange={(e) => handleCustomization(product.id, e.target.value)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Order Summary */}
      {order.length > 0 && (
        <div className="mt-8 p-4 border rounded-md shadow-md">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>
          {order.map((item) => (
            <div key={item.id} className="flex justify-between items-center mb-2">
              <span>{item.name} x {item.quantity}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="text-xl font-bold mt-4">
            Total: ${totalPrice.toFixed(2)}
          </div>
          <button
            onClick={sendOrder}
            className="w-full bg-yellow-500 text-white py-2 mt-4 rounded"
          >
            Send Order to Cook
          </button>
        </div>
      )}
    </div>
  );
}