'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Sidebar from '../_components/Sidebar';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const usersRef = collection(db, 'users');
          const q = query(usersRef, where("email", "==", user.email));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();
            setProfile({
              name: userData.name || 'N/A',
              email: userData.email || user.email,
              role: userData.role || 'N/A'
            });
          } else {
            setError('User profile not found');
          }
        } catch (error) {
          console.error("Error fetching user document:", error);
          setError('Error fetching user profile');
        } finally {
          setLoading(false);
        }
      } else {
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 p-4 md:ml-64">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white md: text-center sm:text-center">Perfil</h1>
        {profile && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">Informacion Personal</h2>
                <p className="text-gray-600 dark:text-gray-400">Nombre: {profile.name}</p>
                <p className="text-gray-600 dark:text-gray-400">Ocupacion: {profile.role}</p>
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">Informacion de contacto</h2>
                <p className="text-gray-600 dark:text-gray-400">Email: {profile.email}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}