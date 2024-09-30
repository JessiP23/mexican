'use client'

import { useState, useEffect } from "react"
import { db } from "@/firebase"
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'

export default function Cook () {
    const [orders, setOrders] = useState([])

    useEffect(() => {
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newOrders = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setOrders(newOrders);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    return (
        <div>
            <h1>Incoming Orders</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {orders.map((order) => (
          <div key={order.id} className="card p-4 border rounded-md shadow-md">
            <h2 className="text-xl font-semibold">Product: {order.product}</h2>
            <p className="text-lg">Quantity: {order.quantity}</p>
            <p className="text-lg">Customization: {order.customization}</p>
            <p className="text-sm text-gray-500">Status: {order.status}</p>
          </div>
        ))}
      </div>
        </div>
    )
}