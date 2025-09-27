import React, { useState, useEffect } from 'react'
import './index.css'

/**
 * Main Portfolio Application Component
 * 
 * This component manages the entire portfolio website including:
 * - State management for theme (dark/light mode)
 * - Data fetching from backend API
 * - Navigation and smooth scrolling
 * - Responsive design with animations
 */
function App() {
  // State management for theme toggle
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Initialize theme from localStorage or default to light mode
    const savedTheme = localStorage.getItem('theme')
    return savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)
  })

  // State management for data fetching
  const [resumeData, setResumeData] = useState(null)
  const [projectsData, setProjectsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Effect to apply theme to document and persist to localStorage
  useEffect(() => {
    const htmlElement = document.documentElement
    if (isDarkMode) {
      htmlElement.classList.add('dark')
    } else {
      htmlElement.classList.remove('dark')
    }
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])

  // Effect to fetch data from backend API on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch resume and projects data in parallel
        const [resumeResponse, projectsResponse] = await Promise.all([
          fetch('/api/resume'),
          fetch('/api/projects')
        ])

        if (!resumeResponse.ok || !projectsResponse.ok) {
          throw new Error('Failed to fetch data from server')
        }

        const resume = await resumeResponse.json()
        const projects = await projectsResponse.json()
        
        setResumeData(resume)
        setProjectsData(projects)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load portfolio data. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Effect to handle scroll animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
        }
      })
    }, observerOptions)

    // Observe all sections with fade-in-section class
    const sections = document.querySelectorAll('.fade-in-section')
    sections.forEach(section => observer.observe(section))

    return () => observer.disconnect()
  }, [resumeData, projectsData])

  /**
   * Toggle between dark and light mode
   */
  const toggleTheme = () => {
    setIsDarkMode(prev => !prev)
  }

  /**
   * Smooth scroll to a specific section
   * @param {string} sectionId - The ID of the section to scroll to
   */
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  /**
   * Render loading state
   */
  const renderLoadingState = () => (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">Loading...</p>
      </div>
    </div>
  )

  /**
   * Render error state
   */
  const renderErrorState = () => (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
      <div className="text-center">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Oops!</h2>
        <p className="text-gray-600 dark:text-gray-300">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  )

  // Show loading or error states
  if (loading) return renderLoadingState()
  if (error) return renderErrorState()

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-effect">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand */}
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-800 dark:text-white">
                Alex's Portfolio
              </h1>
            </div>
            
            {/* Navigation Links */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <button
                  onClick={() => scrollToSection('home')}
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Home
                </button>
                <button
                  onClick={() => scrollToSection('resume')}
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Resume
                </button>
                <button
                  onClick={() => scrollToSection('projects')}
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Projects
                </button>
              </div>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-800 dark:text-white mb-6 animate-fade-in">
            Welcome to Alex's Portfolio
          </h1>
          <div className="animate-bounce-slow">
            <svg className="w-8 h-8 mx-auto text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* Resume Section */}
      <section id="resume" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="fade-in-section">
            <h2 className="text-4xl font-bold text-center text-gray-800 dark:text-white mb-16">
              My Experience & Education
            </h2>
            
            {/* Experience Section */}
            <div className="mb-16">
              <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-8">Professional Experience</h3>
              <div className="space-y-8">
                {resumeData?.experience?.map((job, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                      <div>
                        <h4 className="text-xl font-semibold text-gray-800 dark:text-white">{job.title}</h4>
                        <p className="text-lg text-blue-600 dark:text-blue-400 font-medium">{job.company}</p>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400 mt-2 md:mt-0">{job.dates}</span>
                    </div>
                    <ul className="space-y-2">
                      {job.description.map((desc, descIndex) => (
                        <li key={descIndex} className="text-gray-600 dark:text-gray-300 flex items-start">
                          <span className="text-blue-500 mr-2 mt-1">•</span>
                          {desc}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Education Section */}
            <div>
              <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-8">Education</h3>
              <div className="space-y-6">
                {resumeData?.education?.map((edu, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                      <div>
                        <h4 className="text-xl font-semibold text-gray-800 dark:text-white">{edu.degree}</h4>
                        <p className="text-lg text-blue-600 dark:text-blue-400 font-medium">{edu.university}</p>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400 mt-2 md:mt-0">{edu.dates}</span>
                    </div>
                    <ul className="space-y-2">
                      {edu.description.map((desc, descIndex) => (
                        <li key={descIndex} className="text-gray-600 dark:text-gray-300 flex items-start">
                          <span className="text-blue-500 mr-2 mt-1">•</span>
                          {desc}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="fade-in-section">
            <h2 className="text-4xl font-bold text-center text-gray-800 dark:text-white mb-16">
              Featured Projects
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projectsData?.map((project, index) => (
                <div key={index} className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">
                    {project.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, techIndex) => (
                      <span 
                        key={techIndex}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 dark:bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2024 Alex's Portfolio. Built with React, FastAPI, and Docker.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App