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
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [customization, setCustomization] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);
  const [isCustomizing, setIsCustomizing] = useState(false);

  // Function to handle quantity changes and update total price
  const handleQuantityChange = (type, price) => {
    setQuantity((prev) => {
      const newQuantity = type === 'increment' ? prev + 1 : prev > 1 ? prev - 1 : prev;
      setTotalPrice(newQuantity * price);
      return newQuantity;
    });
  };

  // Function to send order to Firebase
  const sendOrder = async (product) => {
    try {
      await addDoc(collection(db, 'orders'), {
        product: product.name,
        customization,
        quantity,
        totalPrice,
        status: 'pending',
        createdAt: new Date(),
      });
      setQuantity(1);
      setCustomization('');
      setTotalPrice(0);
      setIsCustomizing(false);
      alert('Order sent!');
    } catch (e) {
      console.error('Error adding document: ', e);
      alert('An error occurred, please try again later.');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Take Order</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {products.map((product) => (
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
                onClick={() => handleQuantityChange('decrement', product.price)}
                className="px-3 py-1 bg-red-500 text-white rounded"
              >
                -
              </button>
              <span>{quantity}</span>
              <button
                onClick={() => handleQuantityChange('increment', product.price)}
                className="px-3 py-1 bg-green-500 text-white rounded"
              >
                +
              </button>
            </div>

            {/* Show Total Price */}
            <p className="text-lg">Total: ${(quantity * product.price).toFixed(2)}</p>

            {/* Customize Button */}
            <button
              onClick={() => {
                setSelectedProduct(product);
                setIsCustomizing(true);
                setTotalPrice(product.price * quantity); // Set the initial total price
              }}
              className="w-full bg-blue-500 text-white py-2 mt-2 rounded"
            >
              Customize
            </button>

            {/* If customizing, show the customization text area */}
            {isCustomizing && selectedProduct?.id === product.id && (
              <div className="mt-4">
                <textarea
                  className="w-full p-2 border rounded text-blue-700"
                  placeholder="Enter customization..."
                  value={customization}
                  onChange={(e) => setCustomization(e.target.value)}
                />
                <button
                  onClick={() => sendOrder(product)}
                  className="w-full bg-yellow-500 text-white py-2 mt-2 rounded"
                >
                  Send Order
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
