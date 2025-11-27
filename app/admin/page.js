"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, X, Check, Save } from "lucide-react";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("products"); // products, categories, orders

  // Data State
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  // Product Form State
  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    imageURLs: [""],
  });
  const [editingProduct, setEditingProduct] = useState(null);

  // Category Form State
  const [categoryForm, setCategoryForm] = useState({ name: "" });
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    const token = document.cookie.split('; ').find(row => row.startsWith('admin-token='));
    if (token) {
      setIsAuthenticated(true);
      fetchAllData();
    }
    setLoading(false);
  }, []);

  const fetchAllData = () => {
    fetchOrders();
    fetchProducts();
    fetchCategories();
  };

  const handleLogin = (e) => {
    e.preventDefault();
    document.cookie = `admin-token=${password}; path=/; max-age=86400`;
    setIsAuthenticated(true);
    fetchAllData();
  };

  const handleLogout = () => {
    document.cookie = 'admin-token=; path=/; max-age=0';
    setIsAuthenticated(false);
    setPassword("");
  };

  // --- Fetch Functions ---
  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders');
      if (res.ok) setOrders(await res.json());
    } catch (error) { console.error('Failed to fetch orders:', error); }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) setProducts(await res.json());
    } catch (error) { console.error('Failed to fetch products:', error); }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) setCategories(await res.json());
    } catch (error) { console.error('Failed to fetch categories:', error); }
  };

  // --- Product Handlers ---
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const url = editingProduct ? `/api/products/${editingProduct._id}` : '/api/admin/products';
    const method = editingProduct ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...productForm,
          price: parseFloat(productForm.price),
          imageURLs: productForm.imageURLs.filter(url => url.trim() !== ''),
        }),
      });

      if (res.ok) {
        alert(editingProduct ? 'Product updated!' : 'Product added!');
        setProductForm({ name: "", price: "", description: "", category: "", imageURLs: [""] });
        setEditingProduct(null);
        fetchProducts();
      } else {
        alert('Operation failed');
      }
    } catch (error) { console.error('Error:', error); alert('Error occurred'); }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) fetchProducts();
    } catch (error) { console.error('Error deleting product:', error); }
  };

  const startEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      price: product.price,
      description: product.description,
      category: product.category || "",
      imageURLs: product.imageURLs.length > 0 ? product.imageURLs : [""],
    });
    setActiveTab("products");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- Category Handlers ---
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    const url = editingCategory ? `/api/categories/${editingCategory._id}` : '/api/categories';
    const method = editingCategory ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm),
      });

      if (res.ok) {
        setCategoryForm({ name: "" });
        setEditingCategory(null);
        fetchCategories();
      } else {
        const errorData = await res.json();
        alert(`Operation failed: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) { console.error('Error:', error); alert('Error occurred'); }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm("Delete this category?")) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (res.ok) fetchCategories();
    } catch (error) { console.error('Error deleting category:', error); }
  };

  // --- Image Field Handlers ---
  const addImageURLField = () => setProductForm({ ...productForm, imageURLs: [...productForm.imageURLs, ""] });
  const removeImageURLField = (index) => {
    const newURLs = productForm.imageURLs.filter((_, i) => i !== index);
    setProductForm({ ...productForm, imageURLs: newURLs.length > 0 ? newURLs : [""] });
  };
  const updateImageURL = (index, value) => {
    const newURLs = [...productForm.imageURLs];
    newURLs[index] = value;
    setProductForm({ ...productForm, imageURLs: newURLs });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Password"
              required
            />
            <button type="submit" className="w-full py-2 bg-black text-white rounded-lg hover:bg-gray-800">Login</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Logout</button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          {['products', 'categories', 'orders'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium capitalize ${
                activeTab === tab ? 'border-b-2 border-black text-black' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <form onSubmit={handleProductSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Product Name"
                    required
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Price (₹)"
                    required
                  />
                </div>
                
                <select
                  value={productForm.category}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat.slug}>{cat.name}</option>
                  ))}
                </select>

                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Description"
                  required
                />

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Image URLs</label>
                  {productForm.imageURLs.map((url, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => updateImageURL(index, e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                      />
                      {productForm.imageURLs.length > 1 && (
                        <button type="button" onClick={() => removeImageURLField(index)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={addImageURLField} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
                    <Plus className="w-4 h-4" /> Add Another Image URL
                  </button>
                </div>

                <div className="flex gap-2">
                  <button type="submit" className="flex-1 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </button>
                  {editingProduct && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProduct(null);
                        setProductForm({ name: "", price: "", description: "", category: "", imageURLs: [""] });
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">Product List</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Price</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {products.map((product) => (
                      <tr key={product._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{product.name}</td>
                        <td className="px-4 py-3">{product.category}</td>
                        <td className="px-4 py-3">₹{product.price}</td>
                        <td className="px-4 py-3 flex gap-2">
                          <button onClick={() => startEditProduct(product)} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteProduct(product._id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md h-fit">
              <h2 className="text-xl font-bold mb-4">{editingCategory ? 'Edit Category' : 'Add Category'}</h2>
              <form onSubmit={handleCategorySubmit} className="flex gap-2">
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Category Name"
                  required
                />
                <button type="submit" className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
                  {editingCategory ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </button>
                {editingCategory && (
                  <button
                    type="button"
                    onClick={() => { setEditingCategory(null); setCategoryForm({ name: "" }); }}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </form>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">Categories</h2>
              <ul className="space-y-2">
                {categories.map((cat) => (
                  <li key={cat._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{cat.name}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setEditingCategory(cat); setCategoryForm({ name: cat.name }); }}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat._id)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3">Order ID</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs">{order._id.slice(-8)}</td>
                      <td className="px-4 py-3">{order.customerInfo?.name || 'N/A'}</td>
                      <td className="px-4 py-3">₹{order.totalAmount}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'Shipped' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {orders.length === 0 && <div className="text-center py-8 text-gray-500">No orders yet</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
