// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';
import 'cypress-runner-themes';

// If you want to develop themes locally, set CYPRESS_RUNNER_THEMES_LOCAL=true
// (or pass env LOCAL_THEMES=true). This will read CSS from `cypress/themes/<theme>.css`
// and append it to the Test Runner (parent) head before tests run.
before(() => {
  try {
    const useLocal =
      (typeof process !== 'undefined' && process.env && process.env.CYPRESS_RUNNER_THEMES_LOCAL === 'true') || Cypress.env('LOCAL_THEMES') === true || Cypress.env('LOCAL_THEMES') === 'true';

    if (!useLocal) return;

    const theme = (Cypress.env('theme') || 'light').toString().toLowerCase();
    const filename = `cypress/themes/${theme}.css`;

    // Read file from project and append to parent runner head
    return cy.readFile(filename, { log: false }).then((css) => {
      try {
        const p = window.parent;
        if (!p || !p.document) return;
        const doc = p.document;
        if (!doc.getElementById('cypress-runner-local-theme')) {
          const style = doc.createElement('style');
          style.id = 'cypress-runner-local-theme';
          style.innerHTML = css;
          doc.head.appendChild(style);
        }
      } catch (e) {
        // ignore
      }
    });
  } catch (e) {
    // ignore
  }
});

// Aggressive runner override: try to force the Cypress Test Runner UI to light
// theme by manipulating the parent window (the runner). This complements
// `cypress-runner-themes` and helps in cases where the runner stays dark.
const forceRunnerLight = (() => {
  // Build the CSS once
  const css = `
    /* Strong runner overrides */
    html[data-theme="light"] *, [data-theme="light"] * { color-scheme: light !important; }
    html[data-theme="light"], [data-theme="light"], #unified-reporter, .reporter, .reporter .container, .reporter .wrap, #app {
      background: #ffffff !important;
      color: #0f172a !important;
      --bg: #ffffff !important;
      --text: #0f172a !important;
    }
    /* Make reporter badges and status indicators light-friendly */
    .stats li.passed, .icon-dark-jade-400, .runnable-state-icon { color: #16a34a !important; }
    .stats li.failed, .icon-dark-red-400 { color: #dc2626 !important; }
    .stats li.pending, .icon-dark-gray-400 { color: #6b7280 !important; }
    /* Ensure panels, headers and buttons become light */
    .collapsible-header, .collapsible-header-inner, .command-wrapper, .controls, .reporter .container, .runnable-title, .spec-file-name, .aut-url-container {
      background: transparent !important;
      color: inherit !important;
    }
    /* Force icons and svgs to use currentColor where possible */
    svg[class*="icon-"] path, svg[class*="icon-"] { fill: currentColor !important; stroke: currentColor !important; }
  `;

  // Apply to parent document; safe no-op if cross-origin
  const apply = () => {
    try {
      const p = window.parent;
      if (!p || !p.document) return false;
      const doc = p.document;

      // Set data-theme on runner root and documentElement
      try {
        doc.documentElement.setAttribute('data-theme', 'light');
      } catch (e) {}

      // Replace force-dark with force-light markers if present
      try {
        const darkEls = Array.from(doc.querySelectorAll('.force-dark')) as HTMLElement[];
        darkEls.forEach((el) => {
          el.classList.remove('force-dark');
          el.classList.add('force-light');
        });
      } catch (e) {}

      // Add a persistent style tag with strong overrides
      if (!doc.getElementById('cypress-force-runner-light')) {
        const style = doc.createElement('style');
        style.id = 'cypress-force-runner-light';
        style.innerHTML = css;
        doc.head.appendChild(style);
      }

      // Aggressive pass: convert many elements with dark backgrounds/text to light
      try {
        const win = (doc.defaultView as Window) || window;
        // Limit number of elements to avoid huge CPU usage
        const all = Array.from(doc.querySelectorAll('*')) as HTMLElement[];
        const max = Math.min(all.length, 3000);
        for (let i = 0; i < max; i++) {
          const el = all[i];
          try {
            const cs = win.getComputedStyle(el);
            if (!cs) continue;
            const bg = cs.backgroundColor || '';
            // If element has any non-transparent background or dark text, force light
            if (bg && bg !== 'transparent' && !/rgba?\(0,\s*0,\s*0,\s*0\)/.test(bg)) {
              el.style.setProperty('background-color', '#ffffff', 'important');
            }
            el.style.setProperty('color', '#0f172a', 'important');
          } catch (e) {
            // ignore element errors
          }
        }
        // Ensure body/backgrounds
        try {
          doc.body && doc.body.style.setProperty('background', '#ffffff', 'important');
        } catch (e) {}
        try {
          doc.documentElement && doc.documentElement.style.setProperty('background', '#ffffff', 'important');
        } catch (e) {}
      } catch (e) {}

      // Observe head for removals and reapply if necessary
      try {
        const head = doc.head;
        if (head && !(head as any).__cypress_force_observer__) {
          const observer = new MutationObserver(() => {
            if (!doc.getElementById('cypress-force-runner-light')) {
              const s = doc.createElement('style');
              s.id = 'cypress-force-runner-light';
              s.innerHTML = css;
              doc.head.appendChild(s);
            }
          });
          observer.observe(head, { childList: true });
          (head as any).__cypress_force_observer__ = true;
        }
      } catch (e) {}

      return true;
    } catch (e) {
      return false;
    }
  };

  // Try applying immediately and then retry a few times in case runner loads later
  apply();
  let attempts = 0;
  const maxAttempts = 12;
  const interval = 300;
  const tid = window.setInterval(() => {
    const ok = apply();
    attempts += 1;
    if (ok || attempts >= maxAttempts) {
      window.clearInterval(tid);
    }
  }, interval);

  // close IIFE
})();

// Overwrite `cy.visit` to force a light theme in the AUT (application under test).
// This sets a `theme` in localStorage, a `data-theme` attribute and injects
// a small stylesheet that forces light colors. It also preserves any
// existing `onBeforeLoad` passed in options.
Cypress.Commands.overwrite('visit', (originalFn: any, url: string, options: any) => {
  const newOptions = options || {};
  const userOnBeforeLoad = newOptions.onBeforeLoad;

  const shouldForceLight = (() => {
    try {
      if (typeof process !== 'undefined' && process.env && process.env.CYPRESS_FORCE_LIGHT === 'true') return true;
    } catch (e) {}
    const envForce = Cypress.env('FORCE_LIGHT');
    if (envForce === true || envForce === 'true') return true;
    const envTheme = Cypress.env('theme');
    if (envTheme === 'light') return true;
    return false;
  })();

  newOptions.onBeforeLoad = (win: any) => {
    try {
      if (shouldForceLight) {
        win.localStorage.setItem('theme', 'light');
        win.document.documentElement.setAttribute('data-theme', 'light');

        const style = win.document.createElement('style');
        style.id = 'cypress-force-light-theme';
        style.innerHTML = `
          :root { color-scheme: light; }
          html, body { background: #ffffff !important; color: #000000 !important; }
          * { background-color: transparent !important; color: inherit !important; }
        `;
        win.document.head.appendChild(style);
      }
    } catch (e) {
      // ignore any errors while trying to force the theme
    }

    if (typeof userOnBeforeLoad === 'function') {
      userOnBeforeLoad(win);
    }
  };

  return originalFn(url, newOptions);
});
