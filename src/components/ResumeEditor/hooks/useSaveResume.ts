import { db, Resume } from '@/localforage'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

interface SaveResumeOptions {
	resume: Resume
	// Callback for when save is successful
	onSaveSuccess: (updatedResume: Resume) => void
}

export function useSaveResume({ resume, onSaveSuccess }: SaveResumeOptions) {
	const [isSaving, setIsSaving] = useState(false)
	const [isDirty, setIsDirty] = useState(false)
	const [lastSaved, setLastSaved] = useState<Date | null>(null)

	const baselineRef = useRef(resume)

	// Update baseline when resume changes (new resume loaded)
	useEffect(() => {
		if (resume.id !== baselineRef.current.id) {
			console.log('Resume ID changed, updating baseline')
			baselineRef.current = resume
			setIsDirty(false)
			setLastSaved(null)
		}
	}, [resume])

	// Check for changes against specific fields
	useEffect(() => {
		console.log('Checking for changes...')
		console.log('Baseline title:', baselineRef.current.title)
		console.log('Current title:', resume.title)
		console.log('Baseline markdown length:', baselineRef.current.markdown?.length)
		console.log('Current markdown length:', resume.markdown?.length)

		const hasChanges =
			baselineRef.current.title !== resume.title ||
			baselineRef.current.markdown !== resume.markdown ||
			baselineRef.current.css !== resume.css ||
			baselineRef.current.styles !== resume.styles

		console.log('Has changes:', hasChanges)
		setIsDirty(hasChanges)
	}, [resume, resume.title, resume.markdown, resume.css, resume.styles])

	// Save function
	const save = useCallback(async () => {
		if (isSaving || !resume.id) return

		try {
			setIsSaving(true)

			const result = await db.resumes.update(resume.id, {
				title: resume.title,
				markdown: resume.markdown,
				css: resume.css,
				styles: resume.styles,
			})
			if (!result) {
				throw new Error('Failed to save resume')
			}

			const current_version = await db.resumeVersions.getLatestVersion(result.id)

			await db.resumeVersions.create({
				resumeId: result.id,
				title: `${result.title} Version: ${current_version + 1}`,
				version: current_version + 1,
				markdown: result.markdown,
				css: result.css,
				styles: result.styles,
			})

			// Update baseline with the actual saved result
			baselineRef.current = result

			setIsDirty(false)
			setLastSaved(new Date())

			// Call onSaveSuccess callback with the updated resume
			onSaveSuccess(result)

			toast.success('Resume saved successfully')
			return result
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to save resume'
			toast.error(errorMessage)
			throw error
		} finally {
			setIsSaving(false)
		}
	}, [resume, isSaving, onSaveSuccess])

	return {
		isSaving,
		isDirty,
		lastSaved,
		save,
	}
}
