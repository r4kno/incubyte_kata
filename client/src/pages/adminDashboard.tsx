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

interface SearchParams {
    name?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
}

interface SweetFormData {
    name: string;
    price: string;
    quantity: string;
    description: string;
    category: string;
    imageUrl: string;
}

const AdminDashboard: React.FC = () => {
    const [sweets, setSweets] = useState<Sweet[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchLoading, setSearchLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Search states
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [categories, setCategories] = useState<string[]>([]);
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    
    // Sorting state
    const [sortBy, setSortBy] = useState('name');
    
    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
    const [editingSweet, setEditingSweet] = useState<Sweet | null>(null);
    const [restockingSweet, setRestockingSweet] = useState<Sweet | null>(null);
    
    // Form states
    const [formData, setFormData] = useState<SweetFormData>({
        name: '',
        price: '',
        quantity: '',
        description: '',
        category: '',
        imageUrl: ''
    });
    const [restockQuantity, setRestockQuantity] = useState('');
    
    // Loading states for operations
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

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

    // Get admin name from cookies
    const getAdminName = (): string => {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'userName') {
                return value;
            }
        }
        return 'Admin';
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

    // Fetch initial data
    const fetchInitialData = async () => {
        setLoading(true);
        const token = getTokenFromCookies();
        
        if (!token) {
            setError('Authentication failed. Please login again.');
            setLoading(false);
            return;
        }

        try {
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

    // Add new sweet
    const handleAddSweet = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        const token = getTokenFromCookies();
        if (!token) {
            alert('Authentication failed. Please login again.');
            setIsSubmitting(false);
            return;
        }

        try {
            const sweetData = {
                name: formData.name.trim(),
                price: parseFloat(formData.price),
                quantity: parseInt(formData.quantity),
                description: formData.description.trim() || undefined,
                category: formData.category.trim() || undefined,
                imageUrl: formData.imageUrl.trim() || undefined
            };

            const response = await axios.post('http://localhost:5000/api/sweets', sweetData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });

            if (response.data.success) {
                alert(`✅ Successfully added ${sweetData.name}!`);
                setIsAddModalOpen(false);
                resetForm();
                fetchInitialData();
            }
        } catch (error) {
            console.error('Add sweet error:', error);
            if (axios.isAxiosError(error)) {
                alert(error.response?.data?.message || 'Failed to add sweet');
            } else {
                alert('An unexpected error occurred');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Update sweet
    const handleUpdateSweet = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingSweet) return;
        
        setIsSubmitting(true);
        const token = getTokenFromCookies();
        
        if (!token) {
            alert('Authentication failed. Please login again.');
            setIsSubmitting(false);
            return;
        }

        try {
            const sweetData = {
                name: formData.name.trim(),
                price: parseFloat(formData.price),
                quantity: parseInt(formData.quantity),
                description: formData.description.trim() || undefined,
                category: formData.category.trim() || undefined,
                imageUrl: formData.imageUrl.trim() || undefined
            };

            const response = await axios.put(`http://localhost:5000/api/sweets/${editingSweet._id}`, sweetData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });

            if (response.data.success) {
                alert(`✅ Successfully updated ${sweetData.name}!`);
                setIsEditModalOpen(false);
                setEditingSweet(null);
                resetForm();
                fetchInitialData();
            }
        } catch (error) {
            console.error('Update sweet error:', error);
            if (axios.isAxiosError(error)) {
                alert(error.response?.data?.message || 'Failed to update sweet');
            } else {
                alert('An unexpected error occurred');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Delete sweet
    const handleDeleteSweet = async (sweet: Sweet) => {
        if (!confirm(`Are you sure you want to delete "${sweet.name}"? This action cannot be undone.`)) {
            return;
        }

        setDeletingId(sweet._id);
        const token = getTokenFromCookies();
        
        if (!token) {
            alert('Authentication failed. Please login again.');
            setDeletingId(null);
            return;
        }

        try {
            const response = await axios.delete(`http://localhost:5000/api/sweets/${sweet._id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });

            if (response.data.success) {
                alert(`🗑️ Successfully deleted ${sweet.name}!`);
                fetchInitialData();
            }
        } catch (error) {
            console.error('Delete sweet error:', error);
            if (axios.isAxiosError(error)) {
                alert(error.response?.data?.message || 'Failed to delete sweet');
            } else {
                alert('An unexpected error occurred');
            }
        } finally {
            setDeletingId(null);
        }
    };

    // Restock sweet
    const handleRestockSweet = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!restockingSweet) return;

        setIsSubmitting(true);
        const token = getTokenFromCookies();
        
        if (!token) {
            alert('Authentication failed. Please login again.');
            setIsSubmitting(false);
            return;
        }

        try {
            const quantity = parseInt(restockQuantity);
            if (quantity <= 0) {
                alert('Please enter a valid quantity greater than 0');
                return;
            }

            const response = await axios.post(`http://localhost:5000/api/sweets/${restockingSweet._id}/restock`, 
                { quantity },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                }
            );

            if (response.data.success) {
                alert(`📦 Successfully restocked ${restockingSweet.name} with ${quantity} units!`);
                setIsRestockModalOpen(false);
                setRestockingSweet(null);
                setRestockQuantity('');
                fetchInitialData();
            }
        } catch (error) {
            console.error('Restock error:', error);
            if (axios.isAxiosError(error)) {
                alert(error.response?.data?.message || 'Failed to restock sweet');
            } else {
                alert('An unexpected error occurred');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Form helpers
    const resetForm = () => {
        setFormData({
            name: '',
            price: '',
            quantity: '',
            description: '',
            category: '',
            imageUrl: ''
        });
    };

    const openEditModal = (sweet: Sweet) => {
        setEditingSweet(sweet);
        setFormData({
            name: sweet.name,
            price: sweet.price.toString(),
            quantity: sweet.quantity.toString(),
            description: sweet.description || '',
            category: sweet.category || '',
            imageUrl: sweet.imageUrl || ''
        });
        setIsEditModalOpen(true);
    };

    const openRestockModal = (sweet: Sweet) => {
        setRestockingSweet(sweet);
        setRestockQuantity('');
        setIsRestockModalOpen(true);
    };

    // Clear search
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

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
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

    // Logout function
    const logout = () => {
        const cookies = ['token', 'userId', 'userEmail', 'userName', 'userRole'];
        cookies.forEach(cookie => {
            document.cookie = `${cookie}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        });
        window.location.href = '/login';
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4 animate-spin">👑</div>
                    <p className="text-purple-600 font-semibold">Loading admin dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
                    <div className="text-6xl mb-4">😔</div>
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Oops!</h2>
                    <p className="text-gray-700 mb-6">{error}</p>
                    <button
                        onClick={() => window.location.href = '/login'}
                        className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100 p-4">
            {/* Main Content */}
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border-4 border-purple-200">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 bg-clip-text text-transparent mb-2">
                                Admin Dashboard
                            </h1>
                            <p className="text-purple-600">Welcome back, {getAdminName()}! Manage your sweet shop inventory.</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    resetForm();
                                    setIsAddModalOpen(true);
                                }}
                                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 rounded-lg font-bold transition-all duration-200 transform hover:scale-105"
                            >
                                ➕ Add Sweet
                            </button>
                            <button 
                                onClick={logout}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>

                    {/* Search Section */}
                    <form onSubmit={handleSearchSubmit} className="space-y-4">
                        <div className="flex gap-2">
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    placeholder="Search for sweets by name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-4 py-3 pl-10 border-2 border-purple-200 rounded-l-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none bg-purple-50/30"
                                />
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400">🔍</span>
                            </div>
                            <button
                                type="submit"
                                disabled={searchLoading}
                                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 disabled:from-purple-300 disabled:to-indigo-300 text-white font-bold rounded-r-xl transition-all duration-200"
                            >
                                {searchLoading ? '⏳' : '🔍'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                                className="px-4 py-3 bg-purple-300 hover:bg-purple-400 text-white rounded-xl transition-colors"
                            >
                                {isSearchExpanded ? '▲' : '▼'} Filters
                            </button>
                        </div>

                        {isSearchExpanded && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-purple-50/50 rounded-xl border border-purple-200">
                                <div>
                                    <label className="block text-sm font-semibold text-purple-700 mb-2">🍭 Category</label>
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none bg-white"
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map(category => (
                                            <option key={category} value={category}>
                                                {category.charAt(0).toUpperCase() + category.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-purple-700 mb-2">💰 Min Price</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(e.target.value)}
                                        className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-purple-700 mb-2">💰 Max Price</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="999.99"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                        className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none bg-white"
                                    />
                                </div>

                                <div className="md:col-span-3 flex gap-2 mt-2">
                                    <button
                                        type="submit"
                                        disabled={searchLoading}
                                        className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white rounded-lg font-semibold transition-colors"
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
                        <p className="text-purple-700 font-medium">
                            {searchLoading ? 'Searching...' : `${sweets.length} sweets in inventory 👑`}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Sort by:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-3 py-1 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none bg-white text-sm"
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
                        <p className="text-purple-600 font-semibold">Searching inventory...</p>
                    </div>
                ) : sweets.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">📦</div>
                        <p className="text-gray-600 text-lg mb-4">No sweets found in inventory</p>
                        <button
                            onClick={() => {
                                resetForm();
                                setIsAddModalOpen(true);
                            }}
                            className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                        >
                            Add Your First Sweet
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {sweets.map((sweet) => (
                            <div
                                key={sweet._id}
                                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-purple-100 overflow-hidden"
                            >
                                <div className="bg-gradient-to-br from-purple-200 to-indigo-200 p-8 text-center">
                                    <div className="text-5xl mb-2">
                                        {sweet.imageUrl ? (
                                            <img src={sweet.imageUrl} alt={sweet.name} className="w-16 h-16 mx-auto rounded-full object-cover" />
                                        ) : (
                                            sweet.category === 'chocolate' ? '🍫' :
                                            sweet.category === 'candy' ? '🍬' :
                                            sweet.category === 'cake' ? '🧁' :
                                            sweet.category === 'cookie' ? '🍪' : '🧁'
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
                                            <span className="inline-block bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                                {sweet.category}
                                            </span>
                                        </div>
                                    )}

                                    <div className="space-y-2 mb-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-purple-600 font-medium">💰 Price:</span>
                                            <span className="text-lg font-bold text-green-600">${sweet.price}</span>
                                        </div>
                                        
                                        <div className="flex justify-between items-center">
                                            <span className="text-purple-600 font-medium">📦 Stock:</span>
                                            <span className={`font-bold ${sweet.quantity > 10 ? 'text-green-600' : sweet.quantity > 0 ? 'text-yellow-600' : 'text-red-500'}`}>
                                                {sweet.quantity} units
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="space-y-2">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => openEditModal(sweet)}
                                                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg font-bold text-sm transition-colors"
                                            >
                                                ✏️ Edit
                                            </button>
                                            <button
                                                onClick={() => openRestockModal(sweet)}
                                                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg font-bold text-sm transition-colors"
                                            >
                                                📦 Restock
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteSweet(sweet)}
                                            disabled={deletingId === sweet._id}
                                            className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white py-2 px-3 rounded-lg font-bold text-sm transition-colors"
                                        >
                                            {deletingId === sweet._id ? '⏳ Deleting...' : '🗑️ Delete'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Sweet Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen p-4">
                        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsAddModalOpen(false)}></div>
                        <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-purple-700">➕ Add New Sweet</h2>
                                <button
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="text-gray-500 hover:text-gray-700 text-2xl"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleAddSweet} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-purple-700 mb-2">Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none"
                                        placeholder="Sweet name"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-purple-700 mb-2">Price *</label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            min="0"
                                            step="0.01"
                                            required
                                            className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none"
                                            placeholder="0.00"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-purple-700 mb-2">Quantity *</label>
                                        <input
                                            type="number"
                                            name="quantity"
                                            value={formData.quantity}
                                            onChange={handleInputChange}
                                            min="0"
                                            required
                                            className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-purple-700 mb-2">Category</label>
                                    <input
                                        type="text"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none"
                                        placeholder="e.g., chocolate, candy, cake"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-purple-700 mb-2">Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none resize-none"
                                        placeholder="Sweet description..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-purple-700 mb-2">Image URL</label>
                                    <input
                                        type="url"
                                        name="imageUrl"
                                        value={formData.imageUrl}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none"
                                        placeholder="https://..."
                                    />
                                </div>

                                <div className="flex gap-2 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddModalOpen(false)}
                                        className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-bold transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white py-2 px-4 rounded-lg font-bold transition-colors"
                                    >
                                        {isSubmitting ? '⏳ Adding...' : '➕ Add Sweet'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Sweet Modal */}
            {isEditModalOpen && editingSweet && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen p-4">
                        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsEditModalOpen(false)}></div>
                        <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-blue-700">✏️ Edit Sweet</h2>
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="text-gray-500 hover:text-gray-700 text-2xl"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleUpdateSweet} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-blue-700 mb-2">Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
                                        placeholder="Sweet name"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-blue-700 mb-2">Price *</label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            min="0"
                                            step="0.01"
                                            required
                                            className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
                                            placeholder="0.00"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-blue-700 mb-2">Quantity *</label>
                                        <input
                                            type="number"
                                            name="quantity"
                                            value={formData.quantity}
                                            onChange={handleInputChange}
                                            min="0"
                                            required
                                            className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-blue-700 mb-2">Category</label>
                                    <input
                                        type="text"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
                                        placeholder="e.g., chocolate, candy, cake"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-blue-700 mb-2">Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none resize-none"
                                        placeholder="Sweet description..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-blue-700 mb-2">Image URL</label>
                                    <input
                                        type="url"
                                        name="imageUrl"
                                        value={formData.imageUrl}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
                                        placeholder="https://..."
                                    />
                                </div>

                                <div className="flex gap-2 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-bold transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-2 px-4 rounded-lg font-bold transition-colors"
                                    >
                                        {isSubmitting ? '⏳ Updating...' : '✏️ Update Sweet'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Restock Modal */}
            {isRestockModalOpen && restockingSweet && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen p-4">
                        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsRestockModalOpen(false)}></div>
                        <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-green-700">📦 Restock Sweet</h2>
                                <button
                                    onClick={() => setIsRestockModalOpen(false)}
                                    className="text-gray-500 hover:text-gray-700 text-2xl"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="mb-4 p-4 bg-green-50 rounded-lg">
                                <h3 className="font-bold text-gray-800">{restockingSweet.name}</h3>
                                <p className="text-sm text-gray-600">Current Stock: <span className="font-semibold">{restockingSweet.quantity} units</span></p>
                            </div>

                            <form onSubmit={handleRestockSweet} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-green-700 mb-2">Add Quantity *</label>
                                    <input
                                        type="number"
                                        value={restockQuantity}
                                        onChange={(e) => setRestockQuantity(e.target.value)}
                                        min="1"
                                        required
                                        className="w-full px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none"
                                        placeholder="Enter quantity to add"
                                    />
                                </div>

                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-blue-700">
                                        New total will be: <span className="font-bold">
                                            {restockQuantity ? restockingSweet.quantity + parseInt(restockQuantity) : restockingSweet.quantity} units
                                        </span>
                                    </p>
                                </div>

                                <div className="flex gap-2 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsRestockModalOpen(false)}
                                        className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-bold transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white py-2 px-4 rounded-lg font-bold transition-colors"
                                    >
                                        {isSubmitting ? '⏳ Restocking...' : '📦 Restock'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;