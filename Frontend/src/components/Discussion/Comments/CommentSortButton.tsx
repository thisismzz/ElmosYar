import React, { useState } from 'react';
export type SortOption = 'date' | 'likes';
export type SortOrder = 'asc' | 'desc';

export interface SortConfig {
  option: SortOption;
  order: SortOrder;
}




interface SortButtonProps {
  onSortChange: (config: SortConfig) => void;
  defaultOption?: SortOption;
  defaultOrder?: SortOrder;
}

const SortButton: React.FC<SortButtonProps> = ({
  onSortChange,
  defaultOption = 'date',
  defaultOrder = 'asc'
}) => {
  const [sortOption, setSortOption] = useState<SortOption>(defaultOption);
  const [sortOrder, setSortOrder] = useState<SortOrder>(defaultOrder);

  const handleOptionChange = (option: SortOption) => {
    setSortOption(option);
    onSortChange({ option, order: sortOrder });
  };

  const handleOrderToggle = () => {
    const newOrder = sortOrder === 'desc' ? 'asc' : 'desc';
    setSortOrder(newOrder);
    onSortChange({ option: sortOption, order: newOrder });
  };

  return (
    <div className="sort-button-container" style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px',
      background: '#f5f5f5',
      borderRadius: '8px',
      marginBottom: '16px'
    }}>
      <span style={{ fontWeight: 500, color: '#666' }}>Sort by:</span>
      
      <div className="sort-options" style={{ display: 'flex', gap: '4px' }}>
        <button
          className={`sort-option ${sortOption === 'date' ? 'active' : ''}`}
          onClick={() => handleOptionChange('date')}
          style={{
            padding: '6px 12px',
            border: '1px solid #ddd',
            background: sortOption === 'date' ? '#007bff' : 'white',
            color: sortOption === 'date' ? 'white' : '#333',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Date
        </button>
        
        <button
          className={`sort-option ${sortOption === 'likes' ? 'active' : ''}`}
          onClick={() => handleOptionChange('likes')}
          style={{
            padding: '6px 12px',
            border: '1px solid #ddd',
            background: sortOption === 'likes' ? '#007bff' : 'white',
            color: sortOption === 'likes' ? 'white' : '#333',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Likes
        </button>
      </div>

      <button
        className="order-toggle"
        onClick={handleOrderToggle}
        style={{
          padding: '6px 12px',
          border: '1px solid #ddd',
          background: 'white',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}
        title={sortOrder === 'desc' ? 'Descending' : 'Ascending'}
      >
        {sortOrder === 'desc' ? '↓' : '↑'}
        <span>{sortOrder === 'desc' ? 'High to Low' : 'Low to High'}</span>
      </button>

      <div style={{ marginLeft: 'auto', color: '#666', fontSize: '12px' }}>
        Current: {sortOption} ({sortOrder})
      </div>
    </div>
  );
};

export default SortButton;