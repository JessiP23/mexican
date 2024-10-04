'use client';

import { useState, useEffect } from "react";
import { db, auth } from "@/firebase";
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import Image from "next/image";
import Notification from "../components/Notification";

import Taco from '../images/taco.jpg';
import Beans from '../images/beans.jpg';
import Bistec from '../images/bistec.jpg';
import Burrito from '../images/burrito.jpg';
import Cemitas from '../images/cemitas.jpg';
import Chilaquiles from '../images/chilaquiles.jpg';
import Enchiladas from '../images/enchiladas.jpg';
import Fajitas from '../images/fajitas.jpg';
import Fries from '../images/fries.jpg';
import Guacamole from '../images/guacamole.jpg';
import Horchata from '../images/horchata.jpg';
import Huevo from '../images/huevo.jpg';
import Jamaica from '../images/jamaica.jpg';
import Pechuga from '../images/pechuga.jpg';
import Quesadilla from '../images/quesadilla.jpg';
import Rice from '../images/rice.jpg';
import Salad from '../images/salad.jpg';
import SodaBottle from '../images/sodabottle.jpg';
import SodaCan from '../images/sodacan.jpg';
import Torta from '../images/torta.jpg';
import Tostadas from '../images/tostadas.jpg';
import Water from '../images/water.jpg';

import Sidebar from "./_components/Sidebar";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";

//customize with product images
// Initial product data
const products = [
  {
    id: 3,
    name: 'Taco',
    image: Taco,
    price: 4.00,
  },
  {
    id: 4,
    name: 'Burritos',
    image: Burrito,
    price: 13.00,
  },
  {
    id: 5,
    name: 'Tortas',
    image: Torta,
    price: 10.00,
  },
  {
    id: 6,
    name: 'Quesadillas',
    image: Quesadilla,
    price: 13.00,
  },
  {
    id: 7,
    name: 'Chilaquiles',
    image: Chilaquiles,
    price: 13.00,
  },
  {
    id: 8,
    name: 'Enchiladas',
    image: Enchiladas,
    price: 15.00,
  },
  {
    id: 9,
    name: 'Fajitas',
    image: Fajitas,
    price: 15.00,
  },
  {
    id: 10,
    name: 'Tostadas',
    image: Tostadas,
    price: 5.00
  },
  {
    id: 11,
    name: 'Cemitas',
    image: Cemitas,
    price: 10.00 
  },
  {
    id: 12,
    name: 'Pechuga a la plancha',
    image: Pechuga,
    price: 15.00
  },
  {
    id: 13,
    name: 'Bistec Encebollado',
    image: Bistec,
    price: 15.00
  },
  {
    id: 14,
    name: 'Huevo a la mexicana',
    image: Huevo,
    price: 13.00
  },
  {
    id: 15,
    name: 'Arroz',
    image: Rice,
    price: 5.00
  },
  {
    id: 16,
    name: 'Frijoles',
    image: Beans,
    price: 5.00
  },
  {
    id: 17,
    name: 'Papas',
    image: Fries,
    price: 5.00
  },
  {
    id: 18,
    name: 'Ensalada',
    image: Salad,
    price: 5.00
  },
  {
    id: 19,
    name: 'Guacamole',
    image: Guacamole,
    price: 5.00
  },
  {
    id: 20,
    name: 'Horchata',
    image: Horchata,
    price: 5.00
  },
  {
    id: 21,
    name: 'Jamaica',
    image: Jamaica,
    price: 5.00
  },
  {
    id: 22,
    name: 'Agua',
    image: Water,
    price: 2.00
  },
  {
    id: 23,
    name: 'Refresco en lata',
    image: SodaCan,
    price: 2.00
  },
  {
    id: 24,
    name: 'Refresco en botella',
    image: SodaBottle,
    price: 3.00
  }

];


export default function Waitress() {
  const [order, setOrder] = useState([]);
  const [customization, setCustomization] = useState({});
  const [isCustomizing, setIsCustomizing] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [orderType, setOrderType] = useState(''); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        router.push('/');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

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

  const handleCustomization = (productId, value) => {
    setCustomization(prev => ({ ...prev, [productId]: value }));
  };

  const calculateTotalPrice = () => {
    return order.reduce((sum, item) => {
      const product = products.find(p => p.id === item.id);
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  const totalPrice = calculateTotalPrice();

  const sendOrder = async () => {
    if (!customerName.trim()) {
      alert('Please enter customer name');
      return;
    }
    if (!orderType) {
      alert('Please select order type (For Here or For Delivery)');
      return;
    }
    try {
      await addDoc(collection(db, 'orders'), {
        items: order.map(item => {
          const product = products.find(p => p.id === item.id);
          return {
            product: item.name,
            customization: customization[item.id] || '',
            quantity: item.quantity,
            price: product ? product.price * item.quantity : 0,
          };
        }),
        customerName: customerName.trim(),
        totalPrice,
        status: 'pending',
        orderType, // Add order type to Firebase collection
        createdAt: serverTimestamp(),
      });
      // Reset states after successful order
      setOrder([]);
      setCustomization({});
      setIsCustomizing(null);
      setCustomerName('');
      setOrderType('');
      setShowNotification(true);
    } catch (e) {
      console.error('Error adding document: ', e);
      alert('An error occurred, please try again later.');
    }
  };

  return (
    <div className="container mx-auto p-4">
      {/* sidebar */}
      <Sidebar />
      <div className="lg:ml-64">
      <h1 className="text-2xl font-bold mb-4 md: text-center sm:text-center">Tomar orden</h1>

      <div className="grid grid-cols-2 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => {
          const orderItem = order.find(item => item.id === product.id);
          const quantity = orderItem ? orderItem.quantity : 0;

          return (
            <div key={product.id} className="card p-4 border rounded-md shadow-md">
              <div className="w-full h-40">
              <Image
                src={product.image} 
                alt={product.name} 
                width={400} 
                height={160} 
                className="w-full h-full object-cover mb-2" 
              />
              </div>
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
                {isCustomizing === product.id ? 'Esconder personalizacion' : 'Personalizar'}
              </button>

              {/* If customizing, show the customization text area */}
              {isCustomizing === product.id && (
                <div className="mt-4">
                  <textarea
                    className="w-full p-2 border rounded text-blue-700"
                    placeholder="Escribir personalizacion..."
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
          <h2 className="text-xl font-bold mb-4">Resumen de la orden</h2>
          {order.map((item) => (
            <div key={item.id} className="flex justify-between items-center mb-2">
              <span>{item.name} x {item.quantity}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="text-xl font-bold mt-4">
            Total: ${totalPrice.toFixed(2)}
          </div>
          <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300">Nombre del cliente</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full p-2 border rounded text-blue-950"
                placeholder="Enter customer name"
              />
            </div>
            <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 mb-2">Tipo de orden</label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio"
                  name="orderType"
                  value="para-aqui"
                  checked={orderType === 'para-aqui'}
                  onChange={() => setOrderType('para-aqui')}
                />
                <span className="ml-2">Para aquí</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio"
                  name="orderType"
                  value="para-llevar"
                  checked={orderType === 'para-llevar'}
                  onChange={() => setOrderType('para-llevar')}
                />
                <span className="ml-2">Para llevar</span>
              </label>
            </div>
          </div>
            <button
              onClick={sendOrder}
              className="w-full bg-yellow-500 text-white py-2 mt-4 rounded"
            >
              Enviar orden al cocinero
            </button>
          
          </div>
        )}
      </div>
      {showNotification && (
        <Notification
          message="Order sent to the cook successfully!"
          onClose={() => setShowNotification(false)}
        />
      )}
    </div>
  );
}