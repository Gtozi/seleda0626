/**
 * Gallery Module
 * Display photos of rooms, restaurants, spa, facilities, and 360° tours
 */

import { Image, Video, Play } from 'lucide-react';

const GalleryModule: React.FC = () => {
  const galleryCategories = [
    { id: 'rooms', name: 'Rooms', images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304', 'https://images.unsplash.com/photo-1611892440504-42a792e24d32'] },
    { id: 'restaurants', name: 'Restaurants', images: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5'] },
    { id: 'spa', name: 'Spa', images: ['https://images.unsplash.com/photo-1544161515-4ab6ce6db874', 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2'] },
    { id: 'facilities', name: 'Facilities', images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945', 'https://images.unsplash.com/photo-1582719508461-905c673771fd'] }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Photo Gallery</h1>
        <p className="text-lg opacity-90">Explore our properties through stunning imagery</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {galleryCategories.map((category) => (
          <div key={category.id} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4 text-violet-600">
              <Image size={24} />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{category.name}</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {category.images.map((image, idx) => (
                <img key={idx} src={image} alt={category.name} className="w-full h-32 object-cover rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4 text-violet-600">
          <Video size={24} />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">360° Virtual Tours</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((idx) => (
            <div key={idx} className="relative aspect-video bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="bg-white/90 backdrop-blur-sm p-3 rounded-full hover:bg-white transition-colors">
                  <Play size={24} className="text-violet-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GalleryModule;