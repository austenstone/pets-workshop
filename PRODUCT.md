# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The primary users are attendees in a live, two-hour GitHub Actions workshop. They need to find the correct exercise quickly, understand what outcome they are working toward, and recover without losing the main presentation.

## Product Purpose

The repository provides a small full-stack pet shelter application and guided workshops for learning GitHub features. The attendee website gives the GitHub Actions workshop one public, browser-friendly route through setup, hands-on exercises, demonstrations, and follow-up resources.

## Positioning

The workshop teaches GitHub Actions by progressively automating a real Flask and Astro application, connecting each workflow concept to observable tests, deployment, reuse, and repository policy.

## Operating Context

Attendees use their GitHub account, a repository created from the public template, GitHub's browser editor or `github.dev`, and the Actions interface. The workshop is delivered live to a group, so the website must remain useful when an attendee falls behind or switches to observing a prepared demonstration.

## Capabilities and Constraints

- The attendee site is public and contains no facilitator-only operational notes.
- It must work as a static GitHub Pages site without a client-side framework or build step.
- It must provide setup links, the timed route, exercise navigation, expected outcomes, and recovery guidance.
- GitHub Actions execute on GitHub-hosted runners; Codespaces is optional.
- Azure deployment and reusable deployment workflows are facilitator demonstrations rather than attendee-run setup.
- The existing workshop documentation remains the detailed source of truth.

## Brand Commitments

Use the existing Tailspin Shelter name and the project's slate and blue visual identity. Keep the voice direct, practical, and instructional.

## Evidence on Hand

- Workshop documentation in `content/github-actions/`
- Working Flask API and Astro frontend in `app/`
- Existing Tailspin Shelter interface in `app/client/src/`
- Public template repository at `https://github.com/austenstone/pets-workshop`

## Product Principles

- Keep attendees moving rather than debugging individual environments.
- Make the next action obvious.
- Explain every automation concept through the application it protects.
- Separate hands-on work from facilitator demonstrations honestly.
- Preserve a useful path for attendees who fall behind.

## Accessibility & Inclusion

The site must support keyboard navigation, visible focus states, semantic structure, responsive layouts, reduced motion preferences, and sufficient color contrast.
