import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Router } from 'react-router-dom'; // Router for useHistory
import { createMemoryHistory } from 'history'; // For testing history push
import CustomDpForm from './CustomDpForm';
import DpGenerator from './DpGenerator'; // Import DpGenerator

// Mock DpGenerator
jest.mock('./DpGenerator', () => {
  // Return a simple functional component mock that captures props
  return jest.fn((props) => <div data-testid="dp-generator-preview-mock" {...props}>Mocked DpGenerator</div>);
});

// Mock Cloudinary globally for all tests in this file
global.window.cloudinary = {
  createUploadWidget: jest.fn(),
};

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


describe('CustomDpForm', () => {
  beforeEach(() => {
    // Reset mocks before each test
    localStorageMock.clear();
    // jest.clearAllMocks(); // This would clear DpGenerator mock too early if not careful
    global.window.cloudinary.createUploadWidget.mockReset();
    DpGenerator.mockClear(); // Clear mock calls for DpGenerator specifically
  });

  test('renders all form inputs, submit button, and DpGenerator in preview mode', () => {
    render(<CustomDpForm />, { wrapper: MemoryRouter });

    expect(screen.getByLabelText(/Logo Width/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Logo Height/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Logo X Position/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Logo Y Position/i)).toBeInTheDocument();
    // Template Name input
    expect(screen.getByLabelText(/Template Name/i)).toBeInTheDocument();
    // Slug input
    expect(screen.getByLabelText(/Custom Slug \(Optional\)/i)).toBeInTheDocument();
    // Is Public checkbox
    expect(screen.getByLabelText(/Make this DP configuration public\?/i)).toBeInTheDocument();
    // Image upload buttons (checking by text on button or a more specific role if applicable)
    expect(screen.getByRole('button', { name: /Upload Logo via Cloudinary/i})).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Upload Main Image via Cloudinary/i})).toBeInTheDocument();

    expect(screen.getByLabelText(/Logo Radius/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create and Save DP Profile/i })).toBeInTheDocument();

    // Check for DpGenerator preview
    expect(screen.getByTestId('dp-generator-preview-mock')).toBeInTheDocument();
    expect(DpGenerator).toHaveBeenCalled();
    // Check initial props for DpGenerator, including isPreviewMode: true
    expect(DpGenerator).toHaveBeenLastCalledWith(
      expect.objectContaining({
        isPreviewMode: true,
        width: 300, // Initial state for width
        height: 300, // Initial state for height
        logoImage: 'plain_pw7uoh', // Default logoImage for preview
        mainImage: 'sample', // Default mainImage for preview
      }),
      {} // Second argument (context) for functional component
    );
  });

  test('input fields update their values and DpGenerator props', async () => {
    render(<CustomDpForm />, { wrapper: MemoryRouter });

    const widthInput = screen.getByLabelText(/Logo Width/i);
    const widthInput = screen.getByLabelText(/Logo Width/i);
    fireEvent.change(widthInput, { target: { value: '350' } });
    expect(widthInput.value).toBe('350');

    const heightInput = screen.getByLabelText(/Logo Height/i);
    fireEvent.change(heightInput, { target: { value: '350' } });
    expect(heightInput.value).toBe('350');

    const templateNameInput = screen.getByLabelText(/Template Name/i);
    fireEvent.change(templateNameInput, { target: { value: 'Test Template' } });
    expect(templateNameInput.value).toBe('Test Template');

    // DpGenerator should be re-rendered with new width
    await waitFor(() => {
      expect(DpGenerator).toHaveBeenLastCalledWith(
        expect.objectContaining({ width: 350, isPreviewMode: true }),
        {}
      );
    });

    // Check DpGenerator props update after changing templateName
    await waitFor(() => {
      expect(DpGenerator).toHaveBeenLastCalledWith(
        expect.objectContaining({ templateName: 'Test Template', isPreviewMode: true }),
        {}
      );
    });
  });

  // This test needs significant updates:
  // 1. Mock fetch for API call, not localStorage.
  // 2. Simulate Cloudinary widget callbacks correctly to set mainImagePublicId and logoImagePublicId.
  // 3. Verify the fetch payload.
  test('form submission with templateName and successful API call', async () => {
    // Mock window.fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'DP Configuration saved successfully' }),
      })
    );
    // Mock window.alert for success message
    const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});

    // Mock useNavigate
    const mockNavigate = jest.fn();
    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'), // use actual for all non-hook parts
      useNavigate: () => mockNavigate,
    }));


    // Mock Cloudinary widget behavior for main image and logo image
    let mainImageCallback;
    let logoImageCallback;

    global.window.cloudinary.createUploadWidget.mockImplementation((options, callback) => {
      if (options.cropping_aspect_ratio === 1) { // Assuming logo is square, main image might not be specified this way
         // Distinguish by some option or assume order: first call for logo, second for main? Or better, check sources/tags if used.
         // For this test, let's assume the test will trigger logo upload first, then main image upload.
         // This is fragile. A better way would be to have the button clicks distinct in the test.
         // Let's refine this: the component calls uploadLogoImageViaWidget or uploadSampleImageViaWidget.
         // We can check which button is clicked.
         // For now, let's make the mock more general and the test will control flow.
        logoImageCallback = callback; // Capture callback for logo
      } else {
        mainImageCallback = callback; // Capture callback for main image
      }
      return {
        open: jest.fn(() => {
          // Simulate immediate success for the widget that was opened
          if (options.cropping_aspect_ratio === 1 && logoImageCallback) { // Logo
            logoImageCallback(null, { event: 'success', info: { public_id: 'test_logo_id_from_widget' } });
          } else if (mainImageCallback) { // Main image
            mainImageCallback(null, { event: 'success', info: { public_id: 'test_main_image_id_from_widget' } });
          }
        }),
      };
    });

    render(<CustomDpForm />, { wrapper: MemoryRouter });

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/Logo Width/i), { target: { value: '400' } });
    fireEvent.change(screen.getByLabelText(/Logo Height/i), { target: { value: '400' } });
    fireEvent.change(screen.getByLabelText(/Logo X Position/i), { target: { value: '20' } });
    fireEvent.change(screen.getByLabelText(/Logo Y Position/i), { target: { value: '20' } });
    fireEvent.change(screen.getByLabelText(/Template Name/i), { target: { value: 'My API Template' } });
    fireEvent.change(screen.getByLabelText(/Logo Radius/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/Custom Slug \(Optional\)/i), { target: { value: 'my-api-slug' } });
    fireEvent.click(screen.getByLabelText(/Make this DP configuration public\?/i)); // Make it private for testing isPublic: false

    // Simulate Logo Image Upload
    fireEvent.click(screen.getByRole('button', {name: /Upload Logo via Cloudinary/i}));
    // The mock for createUploadWidget should ensure logoImageCallback is called, setting state.
     await waitFor(() => {
      expect(screen.getByText(/Logo uploaded: test_logo_id_from_widget/i)).toBeInTheDocument();
    });


    // Simulate Main Image Upload
    // Re-mock for the main image upload specifically if the first mock was too general
     global.window.cloudinary.createUploadWidget.mockImplementationOnce((options, callback) => {
      mainImageCallback = callback;
      return {
        open: jest.fn(() => {
            mainImageCallback(null, { event: 'success', info: { public_id: 'test_main_image_id_from_widget' } });
        }),
      };
    });
    fireEvent.click(screen.getByRole('button', {name: /Upload Main Image via Cloudinary/i}));
    await waitFor(() => {
      expect(screen.getByText(/Main image uploaded: test_main_image_id_from_widget/i)).toBeInTheDocument();
    });


    // Click submit
    const submitButton = screen.getByRole('button', { name: /Create and Save DP Profile/i });
    fireEvent.click(submitButton);

    // Assertions
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/dp-configurations',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mainImageCloudinaryId: 'test_main_image_id_from_widget',
            logoImageCloudinaryId: 'test_logo_id_from_widget',
            width: 400,
            height: 400,
            xPos: 20,
            yPos: 20,
            radius: '10',
            templateName: 'My API Template',
            customSlug: 'my-api-slug',
            isPublic: false, // It was true by default, then clicked, so it becomes false
          }),
        })
      );
    });

    expect(mockAlert).toHaveBeenCalledWith('Custom DP saved successfully to database!');
    // expect(mockNavigate).toHaveBeenCalledWith('/'); // Check navigation after successful save

    mockAlert.mockRestore();
    global.fetch.mockClear();
  });

  test('form submission fails if main image public ID is missing', async () => {
    const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});
    render(<CustomDpForm />, { wrapper: MemoryRouter });

    // Fill other required fields but not main image
    fireEvent.change(screen.getByLabelText(/Template Name/i), { target: { value: 'Test No Main Image' } });
     // Simulate Logo Image Upload to satisfy that requirement
    global.window.cloudinary.createUploadWidget.mockImplementationOnce((options, callback) => {
      return { open: jest.fn(() => callback(null, { event: 'success', info: { public_id: 'logo_for_no_main_test' } })) };
    });
    fireEvent.click(screen.getByRole('button', {name: /Upload Logo via Cloudinary/i}));
    await waitFor(() => screen.getByText(/Logo uploaded: logo_for_no_main_test/i));


    fireEvent.click(screen.getByRole('button', { name: /Create and Save DP Profile/i }));
    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Please upload a sample image first for the main DP.');
    });
    mockAlert.mockRestore();
  });

  test('form submission fails if logo image public ID is missing', async () => {
    const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});
    render(<CustomDpForm />, { wrapper: MemoryRouter });

    fireEvent.change(screen.getByLabelText(/Template Name/i), { target: { value: 'Test No Logo Image' } });
    // Simulate Main Image Upload
    global.window.cloudinary.createUploadWidget.mockImplementationOnce((options, callback) => {
      return { open: jest.fn(() => callback(null, { event: 'success', info: { public_id: 'main_for_no_logo_test' } })) };
    });
    fireEvent.click(screen.getByRole('button', {name: /Upload Main Image via Cloudinary/i}));
    await waitFor(() => screen.getByText(/Main image uploaded: main_for_no_logo_test/i));

    // Ensure logo image public ID is not set (it's empty string by default)

    fireEvent.click(screen.getByRole('button', { name: /Create and Save DP Profile/i }));
    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Please upload an overlay logo image.');
    });
    mockAlert.mockRestore();
  });


  test('layout structure includes two columns', () => {
    const { container } = render(<CustomDpForm />, { wrapper: MemoryRouter });
    // Check for the presence of two elements that are likely to be the columns
    // This is a basic check; more specific data-testid attributes would be robust
    const columns = container.querySelectorAll('.col-md-6');
    expect(columns.length).toBeGreaterThanOrEqual(2); // Expect at least two such columns
  });
});
