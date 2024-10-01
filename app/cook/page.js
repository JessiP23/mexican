'use client'

import { useState, useEffect } from "react"
import { db } from "@/firebase"
import { collection, onSnapshot, query, orderBy, updateDoc, doc } from 'firebase/firestore'
import Sidebar from "./_components/Sidebar"

export default function Cook() {
  const [orders, setOrders] = useState([])
  const [completedOrders, setCompletedOrders] = useState([]);


  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newOrders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const activeOrders = newOrders.filter(order => order.status !== 'completed');
      const completedOrders = newOrders.filter(order => order.status === 'completed');

      setOrders(activeOrders);
      setCompletedOrders(completedOrders);
    });
    return () => {
        unsubscribe();
      };
    }, []);

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
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Pedidos entrantes</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-blue-600 text-white p-4">
              <h2 className="text-xl font-semibold">Orden #{order.id.slice(-4)}</h2>
              <p className="text-sm">Modo: {order.status}</p>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2 text-blue-900">Items:</h3>
              <ul className="space-y-4">
                {order.items.map((item, index) => (
                  <li key={index} className="border-b pb-2 text-blue-950">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{item.product}</span>
                      <span>Qty: {item.quantity}</span>
                    </div>
                    {item.customization && (
                      <p className="text-sm text-gray-900 mt-1">
                        Customization: {item.customization}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={() => updateOrderStatus(order.id, 'in-progress')}
                  className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50"
                  aria-label={`Start preparing order ${order.id.slice(-4)}`}
                >
                  Start Preparing
                </button>
                <button
                  onClick={() => updateOrderStatus(order.id, 'completed')}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                  aria-label={`Mark order ${order.id.slice(-4)} as completed`}
                >
                  Mark as Completed
                </button>
              </div>
            </div>
          </div>
        ))}
        </div>
      </div>
    </div>
  )
}