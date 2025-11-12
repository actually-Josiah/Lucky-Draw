// components/play/update-profile-modal.tsx - UPDATED

"use client"

import type React from "react"
import { useState, useEffect } from "react" // Added useEffect
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserProfile } from "@/app/home/page" // Import the interface

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface UpdateProfileModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentUser: UserProfile; // Prop to receive current user data
  onSuccess: (updatedFields: {name: string, phone_number: string}) => void; // Callback after successful API update
}

export default function UpdateProfileModal({ open, onOpenChange, currentUser, onSuccess }: UpdateProfileModalProps) {
  const [name, setName] = useState(currentUser.name || "")
  const [phone, setPhone] = useState(currentUser.phone_number || "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Sync internal state with props when modal opens or currentUser changes
  useEffect(() => {
    if (open) {
        setName(currentUser.name || "")
        setPhone(currentUser.phone_number || "")
        setError("")
        setSuccess("")
    }
  }, [open, currentUser])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    const token = localStorage.getItem("supabase.access_token")
    if (!token) {
        setError("User not authenticated. Please log in again.")
        setLoading(false)
        return
    }

    // Only include fields that have changed (optional, but cleaner)
    const updatePayload = {
        name: name.trim(),
        phone_number: phone.trim().replace(/-/g, '') // Clean phone number before sending
    }
    
    try {
        const response = await fetch(`${API_URL}/api/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(updatePayload),
        })

        const data = await response.json()

        if (!response.ok) {
            setError(data.error || "Failed to save profile.")
        } else {
            setSuccess(data.message)
            // Call the success handler to update the parent component's state (PlayPage)
            onSuccess({
                name: data.updatedProfile.name, 
                phone_number: data.updatedProfile.phone_number
            })
            // onOpenChange(false) // The onSuccess callback will eventually close the modal
        }

    } catch (err) {
        setError("Network error: Could not connect to API.")
        console.error(err)
    } finally {
        setLoading(false)
    }
  }

  const formatPhoneNumber = (value: string) => {
    // ... (Your formatting logic remains the same)
    const cleaned = value.replace(/\D/g, "")
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/)
    if (!match) return value
    const [, area, exchange, line] = match
    if (!exchange) return area
    if (!line) return `${area}-${exchange}-${line}`
    return `${area}-${exchange}-${line}`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Profile</DialogTitle>
          <DialogDescription>Update your name and phone number</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              placeholder="Enter your full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formatPhoneNumber(phone)} // Ensure input displays formatted phone
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} // Keep raw number in state
              disabled={loading}
              placeholder="123-456-7890"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm">{success}</p>}

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}