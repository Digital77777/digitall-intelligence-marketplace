import { describe, it, expect } from 'vitest';
import { render } from '@/test/test-utils';
import Footer from '../Footer';

describe('Footer', () => {
  it('renders footer component', () => {
    const { container } = render(<Footer />);
    const footer = container.querySelector('footer');
    expect(footer).toBeTruthy();
  });

  it('displays copyright information', () => {
    const { container } = render(<Footer />);
    const currentYear = new Date().getFullYear();
    expect(container.textContent).toContain(currentYear.toString());
  });

  it('contains navigation links', () => {
    const { container } = render(<Footer />);
    const links = container.querySelectorAll('a');
    expect(links.length).toBeGreaterThan(0);
  });
});
