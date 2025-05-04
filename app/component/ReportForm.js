'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from '../styles/reportForm.module.css';

// List of Algerian wilayas
const algerianWilayas = [
  "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra", "Béchar", 
  "Blida", "Bouira", "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret", "Tizi Ouzou", "Alger", 
  "Djelfa", "Jijel", "Sétif", "Saïda", "Skikda", "Sidi Bel Abbès", "Annaba", "Guelma", 
  "Constantine", "Médéa", "Mostaganem", "M'Sila", "Mascara", "Ouargla", "Oran", "El Bayadh", 
  "Illizi", "Bordj Bou Arréridj", "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt", "El Oued", 
  "Khenchela", "Souk Ahras", "Tipaza", "Mila", "Aïn Defla", "Naâma", "Aïn Témouchent", 
  "Ghardaïa", "Relizane", "El M'ghair", "El Menia", "Ouled Djellal", "Bordj Baji Mokhtar", 
  "Béni Abbès", "Timimoun", "Touggourt", "Djanet", "In Salah", "In Guezzam"
];

const MAX_PHOTOS = 3;
const MIN_PHOTOS = 2;

export default function ReportForm() {
  const [formData, setFormData] = useState({
    reportType: 'disappearance',
    species: '',
    breed: '',
    gender: 'male',
    disappearanceDate: '',
    abuseDate: '',
    wilaya: '',
    commune: '',
    neighborhood: '',
    photos: [],
    video: null,
    ownerContact: '',
    description: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState([]);
  const [videoPreview, setVideoPreview] = useState(null);

  // Handle text input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  // Handle file uploads for photos
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (formData.photos.length + files.length > MAX_PHOTOS) {
      setErrors({
        ...errors,
        photos: `Maximum ${MAX_PHOTOS} photos allowed`
      });
      return;
    }
    
    const newPhotos = [...formData.photos, ...files];
    setFormData({
      ...formData,
      photos: newPhotos
    });
    
    // Create URL previews for the photos
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPhotoPreviewUrls([...photoPreviewUrls, ...newPreviewUrls]);
    
    // Clear error if enough photos are now uploaded
    if (newPhotos.length >= MIN_PHOTOS) {
      setErrors({
        ...errors,
        photos: null
      });
    }
  };

  // Handle file upload for video
  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        video: file
      });
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  // Remove a photo
  const removePhoto = (index) => {
    const updatedPhotos = [...formData.photos];
    updatedPhotos.splice(index, 1);
    
    const updatedPreviewUrls = [...photoPreviewUrls];
    URL.revokeObjectURL(photoPreviewUrls[index]); // Free memory
    updatedPreviewUrls.splice(index, 1);
    
    setFormData({
      ...formData,
      photos: updatedPhotos
    });
    setPhotoPreviewUrls(updatedPreviewUrls);
    
    // Set error if not enough photos remain
    if (updatedPhotos.length < MIN_PHOTOS) {
      setErrors({
        ...errors,
        photos: `At least ${MIN_PHOTOS} photos are required`
      });
    }
  };

  // Remove video
  const removeVideo = () => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setFormData({
      ...formData,
      video: null
    });
    setVideoPreview(null);
  };

  // Validate the form
  const validateForm = () => {
    const newErrors = {};
    
    // Common validations
    if (!formData.wilaya) newErrors.wilaya = 'Wilaya is required';
    if (!formData.commune) newErrors.commune = 'Commune is required';
    if (!formData.neighborhood) newErrors.neighborhood = 'Neighborhood is required';
    if (formData.photos.length < MIN_PHOTOS) newErrors.photos = `At least ${MIN_PHOTOS} photos are required`;
    
    // Type-specific validations
    if (formData.reportType === 'disappearance') {
      if (!formData.species) newErrors.species = 'Species is required';
      if (!formData.breed) newErrors.breed = 'Breed is required';
      if (!formData.disappearanceDate) newErrors.disappearanceDate = 'Disappearance date is required';
      if (!formData.ownerContact) newErrors.ownerContact = 'Owner contact information is required';
    } else if (formData.reportType === 'abuse') {
      if (!formData.abuseDate) newErrors.abuseDate = 'Date of abuse is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  // Remplacer la fonction handleSubmit existante par celle-ci
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) {
    return;
  }
  
  setIsSubmitting(true);
  
  try {
    // Créer un objet FormData pour envoyer les fichiers
    const formDataToSend = new FormData();
    
    // Ajouter tous les champs texte
    formDataToSend.append('reportType', formData.reportType);
    formDataToSend.append('wilaya', formData.wilaya);
    formDataToSend.append('commune', formData.commune);
    formDataToSend.append('neighborhood', formData.neighborhood);
    
    if (formData.description) {
      formDataToSend.append('description', formData.description);
    }
    
    // Ajouter les champs spécifiques selon le type de rapport
    if (formData.reportType === 'disappearance') {
      formDataToSend.append('species', formData.species);
      formDataToSend.append('breed', formData.breed);
      formDataToSend.append('gender', formData.gender);
      formDataToSend.append('disappearanceDate', formData.disappearanceDate);
      formDataToSend.append('ownerContact', formData.ownerContact);
    } else if (formData.reportType === 'abuse') {
      formDataToSend.append('abuseDate', formData.abuseDate);
    }
    
    // Ajouter les photos
    formData.photos.forEach(photo => {
      formDataToSend.append('photos', photo);
    });
    
    // Ajouter la vidéo si elle existe
    if (formData.video) {
      formDataToSend.append('video', formData.video);
    }
    
    // Envoyer les données au serveur
    const response = await fetch('/api/reports', {
      method: 'POST',
      body: formDataToSend,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors de la soumission du formulaire');
    }
    
    setSubmitSuccess(true);
    
    // Réinitialiser le formulaire après soumission réussie
    setTimeout(() => {
      setFormData({
        reportType: 'disappearance',
        species: '',
        breed: '',
        gender: 'male',
        disappearanceDate: '',
        abuseDate: '',
        wilaya: '',
        commune: '',
        neighborhood: '',
        photos: [],
        video: null,
        ownerContact: '',
        description: ''
      });
      setPhotoPreviewUrls([]);
      setVideoPreview(null);
      setSubmitSuccess(false);
    }, 3000);
    
  } catch (error) {
    console.error('Submission error:', error);
    setErrors({
      ...errors,
      submit: error.message || 'Échec de la soumission du formulaire. Veuillez réessayer.'
    });
  } finally {
    setIsSubmitting(false);
  }
};
  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      photoPreviewUrls.forEach(url => URL.revokeObjectURL(url));
      if (videoPreview) URL.revokeObjectURL(videoPreview);
    };
  }, []);

  return (
    <div className={styles.reportFormPage}>
      <div className={styles.reportFormContainer}>
        <h1 className={styles.reportFormTitle}>
          {formData.reportType === 'disappearance' ? 'Report Missing Animal' : 'Report Animal Abuse'}
        </h1>
        
        <p className={styles.reportFormDescription}>
          {formData.reportType === 'disappearance' 
            ? 'Help us find your missing pet by providing detailed information below.'
            : 'Report animal abuse to help protect animals from cruelty and neglect.'
          }
        </p>
        
        {submitSuccess && (
          <div className={styles.successMessage}>
            Your report has been submitted successfully! Thank you for your contribution.
          </div>
        )}
        
        <form onSubmit={handleSubmit} className={styles.reportForm}>
          {/* Report Type Selection */}
          <div className={styles.formGroup}>
            <label htmlFor="reportType">Report Type</label>
            <div className={styles.reportTypeToggle}>
              <button 
                type="button"
                className={`${styles.reportTypeButton} ${formData.reportType === 'disappearance' ? styles.active : ''}`}
                onClick={() => setFormData({...formData, reportType: 'disappearance'})}
              >
                Missing Animal
              </button>
              <button 
                type="button"
                className={`${styles.reportTypeButton} ${formData.reportType === 'abuse' ? styles.active : ''}`}
                onClick={() => setFormData({...formData, reportType: 'abuse'})}
              >
                Animal Abuse
              </button>
            </div>
          </div>
          
          {/* Dynamic form fields based on report type */}
          {formData.reportType === 'disappearance' && (
            <>
              {/* Animal Information Section */}
              <div className={styles.formSection}>
                <h3>Animal Information</h3>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="species">Species *</label>
                    <input 
                      type="text" 
                      id="species" 
                      name="species" 
                      value={formData.species}
                      onChange={handleChange}
                      placeholder="e.g., Dog, Cat, Bird"
                      className={errors.species ? styles.inputError : ''}
                      required
                    />
                    {errors.species && <div className={styles.errorMessage}>{errors.species}</div>}
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="breed">Breed *</label>
                    <input 
                      type="text" 
                      id="breed" 
                      name="breed" 
                      value={formData.breed}
                      onChange={handleChange}
                      placeholder="e.g., German Shepherd, Siamese"
                      className={errors.breed ? styles.inputError : ''}
                      required
                    />
                    {errors.breed && <div className={styles.errorMessage}>{errors.breed}</div>}
                  </div>
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="gender">Gender *</label>
                  <div className={styles.radioGroup}>
                    <label className={styles.radioLabel}>
                      <input 
                        type="radio" 
                        name="gender" 
                        value="male" 
                        checked={formData.gender === 'male'}
                        onChange={handleChange}
                      />
                      Male
                    </label>
                    <label className={styles.radioLabel}>
                      <input 
                        type="radio" 
                        name="gender" 
                        value="female" 
                        checked={formData.gender === 'female'}
                        onChange={handleChange}
                      />
                      Female
                    </label>
                  </div>
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="disappearanceDate">Date of Disappearance *</label>
                  <input 
                    type="date" 
                    id="disappearanceDate" 
                    name="disappearanceDate" 
                    value={formData.disappearanceDate}
                    onChange={handleChange}
                    max={new Date().toISOString().split('T')[0]}
                    className={errors.disappearanceDate ? styles.inputError : ''}
                    required
                  />
                  {errors.disappearanceDate && <div className={styles.errorMessage}>{errors.disappearanceDate}</div>}
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="ownerContact">Owner Contact Information *</label>
                  <input 
                    type="text" 
                    id="ownerContact" 
                    name="ownerContact" 
                    value={formData.ownerContact}
                    onChange={handleChange}
                    placeholder="Phone number or email"
                    className={errors.ownerContact ? styles.inputError : ''}
                    required
                  />
                  {errors.ownerContact && <div className={styles.errorMessage}>{errors.ownerContact}</div>}
                </div>
              </div>
            </>
          )}
          
          {formData.reportType === 'abuse' && (
            <>
              <div className={styles.formSection}>
                <h3>Abuse Information</h3>
                
                <div className={styles.formGroup}>
                  <label htmlFor="abuseDate">Date of Observed Abuse *</label>
                  <input 
                    type="date" 
                    id="abuseDate" 
                    name="abuseDate" 
                    value={formData.abuseDate}
                    onChange={handleChange}
                    max={new Date().toISOString().split('T')[0]}
                    className={errors.abuseDate ? styles.inputError : ''}
                    required
                  />
                  {errors.abuseDate && <div className={styles.errorMessage}>{errors.abuseDate}</div>}
                </div>
              </div>
            </>
          )}
          
          {/* Location Section - Common for both report types */}
          <div className={styles.formSection}>
            <h3>Location Information</h3>
            
            <div className={styles.formGroup}>
              <label htmlFor="wilaya">Wilaya (Province) *</label>
              <select 
                id="wilaya" 
                name="wilaya" 
                value={formData.wilaya}
                onChange={handleChange}
                className={errors.wilaya ? styles.inputError : ''}
                required
              >
                <option value="">Select a wilaya</option>
                {algerianWilayas.map((wilaya, index) => (
                  <option key={index} value={wilaya}>{wilaya}</option>
                ))}
              </select>
              {errors.wilaya && <div className={styles.errorMessage}>{errors.wilaya}</div>}
            </div>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="commune">Commune *</label>
                <input 
                  type="text" 
                  id="commune" 
                  name="commune" 
                  value={formData.commune}
                  onChange={handleChange}
                  placeholder="Enter commune name"
                  className={errors.commune ? styles.inputError : ''}
                  required
                />
                {errors.commune && <div className={styles.errorMessage}>{errors.commune}</div>}
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="neighborhood">Neighborhood/Area *</label>
                <input 
                  type="text" 
                  id="neighborhood" 
                  name="neighborhood" 
                  value={formData.neighborhood}
                  onChange={handleChange}
                  placeholder="Enter specific area"
                  className={errors.neighborhood ? styles.inputError : ''}
                  required
                />
                {errors.neighborhood && <div className={styles.errorMessage}>{errors.neighborhood}</div>}
              </div>
            </div>
          </div>
          
          {/* Media Upload Section - Common for both but with different requirements */}
          <div className={styles.formSection}>
            <h3>Media Upload</h3>
            
            <div className={styles.formGroup}>
              <label>Photos * (Min: {MIN_PHOTOS}, Max: {MAX_PHOTOS})</label>
              <div className={styles.fileUploadContainer}>
                <label className={styles.fileUploadButton} htmlFor="photos">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Upload Photos
                </label>
                <input 
                  type="file" 
                  id="photos" 
                  name="photos" 
                  accept="image/*" 
                  multiple
                  onChange={handlePhotoUpload}
                  className={styles.hiddenFileInput}
                  disabled={formData.photos.length >= MAX_PHOTOS}
                />
              </div>
              {errors.photos && <div className={styles.errorMessage}>{errors.photos}</div>}
              
              {/* Photo Preview */}
              {photoPreviewUrls.length > 0 && (
                <div className={styles.photoPreviewContainer}>
                  {photoPreviewUrls.map((url, index) => (
                    <div key={index} className={styles.photoPreview}>
                      <img src={url} alt={`Photo ${index + 1}`} />
                      <button 
                        type="button" 
                        className={styles.removeMediaButton}
                        onClick={() => removePhoto(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {formData.reportType === 'abuse' && (
              <div className={styles.formGroup}>
                <label>Video (Optional)</label>
                <div className={styles.fileUploadContainer}>
                  <label className={styles.fileUploadButton} htmlFor="video">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Upload Video
                  </label>
                  <input 
                    type="file" 
                    id="video" 
                    name="video" 
                    accept="video/*" 
                    onChange={handleVideoUpload}
                    className={styles.hiddenFileInput}
                    disabled={formData.video !== null}
                  />
                </div>
                
                {/* Video Preview */}
                {videoPreview && (
                  <div className={styles.videoPreviewContainer}>
                    <div className={styles.videoPreview}>
                      <video src={videoPreview} controls />
                      <button 
                        type="button" 
                        className={styles.removeMediaButton}
                        onClick={removeVideo}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Description - Common for both */}
          <div className={styles.formSection}>
            <h3>Additional Information</h3>
            
            <div className={styles.formGroup}>
              <label htmlFor="description">Description (Optional)</label>
              <textarea 
                id="description" 
                name="description" 
                value={formData.description}
                onChange={handleChange}
                placeholder={formData.reportType === 'disappearance' 
                  ? "Provide additional details about the animal (color, size, distinctive features, etc.)"
                  : "Describe the abuse situation, any identifiable information about the perpetrators, etc."
                }
                rows={5}
              />
            </div>
          </div>
          
          {/* Submit button */}
          <div className={styles.formActions}>
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
          
          {errors.submit && <div className={styles.errorMessage}>{errors.submit}</div>}
        </form>
      </div>
    </div>
  );
}