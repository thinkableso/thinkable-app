'use client'

// Hook to manage user preferences stored in Supabase profiles.metadata
import { useState, useEffect, useCallback } from 'react'
import { SupabaseClient } from '@supabase/supabase-js'

type PreferenceMode = 'shown' | 'hidden' | 'hover'

interface UserPreferences {
  [key: string]: PreferenceMode
}

export function useUserPreference(
  supabase: SupabaseClient,
  key: string,
  defaultValue: PreferenceMode = 'shown' // Default to 'shown' as per request
) {
  const [mode, setMode] = useState<PreferenceMode>(defaultValue)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Load preference from Supabase
  useEffect(() => {
    const loadPreference = async () => {
      setIsLoading(true)
      try {
        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
          // Not authenticated, use default value
          setMode(defaultValue)
          setIsLoading(false)
          return
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('metadata')
          .eq('id', user.id)
          .single()

        if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
          console.error('Error loading user preferences:', error)
        }

        if (data?.metadata && typeof data.metadata === 'object' && data.metadata[key]) {
          setMode(data.metadata[key] as PreferenceMode)
        } else {
          setMode(defaultValue) // Set default if not found
        }
      } catch (err) {
        console.error('Unexpected error loading user preferences:', err)
        setMode(defaultValue) // Fallback to default on error
      } finally {
        setIsLoading(false)
      }
    }

    loadPreference()
  }, [supabase, key, defaultValue])

  // Save preference to Supabase
  const savePreference = useCallback(async (newMode: PreferenceMode) => {
    setIsSaving(true)
    try {
      // Get authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        // Not authenticated, just update local state
        setMode(newMode)
        setIsSaving(false)
        return
      }

      // Fetch current metadata to merge
      const { data: currentProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('metadata')
        .eq('id', user.id)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching current metadata for saving preference:', fetchError)
        setIsSaving(false)
        return
      }

      const currentMetadata = (currentProfile?.metadata || {}) as UserPreferences
      const updatedMetadata = { ...currentMetadata, [key]: newMode }

      const { error } = await supabase
        .from('profiles')
        .update({ metadata: updatedMetadata })
        .eq('id', user.id)

      if (error) {
        console.error('Error saving user preference:', error)
      } else {
        setMode(newMode)
      }
    } catch (err) {
      console.error('Unexpected error saving user preference:', err)
    } finally {
      setIsSaving(false)
    }
  }, [supabase, key])

  return { mode, setMode: savePreference, isLoading, isSaving }
}


