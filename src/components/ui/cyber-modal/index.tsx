// src/components/ui/cyber-modal/index.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { ModalOptions } from './types';
import CyberButton from '@/src/components/ui/cyber-button';

interface ModalProps extends ModalOptions {
    isOpen: boolean;
    onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({
                                         isOpen,
                                         onClose,
                                         title,
                                         content,
                                         footer,
                                         onConfirm,
                                         showCloseButton = true,
                                         showConfirmButton = true,
                                         showCancelButton = true,
                                         confirmText = '确认',
                                         cancelText = '取消',
                                         size = 'md',
                                         closeOnOverlayClick = true,
                                         closeOnEsc = true,
                                         className,
                                         contentClassName,
                                         showBackdrop = true,
                                         backdropClassName,
                                         theme = 'cyber',
                                         glowEffect = true,
                                         borderStyle = 'gradient',
                                     }) => {
    const [isVisible, setIsVisible] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    const themeColors = {
        neon: {
            border: 'rgba(0, 255, 157, 0.3)',
            shadow: 'var(--shadow-neon)',
            hoverShadow: 'var(--shadow-neon-lg)',
            gradientFrom: 'var(--color-cyber-neon-400)',
            gradientTo: 'var(--color-cyber-purple-400)',
            buttonTheme: 'neon' as const,
        },
        pink: {
            border: 'rgba(255, 0, 255, 0.3)',
            shadow: 'var(--shadow-neon-pink)',
            hoverShadow: 'var(--shadow-neon-pink-lg)',
            gradientFrom: 'var(--color-cyber-pink-400)',
            gradientTo: 'var(--color-cyber-purple-400)',
            buttonTheme: 'pink' as const,
        },
        blue: {
            border: 'rgba(0, 224, 255, 0.3)',
            shadow: 'var(--shadow-neon-blue)',
            hoverShadow: 'var(--shadow-neon-blue-lg)',
            gradientFrom: 'var(--color-cyber-blue-400)',
            gradientTo: 'var(--color-cyber-neon-400)',
            buttonTheme: 'blue' as const,
        },
        purple: {
            border: 'rgba(157, 0, 255, 0.3)',
            shadow: 'var(--shadow-neon-purple)',
            hoverShadow: 'var(--shadow-neon-purple-lg)',
            gradientFrom: 'var(--color-cyber-purple-400)',
            gradientTo: 'var(--color-cyber-pink-400)',
            buttonTheme: 'purple' as const,
        },
        cyber: {
            border: 'rgba(0, 255, 157, 0.3)',
            shadow: '0 0 20px rgba(0, 255, 157, 0.5), 0 0 40px rgba(157, 0, 255, 0.3)',
            hoverShadow: '0 0 30px rgba(0, 255, 157, 0.8), 0 0 60px rgba(157, 0, 255, 0.5)',
            gradientFrom: 'var(--color-cyber-neon-400)',
            gradientTo: 'var(--color-cyber-purple-400)',
            buttonTheme: 'neon' as const,
        },
    };

    const selectedTheme = themeColors[theme];
    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-90vw',
    };

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            document.body.style.overflow = 'hidden';
        } else {
            setTimeout(() => setIsVisible(false), 300);
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (closeOnEsc && e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, closeOnEsc, onClose]);

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (closeOnOverlayClick && e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleConfirm = async () => {
        if (onConfirm) {
            await onConfirm();
        }
        onClose();
    };

    if (!isVisible) return null;

    return (
        <>
            {/* 背景遮罩 */}
            {showBackdrop && (
                <div
                    className={cn(
                        'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300',
                        isOpen ? 'opacity-100' : 'opacity-0',
                        backdropClassName
                    )}
                    onClick={handleOverlayClick}
                />
            )}

            {/* 弹窗内容 */}
            <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                onClick={handleOverlayClick}
            >
                <div
                    ref={modalRef}
                    className={cn(
                        'relative rounded-xl transition-all duration-300 transform pointer-events-auto',
                        sizeClasses[size],
                        isOpen
                            ? 'opacity-100 translate-y-0 scale-100'
                            : 'opacity-0 translate-y-4 scale-95',
                        className
                    )}
                    style={{
                        background: 'var(--gradient-card-bg)',
                        boxShadow: glowEffect
                            ? `0 20px 60px rgba(10, 10, 15, 0.9), ${selectedTheme.shadow}`
                            : '0 20px 60px rgba(10, 10, 15, 0.9)',
                        border: '1px solid transparent',
                        maxHeight: '90vh',
                        overflow: 'hidden',
                    }}
                >
                    {/* 边框层 */}
                    <div
                        className="absolute inset-0 pointer-events-none rounded-xl"
                        style={{
                            border: borderStyle === 'solid'
                                ? `1px solid ${selectedTheme.border}`
                                : borderStyle === 'dashed'
                                    ? `1px dashed ${selectedTheme.border}`
                                    : borderStyle === 'neon'
                                        ? `1px solid ${selectedTheme.border}`
                                        : `1px solid transparent`,
                            ...(borderStyle === 'gradient' && {
                                background: `linear-gradient(var(--color-cyber-dark-400), var(--color-cyber-dark-400)) padding-box,
                linear-gradient(135deg, ${selectedTheme.gradientFrom}, ${selectedTheme.gradientTo}) border-box`,
                                border: '1px solid transparent',
                            }),
                        }}
                    />

                    {/* 悬停光晕效果 */}
                    {glowEffect && (
                        <div
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                            style={{
                                background: `radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), 
                ${selectedTheme.gradientFrom}20 0%, 
                transparent 70%)`,
                                filter: 'blur(40px)',
                            }}
                        />
                    )}

                    {/* 内容区域 */}
                    <div className="relative z-10 flex flex-col h-full">
                        {/* 标题区域 */}
                        {title && (
                            <div className="px-6 pt-6 pb-4 border-b border-cyber-dark-300/50">
                                <h2 className="text-xl font-bold text-white">
                                    {title}
                                </h2>
                            </div>
                        )}

                        {/* 内容区域 */}
                        <div
                            className={cn(
                                'flex-1 overflow-y-auto p-6',
                                contentClassName
                            )}
                            style={{ maxHeight: 'calc(90vh - 140px)' }}
                        >
                            {content}
                        </div>

                        {/* 底部区域 */}
                        <div className="px-6 pb-6 pt-4 border-t border-cyber-dark-300/50">
                            {footer ? (
                                footer
                            ) : (
                                <div className="flex justify-end gap-3">
                                    {showCancelButton && (
                                        <CyberButton
                                            variant="cancel"
                                            onClick={onClose}
                                            theme={selectedTheme.buttonTheme}
                                        >
                                            {cancelText}
                                        </CyberButton>
                                    )}
                                    {showConfirmButton && (
                                        <CyberButton
                                            onClick={handleConfirm}
                                            theme={selectedTheme.buttonTheme}
                                        >
                                            {confirmText}
                                        </CyberButton>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 关闭按钮 */}
                    {showCloseButton && (
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-20 p-2 rounded-full hover:bg-cyber-dark-300/30 transition-colors duration-200 cursor-pointer"
                            aria-label="关闭"
                        >
                            <svg
                                className="w-5 h-5 text-cyber-neon-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    )}
                </div>
            </div>
        </>
    );
};

export default Modal;