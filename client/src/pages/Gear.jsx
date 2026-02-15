import React from 'react';
import { Link } from 'react-router-dom';
import { FiShield, FiCheckCircle, FiArrowRight, FiStar } from 'react-icons/fi';
import { GiWaves } from 'react-icons/gi';

const Gear = () => {
    const gearCategories = [
        {
            title: 'Surfboards',
            image: 'https://images.unsplash.com/photo-1531722569936-825d3dd8e588?w=800',
            description: 'From beginner foam boards to pro-level shortboards. We have the perfect board for every wave and skill level.',
            items: ['Longboards', 'Shortboards', 'Funboards', 'Fish Boards'],
            priceRange: 'From $15/day',
        },
        {
            title: 'Wetsuits',
            image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
            description: 'Premium wetsuits in all sizes to keep you warm and comfortable in any water temperature.',
            items: ['Full Suits', 'Spring Suits', 'Rash Guards', 'Booties'],
            priceRange: 'From $10/day',
        },
        {
            title: 'Accessories',
            image: 'https://images.unsplash.com/photo-1455729552457-5c322b29c789?w=800',
            description: 'Everything else you need for the perfect surf session, from leashes to board wax.',
            items: ['Leashes', 'Fins', 'Board Wax', 'Surf Racks'],
            priceRange: 'From $5/day',
        },
        {
            title: 'Safety Gear',
            image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800',
            description: 'Stay safe out there with our top-quality safety equipment for all conditions.',
            items: ['Helmets', 'Impact Vests', 'First Aid Kits', 'Reef Booties'],
            priceRange: 'From $8/day',
        },
    ];

    const features = [
        {
            icon: <FiCheckCircle className="h-6 w-6" />,
            title: 'Premium Quality',
            description: 'All gear is top-brand and regularly maintained for the best experience.',
        },
        {
            icon: <FiShield className="h-6 w-6" />,
            title: 'Sanitized & Safe',
            description: 'Every item is thoroughly cleaned and inspected between rentals.',
        },
        {
            icon: <GiWaves className="h-6 w-6" />,
            title: 'Expert Fitting',
            description: 'Our staff helps you pick the right gear for your size and skill level.',
        },
        {
            icon: <FiStar className="h-6 w-6" />,
            title: 'Damage Protection',
            description: 'Affordable protection plans so you can surf worry-free.',
        },
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-r from-ocean-600 to-ocean-800 text-white overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <img
                        src="https://images.unsplash.com/photo-1531722569936-825d3dd8e588?w=1920"
                        alt="Surf Gear"
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
                    <div className="text-center max-w-3xl mx-auto">
                        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                            Premium Surf Gear
                        </h1>
                        <p className="text-xl md:text-2xl text-ocean-100 mb-6">
                            Rent top-quality boards, wetsuits, and accessories. Everything you need for the ultimate surf session.
                        </p>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="bg-gray-50 py-14">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className="text-center">
                                <div className="flex items-center justify-center mb-4">
                                    <div className="bg-ocean-100 rounded-full p-4 text-ocean-600">
                                        {feature.icon}
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                                <p className="text-gray-600 text-sm">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Gear Categories */}
            <div className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Browse Gear</h2>
                        <p className="text-xl text-gray-600">Everything you need, ready to rent</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {gearCategories.map((category, index) => (
                            <div
                                key={index}
                                className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2"
                            >
                                <div className="relative h-72">
                                    <img
                                        src={category.image}
                                        alt={category.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-2xl font-bold">{category.title}</h3>
                                            <span className="bg-ocean-500/90 backdrop-blur-sm text-white text-sm font-semibold px-3 py-1 rounded-full">
                                                {category.priceRange}
                                            </span>
                                        </div>
                                        <p className="text-gray-200 text-sm mb-3">{category.description}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {category.items.map((item, i) => (
                                                <span
                                                    key={i}
                                                    className="bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full"
                                                >
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* How Rental Works */}
            <div className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">How Gear Rental Works</h2>
                        <p className="text-xl text-gray-600">Simple, fast, and hassle-free</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="text-center">
                            <div className="relative inline-block mb-6">
                                <div className="bg-ocean-500 text-white rounded-full w-20 h-20 flex items-center justify-center text-3xl font-bold shadow-lg">
                                    1
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Choose Your Gear</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Browse our collection and select the gear that matches your skill level and the conditions.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="relative inline-block mb-6">
                                <div className="bg-ocean-500 text-white rounded-full w-20 h-20 flex items-center justify-center text-3xl font-bold shadow-lg">
                                    2
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Add to Booking</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Bundle gear with your surf spot booking for the best rates, or rent standalone.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="relative inline-block mb-6">
                                <div className="bg-ocean-500 text-white rounded-full w-20 h-20 flex items-center justify-center text-3xl font-bold shadow-lg">
                                    3
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Pick Up & Surf</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Collect your gear at the spot, get fitted by our staff, and hit the waves!
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-ocean-600 to-ocean-800 text-white py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Ready to Gear Up?
                    </h2>
                    <p className="text-lg text-ocean-100 mb-8">
                        Book a surf spot and add gear to your session for the complete experience.
                    </p>
                    <Link
                        to="/"
                        className="inline-flex items-center space-x-2 bg-white text-ocean-600 hover:bg-gray-100 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                        <span>Browse Surf Spots</span>
                        <FiArrowRight className="h-5 w-5" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Gear;
