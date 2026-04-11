import React, { useState } from 'react';
import { Download, Share2, FileText, Type, Layers, Calendar, Clock, Users, Star } from 'lucide-react';
import ImageUploader from '../ImageUploader/ImageUploader';
import { generateNSSReport } from '../../services/pdfGenerator';
import './ReportForm.css';

const IconPlate: React.FC<{ icon: React.ReactNode, color: string }> = ({ icon, color }) => (
  <div className="glass-icon-plate" style={{ color }}>
    {icon}
  </div>
);

const ReportForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Community',
    date: '',
    duration: '',
    volunteerCount: '',
    highlights: '',
  });
  
  const [images, setImages] = useState<File[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.name) return 'Please enter the Program Name.';
    if (!formData.category) return 'Please select a Category.';
    if (!formData.date) return 'Please select a Date.';
    if (!formData.duration) return 'Please enter the Duration.';
    if (!formData.volunteerCount) return 'Please enter the Number of Volunteers.';
    if (!formData.highlights) return 'Please enter the Program Highlights.';
    return null;
  };

  const handleGenerateClick = async (share: boolean = false) => {
    const error = validateForm();
    if (error) {
      alert(error);
      return;
    }

    setIsGenerating(true);
    try {
        await generateNSSReport(formData, images, share);
    } catch (e) {
        console.error('Error generating report:', e);
        alert('Failed to generate report.');
    } finally {
        setIsGenerating(false);
    }
  };

  return (
    <div className="report-form glass-panel">
      <div className="form-header">
        <div className="glass-icon-large" style={{ color: '#5a67d8' }}>
          <FileText size={32} />
        </div>
        <div>
          <h2>Create Report</h2>
          <span className="subtitle-text">NSS Activity generator</span>
        </div>
      </div>
      
      <div className="form-grid">
        <div className="form-group full-width">
          <div className="label-wrapper">
             <IconPlate icon={<Type size={18} />} color="#ed64a6" />
             <label htmlFor="name">Program Name</label>
          </div>
          <input 
            type="text" 
            id="name" 
            name="name" 
            value={formData.name} 
            onChange={handleInputChange} 
            placeholder="e.g. Campus Cleanup Drive" 
          />
        </div>

        <div className="form-group full-width">
          <div className="label-wrapper">
             <IconPlate icon={<Layers size={18} />} color="#4299e1" />
             <label htmlFor="category">Event Category</label>
          </div>
          <select 
            id="category" 
            name="category" 
            value={formData.category} 
            onChange={handleInputChange}
          >
            <option value="Campus">Campus</option>
            <option value="Community">Community</option>
            <option value="Orientation">Orientation</option>
          </select>
        </div>
        
        <div className="form-group">
          <div className="label-wrapper">
             <IconPlate icon={<Calendar size={18} />} color="#48bb78" />
             <label htmlFor="date">Date</label>
          </div>
          <input 
            type="date" 
            id="date" 
            name="date" 
            value={formData.date} 
            onChange={handleInputChange} 
          />
        </div>
        
        <div className="form-group">
          <div className="label-wrapper">
             <IconPlate icon={<Clock size={18} />} color="#ecc94b" />
             <label htmlFor="duration">Duration (Hours)</label>
          </div>
          <input 
            type="number" 
            id="duration" 
            name="duration" 
            value={formData.duration} 
            onChange={handleInputChange} 
            placeholder="e.g. 4" 
            min="1"
          />
        </div>
        
        <div className="form-group full-width">
          <div className="label-wrapper">
             <IconPlate icon={<Users size={18} />} color="#9f7aea" />
             <label htmlFor="volunteerCount">Number of Volunteers Participated</label>
          </div>
          <input 
            type="number" 
            id="volunteerCount" 
            name="volunteerCount" 
            value={formData.volunteerCount} 
            onChange={handleInputChange} 
            placeholder="e.g. 50" 
            min="1"
          />
        </div>

        <div className="form-group full-width">
          <div className="label-wrapper">
             <IconPlate icon={<Star size={18} />} color="#f56565" />
             <label htmlFor="highlights">Highlights of Program</label>
          </div>
          <textarea 
            id="highlights" 
            name="highlights" 
            value={formData.highlights} 
            onChange={handleInputChange} 
            placeholder="Describe the key activities and outcomes..."
            rows={5}
          />
        </div>
      </div>

      <ImageUploader images={images} onImagesChange={setImages} />

      <div className="form-actions">
        <button 
          className="btn" 
          onClick={() => handleGenerateClick(true)}
          disabled={isGenerating}
        >
          <Share2 size={18} color="#5a67d8" />
          <span>{isGenerating ? 'Processing...' : 'Share PDF'}</span>
        </button>
        
        <button 
          className="btn btn-primary" 
          onClick={() => handleGenerateClick(false)}
          disabled={isGenerating}
        >
          <Download size={18} />
          <span>{isGenerating ? 'Generating...' : 'Download PDF'}</span>
        </button>
      </div>
    </div>
  );
};

export default ReportForm;
