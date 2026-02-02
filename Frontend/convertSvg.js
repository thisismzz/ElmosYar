const fs = require('fs');
const path = require('path');

// Helper function to convert SVG for React/Tailwind
function convertSvgForReact(svgContent, componentName = 'Logo') {
  // 1. Remove XML declaration if present
  let converted = svgContent.replace(/<\?xml[^>]*\?>/, '');
  
  // 2. Replace inline styles with classes (preserve for color control)
  converted = converted.replace(/style="[^"]*"/g, (match) => {
    // Remove fill/stroke from style and convert to class
    return match.replace(/fill:[^;]+;?/g, '').replace(/stroke:[^;]+;?/g, '');
  });
  
  // 3. Replace fill attributes with class (keep if it's important)
  converted = converted.replace(/fill="([^"]*)"/g, (match, color) => {
    // Keep important colors, but add class for theme control
    if (color === 'none' || color === 'currentColor') {
      return match;
    }
    return `className="fill-current" data-original-fill="${color}"`;
  });
  
  // 4. Replace stroke attributes
  converted = converted.replace(/stroke="([^"]*)"/g, (match, color) => {
    if (color === 'none') return match;
    return `className="stroke-current" data-original-stroke="${color}"`;
  });
  
  // 5. Add className prop to svg tag
  converted = converted.replace(/<svg([^>]*)>/, (match, attributes) => {
    // Check if already has class or className
    if (attributes.includes('class=') || attributes.includes('className=')) {
      return match;
    }
    return `<svg${attributes} className={className}>`;
  });
  
  // 6. Remove width/height if they're in pixels, keep viewBox
  converted = converted.replace(/(width|height)="[^"]*"/g, (match, attr) => {
    return ''; // Remove so we can control via props
  });
  
  // 7. Format for React component
  return `import React from 'react';

interface ${componentName}Props {
  className?: string;
  width?: number | string;
  height?: number | string;
}

export const ${componentName}: React.FC<${componentName}Props> = ({ 
  className = '', 
  width = 40, 
  height = 40 
}) => {
  return (
    ${converted.replace('<svg', `<svg width={width} height={height}`)}
  );
};`;
}

// Read your SVG file
const svgPath = path.join(__dirname, 'src', 'assets', 'logo.svg');
const outputPath = path.join(__dirname, 'src', 'components', 'Logo.tsx');

try {
  const svgContent = fs.readFileSync(svgPath, 'utf8');
  
  console.log('📦 Converting SVG to React component...');
  console.log(`📄 Input: ${svgPath}`);
  console.log(`📤 Output: ${outputPath}`);
  
  const reactComponent = convertSvgForReact(svgContent, 'Logo');
  
  // Create components directory if it doesn't exist
  const componentsDir = path.dirname(outputPath);
  if (!fs.existsSync(componentsDir)) {
    fs.mkdirSync(componentsDir, { recursive: true });
  }
  
  // Write the component
  fs.writeFileSync(outputPath, reactComponent);
  
  console.log('✅ Success! Logo component created.');
  console.log('\n⚠️  Manual adjustments needed:');
  console.log('1. Review the generated component');
  console.log('2. Replace fill-current/stroke-current with specific Tailwind classes');
  console.log('   Example: fill="blue-600 dark:fill-blue-400"');
  console.log('3. Adjust any data-original-* attributes');
  
  // Show preview
  console.log('\n📋 First 10 lines of generated component:');
  console.log(reactComponent.split('\n').slice(0, 10).join('\n'));
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.log('\n📌 Make sure:');
  console.log('1. Your SVG file exists at: src/assets/logo.svg');
  console.log('2. You run this from project root');
  console.log('3. You have Node.js installed');
}