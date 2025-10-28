import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useWallet } from '../contexts/WalletContext'
import LoadingSpinner from '../components/LoadingSpinner'

const CreateMarket = () => {
  const navigate = useNavigate()
  const { isConnected } = useWallet()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    question: '',
    outcomes: ['', ''],
    expiryTime: ''
  })

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const addOutcome = () => {
    if (formData.outcomes.length < 10) {
      setFormData({
        ...formData,
        outcomes: [...formData.outcomes, '']
      })
    }
  }

  const removeOutcome = (index) => {
    if (formData.outcomes.length > 2) {
      setFormData({
        ...formData,
        outcomes: formData.outcomes.filter((_, i) => i !== index)
      })
    }
  }

  const updateOutcome = (index, value) => {
    const newOutcomes = [...formData.outcomes]
    newOutcomes[index] = value
    setFormData({
      ...formData,
      outcomes: newOutcomes
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!isConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    // Validation
    if (!formData.question.trim()) {
      toast.error('Please enter a market question')
      return
    }

    const validOutcomes = formData.outcomes.filter(outcome => outcome.trim())
    if (validOutcomes.length < 2) {
      toast.error('Please provide at least 2 outcomes')
      return
    }

    if (!formData.expiryTime) {
      toast.error('Please set an expiry time')
      return
    }

    const expiryDate = new Date(formData.expiryTime)
    if (expiryDate <= new Date()) {
      toast.error('Expiry time must be in the future')
      return
    }

    setLoading(true)

    try {
      const response = await axios.post('/api/markets', {
        question: formData.question.trim(),
        outcomes: validOutcomes,
        expiryTime: expiryDate.toISOString()
      })

      toast.success('Market created successfully!')
      navigate(`/market/${response.data.id}`)
    } catch (error) {
      console.error('Failed to create market:', error)
      toast.error(error.response?.data?.error || 'Failed to create market')
    } finally {
      setLoading(false)
    }
  }

  const getMinDateTime = () => {
    const now = new Date()
    now.setMinutes(now.getMinutes() + 5) // Minimum 5 minutes from now
    return now.toISOString().slice(0, 16)
  }

  const presetQuestions = [
    "Will Bitcoin reach $100,000 by the end of this year?",
    "Will it rain tomorrow in New York?",
    "Will the next coin flip be heads?",
    "Will Team A win the next match?"
  ]

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <h1 className="text-3xl font-bold gradient-text mb-6">Create New Market</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Market Question */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Market Question *
            </label>
            <textarea
              name="question"
              value={formData.question}
              onChange={handleInputChange}
              placeholder="What do you want people to predict?"
              rows={3}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-neon-blue resize-none"
              disabled={loading}
            />
            
            {/* Preset Questions */}
            <div className="mt-2">
              <div className="text-xs text-gray-400 mb-2">Quick examples:</div>
              <div className="flex flex-wrap gap-2">
                {presetQuestions.map((question, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setFormData({ ...formData, question })}
                    className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-2 py-1 rounded transition-colors"
                    disabled={loading}
                  >
                    {question.length > 40 ? question.slice(0, 40) + '...' : question}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Outcomes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Possible Outcomes * (2-10 outcomes)
            </label>
            <div className="space-y-3">
              {formData.outcomes.map((outcome, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={outcome}
                      onChange={(e) => updateOutcome(index, e.target.value)}
                      placeholder={`Outcome ${index + 1}`}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-neon-blue"
                      disabled={loading}
                    />
                  </div>
                  {formData.outcomes.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOutcome(index)}
                      className="text-red-400 hover:text-red-300 p-1"
                      disabled={loading}
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            {formData.outcomes.length < 10 && (
              <button
                type="button"
                onClick={addOutcome}
                className="mt-3 flex items-center space-x-2 text-neon-blue hover:text-neon-purple transition-colors"
                disabled={loading}
              >
                <PlusIcon className="w-4 h-4" />
                <span className="text-sm">Add Outcome</span>
              </button>
            )}
          </div>

          {/* Expiry Time */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Market Expiry Time *
            </label>
            <input
              type="datetime-local"
              name="expiryTime"
              value={formData.expiryTime}
              onChange={handleInputChange}
              min={getMinDateTime()}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neon-blue"
              disabled={loading}
            />
            <div className="text-xs text-gray-400 mt-1">
              Market will automatically resolve at this time if not manually resolved
            </div>
          </div>

          {/* Quick Time Presets */}
          <div>
            <div className="text-sm text-gray-400 mb-2">Quick presets:</div>
            <div className="flex flex-wrap gap-2">
              {[
                { label: '5 min', minutes: 5 },
                { label: '15 min', minutes: 15 },
                { label: '1 hour', minutes: 60 },
                { label: '24 hours', minutes: 1440 }
              ].map(({ label, minutes }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    const date = new Date()
                    date.setMinutes(date.getMinutes() + minutes)
                    setFormData({
                      ...formData,
                      expiryTime: date.toISOString().slice(0, 16)
                    })
                  }}
                  className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1 rounded transition-colors"
                  disabled={loading}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 btn-secondary py-3"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !isConnected}
              className="flex-1 btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Creating...</span>
                </>
              ) : (
                'Create Market'
              )}
            </button>
          </div>

          {!isConnected && (
            <div className="text-center text-yellow-400 text-sm">
              Please connect your wallet to create a market
            </div>
          )}
        </form>
      </motion.div>
    </div>
  )
}

export default CreateMarket