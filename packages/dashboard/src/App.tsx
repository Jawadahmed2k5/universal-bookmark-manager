import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { BookmarkProvider } from './store/BookmarkContext';
import { ThemeProvider } from './store/ThemeContext';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Search from './pages/Search';
import Settings from './pages/Settings';
import Import from './pages/Import';
import Export from './pages/Export';

function App() {
  return (
    <ThemeProvider>
      <BookmarkProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/search" element={<Search />} />
            <Route path="/import" element={<Import />} />
            <Route path="/export" element={<Export />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </BookmarkProvider>
    </ThemeProvider>
  );
}

export default App;