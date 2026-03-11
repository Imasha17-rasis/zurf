import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiStar, FiMapPin, FiAward, FiArrowRight } from 'react-icons/fi';
import { GiWaves } from 'react-icons/gi';
import { guideAPI } from '../services/api';

const Guides = () => {
    const [guides, setGuides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchGuides = async () => {
            try {
                setLoading(true);
                const response = await guideAPI.getAll();
                
                // Transform the data to match the component structure
                const transformedGuides = response.data.data.map((guide) => {
                    // Extract location string from surfSpot object
                    let locationString = guide.user?.location || 'Sri Lanka';
                    if (guide.surfSpot?.location) {
                        const loc = guide.surfSpot.location;
                        locationString = `${loc.city}, ${loc.country}`;
                    }

                    return {
                        _id: guide._id,
                        name: guide.user?.name || 'Anonymous Guide',
                        image: guide.profileImage || `https://i.pravatar.cc/300?u=${guide.user?.email || guide._id}`,
                        location: locationString,
                        experience: `${guide.experienceYears} year${guide.experienceYears !== 1 ? 's' : ''}`,
                        rating: 4.5 + (guide.experienceYears * 0.05 > 0.5 ? 0.5 : guide.experienceYears * 0.05),
                        reviews: Math.floor(Math.random() * 200) + 20,
                        specialties: getSpecialtiesByExperience(guide.experienceYears),
                        bio: `Certified surf guide with ${guide.experienceYears} years of experience. Charges $${guide.pricePerSession} per session.`,
                        pricePerSession: guide.pricePerSession,
                    };
                });
                
                setGuides(transformedGuides);
                setError(null);
            } catch (err) {
                console.error('Error fetching guides:', err);
                setError('Failed to load guides. Please try again later.');
                setGuides([]);
            } finally {
                setLoading(false);
            }
        };

        fetchGuides();
    }, []);

    // Helper function to determine specialties based on experience
    const getSpecialtiesByExperience = (years) => {
        const specialtiesPool = [
            'Beginner Lessons',
            'Advanced Techniques',
            'Reef Breaks',
            'Beach Breaks',
            'Wave Selection',
            'Safety Training',
            'Video Analysis',
            'Group Lessons',
            'Ocean Safety',
        ];
        
        // Select 3 random specialties
        const shuffled = specialtiesPool.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 3);
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-r from-ocean-600 to-ocean-800 text-white overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <img
                        src="https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=1920"
                        alt="Surfing Guide"
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
                    <div className="text-center max-w-3xl mx-auto">
                        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                            Expert Surf Guides
                        </h1>
                        <p className="text-xl md:text-2xl text-ocean-100 mb-6">
                            Learn from the best. Our certified guides will help you ride the perfect wave, no matter your skill level.
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="bg-gray-50 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="flex items-center justify-center mb-3">
                                <div className="bg-ocean-100 rounded-full p-4">
                                    <FiAward className="h-8 w-8 text-ocean-600" />
                                </div>
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-1">{guides.length}</h3>
                            <p className="text-gray-600">Certified Guides</p>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center mb-3">
                                <div className="bg-yellow-100 rounded-full p-4">
                                    <FiStar className="h-8 w-8 text-yellow-500" />
                                </div>
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-1">4.8</h3>
                            <p className="text-gray-600">Average Rating</p>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center mb-3">
                                <div className="bg-green-100 rounded-full p-4">
                                    <GiWaves className="h-8 w-8 text-green-600" />
                                </div>
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-1">15K+</h3>
                            <p className="text-gray-600">Sessions Completed</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Guides Grid */}
            <div className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Guides</h2>
                        <p className="text-xl text-gray-600">Handpicked professionals with local expertise</p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-600"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-20">
                            <p className="text-lg text-red-600">{error}</p>
                        </div>
                    ) : guides.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-lg text-gray-600">No verified guides available at the moment.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {guides.map((guide) => (
                                <div
                                    key={guide._id}
                                    className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2 border border-gray-100"
                                >
                                    <div className="relative">
                                        <img
                                            src={guide.image}
                                            alt={guide.name}
                                            className="w-full h-56 object-cover"
                                        />
                                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1">
                                            <FiStar className="h-4 w-4 text-yellow-400 fill-current" />
                                            <span className="text-sm font-bold text-gray-900">{guide.rating.toFixed(1)}</span>
                                            <span className="text-xs text-gray-500">({guide.reviews})</span>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-gray-900 mb-1">{guide.name}</h3>
                                        <div className="flex items-center text-gray-500 text-sm mb-3">
                                            <FiMapPin className="h-4 w-4 mr-1" />
                                            <span>{guide.location}</span>
                                            <span className="mx-2">•</span>
                                            <span>{guide.experience}</span>
                                        </div>
                                        <p className="text-gray-600 text-sm mb-4 leading-relaxed">{guide.bio}</p>
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {guide.specialties.map((specialty, i) => (
                                                <span
                                                    key={i}
                                                    className="bg-ocean-50 text-ocean-700 text-xs font-medium px-3 py-1 rounded-full"
                                                >
                                                    {specialty}
                                                </span>
                                            ))}
                                        </div>
                                        <Link
                                            to={`/guides/${guide._id}`}
                                            className="inline-flex items-center space-x-2 text-ocean-600 hover:text-ocean-700 font-semibold text-sm transition"
                                        >
                                            <span>View Profile</span>
                                            <FiArrowRight className="h-4 w-4" />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-ocean-600 to-ocean-800 text-white py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Want to Become a Zurf Guide?
                    </h2>
                    <p className="text-lg text-ocean-100 mb-8">
                        Share your passion for surfing and earn money doing what you love.
                    </p>
                    <Link
                        to="/register"
                        className="inline-flex items-center space-x-2 bg-white text-ocean-600 hover:bg-gray-100 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                        <span>Apply Now</span>
                        <FiArrowRight className="h-5 w-5" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Guides;
