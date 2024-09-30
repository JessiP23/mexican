'use client'

import { useState } from "react"
import Sidebar from "../_components/Sidebar"

export default function Track() {
  const [revenue, setRevenue] = useState('')
  const [expenses, setExpenses] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    // Here you would typically send this data to your backend
    console.log('Submitted:', { revenue, expenses })
    // Reset form
    setRevenue('')
    setExpenses('')
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 p-4 md:ml-64">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Track Finances</h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="revenue" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Revenue
              </label>
              <input
                type="number"
                id="revenue"
                value={revenue}
                onChange={(e) => setRevenue(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div>
              <label htmlFor="expenses" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Expenses
              </label>
              <input
                type="number"
                id="expenses"
                value={expenses}
                onChange={(e) => setExpenses(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}