import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import './PreviewSection.css';

type ToggleOption = {
  value: string;
  label: string;
};

type PreviewSectionProps = {
  title: string;
  icon: React.ReactNode;
  linkTo: string;
  linkLabel: string;
  toggle?: {
    options: ToggleOption[];
    value: string;
    onChange: (value: string) => void;
  };
  children: React.ReactNode;
};

const PreviewSection: React.FC<PreviewSectionProps> = ({
  title,
  icon,
  linkTo,
  linkLabel,
  toggle,
  children,
}) => {
  return (
    <div className="preview-section">
      <div className="preview-section-header">
        <h2 className="preview-section-title">
          {icon}
          {title}
        </h2>
        <div className="preview-section-controls">
          {toggle && (
            <div className="preview-section-toggle">
              {toggle.options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => toggle.onChange(opt.value)}
                  className={`preview-section-toggle-btn ${
                    toggle.value === opt.value ? 'preview-section-toggle-active' : ''
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          <Link to={linkTo} className="preview-section-link">
            {linkLabel}
            <ArrowLeft size={14} />
          </Link>
        </div>
      </div>

      <div className="preview-section-content">{children}</div>
    </div>
  );
};

export default PreviewSection;
