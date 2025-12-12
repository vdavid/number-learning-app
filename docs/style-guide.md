# Style guide

Writing and code styles.

## Writing

- Wording
    - **Use a friendly style**: Make all texts informal, friendly, encouraging, and concise.
    - **Use active voice**: Prefer an active voice rather than passive when writing text.
    - **Abbreviate English**: Use "I'm", "don't", and such.
    - **Don't trivialize**: Avoid terminology of "just", "simple", "easy", and "all you have to do".
    - **Use gender-neutral language**: Use they/them rather than he/him/she/her. Use "folks" or "everyone" rather than
      "guys".
    - **Use universally understood terms**: Use "start" instead of "kickoff", and "end" instead of "wrap up".
    - **Avoid ableist language**: "placeholder value" rather than "dummy value". No "lame", "sanity check" which derive
      from disabilities.
    - **Avoid violent terms**: "stop a process" rather than "kill" or "nuke" it.
    - **Avoid exclusionary terminology**: Prefer "primary/secondary" or "main/replica" over "master/slave". Use
      "allowlist/denylist" over "whitelist/blacklist".
    - **Be mindful of user expertise**: Avoid jargon. Link to definitions and explain concepts when necessary.
    - **Avoid latinisms**: For example, use "for example" instead of "e.g.".
    - **Avoid abbreviations**: Very common acronyms like "URL" are okay. Also, use "docs" rather than "documentation".
- Punctuation, capitalization, numbers
    - **Use sentence case in titles**: Regardless whether visible on the UI or dev only.
    - **Use sentence case in labels**: Applies to buttons, labels, and similar. But omit periods on short microcopy.
    - **Capitalize names correctly**: For example, there is GitHub but mailcow.
    - **Use the Oxford comma**: Use "1, 2, and 3" rather than "1, 2 and 3".
    - **Spell out numbers one through nine.** Use numerals for 10+.
    - **Use ISO dates**: Use YYYY-MM-DD wherever it makes sense.
- UI
    - Make **error messages** positive, actionable, and specific.
    - **Start UI actions with a verb**: This makes buttons and links more actionable. Use "Create user" instead of "New
      user".
    - **Give examples in placeholder text**: Use "Example: 2025-01-01" or "name@example.com" rather than an instruction
      like "Enter your email".

## Code

- Add meaningful comments for public go functions, methods, and types to help the next dev.
- Don't use classes in TypeScript, use only modules.
- Keep editor settings in sync with `.editorconfig`, gofmt, and Prettier config so they all format code consistently.

## Commit messages

The first line is max 50 characters. Examples: "Add new feature X", "Frontend: Fix Save button size on the Settings
page"

Then a blank line. Then a more detailed description if needed, as a form of a concise bulleted list, or free text with
meaningful extra details on what the commit does.

## Comments

Only add JSDoc that actually adds info.
- DO NOT use JSDoc for stuff like `Gets the name` for a function called `getName` :D
- DO NOT use JSDoc for redundant param and return val descriptions, or anything that TypeScript already defines.
- USE JSDoc to mark caveats, tricky/unusual solutions, or formatting like "YYYY-MM-DD" for a date string or
  "must end with a slash" for a path argument.
- Before adding JSDoc, consider using a more descriptive name for the function/param/variable.

## TypeScript

- Only use functional components and modules. No classes anywhere.
- Use pure functions wherever possible and makes sense.
- Use `const` for everything, unless it makes the code unnecessarily verbose.
- Start function names with a verb, unless unidiomatic in the specific case.
- Use `camelCase` for variable and constant names, including module-level constants.
- Put constants closest to where they are used. If a constant is only used in one function, put it in that function.
- For maps, try to name them like `somethingToSomeethingElseMap`. That avoids unnecessary comments.
- Keep interfaces minimal: only export what you must export.
