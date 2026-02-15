import React, { useState, useEffect } from 'react';
import { surfSpotAPI } from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import {
    FiPlus,
    FiEdit2,
    FiTrash2,
    FiX,
    FiMapPin,
    FiCheckCircle,
    FiClock,
    FiImage,
} from 'react-icons/fi';

const OwnerSurfSpots = () => {
    const [spots, setSpots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingSpot, setEditingSpot] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [imageFiles, setImageFiles] = useState([]);
    const [form, setForm] = useState({
        name: '',
        description: '',
        pricePerHour: '',
        country: '',
        city: '',
        lat: '',
        lng: '',
    });

    useEffect(() => {
        fetchSpots();
    }, []);

    const fetchSpots = async () => {
        try {
            setLoading(true);
            const res = await surfSpotAPI.getOwnerSpots();
            setSpots(res.data.data);
        } catch (error) {
            console.error('Error fetching surf spots:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setForm({
            name: '',
            description: '',
            pricePerHour: '',
            country: '',
            city: '',
            lat: '',
            lng: '',
        });
        setImageFiles([]);
        setEditingSpot(null);
    };

    const openAddModal = () => {
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (spot) => {
        setEditingSpot(spot);
        setForm({
            name: spot.name,
            description: spot.description,
            pricePerHour: spot.pricePerHour,
            country: spot.location?.country || '',
            city: spot.location?.city || '',
            lat: spot.location?.coordinates?.lat || '',
            lng: spot.location?.coordinates?.lng || '',
        });
        setImageFiles([]);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        resetForm();
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);

            if (editingSpot) {
                // Update — send JSON
                await surfSpotAPI.update(editingSpot._id, {
                    name: form.name,
                    description: form.description,
                    pricePerHour: Number(form.pricePerHour),
                    location: {
                        country: form.country,
                        city: form.city,
                        coordinates: {
                            lat: Number(form.lat),
                            lng: Number(form.lng),
                        },
                    },
                });
                alert('Surf spot updated successfully');
            } else {
                // Create — send FormData (supports image uploads)
                const formData = new FormData();
                formData.append('name', form.name);
                formData.append('description', form.description);
                formData.append('pricePerHour', form.pricePerHour);
                formData.append('location[country]', form.country);
                formData.append('location[city]', form.city);
                formData.append('location[coordinates][lat]', form.lat);
                formData.append('location[coordinates][lng]', form.lng);
                for (const file of imageFiles) {
                    formData.append('files', file);
                }
                await surfSpotAPI.create(formData);
                alert('Surf spot added successfully');
            }

            closeModal();
            fetchSpots();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to save surf spot');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (spotId) => {
        if (!window.confirm('Are you sure you want to delete this surf spot?')) return;
        try {
            await surfSpotAPI.delete(spotId);
            alert('Surf spot deleted successfully');
            fetchSpots();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to delete surf spot');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen">
                <Navbar />
                <div className="flex">
                    <Sidebar role="owner" />
                    <div className="flex-1 flex items-center justify-center min-h-screen">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-500"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="flex flex-1">
                <Sidebar role="owner" />

                <div className="flex-1 p-8">
                    <div className="max-w-6xl mx-auto">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    My Surf Spots
                                </h1>
                                <p className="text-gray-600">
                                    Add and manage your surf spot listings
                                </p>
                            </div>
                            <button
                                onClick={openAddModal}
                                className="flex items-center space-x-2 bg-ocean-500 hover:bg-ocean-600 text-white px-5 py-3 rounded-lg font-medium transition"
                            >
                                <FiPlus className="h-5 w-5" />
                                <span>Add Surf Spot</span>
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Total Spots</p>
                                        <p className="text-3xl font-bold text-gray-900">
                                            {spots.length}
                                        </p>
                                    </div>
                                    <div className="bg-blue-100 p-3 rounded-lg">
                                        <FiMapPin className="h-6 w-6 text-blue-600" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-md p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Verified</p>
                                        <p className="text-3xl font-bold text-green-600">
                                            {spots.filter((s) => s.isVerified).length}
                                        </p>
                                    </div>
                                    <div className="bg-green-100 p-3 rounded-lg">
                                        <FiCheckCircle className="h-6 w-6 text-green-600" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-md p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">
                                            Pending Verification
                                        </p>
                                        <p className="text-3xl font-bold text-yellow-600">
                                            {spots.filter((s) => !s.isVerified).length}
                                        </p>
                                    </div>
                                    <div className="bg-yellow-100 p-3 rounded-lg">
                                        <FiClock className="h-6 w-6 text-yellow-600" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Spot List */}
                        <div className="bg-white rounded-xl shadow-md overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-gray-900">Your Surf Spots</h2>
                            </div>

                            {spots.length === 0 ? (
                                <div className="p-12 text-center">
                                    <FiMapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600 text-lg mb-2">No surf spots added yet</p>
                                    <p className="text-gray-500 text-sm">
                                        Click "Add Surf Spot" to start listing your surf locations
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Name
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Location
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Price/hr
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Rating
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Images
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Status
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {spots.map((spot) => (
                                                <tr key={spot._id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-4 text-sm font-medium text-gray-900">
                                                        {spot.name}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-gray-600">
                                                        {spot.location?.city}, {spot.location?.country}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm font-semibold text-green-600">
                                                        ${spot.pricePerHour}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-gray-600">
                                                        {spot.rating > 0 ? `⭐ ${spot.rating}` : '—'}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-gray-600">
                                                        {spot.images?.length || 0}
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <span
                                                            className={`px-2 py-1 rounded-full text-xs font-semibold ${spot.isVerified
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-yellow-100 text-yellow-800'
                                                                }`}
                                                        >
                                                            {spot.isVerified ? 'Verified' : 'Pending'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center space-x-2">
                                                            <button
                                                                onClick={() => openEditModal(spot)}
                                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                                title="Edit"
                                                            >
                                                                <FiEdit2 className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(spot._id)}
                                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                                title="Delete"
                                                            >
                                                                <FiTrash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h3 className="text-xl font-bold text-gray-900">
                                {editingSpot ? 'Edit Surf Spot' : 'Add New Surf Spot'}
                            </h3>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600 p-1"
                            >
                                <FiX className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            {/* Spot Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Spot Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. Weligama Bay"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description *
                                </label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    required
                                    rows={3}
                                    placeholder="Describe the surf conditions, wave type, best season..."
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent resize-vertical"
                                />
                            </div>

                            {/* Price */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Price Per Hour ($) *
                                </label>
                                <input
                                    type="number"
                                    name="pricePerHour"
                                    value={form.pricePerHour}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    step="0.01"
                                    placeholder="25.00"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                                />
                            </div>

                            {/* Location */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Country *
                                    </label>
                                    <input
                                        type="text"
                                        name="country"
                                        value={form.country}
                                        onChange={handleChange}
                                        required
                                        placeholder="Sri Lanka"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        City *
                                    </label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={form.city}
                                        onChange={handleChange}
                                        required
                                        placeholder="Weligama"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Coordinates */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Latitude *
                                    </label>
                                    <input
                                        type="number"
                                        name="lat"
                                        value={form.lat}
                                        onChange={handleChange}
                                        required
                                        step="any"
                                        min="-90"
                                        max="90"
                                        placeholder="5.9720"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Longitude *
                                    </label>
                                    <input
                                        type="number"
                                        name="lng"
                                        value={form.lng}
                                        onChange={handleChange}
                                        required
                                        step="any"
                                        min="-180"
                                        max="180"
                                        placeholder="80.4297"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Image Upload (only for new spots) */}
                            {!editingSpot && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Images (optional, max 10)
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={(e) => setImageFiles(Array.from(e.target.files))}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-ocean-50 file:text-ocean-600 hover:file:bg-ocean-100"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Upload photos of the surf spot (images only, max 5MB each)
                                    </p>
                                </div>
                            )}

                            {/* Existing images preview during edit */}
                            {editingSpot && editingSpot.images?.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Current Images
                                    </label>
                                    <div className="flex gap-2 flex-wrap">
                                        {editingSpot.images.map((img, idx) => (
                                            <img
                                                key={idx}
                                                src={img}
                                                alt={`Spot image ${idx + 1}`}
                                                className="h-16 w-16 object-cover rounded-lg border border-gray-200"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-5 py-2 bg-ocean-500 hover:bg-ocean-600 text-white rounded-lg font-medium transition disabled:opacity-50"
                                >
                                    {submitting
                                        ? 'Saving...'
                                        : editingSpot
                                            ? 'Save Changes'
                                            : 'Add Surf Spot'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OwnerSurfSpots;
