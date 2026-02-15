import React, { useState, useEffect } from 'react';
import { gearAPI, surfSpotAPI } from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import {
    FiPlus,
    FiEdit2,
    FiTrash2,
    FiX,
    FiPackage,
    FiCheckCircle,
    FiClock,
} from 'react-icons/fi';

const GEAR_TYPES = ['board', 'wetsuit', 'leash', 'fins', 'other'];

const OwnerGears = () => {
    const [gears, setGears] = useState([]);
    const [ownerSpots, setOwnerSpots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingGear, setEditingGear] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        surfSpot: '',
        name: '',
        type: 'board',
        pricePerHour: '',
        quantityAvailable: '',
    });
    const [certificateFile, setCertificateFile] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [gearsRes, spotsRes] = await Promise.all([
                gearAPI.getOwnerGears(),
                surfSpotAPI.getOwnerSpots(),
            ]);
            setGears(gearsRes.data.data);
            setOwnerSpots(spotsRes.data.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setForm({
            surfSpot: '',
            name: '',
            type: 'board',
            pricePerHour: '',
            quantityAvailable: '',
        });
        setCertificateFile(null);
        setEditingGear(null);
    };

    const openAddModal = () => {
        resetForm();
        if (ownerSpots.length > 0) {
            setForm((prev) => ({ ...prev, surfSpot: ownerSpots[0]._id }));
        }
        setShowModal(true);
    };

    const openEditModal = (gear) => {
        setEditingGear(gear);
        setForm({
            surfSpot: gear.surfSpot?._id || gear.surfSpot,
            name: gear.name,
            type: gear.type,
            pricePerHour: gear.pricePerHour,
            quantityAvailable: gear.quantityAvailable,
        });
        setCertificateFile(null);
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

            if (editingGear) {
                // Update
                await gearAPI.update(editingGear._id, {
                    name: form.name,
                    type: form.type,
                    pricePerHour: Number(form.pricePerHour),
                    quantityAvailable: Number(form.quantityAvailable),
                });
                alert('Gear updated successfully');
            } else {
                // Create
                const formData = new FormData();
                formData.append('surfSpot', form.surfSpot);
                formData.append('name', form.name);
                formData.append('type', form.type);
                formData.append('pricePerHour', form.pricePerHour);
                formData.append('quantityAvailable', form.quantityAvailable);
                if (certificateFile) {
                    formData.append('file', certificateFile);
                }
                await gearAPI.create(formData);
                alert('Gear added successfully');
            }

            closeModal();
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to save gear');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (gearId) => {
        if (!window.confirm('Are you sure you want to delete this gear?')) return;
        try {
            await gearAPI.delete(gearId);
            alert('Gear deleted successfully');
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to delete gear');
        }
    };

    const getTypeLabel = (type) => {
        const labels = {
            board: '🏄 Board',
            wetsuit: '🤿 Wetsuit',
            leash: '🔗 Leash',
            fins: '🦈 Fins',
            other: '📦 Other',
        };
        return labels[type] || type;
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
                                    Gear Management
                                </h1>
                                <p className="text-gray-600">
                                    Manage rental gear for your surf spots
                                </p>
                            </div>
                            <button
                                onClick={openAddModal}
                                disabled={ownerSpots.length === 0}
                                className="flex items-center space-x-2 bg-ocean-500 hover:bg-ocean-600 text-white px-5 py-3 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FiPlus className="h-5 w-5" />
                                <span>Add Gear</span>
                            </button>
                        </div>

                        {ownerSpots.length === 0 && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
                                <p className="text-yellow-800 font-medium">
                                    You need to create a surf spot first before you can add gear.
                                </p>
                            </div>
                        )}

                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Total Gear</p>
                                        <p className="text-3xl font-bold text-gray-900">
                                            {gears.length}
                                        </p>
                                    </div>
                                    <div className="bg-blue-100 p-3 rounded-lg">
                                        <FiPackage className="h-6 w-6 text-blue-600" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-md p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Verified</p>
                                        <p className="text-3xl font-bold text-green-600">
                                            {gears.filter((g) => g.isVerified).length}
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
                                            {gears.filter((g) => !g.isVerified).length}
                                        </p>
                                    </div>
                                    <div className="bg-yellow-100 p-3 rounded-lg">
                                        <FiClock className="h-6 w-6 text-yellow-600" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Gear List */}
                        <div className="bg-white rounded-xl shadow-md overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-gray-900">Your Gear</h2>
                            </div>

                            {gears.length === 0 ? (
                                <div className="p-12 text-center">
                                    <FiPackage className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600 text-lg mb-2">No gear added yet</p>
                                    <p className="text-gray-500 text-sm">
                                        Click "Add Gear" to start listing rental equipment
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
                                                    Type
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Surf Spot
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Price/hr
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Qty
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
                                            {gears.map((gear) => (
                                                <tr key={gear._id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-4 text-sm font-medium text-gray-900">
                                                        {gear.name}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-gray-600">
                                                        {getTypeLabel(gear.type)}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-gray-600">
                                                        {gear.surfSpot?.name || 'N/A'}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm font-semibold text-green-600">
                                                        ${gear.pricePerHour}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-gray-900">
                                                        {gear.quantityAvailable}
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <span
                                                            className={`px-2 py-1 rounded-full text-xs font-semibold ${gear.isVerified
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : 'bg-yellow-100 text-yellow-800'
                                                                }`}
                                                        >
                                                            {gear.isVerified ? 'Verified' : 'Pending'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center space-x-2">
                                                            <button
                                                                onClick={() => openEditModal(gear)}
                                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                                title="Edit"
                                                            >
                                                                <FiEdit2 className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(gear._id)}
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
                                {editingGear ? 'Edit Gear' : 'Add New Gear'}
                            </h3>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600 p-1"
                            >
                                <FiX className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            {/* Surf Spot Selector (only for new gear) */}
                            {!editingGear && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Surf Spot *
                                    </label>
                                    <select
                                        name="surfSpot"
                                        value={form.surfSpot}
                                        onChange={handleChange}
                                        required
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                                    >
                                        {ownerSpots.map((spot) => (
                                            <option key={spot._id} value={spot._id}>
                                                {spot.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Gear Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Gear Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. Pro Surfboard 7ft"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                                />
                            </div>

                            {/* Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Type *
                                </label>
                                <select
                                    name="type"
                                    value={form.type}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                                >
                                    {GEAR_TYPES.map((t) => (
                                        <option key={t} value={t}>
                                            {t.charAt(0).toUpperCase() + t.slice(1)}
                                        </option>
                                    ))}
                                </select>
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
                                    placeholder="15.00"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                                />
                            </div>

                            {/* Quantity */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Quantity Available *
                                </label>
                                <input
                                    type="number"
                                    name="quantityAvailable"
                                    value={form.quantityAvailable}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    placeholder="10"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                                />
                            </div>

                            {/* Certificate Upload (only for new gear) */}
                            {!editingGear && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Certificate (optional)
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*,application/pdf"
                                        onChange={(e) => setCertificateFile(e.target.files[0])}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-ocean-50 file:text-ocean-600 hover:file:bg-ocean-100"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Upload a quality or safety certificate (image or PDF, max 5MB)
                                    </p>
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
                                        : editingGear
                                            ? 'Save Changes'
                                            : 'Add Gear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OwnerGears;
