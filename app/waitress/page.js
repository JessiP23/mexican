'use client'

import { useState } from "react"
import { db } from "@/firebase"
import {collection, addDoc} from 'firebase/firestore'

export default function Waitress () {
    const [product, setProduct] = useState('')
    const [customization, setCustomization] = useState('')

    const sendOrder = async () => {
        try {
            await addDoc(collection(db, 'orders'), {
                product,
                customization,
                status: 'pending',
                createdAt: new Date(),
            });
            setProduct('');
            setCustomization('');
            alert('Order sent!');
        } catch (e) {
            console.error('Error adding document: ', e);
            alert('An error occurred, please try again later.');
        }
    };

    return (
        <div>
            <h1>Take Order</h1>
            <input type="text" className="text-blue-600" value={product} onChange={e => setProduct(e.target.value)} placeholder="Product" />
            <textarea style={{ color: 'blue' }} placeholder="Customization" value={customization} onChange={(e) => setCustomization(e.target.value)} />
            <button onClick={sendOrder}>Send Order</button>
        </div>
    )
}
