import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
};

const DetailMovie = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/movie/${id}`, API_OPTIONS);
        const data = await res.json();

        const videoRes = await fetch(`${API_BASE_URL}/movie/${id}/videos`, API_OPTIONS);
        const videoData = await videoRes.json();
        const trailer = videoData.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');

        setMovie({
          title: data.title,
          vote_average: data.vote_average,
          release_date: data.release_date,
          runtime: data.runtime,
          poster: `https://image.tmdb.org/t/p/w500${data.poster_path}`,
          backdrop: `https://image.tmdb.org/t/p/original${data.backdrop_path}`,
          overview: data.overview,
          genres: data.genres.map(g => g.name),
          countries: data.production_countries.map(c => c.name),
          status: data.status,
          languages: data.spoken_languages.map(l => l.english_name),
          budget: data.budget,
          revenue: data.revenue,
          tagline: data.tagline || '—',
          homepage: data.homepage,
          production_companies: data.production_companies.map(p => p.name),
          trailer_url: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null
        });
      } catch {
        setError('Could not load movie details');
      }
    };

    fetchMovie();
  }, [id]);

  if (error) return <p className="p-6 text-red-500">{error}</p>;
  if (!movie) return <p className="p-6 text-white">Loading...</p>;

  return (
    <div className='pattern'>
      <div className="bg-[#0f0f1b] shadow-lg drop-shadow-[0_0_20px_rgba(168,85,247,0.6)] mx-auto mt-8 mb-5 px-6 py-8 rounded-xl max-w-6xl min-h-screen text-white">
        <Link to="/" className="block mb-4 text-white text-base">← Back</Link>

        {/* Movie Name */}
        <p className="mb-1 font-bold text-4xl">
          {movie.title} &nbsp;
          <span className="text-yellow-400 text-lg">⭐ {movie.vote_average?.toFixed(1) || 'N/A'}/10</span>
        </p>
        <p className="mt-3 mb-6 text-[16px] text-gray-400">
          {movie.release_date?.split('-')[0]} • PG-13 • {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
        </p>
        

        {/* Poster + Backdrop */}
        <div className="flex md:flex-row flex-col gap-6">
          <img src={movie.poster} alt={movie.title} className="shadow-md rounded-lg w-full md:w-1/3" />

          <div className="relative rounded-lg w-full md:w-2/3 overflow-hidden">
            {movie.trailer_url ? (
              <iframe
                className="rounded-lg w-full aspect-video"
                src={movie.trailer_url.replace("watch?v=", "embed/")}
                title={`${movie.title} Trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="bg-gray-800 py-10 rounded-lg text-white text-center">
                No trailer available
              </div>
            )}

          </div>
        </div>

        {/* Genres */}
        <div className="flex flex-wrap gap-2 mt-6">
          {movie.genres.map((genre, index) => (
            <span key={index} className="bg-purple-700 px-3 py-1 rounded-full text-base">
              {genre}
            </span>
          ))}
        </div>

        {/* Overview */}
        <p className="mt-4 text-gray-300 text-lg leading-relaxed">{movie.overview}</p>

        {/* Info grid */}
        <div className="gap-6 grid md:grid-cols-2 mt-6 text-[18px]">
          <div>
            <p><strong>Release Date:</strong><span className='px-2 text-base'>{movie.release_date}</span> </p>
            <p><strong>Countries:</strong> <span className='px-2 text-base'>{movie.countries.join(', ')}</span></p>
            <p><strong>Status:</strong> <span className='px-2 text-base'>{movie.status}</span></p>
            <p><strong>Languages:</strong> <span className='px-2 text-base'>{movie.languages.join(', ')}</span></p>
          </div>
          <div>
            <p><strong>Budget:</strong> <span className='px-2 text-base'>${movie.budget.toLocaleString()}</span></p>
            <p><strong>Revenue:</strong> <span className='px-2 text-base'>${movie.revenue.toLocaleString()}</span></p>
            <p><strong>Tagline:</strong> <span className='px-2 text-base'>{movie.tagline}</span></p>
            <p><strong>Production:</strong> <span className='px-2 text-base'>{movie.production_companies.join(', ')}</span></p>
          </div>
        </div>

        {/* Visit Homepage */}
        {movie.homepage && (
          <a
            href={movie.homepage}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-purple-600 hover:bg-purple-700 mt-8 px-5 py-2 rounded text-white"
          >
            Visit Homepage →
          </a>
        )}
      </div>
    </div>
  );
};

export default DetailMovie;
