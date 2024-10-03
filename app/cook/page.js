'use client'

import React, { useState, useEffect, useRef } from "react";
import { db } from "@/firebase";
import { collection, onSnapshot, query, orderBy, updateDoc, doc } from 'firebase/firestore';
import Sidebar from "./_components/Sidebar";

export default function Cook() {
  const [orders, setOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const audioRef = useRef(null);
  const prevOrdersLengthRef = useRef(0);

  useEffect(() => {
    audioRef.current = new Audio('/sounds/success.mp3');
    audioRef.current.load();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newOrders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const activeOrders = newOrders.filter(order => order.status !== 'completed');
      const completedOrders = newOrders.filter(order => order.status === 'completed');

      if (isAudioEnabled && activeOrders.length > prevOrdersLengthRef.current) {
        playNewOrderSound();
      }

      setOrders(activeOrders);
      setCompletedOrders(completedOrders);
      prevOrdersLengthRef.current = activeOrders.length;
    });

    return () => unsubscribe();
  }, [isAudioEnabled]);

  const playNewOrderSound = () => {
    if (audioRef.current && isAudioEnabled) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(error => console.error("Error playing audio:", error));
      
      setTimeout(() => {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }, 3000);
    }
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus
      });
    } catch (error) {
      console.error("Error updating order status: ", error);
    }
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 p-4 md:ml-64">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white md:ml-20">Pedidos entrantes</h1>
          <button
            onClick={toggleAudio}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600"
            aria-label={isAudioEnabled ? "Disable audio notifications" : "Enable audio notifications"}
          >
            {isAudioEnabled ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            )}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className={`${order.status === 'En progreso' ? 'bg-yellow-500' : 'bg-blue-600'} text-white p-4`}>
                <h2 className="text-xl font-semibold">Orden #{order.id.slice(-4)}</h2>
                <p className="text-sm">Modo: {order.status}</p>
                <h3>Cliente: {order.customerName}</h3>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2 text-blue-900">Articulos:</h3>
                <ul className="space-y-4">
                  {order.items.map((item, index) => (
                    <li key={index} className="border-b pb-2 text-blue-950">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{item.product}</span>
                        <span>Cantidad: {item.quantity}</span>
                      </div>
                      {item.customization && (
                        <p className="text-sm text-gray-900 mt-1">
                          Personalizacion: {item.customization}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={() => updateOrderStatus(order.id, 'En progreso')}
                    className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50"
                    aria-label={`Empieza a preparar orden ${order.id.slice(-4)}`}
                  >
                    Empieza a preparar
                  </button>
                  <button
                    onClick={() => updateOrderStatus(order.id, 'completed')}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                    aria-label={`Marcar orden ${order.id.slice(-4)} como completada`}
                  >
                    Marcar como completado
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}