'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Headphones, Mail, Lock, Globe } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebase';
import { collection, doc, getDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';

const translations = {
  en: {
    welcomeBack: "Welcome Back",
    email: "Email",
    password: "Password",
    login: "Login",
    forgotPassword: "Forgot password?",
    signInWithGoogle: "Sign In with Google",
    dontHaveAccount: "Don't have an account?",
    signUp: "Sign up",
    resetPassword: "Reset Password",
    enterYourEmail: "Enter your email",
    backToLogin: "Back to Login",
    newPassword: "New Password",
    updatePassword: "Update Password",
  },
  es: {
    welcomeBack: "Bienvenido de nuevo",
    email: "Correo electrónico",
    password: "Contraseña",
    login: "Iniciar sesión",
    forgotPassword: "¿Olvidaste tu contraseña?",
    signInWithGoogle: "Iniciar sesión con Google",
    dontHaveAccount: "¿No tienes una cuenta?",
    signUp: "Regístrate",
    resetPassword: "Restablecer contraseña",
    enterYourEmail: "Ingresa tu correo electrónico",
    backToLogin: "Volver al inicio de sesión",
    newPassword: "Nueva contraseña",
    updatePassword: "Actualizar contraseña",
  }
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [language, setLanguage] = useState('en');
  const router = useRouter();

  const t = translations[language];

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'es' : 'en');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
  
    try {
      // Authenticate user
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Fetch user role from Firestore
      const userRef = collection(db, 'users');
      const q = query(userRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
  
      if (querySnapshot.docs.length > 0) {
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        
        // Redirect based on user role
        switch (userData.role) {
          case 'waitress':
            router.push('/waitress');
            break;
          case 'cook':
            router.push('/cook');
            break;
          default:
            setError('Invalid user role');
            break;
        }
      } else {
        setError('User  data not found');
      }
    } catch (err) {
      setError(err.message);
      console.error('Login error:', err);
    }
  };





  return (
    <div className="min-h-screen bg-gradient-to-r bg-gray-500 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-end mb-4">
          <button
            onClick={toggleLanguage}
            className="flex items-center text-indigo-600 hover:text-indigo-800 transition duration-300"
          >
            <Globe className="w-5 h-5 mr-1" />
            {language === 'en' ? 'Español' : 'English'}
          </button>
        </div>
        
       
        
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute top-3 left-3 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.email}
                required
                className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-blue-600"
              />
            </div>
            <div className="relative">
              <Lock className="absolute top-3 left-3 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.password}
                required
                className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-blue-600"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition duration-300"
            >
              {t.login}
            </button>
           
          </form>
       
     
      </div>
    </div>
  );
}