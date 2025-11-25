'use client'

import * as React from 'react'
import { AppLayout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/Input'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Modal, ModalFooter } from '@/components/ui/Modal'
import { Tooltip } from '@/components/ui/Tooltip'
import {
  Skeleton,
  SkeletonCard,
  SkeletonAvatar,
  SkeletonText,
} from '@/components/ui/Skeleton'
import {
  Spinner,
  SpinnerInline,
  SpinnerOverlay,
} from '@/components/ui/Spinner'

/**
 * UI Components Test Page
 *
 * Comprehensive visual validation of STAT-DISCUTE Design System v1.0
 * Phase 2: Base Components
 *
 * Tests all variants, sizes, and states for:
 * - Button (primary, secondary, ghost)
 * - Input (default, search, error)
 * - Card (default, anthracite, elevated, clickable)
 * - Modal (with overlay and animations)
 * - Tooltip (all positions)
 * - Skeleton (text, circular, rectangular)
 * - Spinner (all sizes)
 */

export default function UIComponentsTestPage() {
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState('')
  const [inputValue, setInputValue] = React.useState('')

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-[var(--space-12)] p-[var(--space-8)]">
        {/* Header */}
        <header className="space-y-[var(--space-3)]">
          <h1 className="text-[var(--text-4xl)] font-[var(--font-bold)]">
            UI Components Test
          </h1>
          <p className="text-[var(--text-lg)] text-[var(--color-gray-400)]">
            STAT-DISCUTE Design System v1.0 - Phase 2: Base Components
          </p>
        </header>

        {/* Button Component */}
        <section className="space-y-[var(--space-6)]">
          <h2 className="text-[var(--text-2xl)] font-[var(--font-semibold)] border-b border-[var(--color-gray-800)] pb-[var(--space-3)]">
            Button Component
          </h2>

          {/* Variants */}
          <div className="space-y-[var(--space-4)]">
            <h3 className="text-[var(--text-lg)] font-[var(--font-medium)] text-[var(--color-gray-400)]">
              Variants
            </h3>
            <div className="flex flex-wrap gap-[var(--space-3)]">
              <Button variant="primary">Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="ghost">Ghost Button</Button>
            </div>
          </div>

          {/* Sizes */}
          <div className="space-y-[var(--space-4)]">
            <h3 className="text-[var(--text-lg)] font-[var(--font-medium)] text-[var(--color-gray-400)]">
              Sizes
            </h3>
            <div className="flex flex-wrap items-center gap-[var(--space-3)]">
              <Button variant="primary" size="sm">Small</Button>
              <Button variant="primary" size="md">Medium (Default)</Button>
              <Button variant="primary" size="lg">Large</Button>
              <Button variant="primary" size="xl">Extra Large</Button>
            </div>
          </div>

          {/* States */}
          <div className="space-y-[var(--space-4)]">
            <h3 className="text-[var(--text-lg)] font-[var(--font-medium)] text-[var(--color-gray-400)]">
              States
            </h3>
            <div className="flex flex-wrap gap-[var(--space-3)]">
              <Button variant="primary">Normal</Button>
              <Button variant="primary" disabled>Disabled</Button>
              <Button variant="primary" loading>Loading</Button>
              <Button variant="primary" fullWidth>Full Width</Button>
            </div>
          </div>

          {/* With Icons */}
          <div className="space-y-[var(--space-4)]">
            <h3 className="text-[var(--text-lg)] font-[var(--font-medium)] text-[var(--color-gray-400)]">
              With Icons
            </h3>
            <div className="flex flex-wrap gap-[var(--space-3)]">
              <Button
                variant="secondary"
                leftIcon={
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                }
              >
                Search
              </Button>
              <Button
                variant="primary"
                rightIcon={
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                }
              >
                Next
              </Button>
            </div>
          </div>
        </section>

        {/* Input Component */}
        <section className="space-y-[var(--space-6)]">
          <h2 className="text-[var(--text-2xl)] font-[var(--font-semibold)] border-b border-[var(--color-gray-800)] pb-[var(--space-3)]">
            Input Component
          </h2>

          <div className="space-y-[var(--space-4)] max-w-md">
            <Input placeholder="Default input" value={inputValue} onChange={(e) => setInputValue(e.target.value)} />

            <Input
              variant="search"
              placeholder="Rechercher un joueur..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onClear={() => setSearchValue('')}
            />

            <Input
              placeholder="Input with error"
              error="Ce champ est requis"
            />

            <Input
              placeholder="Disabled input"
              disabled
            />
          </div>
        </section>

        {/* Card Component */}
        <section className="space-y-[var(--space-6)]">
          <h2 className="text-[var(--text-2xl)] font-[var(--font-semibold)] border-b border-[var(--color-gray-800)] pb-[var(--space-3)]">
            Card Component
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-[var(--space-6)]">
            {/* Default Card */}
            <Card variant="default">
              <CardHeader>
                <CardTitle>Default Card</CardTitle>
                <CardDescription>Gray-950 background</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-[var(--text-sm)] text-[var(--color-gray-400)]">
                  Standard card variant with subtle styling.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="secondary" size="sm">Action</Button>
              </CardFooter>
            </Card>

            {/* Anthracite Card */}
            <Card variant="anthracite">
              <CardHeader>
                <CardTitle>Anthracite Card</CardTitle>
                <CardDescription>Gray-850 background (#1F1F1F)</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-[var(--text-sm)] text-[var(--color-gray-400)]">
                  Signature color for main cards.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="primary" size="sm">Action</Button>
              </CardFooter>
            </Card>

            {/* Elevated Card */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Elevated Card</CardTitle>
                <CardDescription>With stronger shadow</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-[var(--text-sm)] text-[var(--color-gray-400)]">
                  Enhanced visibility with shadow.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="secondary" size="sm">Action</Button>
              </CardFooter>
            </Card>
          </div>

          {/* Clickable Card */}
          <Card
            variant="anthracite"
            onClick={() => alert('Card clicked!')}
            className="max-w-md"
          >
            <CardHeader>
              <CardTitle>Clickable Card</CardTitle>
              <CardDescription>Click me to see interaction</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-[var(--text-sm)] text-[var(--color-gray-400)]">
                Hover to see the effect. Keyboard accessible with Enter/Space.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Modal Component */}
        <section className="space-y-[var(--space-6)]">
          <h2 className="text-[var(--text-2xl)] font-[var(--font-semibold)] border-b border-[var(--color-gray-800)] pb-[var(--space-3)]">
            Modal Component
          </h2>

          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            Open Modal
          </Button>

          <Modal
            open={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Confirmation"
            description="This is a modal dialog with overlay and animations"
            size="md"
          >
            <div className="space-y-[var(--space-4)]">
              <p className="text-[var(--text-base)] text-[var(--color-gray-300)]">
                This modal demonstrates:
              </p>
              <ul className="list-disc list-inside space-y-[var(--space-2)] text-[var(--text-sm)] text-[var(--color-gray-400)]">
                <li>Overlay with backdrop blur</li>
                <li>Focus trap (Tab cycles within modal)</li>
                <li>Escape key closes modal</li>
                <li>Click overlay to close</li>
                <li>Smooth fade + scale animations</li>
              </ul>
            </div>

            <ModalFooter>
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setIsModalOpen(false)}>
                Confirm
              </Button>
            </ModalFooter>
          </Modal>
        </section>

        {/* Tooltip Component */}
        <section className="space-y-[var(--space-6)]">
          <h2 className="text-[var(--text-2xl)] font-[var(--font-semibold)] border-b border-[var(--color-gray-800)] pb-[var(--space-3)]">
            Tooltip Component
          </h2>

          <div className="flex flex-wrap gap-[var(--space-6)]">
            <Tooltip content="This tooltip appears on top" position="top">
              <Button variant="secondary">Hover (Top)</Button>
            </Tooltip>

            <Tooltip content="This tooltip appears on bottom" position="bottom">
              <Button variant="secondary">Hover (Bottom)</Button>
            </Tooltip>

            <Tooltip content="This tooltip appears on left" position="left">
              <Button variant="secondary">Hover (Left)</Button>
            </Tooltip>

            <Tooltip content="This tooltip appears on right" position="right">
              <Button variant="secondary">Hover (Right)</Button>
            </Tooltip>
          </div>
        </section>

        {/* Skeleton Component */}
        <section className="space-y-[var(--space-6)]">
          <h2 className="text-[var(--text-2xl)] font-[var(--font-semibold)] border-b border-[var(--color-gray-800)] pb-[var(--space-3)]">
            Skeleton Component
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-[var(--space-6)]">
            {/* Skeleton Card */}
            <SkeletonCard />

            {/* Avatar + Text */}
            <div className="space-y-[var(--space-4)]">
              <div className="flex items-center gap-[var(--space-3)]">
                <SkeletonAvatar />
                <div className="flex-1">
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="40%" className="mt-[var(--space-2)]" />
                </div>
              </div>
              <SkeletonText lines={4} />
            </div>

            {/* Various shapes */}
            <div className="space-y-[var(--space-4)]">
              <Skeleton variant="rectangular" width="100%" height="100px" />
              <Skeleton variant="text" width="100%" />
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="circular" width="64px" height="64px" />
            </div>
          </div>
        </section>

        {/* Spinner Component */}
        <section className="space-y-[var(--space-6)]">
          <h2 className="text-[var(--text-2xl)] font-[var(--font-semibold)] border-b border-[var(--color-gray-800)] pb-[var(--space-3)]">
            Spinner Component
          </h2>

          <div className="space-y-[var(--space-6)]">
            {/* Sizes */}
            <div className="flex items-center gap-[var(--space-6)]">
              <div className="text-center space-y-[var(--space-2)]">
                <Spinner size="sm" />
                <p className="text-[var(--text-xs)] text-[var(--color-gray-400)]">Small</p>
              </div>
              <div className="text-center space-y-[var(--space-2)]">
                <Spinner size="md" />
                <p className="text-[var(--text-xs)] text-[var(--color-gray-400)]">Medium</p>
              </div>
              <div className="text-center space-y-[var(--space-2)]">
                <Spinner size="lg" />
                <p className="text-[var(--text-xs)] text-[var(--color-gray-400)]">Large</p>
              </div>
              <div className="text-center space-y-[var(--space-2)]">
                <Spinner size="xl" />
                <p className="text-[var(--text-xs)] text-[var(--color-gray-400)]">XL</p>
              </div>
            </div>

            {/* Inline */}
            <SpinnerInline text="Chargement des données..." />

            {/* Overlay example */}
            <Card variant="anthracite" className="relative h-48">
              <SpinnerOverlay />
            </Card>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-[var(--color-gray-800)] pt-[var(--space-8)] text-center text-[var(--text-sm)] text-[var(--color-gray-400)]">
          <p>STAT-DISCUTE Design System v1.0 - Phase 2 Complete</p>
          <p className="mt-[var(--space-2)]">Tous les composants respectent la philosophie anti-impulsivité et la règle monochrome stricte</p>
        </footer>
      </div>
    </AppLayout>
  )
}
