import React from 'react';
import { render, screen } from '@testing-library/react';
import Led from '@components/parts/Led';

describe('Led component', () => {
    it('should have "on" class when isActive is true', () => {
        render(<Led className="test" isActive={true} />);
        const element = screen.getByRole('img');
        expect(element).toHaveClass('on');
        expect(element).not.toHaveClass('off');
    });

    it('should have "off" class when isActive is false', () => {
        render(<Led className="test" isActive={false} />);
        const element = screen.getByRole('img');
        expect(element).toHaveClass('off');
        expect(element).not.toHaveClass('on');
    });
});