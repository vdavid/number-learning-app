## 1. Project Overview

Goal: Build a "reflex trainer" web application that helps users master numbers in a foreign language (MVP: Sino-Korean).

Core Value: Speed. The user should understand numbers instantly (latency &lt; 1s) and be able to say them instantly.

Platform: Mobile-first Web App (PWA ready).

Stack: React (Vite), TypeScript, Tailwind CSS. Local-first (no backend for MVP).


## 2. Product Principles



* **Reflexes over Vocab:** This is not a flashcard deck; it is a gym. Low latency is the metric for success.
* **Frictionless Flow:** Minimise buttons. "Big Button" logic drives the entire session.
* **Gamified Decay:** Progress isn't permanent. Skills "rot" visually if not practiced.
* **Strict Scope:** Only **Sino-Korean** (Il, I, Sam...) for this version.


## 

---
3. Curriculum & Data Structure

The learning path is a linear sequence of **Stages**. The app does not generate random numbers infinitely; it follows a fixed "deck" of cards that introduces concepts progressively.


### The 9 Stages (Curriculum)

*Note: Randomize order within each stage.*



1. **1–10** (Digits)
2. **11–20** (Teens)
3. **21–30** (Twenties)
4. **Decades** (0, 10, 20... 90, 100)
5. **31–99** (Sparse random selection, ~50 cards)
6. **Hundreds** (200, 300... 1000)
7. **101–1000** (Sparse random selection, ~100 cards)
8. **1000–10000** (Sparse random selection, ~100 cards)
9. **10000+** (The "Man/Myon" shift, ~200 cards)


### The Graph Nodes (Level Separation)

For the UI, each Stage is split into two distinct **Nodes**:



1. **Stage X (Listen):** Audio plays → User types digits.
2. **Stage X (Speak):** Number shown → User speaks → STT verifies.

*Total Nodes:* 18 (9 stages × 2 modes).


## 

---
4. Feature Specifications


### A. The "Level Selector" (Home Screen)

**Visuals:**



* A vertical or winding path of **Circular Nodes**.
* **Node States (The "Rotting" System):**
    * **Locked:** Grey/Ghosted. (Cannot play yet).
    * **New/Next:** Pulsing or Bright White. (Current frontier).
    * **Gold/Shiny:** Mastered. High stability (FSRS), recently reviewed.
    * **Faded:** Needs review soon.
    * **Rusty/Cracked:** Urgent. Long time since review.
* **Toggle:** A switch at the bottom: **"Quiet Mode"** (I can't speak right now).
    * *Action:* If ON, "Speak" nodes are skipped in the session queue.

**Interaction:**



* **The Big "LEARN" Button:**
    * Located at the bottom (sticky).
    * *Logic:* It is the **only** way to start a session.
    * *Algorithm:* It pulls a queue of cards comprising:
        1. **Due Reviews:** All cards from previously unlocked levels that FSRS says are due.
        2. **New Cards:** Up to 10 new cards from the current "Frontier" level.
* **Node Click:** User can click a specific node to "Force Review" that specific level (optional but good for targeted practice).


### B. Session Mode (The Game Loop)

**Termination Conditions:**



1. User completes all Reviews + 10 New Cards.
2. **OR** 10 minutes have passed.


#### **View 1: Listen Mode (Type)**



* **Trigger:** App plays audio (TTS) immediately on load.
* **UI:**
    * **Visual Hint:** Display underscores _ _ _ matching the digit count of the answer (e.g., "123" shows 3 lines).
    * **Input:** Custom Numeric Keypad (HTML/CSS, do not use native keyboard).
* **Validation Logic (Auto-Submit):**
    * *No Enter Button.*
    * If input.length == answer.length:
        * If input == answer: **Instant Success** (Green flash, next card).
        * If input != answer: **Wait 500ms** (Debounce). If user doesn't correct it, mark Wrong (Red flash, show answer, play audio again).


#### **View 2: Speak Mode (Voice)**



* **Trigger:** Display number (e.g., "54") on screen.
* **UI:**
    * Hide Keypad.
    * Show large **Microphone Icon**.
    * *Animation:* Pulse the icon when the user speaks (visual feedback).
* **Tech:**
    * Enable SpeechRecognition in continuous mode at session start.
    * **"Magic Match":** Normalize STT input. If it matches the target, trigger **Instant Success**.
    * **Silence Timeout:** If user stops speaking for ~1.5s and input is wrong/incomplete, trigger Fail.


### C. Technical Implementation Details


#### 1. FSRS (Spaced Repetition)



* **Library:** Use ts-fsrs.
* **Storage:** localStorage.
* **Card Object:** \
  TypeScript \
  interface Card { \
  id: number; // The number itself (e.g., 54) \
  type: 'listen' | 'speak'; \
  fsrsData: FSRSCard; // Stability, Difficulty, DueDate \
  } \

* **Grading:**
    * User is **never** asked "How hard was this?".
    * **Easy:** Correct &lt; 2s.
    * **Good:** Correct > 2s.
    * **Again:** Wrong.


#### 2. STT Normalization (The "Hangul Parser")

Chrome's STT is inconsistent. It might return "54", "오십사", or "5십4". You must write a normalizer.



* **Mapping:**
    * 일 (Il) = 1, 이 (I) = 2 ... 구 (Gu) = 9.
    * 십 (Sip) = 10, 백 (Baek) = 100, 천 (Cheon) = 1000, 만 (Man) = 10000.
    * 영/공 (Yeong/Gong) = 0.
* **Logic:** Parse the string. If it contains multipliers (Sip, Baek), perform the math: (Multiplier * Base) + Unit.
* **Result:** Compare the calculated integer against the target number.


#### 3. Audio (TTS)



* Use window.speechSynthesis.
* **Language:** ko-KR.
* **Constraint:** Must be triggered by a user gesture first (the "LEARN" button click handles this).


## 

---
5. Development Milestones


### Milestone 1: The "Steel Thread" (2 Hours)



* Setup React + Tailwind.
* Implement the GameLoop component.
* Hardcode a 10-card array (Level 1).
* Build the Keypad UI.
* Get TTS working (Listen Mode only).
* **Goal:** You can listen to numbers and type them.


### Milestone 2: Speech & Normalizer (3 Hours)



* Implement useSpeechRecognition hook.
* Write the koreanToDigits normalizer function.
* Build the "Speak Mode" UI (Mic icon).
* **Goal:** You can see numbers and speak them.


### Milestone 3: The Engine (FSRS & Storage) (3 Hours)



* Integrate ts-fsrs.
* Create the CardRepository (load/save to localStorage).
* Implement the "Big Button" scheduler (Select due cards + new cards).
* **Goal:** The app remembers your progress.


### Milestone 4: The Map & Polish (3 Hours)



* Build the "Level Selector" screen with the 18 nodes.
* Implement the "Rotting" visual logic (calculate color based on card.due).
* Add animations (slide transitions, green/red flashes).
* **Goal:** The app feels like a game.


## 

---
6. Questions & Edge Cases (For Developer)



* **Q:** What if the user is offline?
    * **A:** App works 100% offline (Logic is local). TTS *should* work offline on most modern devices (OS level), but verify on target device.
* **Q:** How do we handle "Zero"?
    * **A:** Sino-Korean uses "Yeong" or "Gong". Accept both in STT.
* **Q:** User Permissions?
    * **A:** Request Microphone permission immediately upon clicking "LEARN" if Speak Mode is enabled. Handle denial gracefully (fallback to Quiet Mode).