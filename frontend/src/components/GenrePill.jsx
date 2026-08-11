import React from 'react';
import { Link } from 'react-router-dom';

const GenrePill = ({ genre, clickable = true }) => {
  if (!genre) return null;

  const name = typeof genre === 'string' ? genre : (genre.name || 'Genre');
  const slug = (typeof genre === 'object' && genre.slug) 
    ? genre.slug 
    : name.toLowerCase().replace(/\s+/g, '-');

  const content = (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-800/80 text-slate-300 border border-slate-700/60 hover:border-purple-500/60 hover:text-purple-300 transition-all backdrop-blur-sm shadow-sm">
      {name}
    </span>
  );

  if (clickable && slug) {
    return <Link to={`/genres?genre=${slug}`}>{content}</Link>;
  }

  return content;
};

export default GenrePill;
