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
    expect(screen.getByLabelText(/Overlay Logo Image \(Cloudinary Public ID\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Logo Radius/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Main DP Image \(Your Photo\)/i)).toBeInTheDocument();
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
    fireEvent.change(widthInput, { target: { value: '350' } });
    expect(widthInput.value).toBe('350');

    const heightInput = screen.getByLabelText(/Logo Height/i);
    fireEvent.change(heightInput, { target: { value: '350' } });
    expect(heightInput.value).toBe('350');

    const xPosInput = screen.getByLabelText(/Logo X Position/i);
    fireEvent.change(xPosInput, { target: { value: '10' } });
    expect(xPosInput.value).toBe('10');

    const yPosInput = screen.getByLabelText(/Logo Y Position/i);
    fireEvent.change(yPosInput, { target: { value: '10' } });
    expect(yPosInput.value).toBe('10');

    const logoImageInput = screen.getByLabelText(/Overlay Logo Image \(Cloudinary Public ID\)/i);
    fireEvent.change(logoImageInput, { target: { value: 'test_logo_id' } });
    expect(logoImageInput.value).toBe('test_logo_id');

    const radiusInput = screen.getByLabelText(/Logo Radius/i);
    fireEvent.change(radiusInput, { target: { value: '50' } });
    expect(radiusInput.value).toBe('50');

    // Check DpGenerator props update after changing width
    const widthInput = screen.getByLabelText(/Logo Width/i);
    fireEvent.change(widthInput, { target: { value: '350' } });
    expect(widthInput.value).toBe('350');
    // DpGenerator should be re-rendered with new width
    // Need to wait for state update and re-render
    await waitFor(() => {
      expect(DpGenerator).toHaveBeenLastCalledWith(
        expect.objectContaining({ width: 350, isPreviewMode: true }),
        {}
      );
    });

    // Test logoImage prop update
    const logoImageInput = screen.getByLabelText(/Overlay Logo Image \(Cloudinary Public ID\)/i);
    fireEvent.change(logoImageInput, { target: { value: 'new_logo_id' } });
    expect(logoImageInput.value).toBe('new_logo_id');
    await waitFor(() => {
      expect(DpGenerator).toHaveBeenLastCalledWith(
        expect.objectContaining({ logoImage: 'new_logo_id', isPreviewMode: true }),
        {}
      );
    });
  });

  test('DpGenerator preview updates after image upload', async () => {
    const mockUploadWidgetOpen = jest.fn();
    global.window.cloudinary.createUploadWidget.mockImplementation((options, callback) => {
      setTimeout(() => callback(null, { event: 'success', info: { public_id: 'uploaded_image_id_123' } }), 0);
      return { open: mockUploadWidgetOpen };
    });

    render(<CustomDpForm />, { wrapper: MemoryRouter });

    const sampleImageInput = screen.getByLabelText(/Main DP Image \(Your Photo\)/i);
    const dummyFile = new File(['(⌐□_□)'], 'testfile.png', { type: 'image/png' });
    fireEvent.change(sampleImageInput, { target: { files: [dummyFile] } });

    expect(mockUploadWidgetOpen).toHaveBeenCalled();

    await waitFor(() => {
      expect(DpGenerator).toHaveBeenLastCalledWith(
        expect.objectContaining({ mainImage: 'uploaded_image_id_123', isPreviewMode: true }),
        {}
      );
    });
  });


  test('form submission with successful image upload', async () => {
    const mockUploadWidgetOpen = jest.fn();
    global.window.cloudinary.createUploadWidget.mockImplementation((options, callback) => {
      // Simulate a successful upload
      // The callback would be called by Cloudinary's widget
      // For testing, we can call it directly after a timeout or a specific event
      // Here we simulate calling it as if the user completed an upload successfully
      setTimeout(() => callback(null, { event: 'success', info: { public_id: 'test_main_image_id' } }), 0);
      return {
        open: mockUploadWidgetOpen, // mock the open function of the widget
      };
    });

    const history = createMemoryHistory();

    render(
      <Router history={history}>
        <CustomDpForm />
      </Router>
    );

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/Logo Width/i), { target: { value: '400' } });
    fireEvent.change(screen.getByLabelText(/Logo Height/i), { target: { value: '400' } });
    fireEvent.change(screen.getByLabelText(/Logo X Position/i), { target: { value: '20' } });
    fireEvent.change(screen.getByLabelText(/Logo Y Position/i), { target: { value: '20' } });
    fireEvent.change(screen.getByLabelText(/Overlay Logo Image \(Cloudinary Public ID\)/i), { target: { value: 'logo_public_id' } });
    fireEvent.change(screen.getByLabelText(/Logo Radius/i), { target: { value: '10' } });

    // Simulate file selection for main DP image
    // This will trigger the upload
    const sampleImageInput = screen.getByLabelText(/Main DP Image \(Your Photo\)/i);
    const dummyFile = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
    fireEvent.change(sampleImageInput, { target: { files: [dummyFile] } });

    // The upload widget's open function should be called
    expect(mockUploadWidgetOpen).toHaveBeenCalled();

    // Wait for the simulated upload to complete and state to update
    await waitFor(() => {
      expect(screen.getByText(/Main image uploaded: test_main_image_id/i)).toBeInTheDocument();
    });

    // Click submit
    const submitButton = screen.getByRole('button', { name: /Create and Save DP Profile/i });
    fireEvent.click(submitButton);

    // Assertions
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'customDpList',
        expect.stringContaining('"mainImage":"test_main_image_id"')
      );
    });

    const storedData = JSON.parse(localStorageMock.getItem('customDpList'));
    expect(storedData[0]).toMatchObject({
      width: 400,
      height: 400,
      xPos: 20,
      yPos: 20,
      logoImage: 'logo_public_id',
      radius: 10,
      mainImage: 'test_main_image_id',
    });

    expect(history.location.pathname).toBe('/');
  });

  test('form submission fails if main image is not uploaded', async () => {
    // Mock window.alert
    const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(<CustomDpForm />, { wrapper: MemoryRouter });

    fireEvent.change(screen.getByLabelText(/Logo Width/i), { target: { value: '400' } });
    fireEvent.change(screen.getByLabelText(/Overlay Logo Image \(Cloudinary Public ID\)/i), { target: { value: 'logo_public_id_for_submit' } });
    // ... fill other fields except triggering upload ...

    const submitButton = screen.getByRole('button', { name: /Create and Save DP Profile/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      // Alert because mainImagePublicId is not set
      expect(mockAlert).toHaveBeenCalledWith('Please upload a sample image first for the main DP.');
    });

    expect(localStorageMock.setItem).not.toHaveBeenCalled();

    // Now test alert if logoImage is missing
    // Simulate main image upload first
     const mockUploadWidgetOpen = jest.fn();
    global.window.cloudinary.createUploadWidget.mockImplementation((options, callback) => {
      setTimeout(() => callback(null, { event: 'success', info: { public_id: 'test_main_image_id_for_alert' } }), 0);
      return { open: mockUploadWidgetOpen, };
    });
    const sampleImageInput = screen.getByLabelText(/Main DP Image \(Your Photo\)/i);
    const dummyFile = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
    fireEvent.change(sampleImageInput, { target: { files: [dummyFile] } });
     await waitFor(() => {
      expect(screen.getByText(/Main image uploaded: test_main_image_id_for_alert/i)).toBeInTheDocument();
    });
    // Clear logoImage input
    fireEvent.change(screen.getByLabelText(/Overlay Logo Image \(Cloudinary Public ID\)/i), { target: { value: '' } });
    fireEvent.click(submitButton);
    await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Please provide a Cloudinary Public ID for the overlay logo.');
    });


    mockAlert.mockRestore(); // Restore original alert
  });

  test('layout structure includes two columns', () => {
    const { container } = render(<CustomDpForm />, { wrapper: MemoryRouter });
    // Check for the presence of two elements that are likely to be the columns
    // This is a basic check; more specific data-testid attributes would be robust
    const columns = container.querySelectorAll('.col-md-6');
    expect(columns.length).toBeGreaterThanOrEqual(2); // Expect at least two such columns
  });
});
