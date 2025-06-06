import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DpGenerator from './DpGenerator';

// Mock Cloudinary globally for DpGenerator's internal uploadWidget
// (though it shouldn't be called in isPreviewMode=true tests)
global.window.cloudinary = {
  createUploadWidget: jest.fn(() => ({
    open: jest.fn(), // Mock the open function
  })),
};

describe('DpGenerator', () => {
  const defaultProps = {
    width: 300,
    height: 300,
    xPos: 10,
    yPos: 10,
    mainImage: 'sample_main', // Default base image for tests
    radius: '0',
    logoImage: 'sample_logo', // Default overlay logo for tests
  };

  beforeEach(() => {
    jest.clearAllMocks(); // Clear Cloudinary mocks
  });

  describe('isPreviewMode = true', () => {
    test('renders only the DP image and not interactive controls', () => {
      render(<DpGenerator {...defaultProps} isPreviewMode={true} />);

      // Check that the main image is present
      const dpImage = screen.getByAltText('Generated DP');
      expect(dpImage).toBeInTheDocument();

      // Check that interactive elements are NOT present
      expect(screen.queryByRole('button', { name: /Upload Your Picture/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Change Your Picture/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /Download/i })).not.toBeInTheDocument();
      expect(screen.queryByText(/Create your custom DP/i)).not.toBeInTheDocument(); // h3 title
      expect(screen.queryByAltText('Event Logo')).not.toBeInTheDocument(); // Top event logo
    });

    test('constructs correct Cloudinary URL for preview', () => {
      const previewMainImage = 'user_uploaded_photo_id';
      const previewLogoImage = 'user_selected_logo_id';
      render(
        <DpGenerator
          {...defaultProps}
          mainImage={previewMainImage} // In preview, this is the user's photo
          logoImage={previewLogoImage} // In preview, this is the overlay logo
          width={250}
          height={200}
          xPos={5}
          yPos={15}
          radius={'max'}
          isPreviewMode={true}
        />
      );
      const dpImage = screen.getByAltText('Generated DP');
      expect(dpImage).toHaveAttribute(
        'src',
        expect.stringContaining(`l_${previewLogoImage},w_250,h_200,c_fill,x_5,y_15,r_max/${previewMainImage}`)
      );
    });
     test('constructs correct Cloudinary URL for preview when only mainImage is provided', () => {
      const previewMainImage = 'user_uploaded_photo_id_only';
      render(
        <DpGenerator
          {...defaultProps}
          mainImage={previewMainImage} // In preview, this is the user's photo
          logoImage="" // No logo image
          isPreviewMode={true}
        />
      );
      const dpImage = screen.getByAltText('Generated DP');
      // URL should just be the main image without logo transformations
      expect(dpImage).toHaveAttribute(
        'src',
        expect.stringContaining(`w_1080,h_1080,c_fill/${previewMainImage}`)
      );
       expect(dpImage.src).not.toContain('l_'); // Should not contain logo overlay part
    });
  });

  describe('isPreviewMode = false (Default Interactive Mode)', () => {
    test('renders DP image and all interactive controls', () => {
      render(<DpGenerator {...defaultProps} isPreviewMode={false} />);

      expect(screen.getByAltText('Generated DP')).toBeInTheDocument();
      expect(screen.getByAltText('Event Logo')).toBeInTheDocument(); // Top event logo
      expect(screen.getByRole('button', { name: /Upload Your Picture/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Download/i })).toBeInTheDocument();
      expect(screen.getByText(/Create your custom DP/i)).toBeInTheDocument(); // h3 title
    });

    test('constructs initial Cloudinary URL with overlay on mainImage prop', () => {
      render(<DpGenerator {...defaultProps} />);
      const dpImage = screen.getByAltText('Generated DP');
      expect(dpImage).toHaveAttribute(
        'src',
        // Initially, uploadedUserPhotoId is empty, so mainImage prop is the base
        expect.stringContaining(`l_${defaultProps.logoImage},w_${defaultProps.width},h_${defaultProps.height},c_fill,x_${defaultProps.xPos},y_${defaultProps.yPos},r_${defaultProps.radius}/${defaultProps.mainImage}`)
      );
    });

    test('updates Cloudinary URL and download link after simulated user photo upload', async () => {
      const mockOpen = jest.fn();
      global.window.cloudinary.createUploadWidget.mockImplementation((options, callback) => {
        // Simulate successful upload
        setTimeout(() => callback(null, { event: 'success', info: { public_id: 'new_user_photo_id' } }), 0);
        return { open: mockOpen };
      });

      render(<DpGenerator {...defaultProps} />);

      const uploadButton = screen.getByRole('button', { name: /Upload Your Picture/i });
      fireEvent.click(uploadButton);

      expect(mockOpen).toHaveBeenCalled();

      await waitFor(() => {
        const dpImage = screen.getByAltText('Generated DP');
        expect(dpImage).toHaveAttribute(
          'src',
          // Now, new_user_photo_id should be the base for the overlay
          expect.stringContaining(`l_${defaultProps.logoImage},w_${defaultProps.width},h_${defaultProps.height},c_fill,x_${defaultProps.xPos},y_${defaultProps.yPos},r_${defaultProps.radius}/new_user_photo_id`)
        );
      });

      await waitFor(() => {
        const downloadLink = screen.getByRole('link', { name: /Download/i });
        expect(downloadLink).toHaveAttribute(
            'href',
            expect.stringContaining(`fl_attachment:my_dp`)
        );
        expect(downloadLink).toHaveAttribute(
            'href',
            expect.stringContaining(`l_${defaultProps.logoImage},w_${defaultProps.width},h_${defaultProps.height},c_fill,x_${defaultProps.xPos},y_${defaultProps.yPos},r_${defaultProps.radius}/new_user_photo_id`)
        );
      });
      // Button text should change
      expect(screen.getByRole('button', { name: /Change Your Picture/i })).toBeInTheDocument();
    });

     test('download link is initially disabled or points to #', () => {
      render(<DpGenerator {...defaultProps} isPreviewMode={false} />);
      const downloadLink = screen.getByRole('link', { name: /Download/i });
      // It should be disabled (via className) or href="#" if no user image uploaded yet
      expect(downloadLink).toHaveClass('disabled'); // or check href === '#'
      // Check that it does not contain fl_attachment initially if it's truly disabled
      expect(downloadLink.href).not.toContain('fl_attachment:my_dp');
    });
  });
});
