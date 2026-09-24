(() => {
  'use strict';

  const root = document.querySelector('#prototype');
  const storageKey = 'helix-stitched-onboarding-v1';
  const people = [
    { id: 'jordan', name: 'Jordan', initials: 'J', image: './assets/faces/jordan.png', role: 'Staff Product Manager', level: 'L5', learning: 72 },
    { id: 'sam', name: 'Sam', initials: 'S', image: './assets/faces/sam.png', role: 'Senior Product Manager', level: 'L4', learning: 54 },
    { id: 'nina', name: 'Nina', initials: 'N', image: './assets/faces/nina.png', role: 'Senior Product Manager', level: 'L4', learning: 78 },
    { id: 'leah', name: 'Leah', initials: 'L', image: './assets/faces/leah.png', role: 'Product Manager', level: 'L3', learning: 66 },
    { id: 'omar', name: 'Omar', initials: 'O', image: './assets/faces/omar.png', role: 'Staff Product Manager', level: 'L5', learning: 60 },
    { id: 'tanaka', name: 'Tanaka', initials: 'T', image: './assets/faces/tanaka.png', role: 'Product Manager', level: 'L3', learning: 85 },
  ];
  const stages = [
    {
      title: 'Welcome, Sarah',
      detail: 'Maya Patel set this up and added you. Helix reads what your team is learning and tells you who needs you.',
      step: 'Welcome',
      scene: 'you',
      ms: 2600,
    },
    {
      title: 'Finding your people',
      detail: 'Everyone your organization has reporting to you.',
      step: 'Your people',
      scene: 'roster',
      ms: 3900,
    },
    {
      title: 'Bringing their learning across',
      detail: 'Courses and assessments they have already finished on Udemy Business.',
      step: 'Their learning',
      scene: 'learning',
      ms: 3700,
    },
    {
      title: 'Your team, as it stands today',
      detail: '6 people, and how much learning each of them has on record.',
      step: 'Your view',
      scene: 'chart',
      ms: 2900,
    },
  ];
  const stageAt = [0, 2600, 6500, 10200];
  const changeReasons = [
    { id: 'not-mine', label: 'Not on my team' },
    { id: 'left', label: 'Has left the company' },
    { id: 'wrong-level', label: 'Wrong role or level' },
    { id: 'dotted-line', label: 'Dotted line, not mine' },
  ];

  let screen = 'invite';
  let stage = 0;
  let lastTrigger = null;
  let stopGlass = () => {};
  let introTimers = [];

  const udemyMark = () =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="oklch(58.44% 0.2596 306.65deg)" d="m17.434 7.956-5.218-2.978L7 7.956V4.978L12.217 2l5.218 2.978z"/><path fill="#fff" d="M7 10.457h2.733v6.564c0 1.697 1.28 2.523 2.484 2.523 1.213 0 2.485-.849 2.485-2.546v-6.542h2.733v6.721c0 1.563-.497 2.769-1.49 3.595-.995.826-2.237 1.228-3.75 1.228-1.514 0-2.756-.402-3.727-1.228S7 18.785 7 17.244z"/></svg>`;

  const lucidePaths = {
    menu: '<path d="M4 5h16"/><path d="M4 12h16"/><path d="M4 19h16"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    home: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    people:
      '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    chart: '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
    book: '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
    chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
    rotate: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
    chevron: '<path d="m9 18 6-6-6-6"/>',
    'arrow-left': '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
    archive:
      '<rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    trash:
      '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>',
    mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    'circle-check': '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    'corner-up-right': '<polyline points="15 14 20 9 15 4"/><path d="M4 20v-7a4 4 0 0 1 4-4h12"/>',
    tag: '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>',
    'ellipsis-vertical': '<circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>',
    'circle-help':
      '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
    settings:
      '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
    sparkles:
      '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/>',
    'layout-grid':
      '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
    user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    udemy:
      '<path fill="currentColor" stroke="none" d="m17.4 8-5.2-3-5.2 3V5l5.2-3 5.2 3v3Zm-10.4 2.5h2.7V17c0 1.7 1.3 2.5 2.5 2.5s2.5-.8 2.5-2.5v-6.5h2.7v6.7c0 3.3-2.3 4.8-5.2 4.8S7 20.5 7 17.2v-6.7Z"/>',
  };

  const icon = (name, size = 16) =>
    `<svg class="lucide" aria-hidden="true" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${lucidePaths[name] ?? ''}</svg>`;

  const navItem = (iconName, label, active = false) =>
    `<button class="nav-link${active ? ' active' : ''}" type="button" tabindex="-1"><span class="nav-icon">${icon(iconName)}</span><span>${label}</span></button>`;

  function setDocumentTitle() {
    const titles = {
      invite: 'Moxie has added Helix — your team is ready',
      signin: 'Sign in · Helix One',
      code: 'Check your email · Helix One',
      product: `${stages[stage].title} · Helix`,
    };
    document.title = titles[screen] ?? 'Helix · Manager onboarding';
  }

  function clearIntro() {
    introTimers.forEach((id) => window.clearTimeout(id));
    introTimers = [];
  }

  function mount(markup, focusSelector = 'h1') {
    clearIntro();
    stopGlass();
    root.innerHTML = `<div class="route-frame">${markup}</div>`;
    const glass = root.querySelector('[data-stripe-glass]');
    if (glass && window.mountStripeGlass) stopGlass = window.mountStripeGlass(glass);
    setDocumentTitle();
    requestAnimationFrame(() => {
      const focusTarget = root.querySelector(focusSelector);
      if (!focusTarget) return;
      focusTarget.tabIndex = -1;
      focusTarget.focus({ preventScroll: true });
    });
  }

  function renderInvite() {
    screen = 'invite';
    mount(`
      <div class="mail-app">
        <aside class="mail-sidebar" aria-label="Email folders">
          <div class="gmail-brand">
            ${icon('menu')}<span class="gmail-mark" aria-hidden="true"></span><span>Gmail</span>
          </div>
          <button class="compose-button" type="button" tabindex="-1">Compose</button>
          <nav class="mail-nav" aria-label="Mailbox">
            <span class="selected">Inbox</span><span>Starred</span><span>Snoozed</span>
            <span>Sent</span><span>Drafts</span><span><strong>Labels</strong></span>
            <span>Accounts</span><span>Articles</span><span>Notes</span>
          </nav>
        </aside>
        <main class="mail-main">
          <header class="mail-search-row">
            <div class="mail-search">${icon('search')}<span>Search mail</span></div>
            <div class="mail-utility" aria-hidden="true">${icon('circle-help', 18)}${icon('settings', 18)}${icon('sparkles', 18)}${icon('layout-grid', 18)}<span class="account-dot">S</span></div>
          </header>
          <div class="mail-toolbar" aria-hidden="true">${icon('arrow-left', 18)}${icon('archive', 18)}${icon('info', 18)}${icon('trash', 18)}<span class="mail-divider"></span>${icon('mail', 18)}${icon('clock', 18)}${icon('circle-check', 18)}<span class="mail-divider"></span>${icon('corner-up-right', 18)}${icon('tag', 18)}${icon('ellipsis-vertical', 18)}</div>
          <article class="email-message">
            <h1>Moxie has added Helix — your team is ready</h1>
            <div class="sender-row">
              <span class="sender-avatar">H</span>
              <span class="sender-copy"><strong>Helix</strong> <span class="sender-address">&lt;no-reply@helix.moxie.com&gt;</span><br /><small>to me</small></span>
              <span class="sender-time">8:12 AM</span>
            </div>
            <div class="email-brandline"><img src="./assets/helix-logo-inverted.svg" alt="" />Helix</div>
            <div class="invite-hero">
              <section>
                <small>For managers at Moxie</small>
                <strong>Congratulations — your team is already in Helix.</strong>
              </section>
              <section>
                <div class="logo-transfer">
                  <span class="brand-tile"><span style="color:#6f2cff">U</span>demy</span>
                  <span aria-hidden="true">⟶</span>
                  <span class="brand-tile"><img src="./assets/helix-logo.svg" alt="" /></span>
                </div>
                <div class="transfer-labels"><span>Udemy Business</span><span>Helix</span></div>
                <div class="transfer-copy">Everything your team has learned came across with them.</div>
              </section>
            </div>
            <p class="email-copy">Maya Patel set Helix up for Moxie. Your six people are already in, along with the courses and assessed practice they finished on Udemy Business — so there is nothing for you to configure, and nobody’s history restarted.</p>
            <div class="benefits">
              <section><h2>You stay the authority</h2><p>Helix brings the evidence. You confirm it. Nothing counts as proven until you say so.</p></section>
              <section><h2>Coach without reading everything</h2><p>It reads the learning and assessments your team already has, and tells you which two people need you this week.</p></section>
              <section><h2>See whether coaching worked</h2><p>Agree a next step and Helix comes back on the date with what changed — measured on real work, not a completed course.</p></section>
            </div>
            <button class="sp-button email-cta" data-action="see-team" type="button">See your team</button>
            <div class="email-signoff">
              <strong>The Helix team</strong>
              <div class="divider"></div>
              Maya Patel set this up for Moxie. Your access covers your own six reports and nobody else. If something looks missing from a person’s history, tell Maya — she can check the import before you act on it.
            </div>
          </article>
        </main>
      </div>
    `);
  }

  function signinHeader() {
    return `
      <header class="signin-header" aria-labelledby="signin-title">
        <span class="signin-logo" role="img" aria-label="Helix One"><img src="./assets/helix-logo.svg" alt="" /></span>
        <h1 id="signin-title">Helix One</h1>
        <p class="type-body-sm">Skills → Proof → Outcomes.</p>
      </header>
    `;
  }

  function renderSignin() {
    screen = 'signin';
    mount(
      `
        <main class="signin-screen dark">
          <div class="stripe-glass" data-stripe-glass></div>
          <div class="signin-layout">
            ${signinHeader()}
            <section class="signin-card">
              <form class="signin-form" data-form="email">
                <div class="signin-copy">
                  <h2>Sign in to Moxie</h2>
                  <p class="type-body-sm">Enter your work email to receive a sign-in code.</p>
                </div>
                <div class="field">
                  <label for="work-email">Work email</label>
                  <input class="sp-input" id="work-email" name="email" type="email" autocomplete="email" value="sarah.chen@moxie.com" required />
                </div>
                <button class="sp-button" type="submit">Send code</button>
                <div class="signin-divider">or</div>
                <button class="sp-button sp-button--outline" data-action="udemy" type="button">${udemyMark()}Continue with Udemy</button>
              </form>
            </section>
          </div>
        </main>
      `,
      '#work-email',
    );
  }

  function renderCode() {
    screen = 'code';
    mount(
      `
        <main class="signin-screen dark">
          <div class="stripe-glass" data-stripe-glass></div>
          <div class="signin-layout">
            ${signinHeader()}
            <section class="signin-card">
              <form class="signin-form" data-form="code">
                <div class="signin-copy">
                  <h2>Check your email</h2>
                  <p class="type-body-sm">We sent a 6-digit code to <strong>sarah.chen@moxie.com</strong>.</p>
                </div>
                <div class="field">
                  <label for="signin-code">Sign-in code</label>
                  <input class="sp-input" id="signin-code" name="code" inputmode="numeric" autocomplete="one-time-code" maxlength="6" pattern="[0-9]{6}" placeholder="123456" required />
                </div>
                <button class="sp-button" data-verify type="submit" disabled>Verify code</button>
                <p class="signin-status type-body-xs" role="status"></p>
                <div class="verification-actions">
                  <button class="sp-button sp-button--ghost" data-action="resend" type="button">Resend code</button>
                  <button class="sp-button sp-button--ghost" data-action="different-email" type="button">Use a different email</button>
                </div>
              </form>
            </section>
          </div>
        </main>
      `,
      '#signin-code',
    );
  }

  function productSidebar() {
    return `
      <aside class="product-sidebar">
        <div class="product-brand"><img src="./assets/helix-logo-inverted.svg" alt="" /><span>Helix</span></div>
        <div class="product-tabs"><span class="active">▧&nbsp; Org</span><span>♙&nbsp; Learning</span></div>
        <nav class="product-nav" aria-label="Organization">
          ${navItem('home', 'Home', true)}
          ${navItem('people', 'People')}
          ${navItem('people', 'Workforce')}
          ${navItem('book', 'Learning initiatives')}
          ${navItem('chart', 'Insights')}
        </nav>
        <div class="sidebar-rule"></div>
        <div class="sidebar-label">Recent chats</div>
        <div class="product-nav chat-list">
          ${navItem('chat', 'What should I learn next for the PM role?')}
          ${navItem('chat', 'Draft a learning initiative for the design team')}
          ${navItem('chat', 'Summarize last week’s completions')}
          ${navItem('rotate', 'All chat history')}
        </div>
        <div class="sidebar-bottom">
          <button class="sp-button sp-button--outline new-chat" type="button" tabindex="-1">${icon('plus')}New chat</button>
          <div class="manager-identity">
            <span class="manager-avatar">SC</span>
            <span class="manager-copy"><strong>Sarah Chen · Manager</strong><small>sarah.chen@moxie.com</small></span>
            <span aria-hidden="true">⌃</span>
          </div>
        </div>
      </aside>
    `;
  }

  function introFrames() {
    const roster = people
      .map(
        (person) => `
          <div class="seat">
            <span class="seat-slot">
              <span class="seat-ghost" aria-hidden="true">${icon('user', 24)}</span>
              <img class="seat-face" src="${person.image}" alt="" />
            </span>
            <span class="seat-name">${person.name}</span>
          </div>
        `,
      )
      .join('');

    const learning = people
      .map(
        (person) => `
          <div class="learn-person">
            <img src="${person.image}" alt="" />
            <span class="learn-track" aria-hidden="true"><span class="learn-fill"></span></span>
          </div>
        `,
      )
      .join('');

    const chart = people
      .map(
        (person) => `
          <div class="chart-col">
            <div class="chart-grow">
              <img src="${person.image}" alt="" />
              <span class="chart-bar"></span>
            </div>
            <span class="chart-name">${person.name}</span>
          </div>
        `,
      )
      .join('');

    return `
      <div class="intro-frame is-on" data-scene="you">
        <span class="you-mark" aria-hidden="true">SC</span>
        <p>Manager access to your own team</p>
      </div>
      <div class="intro-frame" data-scene="roster" aria-hidden="true">
        <div class="seat-row">${roster}</div>
        <p>Roster · Roles · Levels</p>
      </div>
      <div class="intro-frame" data-scene="learning" aria-hidden="true">
        <div class="learn-row">${learning}</div>
        <p class="learn-source"><img src="./assets/udemy-logo.webp" alt="" />Business</p>
      </div>
      <div class="intro-frame" data-scene="chart" aria-hidden="true">
        <div class="chart-grid" aria-hidden="true"><i></i><i></i><i></i></div>
        <div class="chart-columns">${chart}</div>
      </div>
    `;
  }

  function introSteps() {
    return stages
      .map(
        (item, index) => `
          <li class="intro-step${index === 0 ? ' is-current' : ''}">
            <i aria-hidden="true"><span class="intro-step-fill"></span></i>
            <span>${item.step}</span>
          </li>
        `,
      )
      .join('');
  }

  function renderProduct() {
    screen = 'product';
    stage = 0;
    mount(`
      <div class="product-shell">
        ${productSidebar()}
        <main class="product-main">
          <div class="product-canvas">
            <header class="product-header">
              <span class="crumb-muted">Org</span><span>${icon('chevron')}</span><span>Home</span>
              <button class="sp-button sp-button--ghost restart" data-action="restart" type="button">${icon('rotate')}Start at the invite</button>
            </header>
            <div class="intro-stage">
              <section class="intro-overlay" role="dialog" aria-modal="true" aria-labelledby="onboarding-title" data-intro>
                <div class="intro-card">
                  <p class="intro-eyebrow">Your team · your starting point</p>
                  <div class="intro-copy" role="status" aria-live="polite" aria-atomic="true">
                    <h1 id="onboarding-title" tabindex="-1">Welcome, Sarah<span class="intro-party" aria-hidden="true">🎉</span></h1>
                    <p class="intro-detail">${stages[0].detail}</p>
                  </div>
                  <div class="intro-hero">${introFrames()}</div>
                  <ol class="intro-steps">${introSteps()}</ol>
                  <div class="intro-actions">
                    <div class="intro-action-row" hidden>
                      <button class="sp-button" data-action="confirm-team" type="button">Confirm team</button>
                      <button class="sp-button sp-button--outline" data-action="request-change" type="button">Request a change</button>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    `);

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      showSettledEnd();
      return;
    }

    const firstFill = root.querySelector('.intro-step.is-current .intro-step-fill');
    if (firstFill) firstFill.style.animation = `intro-step ${stages[0].ms}ms linear both`;
    stageAt.slice(1).forEach((at, index) => {
      introTimers.push(window.setTimeout(() => setStage(index + 1), at));
    });
  }

  function setStage(next, settled = false) {
    stage = next;
    const card = root.querySelector('[data-intro]');
    if (!card) return;
    const current = stages[next];
    const title = card.querySelector('#onboarding-title');
    const detail = card.querySelector('.intro-detail');
    title.innerHTML =
      current.scene === 'you'
        ? 'Welcome, Sarah<span class="intro-party" aria-hidden="true">🎉</span>'
        : current.title;
    detail.textContent = current.detail;
    title.classList.remove('intro-enter');
    detail.classList.remove('intro-enter');
    void title.offsetWidth;
    title.classList.add('intro-enter');
    detail.classList.add('intro-enter');

    card.querySelectorAll('.intro-frame').forEach((frame) => {
      const on = frame.dataset.scene === current.scene;
      frame.classList.toggle('is-on', on);
      frame.toggleAttribute('aria-hidden', !on);
    });

    card.querySelectorAll('.intro-step').forEach((step, index) => {
      step.classList.toggle('is-current', index === next);
      step.classList.toggle('is-done', index < next);
      const fill = step.querySelector('.intro-step-fill');
      if (index < next || (index === next && settled)) {
        fill.style.animation = 'none';
        fill.style.width = '100%';
      } else if (index === next) {
        fill.style.animation = 'none';
        fill.style.width = '0%';
        void fill.offsetWidth;
        fill.style.animation = `intro-step ${current.ms}ms linear both`;
      } else {
        fill.style.animation = 'none';
        fill.style.width = '0%';
      }
    });

    card.querySelector('.intro-action-row').hidden = next !== stages.length - 1;
    setDocumentTitle();

    if (settled) return;
    if (current.scene === 'roster') revealRoster();
    if (current.scene === 'learning') revealLearning();
    if (current.scene === 'chart') growChart();
  }

  function revealRoster() {
    root.querySelectorAll('[data-scene="roster"] .seat').forEach((seat, index) => {
      introTimers.push(
        window.setTimeout(() => seat.classList.add('is-found'), (index + 1) * 380),
      );
    });
  }

  function revealLearning() {
    root.querySelectorAll('.learn-fill').forEach((fill, index) => {
      introTimers.push(
        window.setTimeout(() => {
          fill.style.width = `${people[index].learning}%`;
        }, (index + 1) * 340),
      );
    });
  }

  function growChart() {
    window.requestAnimationFrame(() => {
      root.querySelectorAll('.chart-grow').forEach((bar, index) => {
        bar.style.transitionDelay = `${index * 90}ms`;
        bar.style.height = `${people[index].learning}%`;
      });
    });
  }

  function showSettledEnd() {
    setStage(stages.length - 1, true);
    root.querySelectorAll('[data-scene="roster"] .seat').forEach((seat) => seat.classList.add('is-found'));
    root.querySelectorAll('.learn-fill').forEach((fill, index) => {
      fill.style.width = `${people[index].learning}%`;
    });
    root.querySelectorAll('.chart-grow').forEach((bar, index) => {
      bar.style.transition = 'none';
      bar.style.height = `${people[index].learning}%`;
    });
  }

  function rosterHasRequest() {
    const flagged = [...root.querySelectorAll('[data-roster-reason]')].some(
      (select) => select.value && select.value !== 'none',
    );
    const missing = root.querySelector('#roster-missing')?.value.trim().length > 0;
    return flagged || missing;
  }

  function syncRosterActions() {
    const hasRequest = rosterHasRequest();
    const note = root.querySelector('#roster-note');
    const send = root.querySelector('[data-action="roster-send"]');
    const confirm = root.querySelector('[data-action="roster-confirm"]');
    if (note) note.hidden = !hasRequest;
    if (send) send.disabled = !hasRequest;
    confirm?.classList.toggle('sp-button--outline', hasRequest);
    root.querySelectorAll('.roster-row').forEach((row) => {
      const reason = row.querySelector('[data-roster-reason]')?.value;
      row.classList.toggle('is-flagged', Boolean(reason) && reason !== 'none');
    });
  }

  function openRosterReview(trigger) {
    lastTrigger = trigger;
    const reasonOptions = changeReasons
      .map((reason) => `<option value="${reason.id}">${reason.label}</option>`)
      .join('');
    const rows = people
      .map(
        (person) => `
          <div class="roster-row">
            <img src="${person.image}" alt="" />
            <div class="roster-copy">
              <strong>${person.name}</strong>
              <span>${person.role} · ${person.level}</span>
            </div>
            <span class="roster-pending">Pending</span>
            <select data-roster-reason aria-label="Change to request for ${person.name}">
              <option value="none">No change</option>
              ${reasonOptions}
            </select>
          </div>
        `,
      )
      .join('');

    root.insertAdjacentHTML(
      'beforeend',
      `
        <div class="dialog-overlay" data-dialog-overlay>
          <div class="dialog roster-dialog" role="dialog" aria-modal="true" aria-labelledby="roster-title" aria-describedby="roster-description">
            <h2 id="roster-title">Your team</h2>
            <p id="roster-description">Your admin owns the org chart, so Helix sends changes to them rather than editing them here.</p>
            <div class="roster-list">${rows}</div>
            <div class="roster-missing">
              <label for="roster-missing">Someone is missing from this list</label>
              <textarea id="roster-missing" rows="2" placeholder="Who should be here, and what is their role?"></textarea>
              <textarea id="roster-note" rows="2" hidden placeholder="Anything your admin should know (optional)" aria-label="Anything your admin should know (optional)"></textarea>
            </div>
            <div class="dialog-actions">
              <button class="sp-button sp-button--ghost" data-action="cancel-dialog" type="button">Back</button>
              <button class="sp-button" data-action="roster-confirm" type="button">Confirm all</button>
              <button class="sp-button" data-action="roster-send" type="button" disabled>Send to admin</button>
            </div>
          </div>
        </div>
      `,
    );
    root.querySelector('.roster-dialog select')?.focus();
  }

  function closeDialog() {
    root.querySelector('[data-dialog-overlay]')?.remove();
    lastTrigger?.focus();
    lastTrigger = null;
  }

  function showToast(message) {
    root.querySelector('.toast')?.remove();
    root.insertAdjacentHTML('beforeend', `<div class="toast" role="status">${message}</div>`);
    window.setTimeout(() => root.querySelector('.toast')?.remove(), 3200);
  }

  function finishOnboarding() {
    try {
      sessionStorage.setItem(storageKey, 'done');
      sessionStorage.setItem('helix-team-intro-recovered-v1', 'seen');
    } catch {
      // The prototype still works if storage is blocked.
    }
    window.location.assign('./index.html?from=onboarding');
  }

  root.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target : event.target.parentElement;
    const action = target?.closest('[data-action]')?.dataset.action;
    if (!action) return;

    const actions = {
      'see-team': renderSignin,
      udemy: renderProduct,
      'different-email': renderSignin,
      'confirm-team': finishOnboarding,
      'request-change': () => openRosterReview(target.closest('button')),
      'roster-confirm': finishOnboarding,
      'roster-send': () => {
        if (rosterHasRequest()) finishOnboarding();
      },
      'cancel-dialog': closeDialog,
      restart: renderInvite,
      resend: () => {
        const status = root.querySelector('.signin-status');
        if (status) status.textContent = 'A new code was sent.';
      },
    };
    actions[action]?.();
  });

  root.addEventListener('input', (event) => {
    if (event.target.id !== 'signin-code') return;
    event.target.value = event.target.value.replace(/\D/g, '').slice(0, 6);
    const verifyButton = root.querySelector('[data-verify]');
    if (verifyButton) verifyButton.disabled = event.target.value.length !== 6;
  });

  root.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.target;
    if (form.dataset.form === 'email') renderCode();
    if (form.dataset.form === 'code') renderProduct();
  });

  root.addEventListener('change', (event) => {
    if (event.target.matches('[data-roster-reason]')) syncRosterActions();
  });

  root.addEventListener('input', (event) => {
    if (event.target.id === 'roster-missing' || event.target.id === 'roster-note') syncRosterActions();
  });

  root.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && root.querySelector('[data-dialog-overlay]')) closeDialog();
  });

  renderInvite();
})();
