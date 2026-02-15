import React from 'react';
import { Link } from 'react-router-dom';
import { FiStar, FiMapPin, FiAward, FiArrowRight } from 'react-icons/fi';
import { GiWaves } from 'react-icons/gi';

const Guides = () => {
    const guides = [
        {
            name: 'Kasun Perera',
            image: 'https://i.pravatar.cc/300?img=11',
            location: 'Arugam Bay, Sri Lanka',
            experience: '10+ years',
            rating: 4.9,
            reviews: 128,
            specialties: ['Beginner Lessons', 'Reef Breaks', 'Wave Selection'],
            bio: 'Passionate about sharing the stoke! I specialize in helping beginners catch their first wave and intermediate surfers push their limits.',
        },
        {
            name: 'Amara Silva',
            image: 'https://i.pravatar.cc/300?img=5',
            location: 'Hikkaduwa, Sri Lanka',
            experience: '8 years',
            rating: 4.8,
            reviews: 96,
            specialties: ['Advanced Techniques', 'Barrel Riding', 'Competition Prep'],
            bio: 'Former competitive surfer turned coach. I help surfers of all levels refine their technique and find the perfect waves.',
        },
        {
            name: 'Nuwan Fernando',
            image: 'https://i.pravatar.cc/300?img=12',
            location: 'Mirissa, Sri Lanka',
            experience: '12 years',
            rating: 5.0,
            reviews: 210,
            specialties: ['Longboarding', 'Ocean Safety', 'Surf Photography'],
            bio: 'The ocean is my classroom. With over a decade of experience, I provide safe, fun, and unforgettable surf sessions.',
        },
        {
            name: 'Dilani Rajapaksa',
            image: 'https://i.pravatar.cc/300?img=9',
            location: 'Weligama, Sri Lanka',
            experience: '6 years',
            rating: 4.7,
            reviews: 74,
            specialties: ['Kids Lessons', 'Beach Breaks', 'Yoga & Surf'],
            bio: 'Combining surf and wellness for a holistic ocean experience. Great with kids and beginners looking for a relaxed vibe.',
        },
        {
            name: 'Ruwan Jayawardena',
            image: 'https://i.pravatar.cc/300?img=14',
            location: 'Ahangama, Sri Lanka',
            experience: '9 years',
            rating: 4.9,
            reviews: 152,
            specialties: ['Point Breaks', 'Shortboarding', 'Video Analysis'],
            bio: 'I use video analysis to break down your technique and accelerate your progress. Let\'s get you shredding!',
        },
        {
            name: 'Tharushi De Silva',
            image: 'https://i.pravatar.cc/300?img=16',
            location: 'Unawatuna, Sri Lanka',
            experience: '5 years',
            rating: 4.6,
            reviews: 58,
            specialties: ['Beginner Friendly', 'Sunset Sessions', 'Group Lessons'],
            bio: 'Nothing beats a sunset surf session. I create fun, memorable group experiences for surfers of every skill level.',
        },
    ];

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
                            <h3 className="text-3xl font-bold text-gray-900 mb-1">200+</h3>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {guides.map((guide, index) => (
                            <div
                                key={index}
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
                                        <span className="text-sm font-bold text-gray-900">{guide.rating}</span>
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
                                        to="/"
                                        className="inline-flex items-center space-x-2 text-ocean-600 hover:text-ocean-700 font-semibold text-sm transition"
                                    >
                                        <span>View Profile</span>
                                        <FiArrowRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
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
