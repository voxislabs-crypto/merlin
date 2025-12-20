import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import BirthChartVisualization from './BirthChartVisualization.fixed';

// Sample test data
const sampleData = {
  planets: [
    {
      name: 'SUN',
      longitude: 120,
      latitude: 0,
      sign: 'Leo',
      degree: 0,
      house: 5
    },
    {
      name: 'MOON',
      longitude: 45,
      latitude: 0,
      sign: 'Taurus',
      degree: 15,
      house: 2
    },
    {
      name: 'MERCURY',
      longitude: 90,
      latitude: 0,
      sign: 'Gemini',
      degree: 0,
      house: 3
    }
  ],
  houses: [
    { house: 1, position: 0, sign: 'Aries', degree: 0 },
    { house: 2, position: 30, sign: 'Taurus', degree: 0 },
    { house: 3, position: 60, sign: 'Gemini', degree: 0 },
    { house: 4, position: 90, sign: 'Cancer', degree: 0 },
    { house: 5, position: 120, sign: 'Leo', degree: 0 },
    { house: 6, position: 150, sign: 'Virgo', degree: 0 },
    { house: 7, position: 180, sign: 'Libra', degree: 0 },
    { house: 8, position: 210, sign: 'Scorpio', degree: 0 },
    { house: 9, position: 240, sign: 'Sagittarius', degree: 0 },
    { house: 10, position: 270, sign: 'Capricorn', degree: 0 },
    { house: 11, position: 300, sign: 'Aquarius', degree: 0 },
    { house: 12, position: 330, sign: 'Pisces', degree: 0 }
  ],
  aspects: [
    {
      planet1: { name: 'SUN', longitude: 120 },
      planet2: { name: 'MOON', longitude: 45 },
      type: 'TRINE',
      orb: 0.5,
      exact: true
    },
    {
      planet1: { name: 'SUN', longitude: 120 },
      planet2: { name: 'MERCURY', longitude: 90 },
      type: 'SQUARE',
      orb: 1.2,
      exact: false
    }
  ]
};

describe('BirthChartVisualization', () => {
  it('renders without crashing', () => {
    render(<BirthChartVisualization data={sampleData} />);
    expect(screen.getByText('Chart')).toBeInTheDocument();
    expect(screen.getByText('Planets')).toBeInTheDocument();
    expect(screen.getByText('Aspects')).toBeInTheDocument();
  });

  it('switches between tabs', async () => {
    render(<BirthChartVisualization data={sampleData} showTabs={true} />);
    
    // Wait for the component to be fully rendered
    await waitFor(() => {
      expect(screen.getByText('Chart')).toBeInTheDocument();
    });
    
    // Click on Planets tab
    fireEvent.click(screen.getByText('Planets'));
    
    // Check if any planet from our test data is rendered
    await waitFor(() => {
      expect(screen.getByText('Sun')).toBeInTheDocument();
    });
    
    // Click on Aspects tab
    fireEvent.click(screen.getByText('Aspects'));
    
    // Check if any aspect from our test data is rendered
    await waitFor(() => {
      expect(screen.getByText('Trine')).toBeInTheDocument();
    });
    
    // Click back to Chart tab
    fireEvent.click(screen.getByText('Chart'));
    
    // Check if the main chart container is rendered by looking for the SVG element
    await waitFor(() => {
      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
      // Check that the SVG has some content (circles)
      expect(svg?.querySelector('circle')).toBeInTheDocument();
    });
  });

  it('handles planet hover events', async () => {
    const handlePlanetHover = jest.fn();
    render(
      <BirthChartVisualization 
        data={sampleData} 
        onPlanetHover={handlePlanetHover}
        showTabs={false}
        defaultTab="planets"
      />
    );
    
    // Wait for the component to be fully rendered
    await waitFor(() => {
      expect(screen.getByText('Sun')).toBeInTheDocument();
    });
    
    // Find and hover over a planet
    const planetElement = screen.getByText('Sun');
    const planetCard = planetElement.closest('div[class*="bg-slate-800"]');
    
    fireEvent.mouseEnter(planetCard!);
    
    await waitFor(() => {
      expect(handlePlanetHover).toHaveBeenCalledWith(expect.objectContaining({
        name: 'SUN',
        sign: 'Leo',
        degree: 0,
        house: 5
      }));
    });
    
    fireEvent.mouseLeave(planetCard!);
    
    await waitFor(() => {
      expect(handlePlanetHover).toHaveBeenCalledWith(null);
    });
  });

  it('handles aspect hover events', async () => {
    const handleAspectHover = jest.fn();
    render(
      <BirthChartVisualization 
        data={sampleData} 
        onAspectHover={handleAspectHover}
        showTabs={false}
        defaultTab="aspects"
      />
    );
    
    // Wait for the component to be fully rendered
    await waitFor(() => {
      expect(screen.getByText('Trine')).toBeInTheDocument();
    });
    
    // Find and hover over an aspect
    const aspectRow = screen.getByText('Trine').closest('tr');
    
    if (aspectRow) {
      fireEvent.mouseEnter(aspectRow);
      
      await waitFor(() => {
        expect(handleAspectHover).toHaveBeenCalledWith(expect.objectContaining({
          type: 'TRINE'
        }));
      });
      
      fireEvent.mouseLeave(aspectRow);
      
      await waitFor(() => {
        expect(handleAspectHover).toHaveBeenCalledWith(null);
      });
    }
  });
});
