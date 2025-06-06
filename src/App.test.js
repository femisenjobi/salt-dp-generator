import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import DpGenerator from './DpGenerator'; // Import DpGenerator to check its props later

// Mock DpGenerator to inspect its props
jest.mock('./DpGenerator', () => {
  const MockDpGenerator = jest.fn((props) => (
    <div data-testid="dp-generator-mock">
      <img src={`https://res.cloudinary.com/dmlyic7tt/image/upload/w_1080,h_1080/${props.mainImage}`} alt="Main DP" />
      <img src={`https://res.cloudinary.com/dmlyic7tt/image/upload/h_220/${props.logoImage}`} alt="Logo" />
      <p>Width: {props.width}</p>
      <p>Height: {props.height}</p>
      <p>XPos: {props.xPos}</p>
      <p>YPos: {props.yPos}</p>
      <p>Radius: {props.radius}</p>
    </div>
  ));
  return MockDpGenerator;
});

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


describe('App Routing and Validator Integration', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks(); // Clear all mocks, including DpGenerator mock calls
  });

  test('renders Homepage for root path', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText(/Choose a DP Template/i)).toBeInTheDocument();
  });

  test('renders CustomDpForm for /create-custom-dp path', () => {
    render(
      <MemoryRouter initialEntries={['/create-custom-dp']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText(/Create Your Custom DP/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create and Save DP Profile/i})).toBeInTheDocument();
  });

  test('Validator fetches and passes predefined template data to DpGenerator', async () => {
    // Assuming 'salt' is a valid eventKey in data.js
    // data.js: export default { salt: { mainImage: '...', logoImage: '...', ... } }
    const eventKey = 'salt'; // A known key from data.js
    render(
      <MemoryRouter initialEntries={[`/${eventKey}`]}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(DpGenerator).toHaveBeenCalled();
    });

    // DpGenerator is mocked, so we check the props it was called with
    // This requires data.js to have a 'salt' entry.
    // For a more robust test, you could mock data.js or ensure 'salt' exists.
    // For now, we assume 'salt' is in data.js as per original structure.
    // Example: data.js might have: salt: { mainImage: 'salt_main_image_id', logoImage: 'salt_logo_id', width: 300, ... }
    const expectedProps = expect.objectContaining({
      mainImage: expect.any(String), // We don't know the exact value from data.js here
      logoImage: expect.any(String),
    });

    await waitFor(() => {
        expect(DpGenerator).toHaveBeenCalledWith(expectedProps, {});
    });
    // Check if the mock component rendered something based on expected props
    // This is a bit indirect. The key is checking DpGenerator's props.
    expect(screen.getByTestId('dp-generator-mock')).toBeInTheDocument();
  });

  test('Validator fetches and passes custom DP data from localStorage to DpGenerator', async () => {
    const customDpData = {
      name: 'My Test Custom DP',
      description: 'A DP for testing.',
      mainImage: 'custom_test_main_image_id',
      logoImage: 'custom_test_logo_id',
      width: 350,
      height: 350,
      xPos: 25,
      yPos: 25,
      radius: 15,
    };
    localStorageMock.setItem('customDpList', JSON.stringify([customDpData]));

    render(
      <MemoryRouter initialEntries={['/dp/custom/0']}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(DpGenerator).toHaveBeenCalled();
    });

    // Check that DpGenerator was called with the props from localStorage
    expect(DpGenerator).toHaveBeenCalledWith(
      expect.objectContaining({
        mainImage: 'custom_test_main_image_id',
        logoImage: 'custom_test_logo_id',
        width: 350,
        height: 350,
        xPos: 25,
        yPos: 25,
        radius: 15,
      }),
      {} // Second argument to functional component calls is context (empty for shallow render)
    );

    // Also check if the mocked DpGenerator rendered elements based on these props
    expect(screen.getByTestId('dp-generator-mock')).toBeInTheDocument();
    expect(screen.getByAltText('Main DP')).toHaveAttribute('src', expect.stringContaining(customDpData.mainImage));
    expect(screen.getByAltText('Logo')).toHaveAttribute('src', expect.stringContaining(customDpData.logoImage));
    expect(screen.getByText(`Width: ${customDpData.width}`)).toBeInTheDocument();
    expect(screen.getByText(`Radius: ${customDpData.radius}`)).toBeInTheDocument();

  });

  test('Validator redirects to homepage if custom DP ID is not found', async () => {
    localStorageMock.setItem('customDpList', JSON.stringify([])); // Empty list

    const { container } = render(
      <MemoryRouter initialEntries={['/dp/custom/0']}>
        <App />
      </MemoryRouter>
    );

    // Expect redirect to occur, so DpGenerator mock should not be called
    // and homepage content should appear.
    await waitFor(() => {
      expect(screen.getByText(/Choose a DP Template/i)).toBeInTheDocument();
    });
    expect(DpGenerator).not.toHaveBeenCalled();
     // Check if current path is '/' (MemoryRouter doesn't change window.location)
     // This is harder to check directly without access to history object from outside.
     // The presence of homepage content is a strong indicator.
  });

  test('Validator redirects to homepage if eventKey is not found', async () => {
    render(
      <MemoryRouter initialEntries={['/nonexistent-event-key']}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Choose a DP Template/i)).toBeInTheDocument();
    });
    expect(DpGenerator).not.toHaveBeenCalled();
  });

});
