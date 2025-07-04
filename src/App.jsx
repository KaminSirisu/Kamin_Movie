import {React, useEffect, useState} from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Link } from 'react-router-dom';
import Search from './component/search'
import Spinner from './component/Spinner';
import MovieCard from './component/MovieCard';
import { useDebounce } from 'react-use';
import { getTrendingMovies, updateSearchCount } from './appwrite.js';
import DetailMovie from './component/DetailMovie.jsx';

const API_BASE_URL = 'https://api.themoviedb.org/3';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [movieList, setMovieList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debounceSearchTerm, setDebounceSearchTerm] = useState('');
  const [trendingMovies, setTrendingMovies] = useState([]);

  // Delay request API when search (600ms)
  useDebounce(() => setDebounceSearchTerm(searchTerm), 600, [searchTerm])

  const fetchMovies = async (query = '') => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const endpoint = query
      ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
      : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

      const response = await fetch(endpoint, API_OPTIONS);
      if (!response.ok) {
        throw new Error('Failed to fetch movies');
      }

      const data = await response.json();

      if (data.Response === 'False') {
        setErrorMessage(data.Error || "Failed to fetch movies");
      }

      setMovieList(data.results || []);
      
      if (query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }
      
    } catch (error) {
      console.error(`Error fetching movies: ${error}`)
      setErrorMessage('Error fetching movies. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }
  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();

      setTrendingMovies(movies);
      console.log(movies)
    } catch (error) {
      console.error(`Error fetching movies: ${error}`)
    }
  }

  // It will fetch when searchTerm changed.
  useEffect(() => {
    fetchMovies(debounceSearchTerm);
  }, [debounceSearchTerm])

  useEffect(() => {
    loadTrendingMovies();
  }, [])

  console.log(trendingMovies);
 
  return (
    <main>
      <div className='pattern' />
      <div className='wrapper'>
        <header>
          <img src="./hero.png" alt="hero banner"/>
          <h1>Find <span className='text-gradient'>Movies</span> You'll Enjoy Without the Hassle</h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {trendingMovies.length > 0 && (
          <section className='trending'>
            <h2>Trending Movies</h2>

            <ul>
              {trendingMovies.map((movie, index) => (
                <Link to={`/movie/${movie.movie_id}`}>
                  <li key={movie.$id} className='hover:scale-110 transition cursor-pointer'>
                    <p>{index + 1}</p>
                    <img src={movie.poster_url} alt={movie.title}/>
                  </li>
                </Link>
              ))}
            </ul>
          </section>
        )}

        <section className='all-movies'>
          <h2>All Movies</h2>
          {isLoading ? (
            <Spinner />
          ): errorMessage ? (
            <p className='text-red-500'>{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map((movie) => (
                <Link to={`/movie/${movie.id}`} key={movie.id} >
                  <MovieCard movie={movie}/>
                </Link>
              ))}
            </ul>
          )}
          {errorMessage && <p className='text-red-500'>{errorMessage}</p>}
        </section>

        

      </div>
      <div className='mb-3 font-sans font-semibold text-[18px] text-white text-center'>
        <p>Contact: Kaminsirisu@gmail.com</p>
      </div>
      
    </main>
  )
}

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movie/:id" element={<DetailMovie />} />
      </Routes>
    </Router>
  );
};

export default App