'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
      const [loading, setLoading] = useState(false)
        const router = useRouter()

          const handleLogin = async (e) => {
              e.preventDefault()
                  setLoading(true)

                      const { error } = await supabase.auth.signInWithPassword({
                            email: email,
                                  password: password,
                                      })

                                          if (error) {
                                                alert('ලොග් වෙන්න බැරි වුණා: ' + error.message)
                                                      setLoading(false)
                                                            return
                                                                }

                                                                    router.push('/admin/dashboard')
                                                                      }

                                                                        return (
                                                                            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
                                                                                  <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-96">
                                                                                          <h1 className="text-2xl font-bold mb-6 text-center text-green-500">Admin Login</h1>
                                                                                                  <form onSubmit={handleLogin}>
                                                                                                            <input
                                                                                                                        type="email"
                                                                                                                                    placeholder="Email Address"
                                                                                                                                                value={email}
                                                                                                                                                            onChange={(e) => setEmail(e.target.value)}
                                                                                                                                                                        className="w-full p-2 mb-4 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-green-500"
                                                                                                                                                                                    required
                                                                                                                                                                                              />
                                                                                                                                                                                                        <input
                                                                                                                                                                                                                    type="password"
                                                                                                                                                                                                                                placeholder="Password"
                                                                                                                                                                                                                                            value={password}
                                                                                                                                                                                                                                                        onChange={(e) => setPassword(e.target.value)}
                                                                                                                                                                                                                                                                    className="w-full p-2 mb-6 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-green-500"
                                                                                                                                                                                                                                                                                required
                                                                                                                                                                                                                                                                                          />
                                                                                                                                                                                                                                                                                                    <button 
                                                                                                                                                                                                                                                                                                                type="submit" 
                                                                                                                                                                                                                                                                                                                            disabled={loading}
                                                                                                                                                                                                                                                                                                                                        className="w-full bg-green-600 p-2 rounded hover:bg-green-700 transition font-semibold"
                                                                                                                                                                                                                                                                                                                                                  >
                                                                                                                                                                                                                                                                                                                                                              {loading ? 'Logging in...' : 'Login'}
                                                                                                                                                                                                                                                                                                                                                                        </button>
                                                                                                                                                                                                                                                                                                                                                                                </form>
                                                                                                                                                                                                                                                                                                                                                                                      </div>
                                                                                                                                                                                                                                                                                                                                                                                          </div>
                                                                                                                                                                                                                                                                                                                                                                                            )
                                                                                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                                                                                            