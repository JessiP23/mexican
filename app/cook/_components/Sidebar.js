'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, ClipboardList, History, User, DollarSign, Menu, LogOut } from 'lucide-react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth, db } from '@/firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'


const sidebarItems = [
  { name: 'Panel', href: '/cook', icon: Home },
  { name: 'Historial', href: '/cook/history', icon: History },
  { name: 'Perfil', href: '/cook/profile', icon: User },
  { name: 'Gastos', href: '/cook/track', icon: DollarSign },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [userName, setUserName] = useState('')
  const router = useRouter()


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const usersRef = collection(db, 'users')
          const q = query(usersRef, where("email", "==", user.email))
          const querySnapshot = await getDocs(q)
          
          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0]
            const userData = userDoc.data()
            if (userData.name) {
              setUserName(userData.name)
            } else {
              console.log("NNN")
            }
          } else {
            console.log("NNN:")
          }
        } catch (error) {
          console.error("Error fetching user document:", error)
        }
      } else {
        router.push('/')
      }
    })

    return () => {
      unsubscribe()
    }
  }, [router])

  

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      router.push('/')
    } catch (error) {
      console.error('Error signing out: ', error)
    }
  }

  return (
    <>
      <button
        className="fixed top-4 left-4 z-50 md:hidden bg-blue-600 text-white p-2 rounded-md"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label="Toggle sidebar"
      >
        <Menu size={24} />
      </button>
      <aside className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="h-full px-3 py-4 overflow-y-auto bg-gray-50 dark:bg-gray-800">
          {userName ? (
            <div className="mb-6 p-4 bg-blue-100 dark:bg-blue-900 rounded-lg mt-20">
              <p className="text-lg font-semibold text-blue-800 dark:text-blue-200">Welcome, {userName}</p>
            </div>
          ) : (
            <div className="mb-6 p-4 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <p className="text-lg font-semibold text-blue-800 dark:text-blue-200">Loading user...</p>
            </div>
          )}
          <ul className="space-y-4 font-medium">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      isActive ? 'bg-gray-100 dark:bg-gray-700' : ''
                    }`}
                  >
                    <item.icon className={`w-6 h-6 ${isActive ? 'text-blue-600' : 'text-gray-500 dark:text-gray-400'}`} />
                    <span className="ml-3">{item.name}</span>
                  </Link>
                </li>
              )
            })}
            <li>
              <button
                onClick={handleSignOut}
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 w-full"
              >
                <LogOut className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                <span className="ml-3">Sign Out</span>
              </button>
            </li>
          </ul>
        </div>
      </aside>
    </>
  )
}