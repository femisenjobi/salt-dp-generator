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

describe('Homepage - API Fetched DP Configurations', () => {
  beforeEach(() => {
    // Mock window.fetch for these tests
    global.fetch = jest.fn();
    jest.clearAllMocks(); // Clear fetch and any other mocks
  });

  afterEach(() => {
    // Clean up the mock to ensure it doesn't interfere with other tests
    global.fetch.mockRestore();
  });

  const mockApiData = [
    { _id: '1', slug: 'public-dp-1', templateName: 'Public DP 1', mainImageCloudinaryId: 'pub_img_1', isPublic: true },
    { _id: '2', slug: 'private-dp-1', templateName: 'Private DP 1', mainImageCloudinaryId: 'priv_img_1', isPublic: false },
    { _id: '3', slug: 'public-dp-2', templateName: 'Public DP 2 (Undefined isPublic)', mainImageCloudinaryId: 'pub_img_2' }, // isPublic undefined
  ];

  test('renders public and private DP sections if API returns mixed data', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiData,
    });
    render(<Homepage />, { wrapper: MemoryRouter });

    await waitFor(() => {
      expect(screen.getByText('What Others are Creating')).toBeInTheDocument();
      // Check for at least one public DP
      expect(screen.getByText('Public DP 1')).toBeInTheDocument();
      expect(screen.getByText('Public DP 2 (Undefined isPublic)')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Your Private DPs')).toBeInTheDocument();
      // Check for at least one private DP
      expect(screen.getByText('Private DP 1')).toBeInTheDocument();
    });
  });

  test('distributes DPs correctly into public and private sections', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiData,
    });
    render(<Homepage />, { wrapper: MemoryRouter });

    // Check Public DPs
    await waitFor(() => {
      const publicSection = screen.getByText('What Others are Creating').closest('div.container > div > h2').nextElementSibling;
      expect(within(publicSection).getByText('Public DP 1')).toBeInTheDocument();
      expect(within(publicSection).getByText('Public DP 2 (Undefined isPublic)')).toBeInTheDocument();
      expect(within(publicSection).queryByText('Private DP 1')).not.toBeInTheDocument();
    });

    // Check Private DPs
    await waitFor(() => {
      // Need a robust way to select the section. Assuming structure: h2 followed by div.row
      // This assumes "Your Private DPs" is present and followed by a div.row containing cards.
      const privateSectionContainer = screen.getByText('Your Private DPs').closest('div.container > div > h2').parentElement; // Or use a more direct selector if possible
      const privateSection = Array.from(privateSectionContainer.querySelectorAll('.card-title')).find(el => el.textContent === 'Private DP 1').closest('.row');

      expect(within(privateSection).getByText('Private DP 1')).toBeInTheDocument();
      expect(within(privateSection).queryByText('Public DP 1')).not.toBeInTheDocument();
    });
  });

  test('displays error message if API call fails', async () => {
    global.fetch.mockRejectedValueOnce(new Error('API Network Error'));
    render(<Homepage />, { wrapper: MemoryRouter });
    await waitFor(() => {
      expect(screen.getByText('Failed to load DP configurations. Please try again later.')).toBeInTheDocument();
    });
  });

  test('cards in both sections have correct "Customize" and "Share" links', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiData,
    });
    render(<Homepage />, { wrapper: MemoryRouter });

    // Public DP 1
    await waitFor(() => screen.getByText('Public DP 1'));
    const publicDp1Card = screen.getByText('Public DP 1').closest('.card');
    const publicCustomizeLink = within(publicDp1Card).getByRole('link', { name: /Customize/i });
    expect(publicCustomizeLink).toHaveAttribute('href', '/dp/public-dp-1');

    // Private DP 1
    await waitFor(() => screen.getByText('Private DP 1'));
    const privateDp1Card = screen.getByText('Private DP 1').closest('.card');
    const privateCustomizeLink = within(privateDp1Card).getByRole('link', { name: /Customize/i });
    expect(privateCustomizeLink).toHaveAttribute('href', '/dp/private-dp-1');
    const privateShareLink = within(privateDp1Card).getByRole('link', { name: /Share/i });
    expect(privateShareLink).toHaveAttribute('href', '/dp/private-dp-1');
  });

  test('shows "No public DP configurations found" if only private DPs exist or no DPs at all from API', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiData.filter(dp => dp.isPublic === false), // Only private DPs
    });
    render(<Homepage />, { wrapper: MemoryRouter });

    await waitFor(() => {
      expect(screen.getByText('No public DP configurations found.')).toBeInTheDocument();
      expect(screen.getByText('Your Private DPs')).toBeInTheDocument();
      expect(screen.getByText('Private DP 1')).toBeInTheDocument();
    });
  });

  test('does not show "Your Private DPs" section if only public DPs exist or no DPs at all from API', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiData.filter(dp => dp.isPublic !== false), // Only public DPs
    });
    render(<Homepage />, { wrapper: MemoryRouter });

    await waitFor(() => {
      expect(screen.getByText('What Others are Creating')).toBeInTheDocument();
      expect(screen.getByText('Public DP 1')).toBeInTheDocument();
      expect(screen.queryByText('Your Private DPs')).not.toBeInTheDocument();
    });
  });
});

// Helper to import 'within' if not already available
import { within } from '@testing-library/react';
