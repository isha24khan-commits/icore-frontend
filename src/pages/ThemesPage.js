import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getThemes } from '../services/api';
import { Sparkles } from 'lucide-react';

const ThemesPage = () => {
  // state to store all themes fetched from API
  const [themes, setThemes] = useState([]);

  // loading state for UI feedback while fetching data
  const [loading, setLoading] = useState(true);

  // fetch themes once component mounts
  useEffect(() => {
    const fetchThemes = async () => {
      try {
        // API call to get all themes
        const response = await getThemes();

        // store themes into state
        setThemes(response.data);
      } catch (error) {
        // log any API or network errors
        console.error('Error fetching themes:', error);
      } finally {
        // stop loading spinner regardless of success/failure
        setLoading(false);
      }
    };

    fetchThemes();
  }, []);

  // loading UI while API request is in progress
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-amber-200 rounded-full"></div>
          <p className="text-slate-500 font-nunito">Loading themes...</p>
        </div>
      </div>
    );
  }

  // determines layout size for each theme card in bento grid
  const getBentoSize = (index) => {
    const pattern = [
      'md:col-span-2 md:row-span-2', // large tile
      'md:col-span-1 md:row-span-1', // small tile
      'md:col-span-1 md:row-span-1', // small tile
      'md:col-span-2 md:row-span-1', // wide tile
      'md:col-span-1 md:row-span-1', // small tile
      'md:col-span-1 md:row-span-1', // small tile
    ];

    // repeat pattern for all themes
    return pattern[index % pattern.length];
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12" data-testid="themes-page">
      
      {/* page header section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider mb-4">
          <Sparkles size={16} />
          Party Themes
        </div>

        <h1 className="font-fredoka text-4xl sm:text-5xl text-slate-900 mb-4">
          Find Your Perfect{' '}
          <span className="gradient-text">Theme</span>
        </h1>

        <p className="font-nunito text-lg text-slate-600 max-w-2xl mx-auto">
          Choose from our magical collection of birthday party themes. 
          Each theme comes with unique decorations and styling options.
        </p>
      </div>

      {/* bentoo grid layout for themes */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6 auto-rows-[200px] justify-center">
        {themes.map((theme, index) => (
          <Link
            key={theme.theme_id}
            to={`/themes/${theme.theme_id}`}
            className={`${getBentoSize(index)} relative overflow-hidden rounded-3xl group card-hover shadow-md bg-white`}
            data-testid={`theme-card-${theme.theme_id}`}
          >
            {/* theme image */}
            <img
              src={theme.image_url || theme.IMAGE_URL}
              alt={theme.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={(e) => {
                // fallback image if theme image fails to load
                e.target.src = 'https://placehold.co/600x400?text=Theme+Coming+Soon';
              }}
            />

            {/* dark overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

            {/* theme text content */}
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
              <h3 className="font-fredoka text-white text-lg md:text-xl lg:text-2xl leading-tight">
                {theme.name}
              </h3>

              <p className="font-nunito text-white/90 text-sm mt-1 line-clamp-2 hidden md:block">
                {theme.description}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* fallback UI if no themes exist */}
      {themes.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
          <p className="text-slate-400 font-nunito">
            No themes found. Add some in the Admin Dashboard!
          </p>
        </div>
      )}
    </div>
  );
};

export default ThemesPage;