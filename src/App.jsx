import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SiteProvider } from './lib/store.jsx';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Projects from './pages/Projects.jsx';
import ProjectDetail from './pages/ProjectDetail.jsx';
import About from './pages/About.jsx';
import Login from './admin/Login.jsx';
import ProtectedRoute from './admin/ProtectedRoute.jsx';

const AdminLayout = lazy(() => import('./admin/AdminLayout.jsx'));
const Dashboard = lazy(() => import('./admin/Dashboard.jsx'));
const ProjectsAdmin = lazy(() => import('./admin/ProjectsAdmin.jsx'));
const ProjectEditor = lazy(() => import('./admin/ProjectEditor.jsx'));
const CategoriesAdmin = lazy(() => import('./admin/CategoriesAdmin.jsx'));
const FeaturedAdmin = lazy(() => import('./admin/FeaturedAdmin.jsx'));
const AboutAdmin = lazy(() => import('./admin/AboutAdmin.jsx'));

function PublicShell({ children }) {
  return (
    <>
      <Header />
      <main className="wrap">{children}</main>
      <Footer />
    </>
  );
}

const AdminSuspense = ({ children }) => (
  <Suspense fallback={<main className="wrap"><p>Loading admin…</p></main>}>{children}</Suspense>
);

export default function App() {
  return (
    <SiteProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PublicShell><Home /></PublicShell>} />
          <Route path="/projects" element={<PublicShell><Projects /></PublicShell>} />
          <Route path="/p/:slug" element={<PublicShell><ProjectDetail /></PublicShell>} />
          <Route path="/info" element={<PublicShell><About /></PublicShell>} />
          <Route path="/admin/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminSuspense><AdminLayout /></AdminSuspense>}>
              <Route path="/admin" element={<AdminSuspense><Dashboard /></AdminSuspense>} />
              <Route path="/admin/projects" element={<AdminSuspense><ProjectsAdmin /></AdminSuspense>} />
              <Route path="/admin/projects/:id" element={<AdminSuspense><ProjectEditor /></AdminSuspense>} />
              <Route path="/admin/categories" element={<AdminSuspense><CategoriesAdmin /></AdminSuspense>} />
              <Route path="/admin/featured" element={<AdminSuspense><FeaturedAdmin /></AdminSuspense>} />
              <Route path="/admin/about" element={<AdminSuspense><AboutAdmin /></AdminSuspense>} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </SiteProvider>
  );
}
