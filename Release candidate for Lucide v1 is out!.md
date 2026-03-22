Release candidate for Lucide v1 is out!🚀 You're looking at the site for v1, for v0 go to v0 site

Skip to content

Lucide
Main Navigation
Icons
Guide

Resources
Packages
Showcase

Sidebar Navigation
Introduction
What is Lucide?

Version 1

Installation

Framework
Angular logo
Angular
Overview

Getting started

Migration from v0

Basics
Color

Sizing

Stroke width

Advanced
Typescript

Accessibility

Global styling

With Lucide Lab

Filled icons

Combining icons

Icon provider

Resources
Accessibility in depth

VSCode

On this page
Prerequisites
Installation
Importing your first icon
Component inputs
Getting started
This guide will help you get started with Lucide in your Angular project. Make sure you have an Angular environment set up. If you don't have one yet, you can create a new Angular project using @angular/cli.

Prerequisites
This package requires Angular 17+ and uses standalone components, signals, and zoneless change detection.

Installation

pnpm

yarn

npm

bun

pnpm add @lucide/angular
Importing your first icon
This library is built with standalone components, so it's completely tree-shakable.

Every icon can be imported as a ready-to-use standalone component, which renders an inline SVG element. This way, only the icons that are imported into your project are included in the final bundle. The rest of the icons are tree-shaken away.

Standalone icons

import { Component } from '@angular/core';
import { LucideFileText } from '@lucide/angular';

@Component({
  selector: 'app',
  template: '<svg lucideFileText></svg>',
  imports: [LucideFileText],
})
export class App { }
Dynamic icon component
When you need to render icons dynamically (for example in a list of menu items or based on a boolean signal), you can use the LucideDynamicIcon component:


import { Component, computed, signal } from '@angular/core';
import { LucideDynamicIcon, LucideCircleCheck, LucideCircleX } from '@lucide/angular';

@Component({
  selector: 'app',
  template: `<svg [lucideIcon]="icon()"></svg>`,
  imports: [LucideDynamicIcon],
})
export class App {
  protected readonly model = signal<boolean>(true);
  protected readonly icon = computed(() => this.model() ? LucideCircleCheck : LucideCircleX);
}
Component inputs
To customize the appearance of an icon, you can use the following inputs:

name	type	default
size	number	24
color	string	currentColor
strokeWidth	number	2
absoluteStrokeWidth	boolean	false
title	string	null
Because icons render as SVG elements, all standard SVG attributes can also be applied. See the list of SVG Presentation Attributes on MDN.


<svg lucideHouse [size]="48" color="red" [strokeWidth]="1" title="Home"></svg>
For more examples and details on how to use these inputs, continue the guide:

Color
Adjust the color of your icons
Sizing
Adjust the size of your icons
Stroke width
Adjust the stroke width of your icons
Edit this page
Pager
Previous page
Overview
Next page
Migration from v0