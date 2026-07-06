'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */

import React from 'react';
import ReactMarkdown from 'react-markdown';
import DOMPurify from 'isomorphic-dompurify';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content?: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  if (!content) return null;

  const isHtml = content.trim().startsWith('<');

  if (isHtml) {
    const sanitizedHtml = DOMPurify.sanitize(content);
    return (
      <div 
        className={cn("prose prose-invert max-w-none text-nbac-body font-light text-sm leading-relaxed space-y-5 text-left", className)}
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    );
  }

  return (
    <div className={cn("text-nbac-body font-light text-sm leading-relaxed space-y-5", className)}>
      <ReactMarkdown
        components={{
          h1: ({ node: _node, ...props }) => (
            <h1 className="font-display text-2xl md:text-3xl font-bold mt-8 mb-4 text-nbac-text tracking-tight leading-tight" {...props} />
          ),
          h2: ({ node: _node, ...props }) => (
            <h2 className="font-display text-xl md:text-2xl font-bold mt-6 mb-3 text-nbac-text tracking-tight border-b border-nbac-border pb-1" {...props} />
          ),
          h3: ({ node: _node, ...props }) => (
            <h3 className="font-sans text-base font-semibold text-nbac-text mt-4 mb-2" {...props} />
          ),
          blockquote: ({ node: _node, children, ...props }) => {
            // Check if this blockquote is a Highlight panel card
            const textContent = React.Children.toArray(children)
              .map(child => {
                if (typeof child === 'string') return child;
                if (React.isValidElement(child) && child.props && typeof child.props === 'object' && 'children' in child.props) {
                  return String((child.props as { children?: unknown }).children);
                }
                return '';
              })
              .join(' ');

            if (/Highlight:/i.test(textContent)) {
              return (
                <div className="bg-nbac-panel border border-nbac-border border-l-4 border-l-nbac-gold rounded-r-lg p-4 my-3 text-left">
                  {children}
                </div>
              );
            }

            return (
              <blockquote className="border-l-4 border-nbac-gold bg-nbac-canvas/50 px-4 py-2.5 my-3 text-nbac-body italic rounded-r-md text-left" {...props}>
                {children}
              </blockquote>
            );
          },
          ul: ({ node: _node, ...props }) => (
            <ul className="list-disc pl-5 space-y-1 my-2 text-left" {...props} />
          ),
          ol: ({ node: _node, ...props }) => (
            <ol className="list-decimal pl-5 space-y-1 my-2 text-left" {...props} />
          ),
          li: ({ node: _node, ...props }) => (
            <li className="font-sans font-light text-nbac-body" {...props} />
          ),
          p: ({ node: _node, ...props }) => (
            <p className="text-nbac-body whitespace-pre-wrap text-left" {...props} />
          ),
          pre: ({ node: _node, ...props }) => (
            <pre className="bg-nbac-alt/80 border border-nbac-border rounded-xl p-5 my-6 overflow-x-auto text-xs text-nbac-muted font-mono leading-relaxed text-left" {...props} />
          ),
          code: ({ node: _node, ...props }) => (
            <code className="bg-nbac-canvas px-1.5 py-0.5 rounded text-nbac-gold font-mono text-xs border border-nbac-border" {...props} />
          ),
          img: ({ node: _node, ...props }) => (
            <div className="my-4 border border-nbac-border rounded-lg overflow-hidden bg-nbac-panel p-2 text-center select-none">
              {props.src ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={props.src} alt={props.alt} className="max-h-56 w-full object-cover rounded" />
              ) : (
                <div className="h-32 bg-nbac-canvas flex items-center justify-center text-nbac-muted text-xs">No image provided</div>
              )}
              {props.alt && <span className="text-[11px] text-nbac-muted mt-1.5 block text-center italic">{props.alt}</span>}
            </div>
          ),
          a: ({ node: _node, children, ...props }) => {
            const rawUrl = props.href || '#';
            const isSafe = rawUrl.startsWith('/') || rawUrl.startsWith('#') || /^https?:\/\//i.test(rawUrl.trim());
            const safeUrl = isSafe ? rawUrl.trim() : '#';
            
            const childrenText = String(children || '');
            if (childrenText.startsWith('CTA:')) {
              const label = childrenText.replace(/^CTA:\s*/i, '').trim();
              return (
                <div className="my-4 text-left">
                  <a 
                    href={safeUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-block bg-nbac-emerald hover:bg-nbac-emerald-dark text-white text-xs font-semibold px-4 py-2 rounded-full transition-colors shadow-sm"
                  >
                    {label || 'Button Link'}
                  </a>
                </div>
              );
            }
            
            return (
              <a 
                href={safeUrl} 
                target="_blank" 
                rel="noreferrer"
                className="text-nbac-emerald hover:underline font-medium"
              >
                {children}
              </a>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
