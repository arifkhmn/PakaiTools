import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

export const Breadcrumbs: React.FC<{ items: BreadcrumbItem[] }> = ({ items }) => {
  return (
    <nav aria-label="Breadcrumb" style={{ marginBottom: '16px' }}>
      <ol style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '6px',
        listStyle: 'none',
        fontSize: '0.8125rem',
        color: 'var(--text-secondary)'
      }}>
        <li style={{ display: 'inline-flex', alignItems: 'center' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              color: 'var(--text-secondary)'
            }}
          >
            <Home size={14} />
            <span>Beranda</span>
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <React.Fragment key={index}>
              <li aria-hidden="true" style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--text-muted)' }}>
                <ChevronRight size={14} />
              </li>
              <li style={{ display: 'inline-flex', alignItems: 'center' }}>
                {isLast || !item.path ? (
                  <span
                    aria-current={isLast ? 'page' : undefined}
                    style={{
                      color: isLast ? 'var(--text-primary)' : 'var(--text-secondary)',
                      fontWeight: isLast ? 600 : 400
                    }}
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link to={item.path} style={{ color: 'var(--text-secondary)' }}>
                    {item.label}
                  </Link>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};
