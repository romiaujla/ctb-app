# UI Guidelines

**Stack:** React, Tailwind CSS, reusable component primitives
**Purpose:** Define consistent, scalable UI implementation rules across the CTB application.

## Core Principles

* consistency over customization
* clear visual hierarchy
* accessibility by default
* composition over ad hoc component sprawl

## Layout System

All pages should follow a clear shell structure:

* page header
* content container
* sections or cards
* actions

## Typography

* keep headings concise
* avoid arbitrary font sizes
* use a small, consistent type scale
* preserve legibility for dashboards, tables, forms, and reports

## Component Rules

* prefer existing primitives before creating custom components
* one primary action per section
* labels are required for interactive fields
* error and validation states must be visible and explicit

## Accessibility Rules

* keyboard navigation is required
* focus states are required
* labels and semantic structure are required
* color alone must not carry meaning
