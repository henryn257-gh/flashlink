# FlashLink

A lightweight, stateless, Quizlet-inspired flashcard website.

## Core idea

A deck is stored entirely inside its shareable URL.

- No database
- No login
- No accounts
- No localStorage
- No server-side deck storage

A shared deck can be edited by anyone who has the link.

Editing a set does not modify the original link. It creates a new URL containing the edited deck.

## Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Node
- Express
- Gemini API
- Railway

## Production

Build:

```bash
npm run build
