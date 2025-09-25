import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const setCookie = (name: string, value: string, days: number = 7) => {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Client-side validation
        if (password !== confirmPassword) {
            alert('Passwords do not match! Please try again.');
            return;
        }

        if (password.length < 6) {
            alert('Password must be at least 6 characters long!');
            return;
        }

        setIsLoading(true);
        
        try {
            // Register user
            const registerResponse = await axios.post("http://localhost:5000/api/auth/register", {
                name,
                email,
                password,
                role: 'user'
            }, { withCredentials: true });

            
            if (registerResponse.data.success) {
                // Auto-login after registration
                try {
                    const loginResponse = await axios.post("http://localhost:5000/api/auth/login", {
                        email,
                        password
                    }, { withCredentials: true });

                    
                    if (loginResponse.data.success) {
                        const { user, token } = loginResponse.data;
                        
                        // Store session data
                        setCookie('token', token, 7);
                        setCookie('userId', user._id, 7);
                        setCookie('userEmail', user.email, 7);
                        setCookie('userName', user.name, 7);
                        setCookie('userRole', user.role, 7);
                        
                        alert(`🎉 Welcome to Sweet Treats, ${user.name}! Your account has been created successfully!`);
                        
                        navigate('/userDashboard');
                    }
                } catch (loginError) {
                    alert('Account created successfully, but auto-login failed. Please login manually.');
                    navigate('/login');
                }
            }
        } catch (error) {

            if (axios.isAxiosError(error)) {
                if (error.response?.data?.message) {
                    alert(error.response.data.message);
                } else if (error.response?.status === 400) {
                    alert("Please check your input data and try again.");
                } else if (error.response?.status === 409) {
                    alert("An account with this email already exists. Please try logging in instead.");
                } else {
                    alert("Registration failed. Please try again later.");
                }
            } else {
                alert("An unexpected error occurred. Please try again later.");
            }
        } finally {
            setIsLoading(false); 
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-50 to-purple-100 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Sweet background decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 text-6xl animate-bounce" style={{ animationDelay: '0s' }}>🧁</div>
                <div className="absolute top-20 right-20 text-5xl animate-bounce" style={{ animationDelay: '0.5s' }}>🍰</div>
                <div className="absolute bottom-20 left-20 text-4xl animate-bounce" style={{ animationDelay: '1s' }}>🍭</div>
                <div className="absolute bottom-32 right-16 text-5xl animate-bounce" style={{ animationDelay: '1.5s' }}>🍪</div>
                <div className="absolute top-1/2 left-5 text-3xl animate-bounce" style={{ animationDelay: '2s' }}>🍫</div>
                <div className="absolute top-1/3 right-8 text-4xl animate-bounce" style={{ animationDelay: '2.5s' }}>🍬</div>
                <div className="absolute top-3/4 left-1/4 text-3xl animate-bounce" style={{ animationDelay: '3s' }}>🎂</div>
                <div className="absolute top-1/4 left-3/4 text-4xl animate-bounce" style={{ animationDelay: '3.5s' }}>🧁</div>
            </div>
            
            <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative z-10 border-4 border-green-200">
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <div className="text-6xl mb-4">🎂</div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 bg-clip-text text-transparent mb-2">
                        Join Sweet Treats
                    </h1>
                    <p className="text-green-600 font-medium">Create your sweet account</p>
                    <div className="flex justify-center mt-2 space-x-1">
                        <span className="text-lg">🧁</span>
                        <span className="text-lg">🍰</span>
                        <span className="text-lg">🍭</span>
                    </div>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="name" className="block text-sm font-semibold text-green-700 mb-2 flex items-center">
                            <span className="mr-2">👤</span>
                            Full Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            minLength={2}
                            className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all outline-none bg-green-50/30 hover:bg-green-50/50"
                            placeholder="Enter your sweet name"
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-green-700 mb-2 flex items-center">
                            <span className="mr-2">📧</span>
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all outline-none bg-green-50/30 hover:bg-green-50/50"
                            placeholder="your-email@sweetshop.com"
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="password" className="block text-sm font-semibold text-green-700 mb-2 flex items-center">
                            <span className="mr-2">🔒</span>
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all outline-none bg-green-50/30 hover:bg-green-50/50"
                            placeholder="Create a strong password (min 6 chars)"
                        />
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-semibold text-green-700 mb-2 flex items-center">
                            <span className="mr-2">🔐</span>
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={6}
                            className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all outline-none bg-green-50/30 hover:bg-green-50/50"
                            placeholder="Confirm your password"
                        />
                    </div>

                    {/* Role info (read-only since it's always 'user') */}
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3">
                        <div className="flex items-center text-sm text-blue-700">
                            <span className="mr-2">👥</span>
                            <span className="font-semibold">Account Type:</span>
                            <span className="ml-2 bg-blue-100 px-2 py-1 rounded-full text-xs font-bold">Customer</span>
                        </div>
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 hover:from-green-600 hover:via-blue-600 hover:to-purple-600 disabled:from-green-300 disabled:via-blue-300 disabled:to-purple-300 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center">
                                <div className="animate-spin mr-3 h-5 w-5">🧁</div>
                                Creating your sweet account...
                            </div>
                        ) : (
                            <div className="flex items-center justify-center">
                                <span className="mr-2">🎉</span>
                                Join the Sweet Family
                            </div>
                        )}
                    </button>
                </form>
                
                <div className="mt-8 text-center space-y-3">
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                        <span>Already have a sweet account?</span>
                        <a href="/login" className="text-green-600 hover:text-green-800 font-medium">
                            Login here! 🍭
                        </a>
                    </div>
                    
                    <div className="text-xs text-gray-500 mt-4 px-4">
                        <div className="flex items-center justify-center mb-2">
                            <span className="mr-1">🔒</span>
                            <span>Your information is secure with us</span>
                        </div>
                        <p>By joining, you agree to our sweet terms of service and will receive the freshest treats! 🧁</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;