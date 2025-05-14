### 🧱 PART 1: What _Exactly_ Is Tampermonkey?

Tampermonkey is a **browser extension** that uses:

- The **WebExtension API** (standardized for Chrome, Firefox, Edge, Safari)
- Acts as a **script engine**: loads, compiles, injects, and executes custom JavaScript code into pages
- Uses the **Content Script system** provided by browsers to inject user scripts into web pages
---
### ⚙️ PART 2: Browser Architecture Relevant to Tampermonkey
In modern browsers, a web page's environment has multiple **processes and contexts**:
1. **Main Page Context** (the site itself, like `facebook.com`)
2. **Extension Context** (isolated environment where the extension runs)
3. **Content Script Context** (bridges the extension with the web page)

Tampermonkey sits in the **Extension Context**, and injects your userscript into a **sandboxed Content Script Context**.
#### Important Concepts:
- **Content Scripts** have access to the DOM, but not page JS variables unless explicitly injected.
- **Isolated World**: your userscript runs in a VM that wraps native APIs to isolate from conflicts.
- **Tampermonkey itself has background scripts** that manage storage, metadata, and APIs like `GM_*`.
---
### 🗂️ PART 3: How Scripts Are Stored

Scripts are stored in **IndexedDB** or **extension-managed local storage**, not as physical `.js` files on disk.

Tampermonkey uses:
- **IndexedDB** for structured storage (code, metadata, enabled/disabled state)
- **Settings Sync** via Chrome Sync API or Tampermonkey Cloud (optional)

So internally:
```json
{
  id: "abc123",
  name: "My Script",
  code: "function() { ... }",
  metadata: {
    match: ["*://example.com/*"],
    grant: ["GM_getValue"],
    ...
  },
  config: {
    enabled: true,
    runAt: "document-end"
  }
}
```
---
### 📜 PART 4: How Tampermonkey Executes Userscripts
Here’s the full lifecycle with internals:
#### Step 1: Page Load Detected
Tampermonkey watches page loads using:
- `webNavigation` or `tabs` API
- Monitors page URLs in all tabs
#### Step 2: Match Engine Triggers
Tampermonkey runs its **matcher engine**:
- Compares each installed script’s `@match`, `@include`, and `@exclude` patterns to the page URL.
- Converts `@match` rules into **regex-like matchers** behind the scenes.
#### Step 3: Script Preprocessing
Before injection:
- Tampermonkey parses and analyzes `// ==UserScript==` block
- Resolves:
    - Dependencies (`@require`, `@resource`)
    - APIs (`@grant`)
    - Storage references (`GM_getValue`, etc.)

- Generates an **execution context** with helper functions (`GM_` APIs, metadata, sandbox references)
#### Step 4: Injection Method Chosen
Tampermonkey decides **how to inject**:
- **content script** (isolated world): Default
- **page script injection**: If script needs access to page JS variables

Injection Methods:
- Injects a `<script>` tag into DOM (for shared scope)
- Or uses browser's native content script system with `eval`-wrapped code
#### Step 5: Script Runs at `@run-at`
Your script executes based on the `@run-at` value:
- `document-start`: script runs before any page content is parsed
- `document-end`: after `DOMContentLoaded` event
- `document-idle`: after all resources finish loading

Scripts are wrapped like this:

```js
(function(wrapperParams) {
  'use strict';

  // User script code here
})(sandboxEnvironment);
```

Where `sandboxEnvironment` contains:

- Wrapped DOM APIs
- Safe versions of `GM_*` APIs
- References to `window`, `document`, etc., within the content scope

---

### 🧱 PART 5: The `@grant` System – Internal View

Tampermonkey has a **privilege escalation system** using `@grant` declarations. When you write:

```js
// @grant GM_getValue
```

Tampermonkey sets up:

- A **message channel** between the content script and the background script
- The content script calls `GM_getValue`, which sends a message like:
    ```json
    {
      method: "GM_getValue",
      args: ["keyName"]
    }
    ```
- The background script executes it and returns the result asynchronously

This is required because:

- Content scripts have limited access
- Cross-origin requests or storage must go through the extension background context

---
### 🧪 PART 6: Isolation and Security
Userscripts **don’t run in the same JS context as the page**:
- No access to page-defined functions or variables (e.g. `window.AppConfig`)
- To access them, you must inject a `<script>` tag into the DOM:
    ```js
    var s = document.createElement('script');
    s.textContent = 'console.log(window.AppConfig)';
    document.head.appendChild(s);
    ```

Security Features:

- Each script runs in a **separate closure**
- Uses a VM-like layer for API injection
- Can’t leak data between scripts (unless explicitly shared)
- Protects against browser XSS by limiting raw `eval()` use

---
### 🔄 PART 7: Updates and Script Distribution

Tampermonkey supports:

- **Auto-updates** via `@updateURL` and `@downloadURL`
- Script hosting via:
    
    - GitHub
    - GreasyFork
    - Raw URLs

It uses a **versioned metadata** system to check for updates and compares:

```js
// @version        1.2.3
```

It checks the remote script, compares versions, and updates silently or with prompt (configurable).

---

### 💡 PART 8: Developer Tools and Debugging

You can debug userscripts using:
1. **Tampermonkey Dashboard**
    - Edit, disable, reorder, set execution logs

2. **Browser DevTools**
    - Go to the site
    - Open DevTools → Sources → `tm` scripts (e.g., `userscript.html?name=MyScript`)
    - Set breakpoints, watch values

3. **Console Logging**
    - Use `console.log()` inside your script
    - Appears in the website’s console

---
###  Summary of Internals

|Component|Description|
|---|---|
|**Storage**|IndexedDB or extension local storage|
|**Match Engine**|Converts `@match` to URL filters|
|**Execution Context**|Uses browser content script system|
|**APIs**|`GM_*` calls via message-passing to background script|
|**Security**|Sandboxed context, separate from page JS|
|**Injection**|Timing via `@run-at`, injection via `<script>` or native API|
