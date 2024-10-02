'use client'

import { useState, useEffect } from "react"
import { db } from "@/firebase"
import { collection, addDoc, query, orderBy, limit, onSnapshot, Timestamp, getDocs, where } from 'firebase/firestore'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import Sidebar from "../_components/Sidebar"

export default function Track() {
  const [revenue, setRevenue] = useState('')
  const [expenses, setExpenses] = useState('')
  const [reason, setReason] = useState('')
  const [expenseData, setExpenseData] = useState([])
  const [financialData, setFinancialData] = useState([])
  const [todayRevenue, setTodayRevenue] = useState(0)
  const [dailyRevenue, setDailyRevenue] = useState([])

  useEffect(() => {
    // Fetch and aggregate daily revenue data
    const fetchDailyRevenue = async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      thirtyDaysAgo.setHours(0, 0, 0, 0);
  
      // Query  for orders from the last 30 days
      const q = query(
        collection(db, 'orders'),
        where('createdAt', '>=', Timestamp.fromDate(thirtyDaysAgo)),
        orderBy('createdAt', 'asc') // Only order by createdAt to avoid composite index
      );
  
      const querySnapshot = await getDocs(q);
      
      const orderData = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
      }));
  
      // Filter for 'completed' orders locally
      const completedOrders = orderData.filter(order => order.status === 'completed');
  
      const dailyTotals = {};
      completedOrders.forEach(order => {
        // Using local time zone without specifying 'UTC'
        const dateKey = order.createdAt.toLocaleDateString('en-US'); 
        dailyTotals[dateKey] = (dailyTotals[dateKey] || 0) + order.totalPrice;
      });
  
      const sortedDailyRevenue = Object.entries(dailyTotals)
        .map(([date, total]) => ({ date, total }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));
  
      setDailyRevenue(sortedDailyRevenue);
    };
  
    // Fetch financial data
    const fetchFinancialData = async () => {
      const q = query(collection(db, 'financials'), orderBy('date', 'desc'), limit(30));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        date: doc.data().date.toDate().toLocaleDateString()
      }));
      setFinancialData(data.reverse());
    };

    const fetchExpenses = async () => {
      try {
        const q = query(collection(db, 'expenses'), orderBy('date', 'desc'));
        const querySnapshot = await getDocs(q);
        const fetchedExpenses = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
          date: doc.data().date.toDate().toLocaleDateString('en-US')
        }));
        setExpenseData(fetchedExpenses);
      } catch (error) {
        console.error('Error fetching expenses: ', error);
      }
    }
  
    // Listen for new orders to update today's revenue
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const ordersQuery = query(
      collection(db, 'orders'),
      where('createdAt', '>=', Timestamp.fromDate(today)),
      orderBy('createdAt', 'desc')
    );
  
    // Set up the real-time listener here and get the unsubscribe function
    const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
      let dailyRevenue = 0;
      snapshot.forEach((doc) => {
        const orderData = doc.data();
        if (orderData.status === 'completed') {
          dailyRevenue += orderData.totalPrice;
        }
      });
      setTodayRevenue(dailyRevenue);
    });
  
    // Fetch the initial data
    fetchFinancialData();
    fetchDailyRevenue();
    fetchExpenses();
  
    // Clean up the listener on component unmount
    return () => unsubscribe; // Now unsubscribe will be a function
  }, []);
  
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    const expensesNum = parseFloat(expenses);

    // Save to Firestore
    await addDoc(collection(db, 'expenses'), {
      reason,
      expenses: expensesNum,
      date: Timestamp.now()
    });

    // Update local state to display in table
    setExpenseData([...expenseData, {
      reason,
      expenses: expensesNum,
      date: new Date().toLocaleDateString()
    }]);

    // Reset form fields
    setExpenses('');
    setReason('');
  };
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 p-4 md:ml-64 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white ml-16">Seguimiento de las finanzas</h1>
        
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{new Date(day.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">${day.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Grafico Diario de Ingresos</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
              <YAxis />
              <Tooltip labelFormatter={(label) => new Date(label).toLocaleDateString()} />
              <Legend />
              <Line type="monotone" dataKey="total" name="Revenue" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Panorama Financer</h2>
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
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Agregar Gasto</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Razón del Gasto
              </label>
              <input
                type="text"
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
        </div>
        <div>
          <label htmlFor="expenses" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Precio del Gasto
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
          Enviar
        </button>
      </form>

      {/* Display Expense Table */}
      <h3 className="text-lg font-semibold mt-6 mb-4 text-gray-800 dark:text-white">Lista de Gastos</h3>
      <table className="min-w-full bg-white dark:bg-gray-700">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Razón</th>
            <th className="py-2 px-4 border-b">Fecha</th>
            <th className="py-2 px-4 border-b">Precio</th>
          </tr>
        </thead>
        <tbody>
          {expenseData.map((exp) => (
            <tr key={exp.id}>
              <td className="py-2 px-4 border-b text-center">{exp.reason}</td>
              <td className="py-2 px-4 border-b text-center">{exp.date}</td>
              <td className="py-2 px-4 border-b text-center">${exp.expenses.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
      </div>
    </div>
  )
}