'use client'

import { useState } from 'react'

export function OddsRefreshPanel() {
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: ''
  })

  const handleRefresh = async () => {
    setIsLoading(true)
    setStatus({ type: null, message: '' })

    try {
      const response = await fetch('/api/betting/scrape', {
        method: 'POST'
      })

      const data = await response.json()

      if (data.success) {
        setStatus({
          type: 'success',
          message: 'Données Pinnacle mises à jour avec succès'
        })
        // Reload the page to fetch fresh data
        setTimeout(() => window.location.reload(), 1500)
      } else {
        setStatus({
          type: 'error',
          message: data.error || 'Erreur lors du scraping'
        })
      }
    } catch (error: any) {
      setStatus({
        type: 'error',
        message: error.message || 'Erreur de connexion'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            Actualiser les données Pinnacle
          </h2>
          <p className="text-sm text-gray-600">
            Lance le scraper Python pour récupérer les dernières cotes
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            isLoading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Scraping...
            </span>
          ) : (
            'Actualiser'
          )}
        </button>
      </div>

      {status.type && (
        <div
          className={`mt-4 p-4 rounded-lg ${
            status.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <p className="text-sm font-medium">{status.message}</p>
        </div>
      )}
    </div>
  )
}
