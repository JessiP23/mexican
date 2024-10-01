'use client'

import { useState, useEffect } from "react"
import { db } from "@/firebase"
import { collection, addDoc, query, orderBy, limit, onSnapshot, Timestamp, getDocs } from 'firebase/firestore'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import Sidebar from "../_components/Sidebar"

export default function Track() {
  const [revenue, setRevenue] = useState('')
  const [expenses, setExpenses] = useState('')
  const [financialData, setFinancialData] = useState([])
  const [todayRevenue, setTodayRevenue] = useState(0)
  const [dailyRevenue, setDailyRevenue] = useState([])

  useEffect(() => {
    // Fetch financial data
    const fetchFinancialData = async () => {
      const q = query(collection(db, 'financials'), orderBy('date', 'desc'), limit(30))
      const querySnapshot = await getDocs(q)
      const data = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        date: doc.data().date.toDate().toLocaleDateString()
      }))
      setFinancialData(data.reverse())
    }

    fetchFinancialData()

    // Fetch and aggregate daily revenue data
    const fetchDailyRevenue = async () => {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const q = query(
        collection(db, 'orders'),
        orderBy('createdAt', 'desc'),
        limit(1000) // Adjust this limit as needed
      )

      const querySnapshot = await getDocs(q)
      const orderData = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate()
      }))

      const dailyTotals = orderData.reduce((acc, order) => {
        if (order.createdAt >= thirtyDaysAgo) {
          const dateKey = order.createdAt.toISOString().split('T')[0]
          acc[dateKey] = (acc[dateKey] || 0) + order.totalPrice
        }
        return acc
      }, {})

      const sortedDailyRevenue = Object.entries(dailyTotals)
        .map(([date, total]) => ({ date, total }))
        .sort((a, b) => new Date(a.date) - new Date(b.date))

      setDailyRevenue(sortedDailyRevenue)
    }

    fetchDailyRevenue()

    // Listen for new orders to update today's revenue
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const ordersQuery = query(
      collection(db, 'orders'),
      orderBy('createdAt', 'desc'),
      limit(100) // Adjust this limit as needed
    )

    const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
      let dailyRevenue = 0
      snapshot.forEach((doc) => {
        const orderData = doc.data()
        if (orderData.createdAt.toDate() >= today) {
          dailyRevenue += orderData.totalPrice
        }
      })
      setTodayRevenue(dailyRevenue)
    })

    return () => unsubscribe()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const revenueNum = parseFloat(revenue)
    const expensesNum = parseFloat(expenses)

    // Save to Firestore
    await addDoc(collection(db, 'financials'), {
      revenue: revenueNum,
      expenses: expensesNum,
      date: Timestamp.now()
    })

    // Update local state
    setFinancialData([...financialData, {
      revenue: revenueNum,
      expenses: expensesNum,
      date: new Date().toLocaleDateString()
    }])

    // Reset form
    setRevenue('')
    setExpenses('')
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 p-4 md:ml-64 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Seguimiento de las finanzas</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Ingresos de hoy</h2>
          <p className="text-2xl font-bold text-green-600">${todayRevenue.toFixed(2)}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Daily Revenue</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Revenue</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {dailyRevenue.map((day, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-900' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{day.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">${day.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Daily Revenue Chart</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total" name="Revenue" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Financial Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={financialData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
              <Line type="monotone" dataKey="expenses" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Add Financial Data</h2>
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