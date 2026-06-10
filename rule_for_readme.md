When updating the project
- Always check if the `trickle/notes/README.md` needs to be updated to reflect changes in features, file structure, or setup instructions.
- Keep the README concise and up-to-date.
- Never use highly frequent polling (e.g., 1000ms) for heavy database loads; keep polling frequency reasonable (3s to 15s) to avoid slow loading times.
