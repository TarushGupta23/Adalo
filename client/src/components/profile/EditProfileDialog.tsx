// src/components/profile/EditProfileDialog.jsx

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// If you're using react-query or a similar library for mutations,
// you'll need to pass the mutation status (isPending, etc.) as a prop.
// For now, I'll add a placeholder type for it.
type UpdateProfileMutationStatus = {
  isPending: boolean; // Renamed from isLoading, common in modern React Query
  // Add other properties like isError, isSuccess, error if you use them
};

type EditProfileDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: {
    id: number; // Assuming profile always has an ID
    fullName?: string;
    bio?: string;
    company?: string;
    location?: string;
    website?: string;
    phone?: string;
    headquarters?: string;
    showroom1?: string;
    showroom2?: string;
    instagram?: string;
    facebook?: string;
    pinterest?: string;
    logoImage?: string;
    coverImage?: string;
    resume?: string; // This will now typically be a URL to the resume
    createdAt?: string | Date; // Add createdAt to type, as it might be in 'profile'
    updatedAt?: string | Date; // Add updatedAt to type
    [key: string]: any; // Allow for other properties
  };
  onSave: (updatedProfile: FormData) => void; // Change type to FormData
  // Pass the mutation status from parent if using react-query for saving
  updateProfileMutation?: UpdateProfileMutationStatus;
};

export function EditProfileDialog({
  open,
  onOpenChange,
  profile,
  onSave,
  updateProfileMutation,
}: EditProfileDialogProps) {
  const [profileFormData, setProfileFormData] = useState({
    fullName: '',
    bio: '',
    company: '',
    location: '',
    website: '',
    phone: '',
    headquarters: '',
    showroom1: '',
    showroom2: '',
    instagram: '',
    facebook: '',
    pinterest: '',
    logoImage: '',
    coverImage: '',
    resume: '', 
  });

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [currentResumeUrl, setCurrentResumeUrl] = useState<string>(''); // To display current resume URL if exists

  // Use useEffect to populate the form fields when the dialog opens or profile data changes
  useEffect(() => {
    if (profile) {
      setProfileFormData({
        fullName: profile.fullName || '',
        bio: profile.bio || '',
        company: profile.company || '',
        location: profile.location || '',
        website: profile.website || '',
        phone: profile.phone || '',
        headquarters: profile.headquarters || '',
        showroom1: profile.showroom1 || '',
        showroom2: profile.showroom2 || '',
        instagram: profile.instagram || '',
        facebook: profile.facebook || '',
        pinterest: profile.pinterest || '',
        logoImage: profile.logoImage || '',
        coverImage: profile.coverImage || '',
        resume: profile.resume || '', // Initialize resume field
      });
      setCurrentResumeUrl(profile.resume || ''); // Set the current resume URL
      setResumeFile(null); // Clear any previously selected file when profile changes
    }
  }, [profile]); // Re-run effect when the 'profile' prop changes

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    } else {
      setResumeFile(null);
    }
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission

    const formData = new FormData();
    formData.append('id', profile.id.toString()); // Always send ID for updates

    // Append all other form data fields
    Object.entries(profileFormData).forEach(([key, value]) => {
      formData.append(key, value);
    });

    // Append the resume file if it exists
    if (resumeFile) {
      formData.append('resume', resumeFile);
    } else if (currentResumeUrl && !resumeFile) {
      // If there's a current resume URL but no new file selected,
      // you might want to send the existing URL or a flag to keep it.
      // This depends on your backend's API. For simplicity, we'll
      // assume if no new file, the backend keeps the old one unless explicitly told to remove it.
      // Or you can send the current URL if your backend expects it.
      formData.append('resumeUrl', currentResumeUrl); // Example: send current URL
    }


    onSave(formData); // Call the onSave function passed from the parent
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleProfileSubmit}>
          <div className="space-y-6 py-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={profileFormData.fullName}
                    onChange={(e) => setProfileFormData({ ...profileFormData, fullName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={profileFormData.company}
                    onChange={(e) => setProfileFormData({ ...profileFormData, company: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profileFormData.bio}
                  onChange={(e) => setProfileFormData({ ...profileFormData, bio: e.target.value })}
                  placeholder="Tell us about your expertise and experience"
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={profileFormData.location}
                  onChange={(e) => setProfileFormData({ ...profileFormData, location: e.target.value })}
                  placeholder="e.g. New York, NY"
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Contact Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={profileFormData.website}
                    onChange={(e) => setProfileFormData({ ...profileFormData, website: e.target.value })}
                    placeholder="https://www.example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={profileFormData.phone}
                    onChange={(e) => setProfileFormData({ ...profileFormData, phone: e.target.value })}
                    placeholder="+1 (555) 555-5555"
                  />
                </div>
              </div>
            </div>

            {/* Addresses */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Addresses</h3>
              <div className="space-y-2">
                <Label htmlFor="headquarters">Main Address</Label>
                <Input
                  id="headquarters"
                  value={profileFormData.headquarters}
                  onChange={(e) => setProfileFormData({ ...profileFormData, headquarters: e.target.value })}
                  placeholder="e.g. Milan, Italy"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="showroom1">Additional Address 1</Label>
                  <Input
                    id="showroom1"
                    value={profileFormData.showroom1}
                    onChange={(e) => setProfileFormData({ ...profileFormData, showroom1: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="showroom2">Additional Address 2</Label>
                  <Input
                    id="showroom2"
                    value={profileFormData.showroom2}
                    onChange={(e) => setProfileFormData({ ...profileFormData, showroom2: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Social Media</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={profileFormData.instagram}
                    onChange={(e) => setProfileFormData({ ...profileFormData, instagram: e.target.value })}
                    placeholder="@username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    value={profileFormData.facebook}
                    onChange={(e) => setProfileFormData({ ...profileFormData, facebook: e.target.value })}
                    placeholder="facebook.com/page"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pinterest">Pinterest</Label>
                  <Input
                    id="pinterest"
                    value={profileFormData.pinterest}
                    onChange={(e) => setProfileFormData({ ...profileFormData, pinterest: e.target.value })}
                    placeholder="pinterest.com/user"
                  />
                </div>
              </div>
            </div>

            {/* Images and Resume */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Profile Images & Documents</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="logoImage">Logo/Avatar Image URL</Label>
                  <Input
                    id="logoImage"
                    value={profileFormData.logoImage}
                    onChange={(e) => setProfileFormData({ ...profileFormData, logoImage: e.target.value })}
                    placeholder="https://example.com/logo.jpg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coverImage">Cover Image URL</Label>
                  <Input
                    id="coverImage"
                    value={profileFormData.coverImage}
                    onChange={(e) => setProfileFormData({ ...profileFormData, coverImage: e.target.value })}
                    placeholder="https://example.com/cover.jpg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="resume">Resume (PDF, DOCX)</Label>
                  <Input
                    id="resume"
                    type="file" // Changed to type "file"
                    accept=".pdf,.doc,.docx" // Specify accepted file types
                    onChange={handleFileChange}
                  />
                  {currentResumeUrl && (
                    <p className="text-sm text-gray-500 mt-1">
                      Current Resume: <a href={currentResumeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{currentResumeUrl.split('/').pop()}</a>
                    </p>
                  )}
                  {resumeFile && (
                    <p className="text-sm text-gray-500 mt-1">
                      New File Selected: {resumeFile.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              // Use the updateProfileMutation.isPending prop if it's provided
              disabled={updateProfileMutation?.isPending}
            >
              {updateProfileMutation?.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}