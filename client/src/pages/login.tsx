import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const setCookie = (name: string, value: string, days: number = 7) => {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            const response = await axios.post("http://localhost:5000/api/auth/login", { email, password }, { withCredentials: true });
            
            if (response.data.success) {
                const { user, token } = response.data;
                
                // Store user session data
                setCookie('token', token, 7);
                setCookie('userId', user._id, 7);
                setCookie('userEmail', user.email, 7);
                setCookie('userName', user.name, 7);
                setCookie('userRole', user.role, 7);
                
                // Route based on role
                if (user.role === 'admin') {
                    navigate('/adminDashboard');
                } else {
                    navigate('/userDashboard');
                }
            }
        } catch (error) {

            if (axios.isAxiosError(error)) {
                if (error.response?.data?.message) {
                    alert(error.response.data.message);
                } else if (error.message === 'Network Error' || !error.response) {
                    alert("Network error. Please check your connection.");
                } else {
                    alert("Invalid credentials");
                }
            } else {
                alert("An unexpected error occurred. Please try again later.");
            }
        } finally {
            setIsLoading(false); 
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-100 via-orange-50 to-yellow-100 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Sweet background decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 text-6xl animate-bounce" style={{ animationDelay: '0s' }}>🍭</div>
                <div className="absolute top-20 right-20 text-5xl animate-bounce" style={{ animationDelay: '0.5s' }}>🧁</div>
                <div className="absolute bottom-20 left-20 text-4xl animate-bounce" style={{ animationDelay: '1s' }}>🍪</div>
                <div className="absolute bottom-32 right-16 text-5xl animate-bounce" style={{ animationDelay: '1.5s' }}>🍰</div>
                <div className="absolute top-1/2 left-5 text-3xl animate-bounce" style={{ animationDelay: '2s' }}>🍬</div>
                <div className="absolute top-1/3 right-8 text-4xl animate-bounce" style={{ animationDelay: '2.5s' }}>🧁</div>
            </div>
            
            <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative z-10 border-4 border-pink-200">
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <div className="text-6xl mb-4">🍯</div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent mb-2">
                        Sweet Treats
                    </h1>
                    <p className="text-pink-600 font-medium">Login to your sweet account</p>
                    <div className="flex justify-center mt-2 space-x-1">
                        <span className="text-lg">🍭</span>
                        <span className="text-lg">🧁</span>
                        <span className="text-lg">🍪</span>
                    </div>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-pink-700 mb-2 flex items-center">
                            <span className="mr-2">📧</span>
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all outline-none bg-pink-50/30 hover:bg-pink-50/50"
                            placeholder="your-email@sweetshop.com"
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="password" className="block text-sm font-semibold text-pink-700 mb-2 flex items-center">
                            <span className="mr-2">🔒</span>
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all outline-none bg-pink-50/30 hover:bg-pink-50/50"
                            placeholder="Enter your sweet password"
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-pink-500 via-orange-500 to-yellow-500 hover:from-pink-600 hover:via-orange-600 hover:to-yellow-600 disabled:from-pink-300 disabled:via-orange-300 disabled:to-yellow-300 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-pink-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center">
                                <div className="animate-spin mr-3 h-5 w-5">🍭</div>
                                Logging in...
                            </div>
                        ) : (
                            <div className="flex items-center justify-center">
                                <span className="mr-2">🚪</span>
                                Enter Sweet Shop
                            </div>
                        )}
                    </button>
                </form>

                <div className="bg-gray-750 text-m text-gray-800 mt-6 p-3 rounded-lg text-center border border-pink-200">
                    Admin Credentials: <br />
                    admin@kata.com | admin123
                </div>
                
                <div className="mt-8 text-center space-y-3">
                    <a href="#" className="block text-sm text-pink-600 hover:text-pink-800 transition-colors font-medium">
                        🤔 Forgot your password?
                    </a>
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                        <span>New to our sweet shop?</span>
                        <a href="/register" className="text-pink-600 hover:text-pink-800 font-medium">
                            Join us! 🧁
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;