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
            <ul>
                {orders.map(order => (
                    <li key={order.id}>
                        <strong>Product: {order.product}</strong>
                        <p>Customization: {order.customization}</p>
                        <p>Status: {order.status}</p>
                    </li>
                ))}
            </ul>
        </div>
    )
}