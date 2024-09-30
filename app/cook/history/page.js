'use client'

import { useState, useEffect } from "react"
import { db } from "@/firebase"
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore'
import Sidebar from "../_components/Sidebar"

export default function History() {
  const [completedOrders, setCompletedOrders] = useState([])

  useEffect(() => {
    const q = query(
      collection(db, 'orders'),
      where('status', '==', 'completed'),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newOrders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCompletedOrders(newOrders);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 p-4 md:ml-64">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Order History</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {completedOrders.map((order) => (
            <div key={order.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="bg-green-600 text-white p-4">
                <h2 className="text-xl font-semibold">Order #{order.id.slice(-4)}</h2>
                <p className="text-sm">Completed: {new Date(order.createdAt.toDate()).toLocaleString()}</p>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Items:</h3>
                <ul className="space-y-4">
                  {order.items.map((item, index) => (
                    <li key={index} className="border-b pb-2 text-gray-700 dark:text-gray-300">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{item.product}</span>
                        <span>Qty: {item.quantity}</span>
                      </div>
                      {item.customization && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Customization: {item.customization}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}