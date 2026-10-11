import React, { useState } from 'react';
import { Download, Share2, Type, Layers, Calendar, Clock, Users, Star, FileText } from 'lucide-react';
import ImageUploader from '../ImageUploader/ImageUploader';
import { generateNSSReport } from '../../services/pdfGenerator';
import { generateNSSDoc } from '../../services/docGenerator';
import nssLogo from '../../assets/nss_logo.png';
import './ReportForm.css';

const IconPlate: React.FC<{ icon: React.ReactNode, color: string }> = ({ icon, color }) => (
  <div className="glass-icon-plate" style={{ color }}>
    {icon}
  </div>
);

const ReportForm: React.FC = () => {
  const getLocalDate = () => {
    const tzOffset = (new Date()).getTimezoneOffset() * 60000; 
    return (new Date(Date.now() - tzOffset)).toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    name: '',
    category: 'Community',
    date: getLocalDate(),
    duration: '',
    volunteerCount: '',
    highlights: '',
  });

  const [images, setImages] = useState<File[]>([]);
  const [generatingAction, setGeneratingAction] = useState<string | null>(null);
  const isGenerating = generatingAction !== null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'name' ? value.toUpperCase() : value 
    }));
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

  const handleGenerateClick = async (formatType: 'pdf' | 'doc', share: boolean = false) => {
    const error = validateForm();
    if (error) {
      alert(error);
      return;
    }

    const actionKey = share ? `share-${formatType}` : formatType;
    setGeneratingAction(actionKey);
    try {
      if (formatType === 'pdf') {
        await generateNSSReport(formData, images, share);
      } else {
        await generateNSSDoc(formData, images, share);
      }
    } catch (e) {
      console.error(`Error generating ${formatType.toUpperCase()} report:`, e);
      alert(`Failed to generate ${formatType.toUpperCase()} report.`);
    } finally {
      setGeneratingAction(null);
    }
  };

  return (
    <div className="report-form glass-panel">
      <div className="form-header">
        <img src={nssLogo} alt="NSS Logo" className="nss-logo-small" />
        <div className="form-title-container">
          <h1 className="main-title">NSS REPORT GENERATOR</h1>
          <span className="subtitle-text">Create Activity Report</span>
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
        <div className="action-group share-group">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => handleGenerateClick('pdf', true)}
            disabled={isGenerating}
            title="Share report as PDF"
          >
            <Share2 size={18} color="#e53e3e" />
            <span>{generatingAction === 'share-pdf' ? 'Sharing PDF...' : 'Share PDF'}</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => handleGenerateClick('doc', true)}
            disabled={isGenerating}
            title="Share report as Word DOC"
          >
            <Share2 size={18} color="#2b6cb0" />
            <span>{generatingAction === 'share-doc' ? 'Sharing DOC...' : 'Share DOC'}</span>
          </button>
        </div>

        <div className="action-group download-group">
          <button
            type="button"
            className="btn btn-word"
            onClick={() => handleGenerateClick('doc', false)}
            disabled={isGenerating}
            title="Download report in Word (.docx) format"
          >
            <FileText size={18} />
            <span>{generatingAction === 'doc' ? 'Generating DOC...' : 'Download DOC'}</span>
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => handleGenerateClick('pdf', false)}
            disabled={isGenerating}
            title="Download report in PDF format"
          >
            <Download size={18} />
            <span>{generatingAction === 'pdf' ? 'Generating PDF...' : 'Download PDF'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportForm;
