import { Routes, Route } from 'react-router-dom'

import ScrollToTop from './components/ScrollToTop'
import ProtectedRoute from './components/ProtectedRoute'
import PublicLayout from './components/layout/PublicLayout'
import DashboardLayout from './components/layout/DashboardLayout'

// Public pages
import Home from './pages/Home'
import About from './pages/About'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import Blog from './pages/Blog'
import BlogDetail from './pages/BlogDetail'
import Contact from './pages/Contact'
import Login from './pages/Login'
import NotFound from './pages/NotFound'

// Dashboard pages
import Overview from './pages/dashboard/Overview'
import PostsManager from './pages/dashboard/PostsManager'
import PostEditor from './pages/dashboard/PostEditor'
import ProjectsManager from './pages/dashboard/ProjectsManager'
import ProjectEditor from './pages/dashboard/ProjectEditor'
import SkillsManager from './pages/dashboard/SkillsManager'
import ExperienceManager from './pages/dashboard/ExperienceManager'
import EducationManager from './pages/dashboard/EducationManager'
import CommentsManager from './pages/dashboard/CommentsManager'
import MessagesManager from './pages/dashboard/MessagesManager'
import ProfileManager from './pages/dashboard/ProfileManager'

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public site */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:slug" element={<ProjectDetail />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogDetail />} />
          <Route path="/contact" element={<Contact />} />
        </Route>

        {/* Owner sign-in (standalone) */}
        <Route path="/login" element={<Login />} />

        {/* Owner dashboard (protected) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Overview />} />
          <Route path="posts" element={<PostsManager />} />
          <Route path="posts/new" element={<PostEditor />} />
          <Route path="posts/:slug/edit" element={<PostEditor />} />
          <Route path="projects" element={<ProjectsManager />} />
          <Route path="projects/new" element={<ProjectEditor />} />
          <Route path="projects/:slug/edit" element={<ProjectEditor />} />
          <Route path="skills" element={<SkillsManager />} />
          <Route path="experience" element={<ExperienceManager />} />
          <Route path="education" element={<EducationManager />} />
          <Route path="comments" element={<CommentsManager />} />
          <Route path="messages" element={<MessagesManager />} />
          <Route path="profile" element={<ProfileManager />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}
