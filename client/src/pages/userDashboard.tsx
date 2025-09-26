import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Sweet {
    _id: string;
    name: string;
    price: number;
    quantity: number;
    description?: string;
    category?: string;
    imageUrl?: string;
    createdAt?: string;
    updatedAt?: string;
    __v?: number;
}

interface CartItem extends Sweet {
    cartQuantity: number;
}

interface SearchParams {
    name?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
}

const UserDashboard: React.FC = () => {
    const [sweets, setSweets] = useState<Sweet[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchLoading, setSearchLoading] = useState(false);
    const [error, setError] = useState('');
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    
    // Search states
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [categories, setCategories] = useState<string[]>([]);
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    
    // Sorting state
    const [sortBy, setSortBy] = useState('name');
    
    // Get token from cookies
    const getTokenFromCookies = (): string | null => {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'token') {
                return value;
            }
        }
        return null;
    };

    // Get user name from cookies
    const getUserName = (): string => {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'userName') {
                return decodeURIComponent(value);
            }
        }
        return 'User';
    };

    // Logout function
    const logout = () => {
        // Clear all authentication cookies
        const cookies = ['token', 'userId', 'userEmail', 'userName', 'userRole'];
        cookies.forEach(cookie => {
            document.cookie = `${cookie}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        });
        
        // Clear local cart state
        setCart([]);
        
        // Redirect to login page
        window.location.href = '/login';
    };

    // Add to cart
    const addToCart = (sweet: Sweet) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item._id === sweet._id);
            if (existingItem) {
                return prevCart.map(item =>
                    item._id === sweet._id
                        ? { ...item, cartQuantity: Math.min(item.cartQuantity + 1, sweet.quantity) }
                        : item
                );
            } else {
                return [...prevCart, { ...sweet, cartQuantity: 1 }];
            }
        });
    };

    // Remove from cart
    const removeFromCart = (sweetId: string) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item._id === sweetId);
            if (existingItem && existingItem.cartQuantity > 1) {
                return prevCart.map(item =>
                    item._id === sweetId
                        ? { ...item, cartQuantity: item.cartQuantity - 1 }
                        : item
                );
            } else {
                return prevCart.filter(item => item._id !== sweetId);
            }
        });
    };

    // Get cart quantity for a specific sweet
    const getCartQuantity = (sweetId: string): number => {
        const cartItem = cart.find(item => item._id === sweetId);
        return cartItem ? cartItem.cartQuantity : 0;
    };

    // Calculate cart total
    const getCartTotal = (): number => {
        return cart.reduce((total, item) => total + (item.price * item.cartQuantity), 0);
    };

    // Get total items in cart
    const getTotalCartItems = (): number => {
        return cart.reduce((total, item) => total + item.cartQuantity, 0);
    };

    // Handle checkout
    const handleCheckout = async () => {
        if (cart.length === 0) return;

        setIsCheckingOut(true);
        const token = getTokenFromCookies();
        
        if (!token) {
            alert('Authentication token not found. Please login again.');
            setIsCheckingOut(false);
            return;
        }

        try {
            const purchasePromises = cart.map(item =>
                axios.post(
                    `http://localhost:5000/api/sweets/${item._id}/purchase`,
                    { quantity: item.cartQuantity },
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        withCredentials: true
                    }
                )
            );

            const results = await Promise.allSettled(purchasePromises);
            const successful = results.filter(result => result.status === 'fulfilled').length;
            const failed = results.length - successful;

            if (successful === results.length) {
                alert(`🎉 Successfully purchased all ${cart.length} items! Total: $${getCartTotal().toFixed(2)}`);
                setCart([]);
                setIsCartOpen(false);
            } else if (successful > 0) {
                alert(`⚠️ ${successful} items purchased successfully, ${failed} items failed. Please check your cart.`);
            } else {
                alert('❌ All purchases failed. Please try again.');
            }

            // Refresh after checkout
            handleSearch();
        } catch (error) {
            console.error('Checkout error:', error);
            alert('An error occurred during checkout. Please try again.');
        } finally {
            setIsCheckingOut(false);
        }
    };

    // Search API call
    const handleSearch = async (searchParams?: SearchParams) => {
        setSearchLoading(true);
        const token = getTokenFromCookies();
        
        if (!token) {
            setError('Authentication failed. Please login again.');
            setSearchLoading(false);
            return;
        }

        try {
            const params = new URLSearchParams();
            
            // Use provided searchParams or current state
            const name = searchParams?.name ?? searchTerm;
            const category = searchParams?.category ?? selectedCategory;
            const min = searchParams?.minPrice ?? (minPrice ? parseFloat(minPrice) : undefined);
            const max = searchParams?.maxPrice ?? (maxPrice ? parseFloat(maxPrice) : undefined);
            
            if (name && name.trim()) params.append('name', name.trim());
            if (category && category !== '') params.append('category', category);
            if (min !== undefined && min >= 0) params.append('minPrice', min.toString());
            if (max !== undefined && max >= 0) params.append('maxPrice', max.toString());

            const response = await axios.get(`http://localhost:5000/api/sweets/search?${params.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });

            if (response.data.success) {
                let results = response.data.data || [];
                
                // Apply client-side sorting
                results.sort((a: Sweet, b: Sweet) => {
                    switch (sortBy) {
                        case 'name':
                            return a.name.localeCompare(b.name);
                        case 'price-low':
                            return a.price - b.price;
                        case 'price-high':
                            return b.price - a.price;
                        case 'quantity':
                            return b.quantity - a.quantity;
                        default:
                            return 0;
                    }
                });
                
                setSweets(results);
            } else {
                setError(response.data.message || 'Search failed');
            }
        } catch (error) {
            console.error('Search error:', error);
            if (axios.isAxiosError(error)) {
                setError(error.response?.data?.message || 'Search failed');
            } else {
                setError('An unexpected error occurred during search');
            }
        } finally {
            setSearchLoading(false);
        }
    };

    // Fetch initial data and categories
    const fetchInitialData = async () => {
        setLoading(true);
        const token = getTokenFromCookies();
        
        if (!token) {
            setError('Authentication failed. Please login again.');
            setLoading(false);
            return;
        }

        try {
            // Fetch all sweets initially
            const response = await axios.get('http://localhost:5000/api/sweets', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });

            if (response.data.success) {
                const sweetsData = response.data.data || [];
                setSweets(sweetsData);
                
                // Extract unique categories with proper typing
                const uniqueCategories = [...new Set(
                    sweetsData
                        .map((sweet: Sweet) => sweet.category)
                        .filter(Boolean)
                )] as string[];
                setCategories(uniqueCategories);
            } else {
                setError(response.data.message || 'Failed to fetch sweets data');
            }
        } catch (error) {
            console.error('Error fetching initial data:', error);
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 401) {
                    setError('Authentication failed. Please login again.');
                } else {
                    setError(error.response?.data?.message || 'Failed to fetch sweets');
                }
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    // Clear all search filters
    const clearSearch = () => {
        setSearchTerm('');
        setSelectedCategory('');
        setMinPrice('');
        setMaxPrice('');
        fetchInitialData();
    };

    // Handle search form submission
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSearch();
    };

    // Handle sorting change
    useEffect(() => {
        if (sweets.length > 0) {
            const sorted = [...sweets].sort((a, b) => {
                switch (sortBy) {
                    case 'name':
                        return a.name.localeCompare(b.name);
                    case 'price-low':
                        return a.price - b.price;
                    case 'price-high':
                        return b.price - a.price;
                    case 'quantity':
                        return b.quantity - a.quantity;
                    default:
                        return 0;
                }
            });
            setSweets(sorted);
        }
    }, [sortBy]);

    useEffect(() => {
        fetchInitialData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4 animate-spin">🍭</div>
                    <p className="text-pink-600 font-semibold">Loading sweet treats...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
                    <div className="text-6xl mb-4">😔</div>
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Oops!</h2>
                    <p className="text-gray-700 mb-6">{error}</p>
                    <button
                        onClick={() => window.location.href = '/login'}
                        className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 p-4">
            {/* Top Navigation Bar */}
            <div className="fixed top-4 left-4 right-4 z-40 flex justify-between items-center">
                {/* Welcome Message */}
                <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                    <span className="text-pink-700 font-semibold">
                        👋 Welcome, {getUserName()}!
                    </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    {/* Cart Button */}
                    <button
                        onClick={() => setIsCartOpen(true)}
                        className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white p-3 rounded-full shadow-lg transition-all duration-200 transform hover:scale-110"
                    >
                        <div className="relative">
                            🛒
                            {getTotalCartItems() > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                    {getTotalCartItems()}
                                </span>
                            )}
                        </div>
                    </button>

                    {/* Logout Button */}
                    <button
                        onClick={logout}
                        className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg transition-all duration-200 transform hover:scale-110"
                        title="Logout"
                    >
                        🚪
                    </button>
                </div>
            </div>

            {/* Cart Overlay */}
            {isCartOpen && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsCartOpen(false)}></div>
                    <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl transform transition-transform">
                        <div className="flex flex-col h-full">
                            {/* Cart Header */}
                            <div className="p-4 border-b border-pink-200 bg-pink-50">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-pink-700">🛒 Your Cart</h2>
                                    <button
                                        onClick={() => setIsCartOpen(false)}
                                        className="text-pink-600 hover:text-pink-800 text-2xl"
                                    >
                                        ✕
                                    </button>
                                </div>
                                <p className="text-pink-600 text-sm mt-1">
                                    {getTotalCartItems()} {getTotalCartItems() === 1 ? 'item' : 'items'}
                                </p>
                            </div>

                            {/* Cart Items */}
                            <div className="flex-1 overflow-y-auto p-4">
                                {cart.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="text-4xl mb-2">🛒</div>
                                        <p className="text-gray-500">Your cart is empty</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {cart.map(item => (
                                            <div key={item._id} className="bg-pink-50 rounded-lg p-3 border border-pink-200">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h3 className="font-semibold text-gray-800 text-sm">{item.name}</h3>
                                                    <span className="text-lg">
                                                        {item.category === 'chocolate' ? '🍫' : '🧁'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600">
                                                        ${item.price} each
                                                    </span>
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={() => removeFromCart(item._id)}
                                                            className="w-6 h-6 bg-pink-300 hover:bg-pink-400 rounded-full flex items-center justify-center text-white text-sm"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="w-8 text-center font-semibold">
                                                            {item.cartQuantity}
                                                        </span>
                                                        <button
                                                            onClick={() => addToCart(item)}
                                                            disabled={item.cartQuantity >= item.quantity}
                                                            className="w-6 h-6 bg-pink-300 hover:bg-pink-400 disabled:bg-gray-300 rounded-full flex items-center justify-center text-white text-sm"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="text-right text-sm font-semibold text-green-600 mt-1">
                                                    ${(item.price * item.cartQuantity).toFixed(2)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Cart Footer */}
                            {cart.length > 0 && (
                                <div className="p-4 border-t border-pink-200 bg-pink-50">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-lg font-bold text-gray-800">Total:</span>
                                        <span className="text-xl font-bold text-green-600">
                                            ${getCartTotal().toFixed(2)}
                                        </span>
                                    </div>
                                    <button
                                        onClick={handleCheckout}
                                        disabled={isCheckingOut}
                                        className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 disabled:from-pink-300 disabled:to-rose-300 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200"
                                    >
                                        {isCheckingOut ? (
                                            <span className="flex items-center justify-center">
                                                <div className="animate-spin mr-2">🍭</div>
                                                Processing...
                                            </span>
                                        ) : (
                                            `🎉 Checkout (${getTotalCartItems()} items)`
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="max-w-7xl mx-auto pt-20">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border-4 border-pink-200">
                    <div className="text-center mb-6">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 via-rose-500 to-orange-500 bg-clip-text text-transparent mb-2">
                            🍯 Sweet Shop Dashboard 🍰
                        </h1>
                        <p className="text-pink-600">Discover our delicious collection of treats!</p>
                    </div>

                    {/* Amazon-style Search */}
                    <form onSubmit={handleSearchSubmit} className="space-y-4">
                        {/* Main Search Bar */}
                        <div className="flex gap-2">
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    placeholder="🔍 Search for sweets by name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-4 py-3 pl-10 border-2 border-pink-200 rounded-l-xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 outline-none bg-pink-50/30"
                                />
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-400">🔍</span>
                            </div>
                            <button
                                type="submit"
                                disabled={searchLoading}
                                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 disabled:from-pink-300 disabled:to-rose-300 text-white font-bold rounded-r-xl transition-all duration-200"
                            >
                                {searchLoading ? '⏳' : '🔍'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                                className="px-4 py-3 bg-pink-300 hover:bg-pink-400 text-white rounded-xl transition-colors"
                            >
                                {isSearchExpanded ? '▲' : '▼'} Filters
                            </button>
                        </div>

                        {/* Advanced Filters */}
                        {isSearchExpanded && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-pink-50/50 rounded-xl border border-pink-200">
                                {/* Category Filter */}
                                <div>
                                    <label className="block text-sm font-semibold text-pink-700 mb-2">🍭 Category</label>
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-pink-400 outline-none bg-white"
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map(category => (
                                            <option key={category} value={category}>
                                                {category.charAt(0).toUpperCase() + category.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Price Range */}
                                <div>
                                    <label className="block text-sm font-semibold text-pink-700 mb-2">💰 Min Price</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(e.target.value)}
                                        className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-pink-400 outline-none bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-pink-700 mb-2">💰 Max Price</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="999.99"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                        className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-pink-400 outline-none bg-white"
                                    />
                                </div>

                                {/* Filter Actions */}
                                <div className="md:col-span-3 flex gap-2 mt-2">
                                    <button
                                        type="submit"
                                        disabled={searchLoading}
                                        className="px-4 py-2 bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white rounded-lg font-semibold transition-colors"
                                    >
                                        Apply Filters
                                    </button>
                                    <button
                                        type="button"
                                        onClick={clearSearch}
                                        className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-semibold transition-colors"
                                    >
                                        Clear All
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                {/* Results Header with Sort */}
                <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-lg">
                    <div>
                        <p className="text-pink-700 font-medium">
                            {searchLoading ? 'Searching...' : `${sweets.length} sweet treats found 🧁`}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Sort by:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-3 py-1 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-pink-400 outline-none bg-white text-sm"
                        >
                            <option value="name">Name A-Z</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="quantity">Stock: High to Low</option>
                        </select>
                    </div>
                </div>

                {/* Sweet Cards Grid */}
                {searchLoading ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4 animate-spin">🔍</div>
                        <p className="text-pink-600 font-semibold">Searching for sweet treats...</p>
                    </div>
                ) : sweets.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🤷‍♀️</div>
                        <p className="text-gray-600 text-lg">No sweets found matching your search criteria</p>
                        <button
                            onClick={clearSearch}
                            className="mt-4 px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors"
                        >
                            View All Sweets
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {sweets.map((sweet) => {
                            const cartQuantity = getCartQuantity(sweet._id);

                            return (
                                <div
                                    key={sweet._id}
                                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-pink-100 overflow-hidden transform hover:scale-105"
                                >
                                    <div className="bg-gradient-to-br from-pink-200 to-orange-200 p-8 text-center">
                                        <div className="text-5xl mb-2">
                                            {sweet.imageUrl ? (
                                                <img src={sweet.imageUrl} alt={sweet.name} className="w-16 h-16 mx-auto rounded-full object-cover" />
                                            ) : (
                                                sweet.category === 'chocolate' ? '🍫' :
                                                sweet.category === 'candy' ? '🍬' :
                                                sweet.category === 'cake' ? '🧁' :
                                                sweet.category === 'cookie' ? '🍪' :
                                                sweet.name.toLowerCase().includes('chocolate') ? '🍫' :
                                                sweet.name.toLowerCase().includes('candy') ? '🍬' :
                                                sweet.name.toLowerCase().includes('lollipop') ? '🍭' :
                                                sweet.name.toLowerCase().includes('cake') ? '🍰' :
                                                sweet.name.toLowerCase().includes('cookie') ? '🍪' : '🧁'
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-gray-800 mb-2">{sweet.name}</h3>
                                        
                                        {sweet.description && (
                                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{sweet.description}</p>
                                        )}

                                        {sweet.category && (
                                            <div className="mb-3">
                                                <span className="inline-block bg-pink-100 text-pink-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                                    {sweet.category}
                                                </span>
                                            </div>
                                        )}

                                        <div className="space-y-2 mb-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-pink-600 font-medium">💰 Price:</span>
                                                <span className="text-lg font-bold text-green-600">${sweet.price}</span>
                                            </div>
                                            
                                            <div className="flex justify-between items-center">
                                                <span className="text-pink-600 font-medium">📦 Stock:</span>
                                                <span className={`font-bold ${sweet.quantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                    {sweet.quantity} available
                                                </span>
                                            </div>

                                            {cartQuantity > 0 && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-pink-600 font-medium">🛒 In Cart:</span>
                                                    <span className="font-bold text-blue-600">{cartQuantity}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Purchase/Cart Controls */}
                                        {cartQuantity === 0 ? (
                                            <button
                                                onClick={() => addToCart(sweet)}
                                                disabled={sweet.quantity === 0}
                                                className={`w-full py-3 px-4 rounded-xl font-bold transition-all duration-200 ${
                                                    sweet.quantity > 0
                                                        ? 'bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                }`}
                                            >
                                                {sweet.quantity > 0 ? '🛒 Add to Cart' : '😢 Out of Stock'}
                                            </button>
                                        ) : (
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => removeFromCart(sweet._id)}
                                                    className="flex-1 bg-pink-300 hover:bg-pink-400 text-white py-2 rounded-lg font-bold transition-colors"
                                                >
                                                    -
                                                </button>
                                                <span className="flex-1 text-center py-2 bg-gray-100 rounded-lg font-bold">
                                                    {cartQuantity}
                                                </span>
                                                <button
                                                    onClick={() => addToCart(sweet)}
                                                    disabled={cartQuantity >= sweet.quantity}
                                                    className="flex-1 bg-pink-300 hover:bg-pink-400 disabled:bg-gray-300 text-white py-2 rounded-lg font-bold transition-colors"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserDashboard;
