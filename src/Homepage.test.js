import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import Homepage from './Homepage';
import data from './data'; // To check standard templates as well

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: () => {
      store = {};
    },
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Homepage', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  test('"Create Custom DP" button is rendered and links correctly', () => {
    render(<Homepage />, { wrapper: MemoryRouter });
    const createButton = screen.getByRole('link', { name: /Create Custom DP/i });
    expect(createButton).toBeInTheDocument();
    expect(createButton).toHaveAttribute('href', '/create-custom-dp');
  });

  test('renders standard templates when no custom DPs exist', () => {
    render(<Homepage />, { wrapper: MemoryRouter });
    // Check for a couple of standard templates by title (derived from eventKey)
    const standardTemplateTitle = (data && Object.keys(data).length > 0)
      ? (data[Object.keys(data)[0]].name || Object.keys(data)[0].replace(/-/g, ' ').replace(/(^|\s)\w/g, l => l.toUpperCase()))
      : "A cool template for your DP."; // Fallback if data.js is empty

    expect(screen.getByText(standardTemplateTitle)).toBeInTheDocument();
    expect(screen.queryByText(/Custom Templates/i)).not.toBeInTheDocument();
  });

  test('displays custom DPs from localStorage', () => {
    const mockCustomDps = [
      { name: 'My First Custom DP', description: 'A special one', mainImage: 'custom_image_1_id', width: 300, height: 300, xPos: 10, yPos: 10, logoImage: 'logo1', radius: 0 },
      { name: 'My Second Custom DP', description: 'Another cool one', mainImage: 'custom_image_2_id', width: 320, height: 320, xPos: 15, yPos: 15, logoImage: 'logo2', radius: 5 },
    ];
    localStorageMock.setItem('customDpList', JSON.stringify(mockCustomDps));

    render(<Homepage />, { wrapper: MemoryRouter });

    expect(screen.getByText(/Custom Templates/i)).toBeInTheDocument();

    // Check first custom DP
    expect(screen.getByText('Custom DP 1')).toBeInTheDocument(); // Title is "Custom DP " + index + 1
    expect(screen.getByText(mockCustomDps[0].description)).toBeInTheDocument();
    const customImage1 = screen.getByAltText('Custom DP 1 preview');
    expect(customImage1).toBeInTheDocument();
    expect(customImage1).toHaveAttribute('src', expect.stringContaining(mockCustomDps[0].mainImage));
    const customizeButton1 = screen.getAllByRole('link', { name: /Customize/i }); // Get all customize buttons
    // Find the one for custom DP 1. It should link to /dp/custom/0
    const customLink1 = customizeButton1.find(link => link.getAttribute('href') === '/dp/custom/0');
    expect(customLink1).toBeInTheDocument();


    // Check second custom DP
    expect(screen.getByText('Custom DP 2')).toBeInTheDocument();
    expect(screen.getByText(mockCustomDps[1].description)).toBeInTheDocument();
    const customImage2 = screen.getByAltText('Custom DP 2 preview');
    expect(customImage2).toBeInTheDocument();
    expect(customImage2).toHaveAttribute('src', expect.stringContaining(mockCustomDps[1].mainImage));
    const customLink2 = customizeButton1.find(link => link.getAttribute('href') === '/dp/custom/1');
    expect(customLink2).toBeInTheDocument();
  });

  test('does not display "Custom Templates" heading if localStorage is empty or customDpList is not an array', () => {
    localStorageMock.setItem('customDpList', 'this is not an array');
    render(<Homepage />, { wrapper: MemoryRouter });
    expect(screen.queryByText(/Custom Templates/i)).not.toBeInTheDocument();

    localStorageMock.clear(); // Ensure it's empty
    render(<Homepage />, { wrapper: MemoryRouter }); // Re-render
    expect(screen.queryByText(/Custom Templates/i)).not.toBeInTheDocument();
  });
});
