'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Globe, 
  FileEdit, 
  X, 
  Eye, 
  PenTool, 
  Sparkles, 
  RotateCcw,
  BookOpen,
  ArrowUp,
  ArrowDown,
  Megaphone,
  Newspaper,
  Handshake,
  Calendar,
  FilePlus,
  FileText,
  Link as LinkIcon,
  Image as ImageIcon,
  Heading as HeadingIcon,
  List as ListIcon,
  Quote as QuoteIcon,
  Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminRole } from '@/hooks/use-admin-role';
import { RoleBanner } from '@/components/admin/role-banner';
import { POST_TEMPLATES } from '@/lib/post-templates';
import { cn } from '@/lib/utils';
import { getStoredPosts, saveStoredPosts } from '@/lib/blog-data';


// Block Editor Types
interface PostBlock {
  id: string;
  type: 'paragraph' | 'heading' | 'list' | 'quote' | 'image' | 'button' | 'highlight';
  headingLevel?: 'h1' | 'h2' | 'h3';
  listType?: 'bullet' | 'ordered';
  textValue?: string;
  listValues?: string[];
  urlValue?: string;
  labelValue?: string;
  imageTab?: 'upload' | 'preset' | 'url';
}

interface MockPost {
  id: string;
  title: string;
  type: string;
  status: 'published' | 'draft';
  updated_at: string;
  author: string;
  body?: string; // Stored as standard Markdown in database
  featured_image?: string;
}

const initialPosts: MockPost[] = [
  {
    id: 'post_1',
    title: 'Nigerian Business Aviation Outlook 2026 Report Released',
    type: 'Press Release',
    status: 'published',
    updated_at: '2026-06-25 14:30',
    author: 'Chief Coordinator',
    featured_image: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?q=80&w=600&auto=format&fit=crop',
    body: `# Nigerian Business Aviation Outlook 2026

We are proud to release the official **NBAC Business Aviation Outlook Report for 2026**. This comprehensive document covers traffic data, regulatory developments, and market forecasts for Nigeria and the wider West African region.

## Key Highlights from the Report
* **Traffic Growth:** International private jet movements in Lagos and Abuja increased by **12%** year-on-year.
* **Fleet Expansion:** Over **15 new corporate aircraft** were registered in West Africa during the last 18 months.
* **FBO Infrastructure:** Ground handling services have seen a **25% increase** in capital investment.

[CTA: Download Report PDF](file:///download/report.pdf)`
  },
  {
    id: 'post_2',
    title: 'Keynote Panelist Announcement: Ministry officials confirmed',
    type: 'Announcement',
    status: 'published',
    updated_at: '2026-06-20 09:15',
    author: 'Staff Editor',
    featured_image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=600&auto=format&fit=crop',
    body: `# Keynote Panel Confirmations

The NBAC Organizing Committee is excited to confirm that directors from the **Nigerian Civil Aviation Authority (NCAA)** and the **Federal Airports Authority of Nigeria (FAAN)** will participate in our Day 1 plenary panel.

> **Highlight: Regulation Panel**
> Plenary Session focused on cross-border logistics and private terminal slots.`
  },
  {
    id: 'post_3',
    title: 'Sponsorship slots now closed for Hangar Exhibitors',
    type: 'Sponsor Update',
    status: 'draft',
    updated_at: '2026-06-28 17:00',
    author: 'Staff Editor',
    featured_image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=600&auto=format&fit=crop',
    body: `# Sponsorship Announcement: Hangar Slots Closed

Please note that all **exhibitor booths and hangar display slots** for the NBAC 2026 exhibition have now been fully reserved.

## What next?
* Standard Delegate and VIP Passes are still available.
* Advertising slots in the official conference directory remain open until **October 1st**.`
  }
];

const PRESET_IMAGES = [
  { name: 'Private Jet Tarmac', url: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?q=80&w=600&auto=format&fit=crop' },
  { name: 'VIP Conference Panel', url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=600&auto=format&fit=crop' },
  { name: 'Delegate Networking', url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=600&auto=format&fit=crop' },
  { name: 'Business Aviation Lounge', url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=600&auto=format&fit=crop' },
  { name: 'Executive Meeting Room', url: 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?q=80&w=600&auto=format&fit=crop' }
];

// Visual Template Categories mapping to ref image
const CATEGORY_CARDS = [
  {
    id: 'Announcement',
    title: 'Announcement',
    description: 'Standard format for public announcements, policy changes, or urgent operational updates.',
    icon: Megaphone
  },
  {
    id: 'Press Release',
    title: 'Press Release',
    description: 'Structured format for media distribution, including embargo dates and boilerplate text.',
    icon: Newspaper
  },
  {
    id: 'Sponsor Update',
    title: 'Sponsor Update',
    description: 'Targeted communication for event sponsors, detailing logistics and promotional opportunities.',
    icon: Handshake
  },
  {
    id: 'Event Copy',
    title: 'Event Copy',
    description: 'Highlight panel sessions, VIP pass details, and tarmac aircraft static display descriptions.',
    icon: Calendar
  },
  {
    id: 'Blank Document',
    title: 'Blank Document',
    description: 'Start from scratch with a clean editor. Best for unique content that doesn\'t fit standard molds.',
    icon: FilePlus
  }
];

// Parser: Markdown Text -> PostBlocks
function parseMarkdownToBlocks(markdown: string): PostBlock[] {
  if (!markdown || !markdown.trim()) {
    return [{ id: `block_1`, type: 'paragraph', textValue: '' }];
  }

  const lines = markdown.split('\n');
  const blocks: PostBlock[] = [];
  let currentListBlock: PostBlock | null = null;
  let currentParagraphText = '';

  const flushParagraph = () => {
    if (currentParagraphText.trim()) {
      blocks.push({
        id: `block_${Math.random().toString(36).substr(2, 9)}`,
        type: 'paragraph',
        textValue: currentParagraphText.trim()
      });
      currentParagraphText = '';
    }
  };

  const flushList = () => {
    if (currentListBlock) {
      blocks.push(currentListBlock);
      currentListBlock = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Check if list item
    const isBullet = trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ');
    const isOrdered = /^\d+\.\s/.test(trimmedLine);

    if (isBullet || isOrdered) {
      flushParagraph();
      const listType = isBullet ? 'bullet' : 'ordered';
      const cleanText = isBullet ? trimmedLine.slice(2) : trimmedLine.replace(/^\d+\.\s/, '');

      if (currentListBlock && currentListBlock.listType === listType) {
        currentListBlock.listValues?.push(cleanText);
      } else {
        flushList();
        currentListBlock = {
          id: `block_${Math.random().toString(36).substr(2, 9)}`,
          type: 'list',
          listType,
          listValues: [cleanText]
        };
      }
      continue;
    }

    flushList();

    // H1
    if (trimmedLine.startsWith('# ')) {
      flushParagraph();
      blocks.push({
        id: `block_${Math.random().toString(36).substr(2, 9)}`,
        type: 'heading',
        headingLevel: 'h1',
        textValue: trimmedLine.slice(2)
      });
    } 
    // H2
    else if (trimmedLine.startsWith('## ')) {
      flushParagraph();
      blocks.push({
        id: `block_${Math.random().toString(36).substr(2, 9)}`,
        type: 'heading',
        headingLevel: 'h2',
        textValue: trimmedLine.slice(3)
      });
    } 
    // H3
    else if (trimmedLine.startsWith('### ')) {
      flushParagraph();
      blocks.push({
        id: `block_${Math.random().toString(36).substr(2, 9)}`,
        type: 'heading',
        headingLevel: 'h3',
        textValue: trimmedLine.slice(4)
      });
    }
    // Quote or Highlight Card
    else if (trimmedLine.startsWith('> ')) {
      flushParagraph();
      const quoteText = trimmedLine.slice(2);
      
      // Match Highlight formatting: > **Highlight: title** followed by > description
      if (quoteText.startsWith('**Highlight: ') || quoteText.startsWith('**HIGHLIGHT: ')) {
        const titleText = quoteText.replace(/^\*\*(Highlight|HIGHLIGHT):\s*/, '').replace(/\*\*$/, '');
        let descText = '';
        if (i + 1 < lines.length && lines[i + 1].trim().startsWith('> ')) {
          descText = lines[i + 1].trim().slice(2);
          i++; // Consume next line
        }
        blocks.push({
          id: `block_${Math.random().toString(36).substr(2, 9)}`,
          type: 'highlight',
          textValue: titleText,
          labelValue: descText
        });
      } else {
        blocks.push({
          id: `block_${Math.random().toString(36).substr(2, 9)}`,
          type: 'quote',
          textValue: quoteText
        });
      }
    }
    // Image link
    else if (trimmedLine.startsWith('![') && trimmedLine.includes('](') && trimmedLine.endsWith(')')) {
      flushParagraph();
      const altText = trimmedLine.substring(2, trimmedLine.indexOf(']('));
      const url = trimmedLine.substring(trimmedLine.indexOf('](') + 2, trimmedLine.length - 1);
      const tab = url.startsWith('data:') ? 'upload' : PRESET_IMAGES.some(img => img.url === url) ? 'preset' : 'url';
      blocks.push({
        id: `block_${Math.random().toString(36).substr(2, 9)}`,
        type: 'image',
        labelValue: altText,
        urlValue: url,
        imageTab: tab
      });
    }
    // Button link
    else if (trimmedLine.startsWith('[CTA: ') && trimmedLine.includes('](') && trimmedLine.endsWith(')')) {
      flushParagraph();
      const label = trimmedLine.substring(6, trimmedLine.indexOf(']('));
      const url = trimmedLine.substring(trimmedLine.indexOf('](') + 2, trimmedLine.length - 1);
      blocks.push({
        id: `block_${Math.random().toString(36).substr(2, 9)}`,
        type: 'button',
        labelValue: label,
        urlValue: url
      });
    }
    // Empty line
    else if (trimmedLine === '') {
      flushParagraph();
    }
    // Standard paragraph line
    else {
      currentParagraphText += (currentParagraphText ? '\n' : '') + trimmedLine;
    }
  }

  flushParagraph();
  flushList();

  if (blocks.length === 0) {
    return [{ id: `block_1`, type: 'paragraph', textValue: '' }];
  }

  return blocks;
}

// Compiler: PostBlocks -> Markdown Text
function compileBlocksToMarkdown(blocks: PostBlock[]): string {
  return blocks.map(block => {
    switch (block.type) {
      case 'heading': {
        const hash = block.headingLevel === 'h1' ? '# ' : block.headingLevel === 'h3' ? '### ' : '## ';
        return `${hash}${block.textValue || ''}`;
      }
      case 'paragraph':
        return block.textValue || '';
      case 'list': {
        if (!block.listValues || block.listValues.length === 0) return '';
        const prefix = block.listType === 'bullet' ? '- ' : '1. ';
        return block.listValues.map((val, idx) => {
          const itemPrefix = block.listType === 'bullet' ? prefix : `${idx + 1}. `;
          return `${itemPrefix}${val}`;
        }).join('\n');
      }
      case 'quote':
        return `> ${block.textValue || ''}`;
      case 'image':
        return `![${block.labelValue || 'Image'}](${block.urlValue || ''})`;
      case 'button':
        return `[CTA: ${block.labelValue || 'Click Here'}](${block.urlValue || ''})`;
      case 'highlight':
        return `> **Highlight: ${block.textValue || ''}**\n> ${block.labelValue || ''}`;
      default:
        return '';
    }
  }).filter(line => line !== '').join('\n\n');
}

export default function ContentManagerPage() {
  const { isHeadAdmin } = useAdminRole();
  const [posts, setPosts] = useState<MockPost[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setPosts(getStoredPosts() as MockPost[]);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      saveStoredPosts(posts as any);
    }
  }, [posts, loaded]);
  
  // Overlay template picker state (matches image)
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('Announcement');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  // Drawer States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<MockPost | null>(null);
  
  // Block Editor Form States
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Announcement');
  const [status, setStatus] = useState<'published' | 'draft'>('draft');
  const [author, setAuthor] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [featuredImageTab, setFeaturedImageTab] = useState<'gallery' | 'url' | 'upload'>('gallery');
  const [blocks, setBlocks] = useState<PostBlock[]>([]);
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [inserterOpenIndex, setInserterOpenIndex] = useState<number | null>(null);

  // Category specific templates filter
  const filteredTemplates = POST_TEMPLATES.filter(tpl => tpl.type === selectedCategory);

  // Triggered when clicking "Publish New Post"
  const handleOpenPicker = () => {
    setSelectedCategory('Announcement');
    setSelectedTemplateId('');
    setIsPickerOpen(true);
  };

  // Called when choosing template in Picker modal
  const handleApplyTemplateFromPicker = () => {
    if (selectedCategory === 'Blank Document') {
      // Empty document setup
      setEditingPost(null);
      setTitle('');
      setType('Announcement');
      setStatus('draft');
      setAuthor('Staff Editor');
      setFeaturedImage('');
      setFeaturedImageTab('gallery');
      setBlocks([{ id: `block_${Date.now()}`, type: 'paragraph', textValue: '' }]);
      setIsPickerOpen(false);
      setIsDrawerOpen(true);
      return;
    }

    if (!selectedTemplateId) {
      alert('Please select a specific template from the list.');
      return;
    }

    const template = POST_TEMPLATES.find(t => t.id === selectedTemplateId);
    if (!template) return;

    // Load templates in editor
    setEditingPost(null);
    setTitle(template.title);
    setType(template.type);
    setStatus('draft');
    setAuthor('Staff Editor');
    setFeaturedImage('');
    setFeaturedImageTab('gallery');
    setBlocks(parseMarkdownToBlocks(template.body));
    setIsPickerOpen(false);
    setIsDrawerOpen(true);
  };

  // Triggered when editing existing post
  const handleOpenDrawerForEdit = (post: MockPost) => {
    setEditingPost(post);
    setTitle(post.title);
    setType(post.type);
    setStatus(post.status);
    setAuthor(post.author);
    const isPreset = PRESET_IMAGES.some(img => img.url === post.featured_image);
    setFeaturedImageTab(isPreset ? 'gallery' : 'url');
    setFeaturedImage(post.featured_image || '');
    setBlocks(parseMarkdownToBlocks(post.body || ''));
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingPost(null);
    setFeaturedImage('');
    setFeaturedImageTab('gallery');
  };

  // Block Manipulation functions
  const handleUpdateBlockValue = (id: string, updates: Partial<PostBlock>) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const handleUpdateListItem = (blockId: string, itemIdx: number, val: string) => {
    setBlocks(blocks.map(b => {
      if (b.id === blockId && b.listValues) {
        const newValues = [...b.listValues];
        newValues[itemIdx] = val;
        return { ...b, listValues: newValues };
      }
      return b;
    }));
  };

  const handleAddListItem = (blockId: string) => {
    setBlocks(blocks.map(b => {
      if (b.id === blockId && b.listValues) {
        return { ...b, listValues: [...b.listValues, ''] };
      }
      return b;
    }));
  };

  const handleDeleteListItem = (blockId: string, itemIdx: number) => {
    setBlocks(blocks.map(b => {
      if (b.id === blockId && b.listValues) {
        const newValues = b.listValues.filter((_, idx) => idx !== itemIdx);
        // keep at least 1 empty item
        return { ...b, listValues: newValues.length > 0 ? newValues : [''] };
      }
      return b;
    }));
  };

  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === blocks.length - 1) return;

    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const newBlocks = [...blocks];
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[targetIdx];
    newBlocks[targetIdx] = temp;
    setBlocks(newBlocks);
  };

  const handleDeleteBlock = (id: string) => {
    if (blocks.length === 1) {
      // Don't leave document with absolutely 0 blocks
      setBlocks([{ id: `block_${Date.now()}`, type: 'paragraph', textValue: '' }]);
      return;
    }
    setBlocks(blocks.filter(b => b.id !== id));
  };

  const handleInsertBlock = (index: number, blockType: PostBlock['type']) => {
    const newBlock: PostBlock = {
      id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      type: blockType,
      textValue: blockType === 'list' ? undefined : '',
      listType: blockType === 'list' ? 'bullet' : undefined,
      listValues: blockType === 'list' ? [''] : undefined,
      urlValue: (blockType === 'image' || blockType === 'button') ? '' : undefined,
      labelValue: (blockType === 'image' || blockType === 'button' || blockType === 'highlight') ? '' : undefined,
      headingLevel: blockType === 'heading' ? 'h2' : undefined,
      imageTab: blockType === 'image' ? 'upload' : undefined
    };

    const newBlocks = [...blocks];
    newBlocks.splice(index, 0, newBlock);
    setBlocks(newBlocks);
    setInserterOpenIndex(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Please enter a title.');
      return;
    }

    const compiledBody = compileBlocksToMarkdown(blocks);
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    if (editingPost) {
      setPosts(posts.map(post => 
        post.id === editingPost.id 
          ? { ...post, title, type, status, author, body: compiledBody, featured_image: featuredImage, updated_at: formattedDate } 
          : post
      ));
    } else {
      const newPost: MockPost = {
        id: `post_${Date.now()}`,
        title,
        type,
        status,
        updated_at: formattedDate,
        author,
        featured_image: featuredImage,
        body: compiledBody
      };
      setPosts([newPost, ...posts]);
    }
    handleCloseDrawer();
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete: "${title}"?\nThis action cannot be undone.`)) {
      setPosts(posts.filter(post => post.id !== id));
    }
  };

  // Lightweight inline formatter parsing
  const parseInlineFormatting = (text: string) => {
    const boldParts = text.split(/\*\*(.*?)\*\*/g);
    return boldParts.map((part, index) => {
      if (index % 2 === 1) {
        return <strong key={index} className="font-semibold text-nbac-text">{part}</strong>;
      }
      
      const italicParts = part.split(/\*(.*?)\*/g);
      return italicParts.map((subPart, subIndex) => {
        if (subIndex % 2 === 1) {
          return <em key={subIndex} className="italic text-nbac-muted">{subPart}</em>;
        }
        
        const codeParts = subPart.split(/`(.*?)`/g);
        return codeParts.map((codePart, codeIndex) => {
          if (codeIndex % 2 === 1) {
            return (
              <code 
                key={codeIndex} 
                className="bg-nbac-canvas px-1.5 py-0.5 rounded text-nbac-gold font-mono text-xs border border-nbac-border"
              >
                {codePart}
              </code>
            );
          }
          return codePart;
        });
      });
    });
  };

  // Block elements renderer for Preview Tab
  const renderCompiledPreview = (blocksList: PostBlock[]) => {
    return (
      <div className="space-y-5 text-nbac-body font-light text-sm leading-relaxed max-h-[500px] overflow-y-auto pr-1">
        {blocksList.map((block) => {
          switch (block.type) {
            case 'heading': {
              const Tag = block.headingLevel || 'h2';
              const classes = Tag === 'h1' 
                ? "font-display text-2xl font-bold text-nbac-text mt-4 mb-2 border-b border-nbac-border pb-1"
                : Tag === 'h3'
                ? "font-sans text-base font-semibold text-nbac-text mt-3 mb-1.5"
                : "font-display text-xl font-bold text-nbac-text mt-3.5 mb-2";
              return <Tag key={block.id} className={classes}>{block.textValue || ''}</Tag>;
            }
            case 'paragraph':
              return (
                <p key={block.id} className="text-nbac-body whitespace-pre-wrap">
                  {parseInlineFormatting(block.textValue || '')}
                </p>
              );
            case 'list': {
              const Tag = block.listType === 'bullet' ? 'ul' : 'ol';
              const classes = block.listType === 'bullet' ? 'list-disc pl-5' : 'list-decimal pl-5';
              return (
                <Tag key={block.id} className={cn(classes, "space-y-1 my-2")}>
                  {block.listValues?.map((item, idx) => (
                    <li key={idx}>{parseInlineFormatting(item)}</li>
                  ))}
                </Tag>
              );
            }
            case 'quote':
              return (
                <blockquote key={block.id} className="border-l-4 border-nbac-gold bg-nbac-canvas/50 px-4 py-2.5 my-3 text-nbac-body italic rounded-r-md">
                  {parseInlineFormatting(block.textValue || '')}
                </blockquote>
              );
            case 'image':
              return (
                <div key={block.id} className="my-4 border border-nbac-border rounded-lg overflow-hidden bg-nbac-panel p-2">
                  {block.urlValue ? (
                    <img src={block.urlValue} alt={block.labelValue} className="max-h-56 w-full object-cover rounded" />
                  ) : (
                    <div className="h-32 bg-nbac-canvas flex items-center justify-center text-nbac-muted text-xs">No image provided</div>
                  )}
                  {block.labelValue && <span className="text-[11px] text-nbac-muted mt-1.5 block text-center italic">{block.labelValue}</span>}
                </div>
              );
            case 'button':
              return (
                <div key={block.id} className="my-4">
                  <a 
                    href={block.urlValue || '#'} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-block bg-nbac-emerald hover:bg-nbac-emerald-dark text-white text-xs font-semibold px-4 py-2 rounded-full transition-colors shadow-sm"
                  >
                    {block.labelValue || 'Button Link'}
                  </a>
                </div>
              );
            case 'highlight':
              return (
                <div key={block.id} className="bg-nbac-panel border border-nbac-border border-l-4 border-l-nbac-gold rounded-r-lg p-4 my-3">
                  <h4 className="font-sans font-bold text-nbac-text text-sm mb-1">{block.textValue}</h4>
                  <p className="font-sans text-xs text-nbac-body font-light leading-relaxed">{block.labelValue}</p>
                </div>
              );
            default:
              return null;
          }
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <RoleBanner />

      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="font-sans text-xs uppercase tracking-widest font-semibold text-nbac-gold-light">
            Website Content Control
          </span>
          <h2 className="font-display text-2xl font-bold text-nbac-text mt-1">
            Articles & Announcements
          </h2>
        </div>
        <button
          onClick={handleOpenPicker}
          className="bg-nbac-emerald hover:bg-nbac-emerald-dark text-white font-sans font-medium px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2 text-sm shadow-md shadow-nbac-emerald/10 cursor-pointer"
        >
          <Plus size={16} />
          <span>Publish New Post</span>
        </button>
      </div>

      {/* Content List Table */}
      <div className="bg-nbac-panel border border-nbac-border rounded-lg overflow-hidden select-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-nbac-border bg-[#0b0f10]/30 font-sans text-xs uppercase tracking-wider font-semibold text-nbac-muted">
                <th className="p-4 pl-6">Title</th>
                <th className="p-4">Type</th>
                <th className="p-4">Status</th>
                <th className="p-4">Last Updated</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nbac-border font-sans text-sm">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-nbac-canvas/40 transition-colors">
                  <td className="p-4 pl-6 font-medium text-nbac-text max-w-md truncate">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-7 rounded bg-[#0b0f10] border border-nbac-border overflow-hidden shrink-0 flex items-center justify-center relative">
                        {post.featured_image ? (
                          <img 
                            src={post.featured_image} 
                            alt={post.title} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon size={12} className="text-nbac-muted" />
                        )}
                      </div>
                      <span className="truncate" title={post.title}>{post.title}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-nbac-muted text-xs bg-nbac-canvas border border-nbac-border px-2.5 py-1 rounded-md">
                      {post.type}
                    </span>
                  </td>
                  <td className="p-4">
                    {post.status === 'published' ? (
                      <span className="bg-nbac-emerald/15 text-nbac-emerald text-xs font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                        <Globe size={10} />
                        <span>Published</span>
                      </span>
                    ) : (
                      <span className="bg-nbac-amber/15 text-nbac-amber text-xs font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                        <FileEdit size={10} />
                        <span>Draft</span>
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-nbac-body text-xs">
                    {post.updated_at}
                  </td>
                  <td className="p-4 pr-6 text-right space-x-2">
                    <button
                      onClick={() => handleOpenDrawerForEdit(post)}
                      className="text-nbac-body hover:text-nbac-gold p-1.5 rounded bg-nbac-canvas border border-nbac-border hover:border-nbac-gold/30 transition-colors cursor-pointer"
                      title="Edit article"
                    >
                      <Edit size={14} />
                    </button>
                    {isHeadAdmin && (
                      <button
                        onClick={() => handleDelete(post.id, post.title)}
                        className="text-nbac-danger/80 hover:text-nbac-danger hover:bg-nbac-danger/10 p-1.5 rounded bg-nbac-canvas border border-nbac-border hover:border-nbac-danger/30 transition-colors cursor-pointer"
                        title="Delete article"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Template Picker Overlay Modal (Matches Reference Image) */}
      <AnimatePresence>
        {isPickerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#070b0c]/95 backdrop-blur-md overflow-y-auto py-10 px-4 select-none">
            <motion.div 
              className="w-full max-w-4xl space-y-8 text-center animate-none"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <div>
                <h2 className="font-display text-3xl font-bold text-white tracking-tight">Choose a Template</h2>
                <p className="font-sans text-sm text-nbac-muted mt-2">Select a starting point for your new content piece.</p>
              </div>

              {/* Grid of Categories (Matches reference exactly) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left max-w-3xl mx-auto">
                {CATEGORY_CARDS.map((card) => {
                  const IconComponent = card.icon;
                  const isSelected = selectedCategory === card.id;
                  
                  return (
                    <div
                      key={card.id}
                      onClick={() => {
                        setSelectedCategory(card.id);
                        setSelectedTemplateId('');
                      }}
                      className={cn(
                        "bg-[#1d2022] border rounded-xl p-5 flex gap-4 items-start cursor-pointer hover:border-nbac-emerald/30 transition-all duration-200",
                        isSelected 
                          ? "border-nbac-emerald shadow-lg shadow-nbac-emerald/5 ring-1 ring-nbac-emerald" 
                          : "border-nbac-border"
                      )}
                    >
                      <div className={cn(
                        "w-11 h-11 rounded-lg flex items-center justify-center shrink-0 border border-nbac-border transition-colors",
                        isSelected ? "bg-nbac-emerald/10 text-nbac-emerald" : "bg-[#0b0f10] text-nbac-muted"
                      )}>
                        <IconComponent size={20} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-sans font-bold text-sm text-white">{card.title}</h4>
                        <p className="font-sans text-xs text-nbac-muted leading-relaxed font-light">{card.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Sub-Selection Dropdown (For category templates) */}
              {selectedCategory !== 'Blank Document' && (
                <div className="max-w-xl mx-auto bg-[#1d2022]/40 border border-nbac-border p-5 rounded-xl text-left space-y-3">
                  <label className="block text-xs uppercase tracking-wider font-semibold text-nbac-gold-light">
                    Select specific {selectedCategory} layout:
                  </label>
                  <select
                    value={selectedTemplateId}
                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                    className="w-full bg-[#0b0f10] border border-nbac-border rounded-lg px-3.5 py-2.5 text-nbac-text text-sm font-light focus:outline-none focus:border-nbac-emerald transition-colors"
                  >
                    <option value="">--- Select a Layout ---</option>
                    {filteredTemplates.map(tpl => (
                      <option key={tpl.id} value={tpl.id}>{tpl.name}</option>
                    ))}
                  </select>
                  {selectedTemplateId && (
                    <p className="text-xs text-nbac-muted italic mt-1.5 pl-1">
                      {POST_TEMPLATES.find(t => t.id === selectedTemplateId)?.description}
                    </p>
                  )}
                </div>
              )}

              {/* Controls */}
              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={handleApplyTemplateFromPicker}
                  className="bg-[#10b981] hover:bg-[#0b9666] text-white font-sans font-medium px-8 py-3 rounded-lg transition-colors text-sm shadow-md shadow-nbac-emerald/10 cursor-pointer"
                >
                  Use Selected Template
                </button>
                <button
                  onClick={() => setIsPickerOpen(false)}
                  className="text-nbac-muted hover:text-white transition-colors text-sm cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* WordPress/Elementor-Style Full-Screen Workspace */}
      <AnimatePresence>
        {isDrawerOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-[#0b0f10] flex flex-col w-screen h-screen overflow-hidden text-nbac-text select-none"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {/* Workspace Header Top Bar */}
            <div className="h-16 border-b border-nbac-border bg-[#070b0c] px-6 flex items-center justify-between shrink-0 select-none">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCloseDrawer}
                  className="p-1.5 rounded-md hover:bg-nbac-panel border border-nbac-border text-nbac-muted hover:text-nbac-text transition-colors flex items-center gap-1 cursor-pointer text-xs"
                >
                  <X size={14} />
                  <span>Dashboard</span>
                </button>
                <div className="h-4 w-px bg-nbac-border" />
                <div>
                  <h3 className="font-display text-sm font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="text-nbac-gold-light" size={14} />
                    <span>{editingPost ? 'Edit Page Builder' : 'New Page Builder'}</span>
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full select-none",
                  status === 'published' ? "bg-nbac-emerald/15 text-nbac-emerald" : "bg-nbac-amber/15 text-nbac-amber"
                )}>
                  {status}
                </span>
                <div className="h-4 w-px bg-nbac-border" />
                <button
                  type="button"
                  onClick={() => setIsPickerOpen(true)}
                  className="px-3 py-1.5 text-xs border border-nbac-border rounded bg-nbac-panel text-nbac-gold-light hover:border-nbac-gold-light/40 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles size={12} />
                  <span>Change Template</span>
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="bg-nbac-emerald hover:bg-nbac-emerald-dark text-white font-sans font-semibold px-4 py-1.5 rounded-lg transition-colors text-xs shadow-md shadow-nbac-emerald/10 cursor-pointer"
                >
                  {editingPost ? 'Save Updates' : 'Publish Post'}
                </button>
              </div>
            </div>

            {/* Workspace Main Split Panel Layout */}
            <div className="flex-1 flex overflow-hidden">
              
              {/* 1. Main Canvas Area (Center/Left scrollable column) */}
              <div className="flex-1 overflow-y-auto px-6 md:px-16 py-8 bg-[#0b0f10]/95 flex justify-center">
                <div className="max-w-3xl w-full space-y-6">
                  
                  {/* Collapsible Mobile Settings Header (Hidden on Desktop) */}
                  <div className="lg:hidden bg-nbac-panel/30 border border-nbac-border/80 rounded-xl p-5 space-y-4">
                    <h4 className="text-xs uppercase tracking-wider font-semibold text-nbac-gold-light border-b border-nbac-border pb-1">Mobile Settings</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase text-nbac-muted font-bold mb-1">Category Type</label>
                        <select
                          value={type}
                          onChange={(e) => setType(e.target.value)}
                          className="w-full bg-[#0b0f10] border border-nbac-border rounded-lg px-2.5 py-1.5 text-nbac-text text-xs focus:outline-none"
                        >
                          <option value="Announcement">Announcement</option>
                          <option value="Press Release">Press Release</option>
                          <option value="Sponsor Update">Sponsor Update</option>
                          <option value="Event Copy">Event Copy</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase text-nbac-muted font-bold mb-1">Publisher</label>
                        <input
                          type="text"
                          value={author}
                          onChange={(e) => setAuthor(e.target.value)}
                          required
                          className="w-full bg-[#0b0f10] border border-nbac-border rounded-lg px-2.5 py-1.5 text-nbac-text text-xs focus:outline-none"
                        />
                      </div>
                    </div>
                     <div>
                      <label className="block text-[10px] uppercase text-nbac-muted font-bold mb-1">Headline / Title</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        placeholder="Headline..."
                        className="w-full bg-[#0b0f10] border border-nbac-border rounded-lg px-3 py-1.5 text-nbac-text text-xs font-semibold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase text-nbac-muted font-bold mb-1">Featured Image</label>
                      <div className="space-y-2">
                        {/* Tab selector */}
                        <div className="flex bg-[#0b0f10] border border-nbac-border rounded-lg p-0.5 text-[10px] select-none">
                          {(['gallery', 'url', 'upload'] as const).map((tab) => (
                            <button
                              type="button"
                              key={tab}
                              onClick={() => setFeaturedImageTab(tab)}
                              className={cn(
                                "flex-1 py-1 rounded-md capitalize transition-colors cursor-pointer text-center",
                                featuredImageTab === tab 
                                  ? "bg-[#1d2022] text-nbac-gold-light font-medium" 
                                  : "text-nbac-body hover:text-nbac-text"
                              )}
                            >
                              {tab}
                            </button>
                          ))}
                        </div>

                        {/* Tab Content */}
                        {featuredImageTab === 'gallery' && (
                          <select
                            value={featuredImage}
                            onChange={(e) => setFeaturedImage(e.target.value)}
                            className="w-full bg-[#0b0f10] border border-nbac-border rounded-lg px-2.5 py-1.5 text-nbac-text text-xs focus:outline-none"
                          >
                            <option value="">-- Choose from Gallery --</option>
                            {PRESET_IMAGES.map((img) => (
                              <option key={img.url} value={img.url}>{img.name}</option>
                            ))}
                          </select>
                        )}

                        {featuredImageTab === 'url' && (
                          <input
                            type="text"
                            value={featuredImage}
                            onChange={(e) => setFeaturedImage(e.target.value)}
                            placeholder="Paste image URL..."
                            className="w-full bg-[#0b0f10] border border-nbac-border rounded-lg px-2.5 py-1.5 text-nbac-text text-xs focus:outline-none"
                          />
                        )}

                        {featuredImageTab === 'upload' && (
                          <div className="relative border border-dashed border-nbac-border hover:border-nbac-gold/30 rounded-lg p-3 bg-[#0b0f10]/30 hover:bg-[#0b0f10]/60 text-center transition-all duration-300 cursor-pointer select-none group">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const url = URL.createObjectURL(file);
                                  setFeaturedImage(url);
                                }
                              }}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                            />
                            <div className="flex flex-col items-center gap-1">
                              <Upload size={12} className="text-nbac-muted group-hover:text-nbac-gold transition-colors" />
                              <span className="text-[10px] font-semibold text-nbac-text">Upload photo</span>
                            </div>
                          </div>
                        )}

                        {/* Preview */}
                        {featuredImage && (
                          <div className="relative rounded-lg overflow-hidden border border-nbac-border bg-[#0b0f10] h-16 w-32 flex items-center justify-center mt-2">
                            <img src={featuredImage} alt="Featured Preview" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setFeaturedImage('')}
                              className="absolute top-1 right-1 bg-black/75 p-1 rounded-full text-nbac-danger"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setStatus('draft')}
                        className={cn(
                          "flex-1 py-1 rounded-lg text-[10px] border font-sans font-medium transition-all duration-200",
                          status === 'draft' ? "bg-nbac-amber/10 border-nbac-amber text-nbac-amber" : "border-nbac-border text-nbac-body bg-[#0b0f10]"
                        )}
                      >
                        Draft Mode
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatus('published')}
                        className={cn(
                          "flex-1 py-1 rounded-lg text-[10px] border font-sans font-medium transition-all duration-200",
                          status === 'published' ? "bg-nbac-emerald/10 border-nbac-emerald text-nbac-emerald" : "border-nbac-border text-nbac-body bg-[#0b0f10]"
                        )}
                      >
                        Publish
                      </button>
                    </div>
                  </div>

                  {/* Visual Editor vs Preview Tabs */}
                  <div className="flex justify-between items-center border-b border-nbac-border pb-2.5">
                    <h4 className="text-xs uppercase tracking-wider font-semibold text-nbac-gold-light">Content Layout Canvas</h4>
                    <div className="flex bg-[#1d2022] border border-nbac-border rounded-md p-0.5 text-xs select-none">
                      <button
                        type="button"
                        onClick={() => setActiveTab('write')}
                        className={cn(
                          "px-3 py-1 rounded-sm flex items-center gap-1.5 transition-colors cursor-pointer",
                          activeTab === 'write' 
                            ? "bg-[#0b0f10] text-nbac-gold-light font-medium" 
                            : "text-nbac-body hover:text-nbac-text"
                        )}
                      >
                        <PenTool size={11} />
                        <span>Visual Editor</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('preview')}
                        className={cn(
                          "px-3 py-1 rounded-sm flex items-center gap-1.5 transition-colors cursor-pointer",
                          activeTab === 'preview' 
                            ? "bg-[#0b0f10] text-nbac-gold-light font-medium" 
                            : "text-nbac-body hover:text-nbac-text"
                        )}
                      >
                        <Eye size={11} />
                        <span>Live Preview</span>
                      </button>
                    </div>
                  </div>

                  {activeTab === 'write' ? (
                    /* Visual Block Builder Canvas */
                    <div className="space-y-2 pb-24 select-none">
                      {blocks.map((block, index) => {
                        const showInserter = inserterOpenIndex === index;

                        return (
                          <React.Fragment key={block.id}>
                            
                            {/* Visual Inserter Row between blocks (Elementor-style) */}
                            <div className="group/inserter relative h-6 flex items-center justify-center">
                              <div className="absolute inset-x-0 h-px bg-nbac-border opacity-0 group-hover/inserter:opacity-100 transition-opacity" />
                              <button
                                type="button"
                                onClick={() => setInserterOpenIndex(showInserter ? null : index)}
                                className="z-10 w-5 h-5 rounded-full bg-[#10b981] text-white flex items-center justify-center opacity-0 group-hover/inserter:opacity-100 transition-all duration-200 hover:scale-110 cursor-pointer shadow-md"
                              >
                                <Plus size={12} />
                              </button>
                              
                              {/* Elementor Block Inserter Selection Grid */}
                              {showInserter && (
                                <div className="absolute top-7 z-30 bg-[#1d2022] border border-nbac-border p-3 rounded-lg shadow-xl grid grid-cols-4 gap-2 text-center w-80">
                                  {[
                                    { type: 'paragraph', label: 'Text', icon: PenTool },
                                    { type: 'heading', label: 'Heading', icon: HeadingIcon },
                                    { type: 'list', label: 'List', icon: ListIcon },
                                    { type: 'quote', label: 'Quote', icon: QuoteIcon },
                                    { type: 'image', label: 'Image', icon: ImageIcon },
                                    { type: 'button', label: 'Button', icon: LinkIcon },
                                    { type: 'highlight', label: 'Highlight', icon: Sparkles }
                                  ].map((btn) => {
                                    const BtnIcon = btn.icon;
                                    return (
                                      <button
                                        type="button"
                                        key={btn.type}
                                        onClick={() => handleInsertBlock(index, btn.type as PostBlock['type'])}
                                        className="flex flex-col items-center justify-center p-2 rounded hover:bg-[#0b0f10] border border-transparent hover:border-nbac-emerald/30 text-nbac-muted hover:text-white transition-colors cursor-pointer"
                                      >
                                        <BtnIcon size={16} className="mb-1 text-nbac-gold-light" />
                                        <span className="text-[10px]">{btn.label}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>

                            {/* Block Wrapper */}
                            <div className="bg-[#1d2022]/40 border border-nbac-border rounded-xl p-4 relative group hover:border-nbac-gold/20 transition-all duration-150">
                              
                              {/* Reorder and Delete controls overlay */}
                              <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 flex items-center gap-1 bg-[#0b0f10]/80 p-1.5 rounded-lg border border-nbac-border transition-opacity z-10">
                                <button
                                  type="button"
                                  onClick={() => handleMoveBlock(index, 'up')}
                                  disabled={index === 0}
                                  className="text-nbac-muted hover:text-white disabled:opacity-20 transition-colors p-1"
                                >
                                  <ArrowUp size={13} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveBlock(index, 'down')}
                                  disabled={index === blocks.length - 1}
                                  className="text-nbac-muted hover:text-white disabled:opacity-20 transition-colors p-1"
                                >
                                  <ArrowDown size={13} />
                                </button>
                                <div className="w-px h-3 bg-nbac-border mx-0.5" />
                                <button
                                  type="button"
                                  onClick={() => handleDeleteBlock(block.id)}
                                  className="text-nbac-danger/80 hover:text-nbac-danger transition-colors p-1"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>

                              {/* Content Fields based on Block Type */}
                              
                              {/* 1. Heading Block */}
                              {block.type === 'heading' && (
                                <div className="space-y-3 pr-20">
                                  <div className="flex items-center gap-2">
                                    <HeadingIcon size={14} className="text-nbac-gold" />
                                    <span className="text-xs text-nbac-muted uppercase font-semibold">Heading Style</span>
                                    <div className="flex bg-[#0b0f10] border border-nbac-border rounded p-0.5 text-xs font-mono">
                                      {['h1', 'h2', 'h3'].map(lvl => (
                                        <button
                                          type="button"
                                          key={lvl}
                                          onClick={() => handleUpdateBlockValue(block.id, { headingLevel: lvl as any })}
                                          className={cn(
                                            "px-2 py-0.5 rounded-sm uppercase cursor-pointer",
                                            block.headingLevel === lvl ? "bg-[#1d2022] text-nbac-gold font-bold" : "text-nbac-body"
                                          )}
                                        >
                                          {lvl}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                  <input
                                    type="text"
                                    value={block.textValue || ''}
                                    onChange={(e) => handleUpdateBlockValue(block.id, { textValue: e.target.value })}
                                    placeholder="Type heading text..."
                                    className={cn(
                                      "w-full bg-[#0b0f10] border border-nbac-border rounded-lg px-3 py-2 text-nbac-text focus:outline-none focus:border-nbac-emerald font-semibold",
                                      block.headingLevel === 'h1' ? 'text-lg font-display' : block.headingLevel === 'h3' ? 'text-sm font-sans' : 'text-base font-display'
                                    )}
                                  />
                                </div>
                              )}

                              {/* 2. Paragraph Block */}
                              {block.type === 'paragraph' && (
                                <div className="space-y-1.5 pr-20">
                                  <div className="flex items-center gap-1.5 text-xs text-nbac-muted uppercase font-semibold">
                                    <PenTool size={13} className="text-nbac-gold" />
                                    <span>Paragraph Text</span>
                                  </div>
                                  <textarea
                                    value={block.textValue || ''}
                                    onChange={(e) => handleUpdateBlockValue(block.id, { textValue: e.target.value })}
                                    placeholder="Start writing paragraph content..."
                                    rows={3}
                                    className="w-full bg-[#0b0f10] border border-nbac-border rounded-lg px-3 py-2.5 text-nbac-text text-sm focus:outline-none focus:border-nbac-emerald resize-y font-light leading-relaxed"
                                  />
                                </div>
                              )}

                              {/* 3. List Block */}
                              {block.type === 'list' && (
                                <div className="space-y-3 pr-20">
                                  <div className="flex items-center gap-2">
                                    <ListIcon size={14} className="text-nbac-gold" />
                                    <span className="text-xs text-nbac-muted uppercase font-semibold">List Block</span>
                                    <div className="flex bg-[#0b0f10] border border-nbac-border rounded p-0.5 text-xs font-sans">
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateBlockValue(block.id, { listType: 'bullet' })}
                                        className={cn(
                                          "px-2 py-0.5 rounded-sm cursor-pointer",
                                          block.listType === 'bullet' ? "bg-[#1d2022] text-nbac-gold font-medium" : "text-nbac-body"
                                        )}
                                      >
                                        Bullets
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateBlockValue(block.id, { listType: 'ordered' })}
                                        className={cn(
                                          "px-2 py-0.5 rounded-sm cursor-pointer",
                                          block.listType === 'ordered' ? "bg-[#1d2022] text-nbac-gold font-medium" : "text-nbac-body"
                                        )}
                                      >
                                        Numbers
                                      </button>
                                    </div>
                                  </div>

                                  <div className="space-y-2 pl-3">
                                    {block.listValues?.map((item, itemIdx) => (
                                      <div key={itemIdx} className="flex gap-2 items-center">
                                        <span className="text-xs text-nbac-muted font-light font-mono shrink-0">
                                          {block.listType === 'bullet' ? '•' : `${itemIdx + 1}.`}
                                        </span>
                                        <input
                                          type="text"
                                          value={item}
                                          onChange={(e) => handleUpdateListItem(block.id, itemIdx, e.target.value)}
                                          placeholder={`Item ${itemIdx + 1}`}
                                          className="flex-1 bg-[#0b0f10] border border-nbac-border rounded-lg px-3 py-1.5 text-nbac-text text-sm focus:outline-none focus:border-nbac-emerald"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteListItem(block.id, itemIdx)}
                                          className="text-nbac-muted hover:text-nbac-danger p-1 rounded"
                                        >
                                          <X size={14} />
                                        </button>
                                      </div>
                                    ))}
                                    <button
                                      type="button"
                                      onClick={() => handleAddListItem(block.id)}
                                      className="text-xs text-nbac-gold-light hover:text-nbac-gold flex items-center gap-1 mt-1 pl-1 cursor-pointer"
                                    >
                                      <Plus size={12} />
                                      <span>Add List Item</span>
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* 4. Quote Block */}
                              {block.type === 'quote' && (
                                <div className="space-y-2 pr-20">
                                  <div className="flex items-center gap-1.5 text-xs text-nbac-muted uppercase font-semibold">
                                    <QuoteIcon size={13} className="text-nbac-gold" />
                                    <span>Blockquote Card</span>
                                  </div>
                                  <div className="border-l-4 border-nbac-gold bg-[#0b0f10]/40 pl-3 py-0.5">
                                    <textarea
                                      value={block.textValue || ''}
                                      onChange={(e) => handleUpdateBlockValue(block.id, { textValue: e.target.value })}
                                      placeholder="Quote content..."
                                      rows={2}
                                      className="w-full bg-transparent border-0 text-nbac-text italic text-sm focus:outline-none resize-none font-light leading-relaxed animate-none"
                                    />
                                  </div>
                                </div>
                              )}

                              {/* 5. Image Block */}
                              {block.type === 'image' && (
                                <div className="space-y-3 pr-20">
                                  <div className="flex items-center gap-1.5 text-xs text-nbac-muted uppercase font-semibold">
                                    <ImageIcon size={13} className="text-nbac-gold" />
                                    <span>Image Placement</span>
                                  </div>

                                  {(() => {
                                    const currentTab = block.imageTab || 
                                      (block.urlValue && PRESET_IMAGES.some(img => img.url === block.urlValue) ? 'preset' : 
                                       block.urlValue && block.urlValue.startsWith('data:') ? 'upload' : 
                                       block.urlValue ? 'url' : 'upload');

                                    return (
                                      <div className="space-y-2.5">
                                        {/* Tab Switcher */}
                                        <div className="flex bg-[#0b0f10] border border-nbac-border rounded-lg p-0.5 text-[10px] w-full max-w-xs">
                                          {[
                                            { id: 'upload', label: 'Upload' },
                                            { id: 'preset', label: 'Presets' },
                                            { id: 'url', label: 'Custom URL' }
                                          ].map((tab) => (
                                            <button
                                              type="button"
                                              key={tab.id}
                                              onClick={() => handleUpdateBlockValue(block.id, { imageTab: tab.id as any })}
                                              className={cn(
                                                "flex-1 py-1 rounded-md transition-colors cursor-pointer text-center font-medium",
                                                currentTab === tab.id 
                                                  ? "bg-[#1d2022] text-nbac-gold-light" 
                                                  : "text-nbac-muted hover:text-nbac-text"
                                              )}
                                            >
                                              {tab.label}
                                            </button>
                                          ))}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                          {/* Tab content */}
                                          {currentTab === 'upload' && (
                                            <div>
                                              <label className="block text-[10px] uppercase font-semibold text-nbac-muted mb-0.5">Upload Image File</label>
                                              <div className="relative border border-dashed border-nbac-border hover:border-nbac-gold/30 rounded-lg p-2.5 bg-[#0b0f10]/30 hover:bg-[#0b0f10]/60 text-center transition-all duration-300 cursor-pointer select-none group">
                                                <input
                                                  type="file"
                                                  accept="image/*"
                                                  onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                      const reader = new FileReader();
                                                      reader.onload = (event) => {
                                                        if (event.target?.result) {
                                                          handleUpdateBlockValue(block.id, { 
                                                            urlValue: event.target.result as string,
                                                            labelValue: block.labelValue || file.name.split('.')[0]
                                                          });
                                                        }
                                                      };
                                                      reader.readAsDataURL(file);
                                                    }
                                                  }}
                                                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                                                />
                                                <div className="flex flex-col items-center gap-1">
                                                  <Upload size={12} className="text-nbac-muted group-hover:text-nbac-gold transition-colors" />
                                                  <span className="text-[10px] font-semibold text-nbac-text">
                                                    {block.urlValue && block.urlValue.startsWith('data:') ? 'Change photo' : 'Upload photo'}
                                                  </span>
                                                </div>
                                              </div>
                                            </div>
                                          )}

                                          {currentTab === 'preset' && (
                                            <div>
                                              <label className="block text-[10px] uppercase font-semibold text-nbac-muted mb-0.5">Choose Preset</label>
                                              <select
                                                value={PRESET_IMAGES.some(img => img.url === block.urlValue) ? block.urlValue : ''}
                                                onChange={(e) => {
                                                  const selected = PRESET_IMAGES.find(img => img.url === e.target.value);
                                                  if (selected) {
                                                    handleUpdateBlockValue(block.id, { 
                                                      urlValue: selected.url,
                                                      labelValue: selected.name
                                                    });
                                                  } else {
                                                    handleUpdateBlockValue(block.id, { urlValue: '', labelValue: '' });
                                                  }
                                                }}
                                                className="w-full bg-[#0b0f10] border border-nbac-border rounded-lg px-2.5 py-1.5 text-nbac-text text-xs focus:outline-none focus:border-nbac-emerald"
                                              >
                                                <option value="">-- Choose Preset --</option>
                                                {PRESET_IMAGES.map((img) => (
                                                  <option key={img.url} value={img.url}>{img.name}</option>
                                                ))}
                                              </select>
                                            </div>
                                          )}

                                          {currentTab === 'url' && (
                                            <div>
                                              <label className="block text-[10px] uppercase font-semibold text-nbac-muted mb-0.5">Image URL</label>
                                              <input
                                                type="text"
                                                value={(!block.urlValue || block.urlValue.startsWith('data:')) ? '' : block.urlValue}
                                                onChange={(e) => handleUpdateBlockValue(block.id, { urlValue: e.target.value })}
                                                placeholder="e.g. /images/apron-jet.jpg"
                                                className="w-full bg-[#0b0f10] border border-nbac-border rounded-lg px-2.5 py-1.5 text-nbac-text text-xs focus:outline-none focus:border-nbac-emerald"
                                              />
                                            </div>
                                          )}

                                          <div>
                                            <label className="block text-[10px] uppercase font-semibold text-nbac-muted mb-0.5">Alt / Caption</label>
                                            <input
                                              type="text"
                                              value={block.labelValue || ''}
                                              onChange={(e) => handleUpdateBlockValue(block.id, { labelValue: e.target.value })}
                                              placeholder="e.g. Aircraft Display Tarmac Preview"
                                              className="w-full bg-[#0b0f10] border border-nbac-border rounded-lg px-2.5 py-1.5 text-nbac-text text-xs focus:outline-none focus:border-nbac-emerald"
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })()}

                                  {/* Small visual image rendering in editor */}
                                  {block.urlValue && (
                                    <div className="border border-nbac-border rounded-lg overflow-hidden h-24 max-w-sm bg-[#0b0f10] relative mt-1 select-none">
                                      <img src={block.urlValue} alt="Preview" className="w-full h-full object-cover" />
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateBlockValue(block.id, { urlValue: '', labelValue: '' })}
                                        className="absolute top-1.5 right-1.5 bg-black/75 hover:bg-black/90 p-1.5 rounded-full text-nbac-danger hover:scale-105 transition-all cursor-pointer z-10"
                                        title="Clear image source"
                                      >
                                        <X size={12} />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* 6. Button / CTA Link Block */}
                              {block.type === 'button' && (
                                <div className="space-y-3 pr-20">
                                  <div className="flex items-center gap-1.5 text-xs text-nbac-muted uppercase font-semibold">
                                    <LinkIcon size={13} className="text-nbac-gold" />
                                    <span>Call-To-Action Button</span>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                      <label className="block text-[10px] uppercase font-semibold text-nbac-muted mb-0.5">Button Label</label>
                                      <input
                                        type="text"
                                        value={block.labelValue || ''}
                                        onChange={(e) => handleUpdateBlockValue(block.id, { labelValue: e.target.value })}
                                        placeholder="e.g. Purchase Pass"
                                        className="w-full bg-[#0b0f10] border border-nbac-border rounded-lg px-2.5 py-1.5 text-nbac-text text-xs focus:outline-none focus:border-nbac-emerald"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] uppercase font-semibold text-nbac-muted mb-0.5">Destination Link</label>
                                      <input
                                        type="text"
                                        value={block.urlValue || ''}
                                        onChange={(e) => handleUpdateBlockValue(block.id, { urlValue: e.target.value })}
                                        placeholder="e.g. /reservations"
                                        className="w-full bg-[#0b0f10] border border-nbac-border rounded-lg px-2.5 py-1.5 text-nbac-text text-xs focus:outline-none focus:border-nbac-emerald"
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* 7. Highlight Card Block */}
                              {block.type === 'highlight' && (
                                <div className="space-y-3 pr-20">
                                  <div className="flex items-center gap-1.5 text-xs text-nbac-muted uppercase font-semibold">
                                    <Sparkles size={13} className="text-nbac-gold" />
                                    <span>Highlight Panel Card</span>
                                  </div>
                                  <div className="space-y-2 border-l-4 border-l-nbac-gold bg-[#0b0f10]/30 pl-3">
                                    <input
                                      type="text"
                                      value={block.textValue || ''}
                                      onChange={(e) => handleUpdateBlockValue(block.id, { textValue: e.target.value })}
                                      placeholder="Callout card title..."
                                      className="w-full bg-transparent border-0 text-nbac-text text-sm font-semibold focus:outline-none"
                                    />
                                    <textarea
                                      value={block.labelValue || ''}
                                      onChange={(e) => handleUpdateBlockValue(block.id, { labelValue: e.target.value })}
                                      placeholder="Description..."
                                      rows={2}
                                      className="w-full bg-transparent border-0 text-nbac-body text-xs focus:outline-none font-light resize-none animate-none"
                                    />
                                  </div>
                                </div>
                              )}

                            </div>
                          </React.Fragment>
                        );
                      })}
                      
                      {/* End Inserter Line */}
                      <div className="group/inserter relative h-6 flex items-center justify-center">
                        <div className="absolute inset-x-0 h-px bg-nbac-border opacity-0 group-hover/inserter:opacity-100 transition-opacity" />
                        <button
                          type="button"
                          onClick={() => setInserterOpenIndex(inserterOpenIndex === blocks.length ? null : blocks.length)}
                          className="z-10 w-5 h-5 rounded-full bg-[#10b981] text-white flex items-center justify-center opacity-0 group-hover/inserter:opacity-100 transition-all duration-200 hover:scale-110 cursor-pointer shadow-md"
                        >
                          <Plus size={12} />
                        </button>
                        {inserterOpenIndex === blocks.length && (
                          <div className="absolute top-7 z-30 bg-[#1d2022] border border-nbac-border p-3 rounded-lg shadow-xl grid grid-cols-4 gap-2 text-center w-80">
                            {[
                              { type: 'paragraph', label: 'Text', icon: PenTool },
                              { type: 'heading', label: 'Heading', icon: HeadingIcon },
                              { type: 'list', label: 'List', icon: ListIcon },
                              { type: 'quote', label: 'Quote', icon: QuoteIcon },
                              { type: 'image', label: 'Image', icon: ImageIcon },
                              { type: 'button', label: 'Button', icon: LinkIcon },
                              { type: 'highlight', label: 'Highlight', icon: Sparkles }
                            ].map((btn) => {
                              const BtnIcon = btn.icon;
                              return (
                                <button
                                  type="button"
                                  key={btn.type}
                                  onClick={() => handleInsertBlock(blocks.length, btn.type as PostBlock['type'])}
                                  className="flex flex-col items-center justify-center p-2 rounded hover:bg-[#0b0f10] border border-transparent hover:border-nbac-emerald/30 text-nbac-muted hover:text-white transition-colors cursor-pointer"
                                >
                                  <BtnIcon size={16} className="mb-1 text-nbac-gold-light" />
                                  <span className="text-[10px]">{btn.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                    </div>
                  ) : (
                    /* Compiled HTML Visual Preview Tab */
                    <div className="bg-[#0b0f10]/60 border border-nbac-border rounded-xl p-8 min-h-[400px] pb-24">
                      <div className="border-b border-nbac-border pb-3 mb-4 select-none">
                        <span className="text-nbac-gold-light text-xs font-semibold uppercase tracking-wider">{type}</span>
                        <h1 className="font-display text-2xl font-bold text-nbac-text mt-1">{title || 'Untitled Post'}</h1>
                        <span className="text-[11px] text-nbac-muted">Published by {author} • Date: Just Now</span>
                      </div>
                      {renderCompiledPreview(blocks)}
                    </div>
                  )}
                </div>

              </div>

              {/* 2. Desktop Settings Sidebar (Elementor-style) */}
              <div className="w-80 border-l border-nbac-border bg-[#070b0c] shrink-0 hidden lg:flex flex-col overflow-y-auto p-6 space-y-6">
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-bold text-white border-b border-nbac-border pb-2">Document Settings</h4>
                  <p className="text-[10px] text-nbac-muted mt-1 leading-relaxed">Configure metadata, category parameters, and publication states.</p>
                </div>

                {/* Settings Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-nbac-muted mb-1.5 uppercase tracking-wider">Category Type</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full bg-[#1d2022] border border-nbac-border rounded-lg px-3 py-2 text-nbac-text text-sm focus:outline-none focus:border-nbac-emerald transition-colors"
                    >
                      <option value="Announcement">Announcement</option>
                      <option value="Press Release">Press Release</option>
                      <option value="Sponsor Update">Sponsor Update</option>
                      <option value="Event Copy">Event Copy</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-nbac-muted mb-1.5 uppercase tracking-wider">Publisher</label>
                    <input
                      type="text"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      required
                      className="w-full bg-[#1d2022] border border-nbac-border rounded-lg px-3 py-2 text-nbac-text text-sm focus:outline-none focus:border-nbac-emerald transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-nbac-muted mb-1.5 uppercase tracking-wider">Headline Title</label>
                    <textarea
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      placeholder="Article title..."
                      rows={3}
                      className="w-full bg-[#1d2022] border border-nbac-border rounded-lg px-3 py-2 text-nbac-text text-sm focus:outline-none focus:border-nbac-emerald transition-colors resize-none font-medium leading-normal"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-nbac-muted mb-1.5 uppercase tracking-wider">Featured Image</label>
                    <div className="space-y-2.5">
                      {/* Tab selector */}
                      <div className="flex bg-[#0b0f10] border border-nbac-border rounded-lg p-0.5 text-xs select-none">
                        {(['gallery', 'url', 'upload'] as const).map((tab) => (
                          <button
                            type="button"
                            key={tab}
                            onClick={() => setFeaturedImageTab(tab)}
                            className={cn(
                              "flex-1 py-1 rounded-md capitalize transition-colors cursor-pointer text-center",
                              featuredImageTab === tab 
                                ? "bg-[#1d2022] text-nbac-gold-light font-medium" 
                                : "text-nbac-body hover:text-nbac-text"
                            )}
                          >
                            {tab}
                          </button>
                        ))}
                      </div>

                      {/* Tab Content */}
                      {featuredImageTab === 'gallery' && (
                        <select
                          value={featuredImage}
                          onChange={(e) => setFeaturedImage(e.target.value)}
                          className="w-full bg-[#1d2022] border border-nbac-border rounded-lg px-3 py-2 text-nbac-text text-xs focus:outline-none focus:border-nbac-emerald transition-colors"
                        >
                          <option value="">-- Choose from Gallery --</option>
                          {PRESET_IMAGES.map((img) => (
                            <option key={img.url} value={img.url}>{img.name}</option>
                          ))}
                        </select>
                      )}

                      {featuredImageTab === 'url' && (
                        <input
                          type="text"
                          value={featuredImage}
                          onChange={(e) => setFeaturedImage(e.target.value)}
                          placeholder="Paste image URL..."
                          className="w-full bg-[#1d2022] border border-nbac-border rounded-lg px-3 py-2 text-nbac-text text-xs focus:outline-none focus:border-nbac-emerald transition-colors font-light"
                        />
                      )}

                      {featuredImageTab === 'upload' && (
                        <div className="relative border border-dashed border-nbac-border hover:border-nbac-gold/30 rounded-lg p-4 bg-[#0b0f10]/30 hover:bg-[#0b0f10]/60 text-center transition-all duration-300 cursor-pointer select-none group">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const url = URL.createObjectURL(file);
                                setFeaturedImage(url);
                              }
                            }}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                          />
                          <div className="flex flex-col items-center gap-1.5">
                            <Upload size={14} className="text-nbac-muted group-hover:text-nbac-gold transition-colors" />
                            <span className="text-[11px] font-semibold text-nbac-text">Upload photo</span>
                            <span className="text-[9px] text-nbac-muted font-light">PNG, JPG up to 5MB</span>
                          </div>
                        </div>
                      )}

                      {/* Preview */}
                      {featuredImage && (
                        <div className="relative rounded-lg overflow-hidden border border-nbac-border bg-[#0b0f10] aspect-video flex items-center justify-center">
                          <img src={featuredImage} alt="Featured Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setFeaturedImage('')}
                            className="absolute top-1.5 right-1.5 bg-black/75 hover:bg-black/90 p-1.5 rounded-full text-nbac-danger hover:scale-105 transition-all cursor-pointer"
                            title="Remove image"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-nbac-muted mb-1.5 uppercase tracking-wider">Publish State</label>
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => setStatus('draft')}
                        className={cn(
                          "py-2 px-3 rounded-lg text-xs border font-sans font-medium transition-all duration-200 cursor-pointer text-left flex justify-between items-center",
                          status === 'draft'
                            ? "bg-nbac-amber/10 border-nbac-amber text-nbac-amber shadow-sm shadow-nbac-amber/5"
                            : "border-nbac-border bg-[#1d2022] text-nbac-body hover:bg-[#1d2022]/80"
                        )}
                      >
                        <span>Draft Mode</span>
                        {status === 'draft' && <span className="w-1.5 h-1.5 rounded-full bg-nbac-amber animate-pulse" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatus('published')}
                        className={cn(
                          "py-2 px-3 rounded-lg text-xs border font-sans font-medium transition-all duration-200 cursor-pointer text-left flex justify-between items-center",
                          status === 'published'
                            ? "bg-nbac-emerald/10 border-nbac-emerald text-nbac-emerald shadow-sm shadow-nbac-emerald/5"
                            : "border-nbac-border bg-[#1d2022] text-nbac-body hover:bg-[#1d2022]/80"
                        )}
                      >
                        <span>Published (Live)</span>
                        {status === 'published' && <span className="w-1.5 h-1.5 rounded-full bg-nbac-emerald animate-pulse" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex-1" />

                {/* Actions summary at sidebar bottom */}
                <div className="border-t border-nbac-border pt-4 space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (editingPost) {
                        setBlocks(parseMarkdownToBlocks(editingPost.body || ''));
                        setTitle(editingPost.title);
                        setType(editingPost.type);
                        setStatus(editingPost.status);
                        setAuthor(editingPost.author);
                        setFeaturedImage(editingPost.featured_image || '');
                      } else {
                        setBlocks([{ id: `block_${Date.now()}`, type: 'paragraph', textValue: '' }]);
                        setTitle('');
                        setType('Announcement');
                        setStatus('draft');
                        setAuthor('Staff Editor');
                        setFeaturedImage('');
                      }
                      setInserterOpenIndex(null);
                    }}
                    className="w-full flex items-center justify-center gap-1.5 border border-nbac-border text-nbac-muted hover:text-white hover:bg-nbac-panel py-2 rounded-lg text-xs transition-colors cursor-pointer"
                  >
                    <RotateCcw size={12} />
                    <span>Revert All Changes</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseDrawer}
                    className="w-full border border-nbac-border text-nbac-body hover:bg-nbac-panel hover:text-white py-2 rounded-lg text-xs transition-colors cursor-pointer"
                  >
                    Close Editor
                  </button>
                </div>
              </div>

            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
