import React from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiStar, FiDollarSign } from 'react-icons/fi';

const SurfSpotCard = ({ surfSpot }) => {
  const defaultImage = 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=500';

  return (
    <Link 
      to={`/surf-spots/${surfSpot._id}`}
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={surfSpot.images?.[0] || defaultImage}
          alt={surfSpot.name}
          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
        />
        {surfSpot.isVerified && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
            Verified
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
          {surfSpot.name}
        </h3>

        {/* Location */}
        <div className="flex items-center text-gray-600 mb-3">
          <FiMapPin className="h-4 w-4 mr-1" />
          <span className="text-sm">
            {surfSpot.location?.city}, {surfSpot.location?.country}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {surfSpot.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          {/* Rating */}
          <div className="flex items-center">
            <FiStar className="h-4 w-4 text-yellow-400 fill-current mr-1" />
            <span className="text-sm font-semibold text-gray-900">
              {surfSpot.rating?.toFixed(1) || 'New'}
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center text-ocean-600 font-bold">
            <FiDollarSign className="h-4 w-4" />
            <span>{surfSpot.pricePerHour}</span>
            <span className="text-xs text-gray-500 ml-1">/hr</span>
          </div>
        </div>

        {/* Extras Info */}
        <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
          {surfSpot.guides?.length > 0 && (
            <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded">
              {surfSpot.guides.length} Guide{surfSpot.guides.length > 1 ? 's' : ''}
            </span>
          )}
          {surfSpot.gears?.length > 0 && (
            <span className="bg-green-50 text-green-600 px-2 py-1 rounded">
              {surfSpot.gears.length} Gear{surfSpot.gears.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default SurfSpotCard;