# Double-E TinyMCE Changelog

## Version 1.0.2
Date: 7 April 2026

- Fix: Handle script blocks (e.g., those used by Ninja Forms) when filtering `the_content`.

## Version 1.0.1
Date: 9 March 2026

- Fix: Separate dev Composer config to fix install issues in Composer-managed sites.

## Version 1.0.0
Date: 1 February 2026

- Feature: Horizontal alignment option for Button Group plugin.
- Fix: Display currently selected swatch correctly for the Callout, Pullquote, and Button Group plugins.
- Refactor: Moved button HTML generation into PHP, including using Comet Components if available.
- Build: Added `.gitattributes` to exclude unnecessary files from Packagist distribution.

## Version 0.0.1

Initial release, including:
- Centralised customised configurations for TinyMCE toolbars across the classic editor and ACF usages.
- Enabling the TinyMCE Tables plugin.
- Creation of 3x custom plugins: Callout, Pullquote, and Button Group.
