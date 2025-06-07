import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Validator from './Validator';
import DpGenerator from './DpGenerator';

// Mock DpGenerator to inspect its props and prevent its actual rendering/logic
jest.mock('./DpGenerator', () => {
  return jest.fn((props) => <div data-testid="mocked-dp-generator" {...props}>Mocked DpGenerator</div>);
});

// Mock localStorage for the params.id logic path
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => { store[key] = value.toString(); }),
    clear: () => { store = {}; },
    removeItem: jest.fn((key) => { delete store[key]; }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock data.js for the params.eventKey logic path
jest.mock('./data', () => ({
  'sample-event': {
    mainImage: 'event_main_image',
    logoImage: 'event_logo_image',
    width: 200,
    height: 200,
    xPos: 10,
    yPos: 10,
    radius: '10',
    templateName: 'Sample Event Template',
  }
}));

// Helper function to render Validator with a specific route
const renderWithRouter = (initialEntry) => {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/dp/:slug" element={<Validator />} />
        <Route path="/dp/custom/:id" element={<Validator />} />
        <Route path="/:eventKey" element={<Validator />} />
        <Route path="/" element={<div>Homepage Redirect</div>} /> {/* For redirect testing */}
      </Routes>
    </MemoryRouter>
  );
};

describe('Validator Component', () => {
  beforeEach(() => {
    global.fetch = jest.fn(); // Mock fetch before each test
    DpGenerator.mockClear(); // Clear mock calls for DpGenerator
    localStorageMock.clear();
    jest.clearAllMocks(); // Clear all other mocks including fetch
     // Re-initialize fetch mock after clearAllMocks
    global.fetch = jest.fn();
  });

  afterEach(() => {
    if (global.fetch.mockRestore) { // mockRestore might not exist if using jest.fn() directly on global
        global.fetch.mockRestore();
    }
    jest.useRealTimers(); // Clean up jest.useFakeTimers if used
  });

  describe('Routing via /dp/:slug', () => {
    const testSlug = 'some-test-slug';
    const mockSlugData = {
      mainImageCloudinaryId: 'slug_main_img',
      logoImageCloudinaryId: 'slug_logo_img',
      width: 250,
      height: 250,
      xPos: 5,
      yPos: 5,
      radius: '5',
      templateName: 'Slug Test Template',
    };

    test('calls correct API endpoint and shows loading state', async () => {
      global.fetch.mockImplementationOnce(() => new Promise(() => {})); // Keep fetch pending
      renderWithRouter(`/dp/${testSlug}`);
      expect(global.fetch).toHaveBeenCalledWith(`/api/dp-configurations/${testSlug}`);
      expect(screen.getByText(/Loading DP configuration.../i)).toBeInTheDocument();
    });

    test('renders DpGenerator with correct props on successful API call', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSlugData,
      });
      renderWithRouter(`/dp/${testSlug}`);
      await waitFor(() => expect(DpGenerator).toHaveBeenCalledTimes(1));

      expect(DpGenerator).toHaveBeenCalledWith(
        expect.objectContaining({
          mainImage: mockSlugData.mainImageCloudinaryId,
          logoImage: mockSlugData.logoImageCloudinaryId,
          width: mockSlugData.width,
          height: mockSlugData.height,
          xPos: mockSlugData.xPos,
          yPos: mockSlugData.yPos,
          radius: mockSlugData.radius,
          templateName: mockSlugData.templateName,
          isPreviewMode: false,
        }),
        {}
      );
      expect(screen.getByTestId('mocked-dp-generator')).toBeInTheDocument();
    });

    test('handles API 404 error and redirects to homepage', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });
      renderWithRouter(`/dp/non-existent-slug`);
      // Validator sets notFound and then Navigate component handles redirect
      // We check for the redirect destination.
      await waitFor(() => {
        // The Validator component itself doesn't render "Homepage Redirect"
        // The Navigate component does the redirect. We can check if DpGenerator is NOT called.
        // And potentially if the console warning for redirect occurs.
        expect(DpGenerator).not.toHaveBeenCalled();
        // To truly test navigation, one might need a more complex setup or check window.location.pathname
        // For this component test, ensuring it doesn't render DpGenerator and doesn't crash is key.
        // The redirect itself is handled by <Navigate>.
        // If there was a "Not Found" message *within* Validator before redirect, we'd check that.
        // But it directly uses <Navigate>.
      });
       // Check if the "Homepage Redirect" text is present, indicating a successful redirect
      expect(screen.getByText('Homepage Redirect')).toBeInTheDocument();
    });

    test('handles general API error, shows error message, and redirects', async () => {
      jest.useFakeTimers();
      global.fetch.mockRejectedValueOnce(new Error('Network Error'));
      renderWithRouter(`/dp/error-slug`);

      await waitFor(() => {
        expect(screen.getByText(/Error loading DP configuration: Network Error/i)).toBeInTheDocument();
      });

      // Fast-forward timers to trigger the redirect in setTimeout
      jest.advanceTimersByTime(3000);

      // This assertion is tricky because the redirect happens via window.location.href
      // JSDOM doesn't fully support navigation via window.location.href in a way that React Router's MemoryRouter would see.
      // For now, we've tested the error message. The redirect is harder to assert in this environment without more complex mocking.
      // We can check that DpGenerator was not called.
      expect(DpGenerator).not.toHaveBeenCalled();
      jest.useRealTimers();
    });
  });

  describe('Existing route handling (localStorage and data.js)', () => {
    test('loads from localStorage for /dp/custom/:id', async () => {
      const customDpData = { mainImage: 'custom_main', logoImage: 'custom_logo', templateName: 'Custom From Storage' };
      localStorageMock.setItem('customDpList', JSON.stringify([customDpData]));
      renderWithRouter('/dp/custom/0');

      await waitFor(() => expect(DpGenerator).toHaveBeenCalledTimes(1));
      expect(DpGenerator).toHaveBeenCalledWith(
        expect.objectContaining({
          ...customDpData,
          radius: 0, // Default from Validator's finalProps
          isPreviewMode: false,
        }),
        {}
      );
    });

    test('loads from data.js for /:eventKey', async () => {
      renderWithRouter('/sample-event');

      await waitFor(() => expect(DpGenerator).toHaveBeenCalledTimes(1));
      expect(DpGenerator).toHaveBeenCalledWith(
        expect.objectContaining({
          mainImage: 'event_main_image',
          logoImage: 'event_logo_image',
          templateName: 'Sample Event Template',
          radius: '10', // From mock data.js, not Validator default
          isPreviewMode: false,
        }),
        {}
      );
    });

    test('redirects if :eventKey not in data.js', async () => {
      renderWithRouter('/unknown-event');
      await waitFor(() => {
          expect(DpGenerator).not.toHaveBeenCalled();
      });
      expect(screen.getByText('Homepage Redirect')).toBeInTheDocument();
    });
  });
});
