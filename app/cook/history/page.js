'use client'

import { useState, useEffect } from "react";
import { db, auth } from "@/firebase";
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { onAuthStateChanged } from "firebase/auth";
import Sidebar from "../_components/Sidebar";
import { useRouter } from "next/navigation";
export default function History() {
  const [completedOrders, setCompletedOrders] = useState([]);
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        setUser(user);
      } else {
        // User is signed out
        router.push('/'); // Redirect to login page
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [router]);

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
    <div className="flex h-full bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 p-4 md:ml-64">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Historial de pedidos</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {completedOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-blue-600 text-white p-4">
                <h2 className="text-xl font-semibold">Orden #{order.id.slice(-4)}</h2>
                <p className="text-sm">Estado: {order.status}</p>
                <p className="text-sm">{new Date(order.createdAt.seconds * 1000).toLocaleString()}</p>
                <h1>Cliente: {order.customerName}</h1>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2 text-blue-900">Articulos:</h3>
                <ul className="space-y-4">
                  {order.items.map((item, index) => (
                    <li key={index} className="border-b pb-2 text-blue-950">
                      {item.product} - {item.quantity}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}