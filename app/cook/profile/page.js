'use client'

import { useState, useEffect } from "react"
import Sidebar from "../_components/Sidebar"

export default function Profile() {
  const [profile, setProfile] = useState({
    name: 'John Doe',
    role: 'Head Chef',
    email: 'john.doe@example.com',
    phone: '+1 234 567 8900'
  })

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 p-4 md:ml-64">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Profile</h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">Personal Information</h2>
              <p className="text-gray-600 dark:text-gray-400">Name: {profile.name}</p>
              <p className="text-gray-600 dark:text-gray-400">Role: {profile.role}</p>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">Contact Information</h2>
              <p className="text-gray-600 dark:text-gray-400">Email: {profile.email}</p>
              <p className="text-gray-600 dark:text-gray-400">Phone: {profile.phone}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}