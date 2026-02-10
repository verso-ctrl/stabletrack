import React from 'react';
import { render, screen } from '@testing-library/react';
import { Breadcrumbs } from '../ui/Breadcrumbs';

describe('Breadcrumbs', () => {
  const items = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Horses', href: '/horses' },
    { label: 'Thunder' },
  ];

  it('renders all breadcrumb items', () => {
    render(<Breadcrumbs items={items} />);

    // Desktop breadcrumbs should contain all items
    // "Horses" appears twice (mobile back arrow + desktop breadcrumb)
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getAllByText('Horses').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Thunder')).toBeInTheDocument();
  });

  it('last item is not a link', () => {
    render(<Breadcrumbs items={items} />);

    // The last item (Thunder) should be rendered as a span, not a link
    const thunderElements = screen.getAllByText('Thunder');
    const desktopThunder = thunderElements.find(
      (el) => el.tagName === 'SPAN'
    );
    expect(desktopThunder).toBeDefined();
    expect(desktopThunder?.tagName).toBe('SPAN');
  });

  it('has correct aria-label on nav element', () => {
    render(<Breadcrumbs items={items} />);

    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Breadcrumb');
  });

  it('links have correct href attributes', () => {
    render(<Breadcrumbs items={items} />);

    const dashboardLinks = screen.getAllByText('Dashboard');
    const dashboardLink = dashboardLinks.find((el) => el.closest('a'));
    expect(dashboardLink?.closest('a')).toHaveAttribute('href', '/dashboard');

    const horsesLinks = screen.getAllByText('Horses');
    const horsesLink = horsesLinks.find((el) => el.closest('a'));
    expect(horsesLink?.closest('a')).toHaveAttribute('href', '/horses');
  });

  it('renders mobile back arrow to parent', () => {
    render(<Breadcrumbs items={items} />);

    // Mobile back arrow should link to the last item with an href (Horses)
    const horsesLinks = screen.getAllByText('Horses');
    // One should be in the mobile back arrow link
    const mobileLink = horsesLinks.find(
      (el) => el.closest('a')?.className.includes('sm:hidden')
    );
    expect(mobileLink).toBeDefined();
  });
});
