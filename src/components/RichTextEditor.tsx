'use client';

import { useState, useRef, useEffect } from 'react';
import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Heading2,
    Heading3,
    Quote,
    Code,
    Link as LinkIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const insertMarkdown = (before: string, after: string = '') => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        const beforeText = textarea.value.substring(0, start);
        const afterText = textarea.value.substring(end);

        const newText = beforeText + before + selectedText + after + afterText;
        onChange(newText);

        // Set cursor position
        setTimeout(() => {
            textarea.focus();
            const newPosition = start + before.length + selectedText.length;
            textarea.setSelectionRange(newPosition, newPosition);
        }, 0);
    };

    const formatButtons = [
        {
            icon: Bold,
            label: 'Bold',
            action: () => insertMarkdown('**', '**'),
        },
        {
            icon: Italic,
            label: 'Italic',
            action: () => insertMarkdown('*', '*'),
        },
        {
            icon: Heading2,
            label: 'Heading 2',
            action: () => insertMarkdown('\n## ', '\n'),
        },
        {
            icon: Heading3,
            label: 'Heading 3',
            action: () => insertMarkdown('\n### ', '\n'),
        },
        {
            icon: List,
            label: 'Bullet List',
            action: () => insertMarkdown('\n- ', '\n'),
        },
        {
            icon: ListOrdered,
            label: 'Numbered List',
            action: () => insertMarkdown('\n1. ', '\n'),
        },
        {
            icon: Quote,
            label: 'Quote',
            action: () => insertMarkdown('\n> ', '\n'),
        },
        {
            icon: Code,
            label: 'Code',
            action: () => insertMarkdown('`', '`'),
        },
        {
            icon: LinkIcon,
            label: 'Link',
            action: () => insertMarkdown('[', '](url)'),
        },
    ];

    // Auto-resize textarea
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = Math.max(textarea.scrollHeight, 200) + 'px';
        }
    }, [value]);

    return (
        <div className={cn('border border-slate-200 rounded-lg overflow-hidden bg-white', className)}>
            {/* Toolbar */}
            <div className="border-b border-slate-200 bg-slate-50 p-2 flex flex-wrap gap-1">
                {formatButtons.map((button, index) => (
                    <Button
                        key={index}
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={button.action}
                        className="h-8 w-8 p-0"
                        title={button.label}
                    >
                        <button.icon className="w-4 h-4" />
                    </Button>
                ))}
            </div>

            {/* Editor */}
            <div className="relative">
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full p-4 border-0 focus:outline-none focus:ring-0 resize-none font-mono text-sm min-h-[200px] placeholder:text-slate-400"
                    style={{ height: 'auto' }}
                />
            </div>

            {/* Help Text */}
            <div className="border-t border-slate-200 bg-slate-50 px-4 py-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Markdown supported</span>
                    <span>{value.length} karakter</span>
                </div>
            </div>
        </div>
    );
}
