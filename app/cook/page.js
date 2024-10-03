'use client'
import React, { useState, useEffect, useRef } from "react";
import { db } from "@/firebase";
import { collection, onSnapshot, query, orderBy, updateDoc, doc } from 'firebase/firestore';
import Sidebar from "./_components/Sidebar";

export default function Cook() {
  const [orders, setOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const audioRef = useRef(null);
  const prevOrdersLengthRef = useRef(0);

  useEffect(() => {
    audioRef.current = new Audio('/sounds/success.mp3');
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

      // Check if there are new active orders
      if (activeOrders.length > prevOrdersLengthRef.current) {
        playNewOrderSound();
      }

      setOrders(activeOrders);
      setCompletedOrders(completedOrders);
      prevOrdersLengthRef.current = activeOrders.length;
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const playNewOrderSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      
      // Stop the audio after 3 seconds
      setTimeout(() => {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }, 3000);
    }
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
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white md:ml-20">Pedidos entrantes</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className={`${order.status === 'En progreso' ? 'bg-yellow-500' : 'bg-blue-600'} text-white p-4`}>
                <h2 className="text-xl font-semibold">Orden #{order.id.slice(-4)}</h2>
                <p className="text-sm">Modo: {order.status}</p>
                <h1>Cliente: {order.customerName}</h1>
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