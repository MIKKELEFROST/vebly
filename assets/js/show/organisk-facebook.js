// Organisk Facebook showcase (/services/organisk-facebook): "The week that plans itself + Messenger". A posting plan for
// Mango & Mokka (a made-up café in Odense, never a real business). When the plan comes into view the week fills
// itself with planned posts, then a clock runs from Monday morning to Sunday evening: the now-line moves down each
// day and every post it reaches flips from "Planlagt" to "Udgivet". Meanwhile customers write in Messenger: the
// questions that come again and again get an answer within a second, a hard one is handed over to Maja. The clock
// waits while a conversation runs, and while the section is out of view. Pause / Se ugen igen control the week, and
// the chips let the visitor ask as a customer. Without motion: the finished week, the chips still answer.
import { track } from '/assets/js/analytics.js';

const root = document.querySelector('.show--organisk-facebook');
if (root) {
  try { init(root); } catch (e) { root.querySelectorAll('.is-wait').forEach(p => p.classList.remove('is-wait')); throw e; }
}

function init(root) {
  const S = 'organisk-facebook';
  const $ = s => root.querySelector(s), $$ = s => [...root.querySelectorAll(s)];
  const motion = document.documentElement.classList.contains('motion');
  const plan = $('.fb-plan'), clock = $('[data-fb-clock]'), clockBox = $('.fb-clock'), msgs = $('[data-fb-msgs]'), live = $('[data-fb-live]');
  const days = $$('[data-fb-day]'), pauseB = $('[data-fb-pause]'), againB = $('[data-fb-again]'), asks = $$('[data-fb-ask]');
  const N = { pub: $('[data-fb-n="pub"]'), svar: $('[data-fb-n="svar"]'), videre: $('[data-fb-n="videre"]') };
  const seen = new Set();
  const step = n => { if (!seen.has(n)) { seen.add(n); track('showcase_step', { showcase: S, step: n }); } };
  const ev = action => track('showcase_interact', { showcase: S, action });
  const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const DAY = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];
  const pad = n => String(n).padStart(2, '0');
  // Hours from Monday 00.00 → "Tir 11.00"
  const fmt = h => { const d = Math.min(6, Math.floor(h / 24)), m = Math.min(1439, Math.round((h - d * 24) * 60)); return `${DAY[d]} ${pad(Math.floor(m / 60))}.${pad(m % 60)}`; };
  const posts = $$('[data-fb-post]').map(el => ({ el, at: days.indexOf(el.closest('[data-fb-day]')) * 24 + +el.dataset.h }));
  const END = 6 * 24 + 21;

  // The week's conversations (names, prices and times are examples). at: hours from Monday 00.00
  const BOLT = '<svg><use href="#fb-i-bolt"/></svg>';
  const WEEK = [
    { at: 19.7, n: 'Line', h: 150, q: 'Har I åbent i weekenden?', a: 'Ja! Lørdag og søndag fra kl. 9 til 16. Brunchen serveres til kl. 13.' },
    { at: 63.4, n: 'Jonas', h: 24, ctx: 'Kommentar på onsdagens opslag', q: 'JA', a: 'Hej Jonas! Ugens tilbud: 2 kaffe og 2 kanelsnegle for 89 kr. Vis beskeden ved disken.' },
    { at: 93.1, n: 'Sara', h: 280, q: 'Hvad koster en smoothie?', a: 'En smoothie koster 52 kr., og en stor koster 64 kr. Ugens smoothie er mango.' },
    { at: 114.5, n: 'Peter', h: 200, q: 'Kan jeg booke bord til 6 på lørdag?', a: 'Ja! Hvilken tid passer?', chips: ['10.00', '11.30', '13.00'], pick: 1, a2: 'Bordet er booket: 6 personer, lørdag kl. 11.30. Vi glæder os!' },
    { at: 142.2, n: 'Mette', h: 330, q: 'Kan I lave en lagkage uden gluten til 30 personer?', a: 'Godt spørgsmål. Det giver jeg videre til et menneske.', hand: 'Sendt videre til Maja. Hun svarer i morgen.' },
    { at: 153.1, n: 'Mette', human: 'Hej Mette! Det kan vi godt. Jeg ringer til dig i dag, så finder vi en dato.' }
  ];
  // The visitor's own questions
  const ASK = {
    tider: { q: 'Hvornår har I åbent?', a: 'Hverdage fra kl. 7 til 18 og weekender fra kl. 9 til 16.' },
    pris: { q: 'Hvad koster en kaffe?', a: 'En kaffe koster 38 kr., og en smoothie koster 52 kr.' },
    book: { q: 'Kan jeg booke et bord?', a: 'Ja! I morgen er der ledige borde kl. 10.00, 11.30 og 13.00.' },
    andet: { q: 'Kan vi leje caféen til en fødselsdag?', a: 'Godt spørgsmål. Det giver jeg videre til et menneske.', hand: 'Sendt videre til Maja. Hun svarer, så snart hun kan.' }
  };

  let token = 0, H = END, paused = false, visible = false, started = false, lock = Promise.resolve();
  const count = { pub: 7, svar: 4, videre: 1 };
  const setN = (k, v) => {
    count[k] = v; N[k].textContent = v;
    if (motion && v) { N[k].classList.remove('is-bump'); void N[k].offsetWidth; N[k].classList.add('is-bump'); }
  };
  const sleep = ms => new Promise(r => setTimeout(r, motion ? ms : 0));
  const stopped = () => paused || !visible;

  /* ---------------- The chat ---------------- */
  const gap = () => parseFloat(getComputedStyle(msgs).rowGap) || 0;
  const add = (cls, html) => {
    const e = msgs.querySelector('.fb-empty');
    if (e && cls !== 'fb-empty') e.remove();
    const li = document.createElement('li'), old = [...msgs.children];
    li.className = cls; li.innerHTML = html;
    msgs.append(li);
    while (msgs.children.length > 18) msgs.firstElementChild.remove();
    if (motion) {
      const dy = li.offsetHeight + gap();
      old.forEach(o => o.animate && o.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.2,.8,.2,1)' }));
      li.classList.add('is-pop');
    }
    return li;
  };
  const av = c => c.you ? '<i class="fb-av fb-av--you">D</i>' : `<i class="fb-av" style="--h:${c.h}">${c.n[0]}</i>`;
  const answer = async (text, alive) => {
    let li = null;
    if (motion) { li = add('fb-m fb-m--out fb-typing', '<p><i></i><i></i><i></i></p>'); await sleep(650); if (!alive()) return; }
    if (li) { li.className = 'fb-m fb-m--out'; li.innerHTML = `<p>${esc(text)}</p>`; } else add('fb-m fb-m--out', `<p>${esc(text)}</p>`);
    add('fb-meta', `${BOLT}Automatisk svar · ${motion ? '0,9' : '1'} sek.`);
  };
  // One conversation. alive() turns false when the week starts over
  const talk = async (c, when, alive) => {
    if (c.human) {
      add('fb-dv', `<b>Maja</b> svarer · ${when}`);
      await sleep(300); if (!alive()) return;
      add('fb-m fb-m--out fb-m--human', `<p>${esc(c.human)}</p>`);
      add('fb-meta', 'Maja · Mango &amp; Mokka');
      await sleep(900);
      return;
    }
    add('fb-dv', `<b>${c.you ? 'Dig' : c.n}</b> · ${when}`);
    if (c.ctx) add('fb-ctx', c.ctx);
    await sleep(250); if (!alive()) return;
    add('fb-m fb-m--in', `${av(c)}<p>${esc(c.q)}</p>`);
    await sleep(350); if (!alive()) return;
    await answer(c.a, alive); if (!alive()) return;
    if (c.chips) {
      const ch = add('fb-chips', c.chips.map(x => `<i>${x}</i>`).join(''));
      await sleep(1100); if (!alive()) return;
      ch.children[c.pick].classList.add('is-on');
      await sleep(450); if (!alive()) return;
      add('fb-m fb-m--in', `${av(c)}<p>${c.chips[c.pick]}</p>`);
      await sleep(300); if (!alive()) return;
      await answer(c.a2, alive); if (!alive()) return;
    }
    if (c.hand) { await sleep(450); if (!alive()) return; add('fb-hand', `<svg><use href="#fb-i-person"/></svg>${esc(c.hand)}`); setN('videre', count.videre + 1); }
    else setN('svar', count.svar + 1);
    await sleep(700);
  };
  // Conversations take turns, so two never mix
  const queue = fn => (lock = lock.then(fn, fn));

  /* ---------------- The clock and the plan ---------------- */
  const publish = p => {
    p.el.classList.add('is-pub');
    setN('pub', count.pub + 1);
    if (motion) { p.el.classList.remove('is-flash'); void p.el.offsetWidth; p.el.classList.add('is-flash'); }
    step(2);
  };
  const setH = h => {
    H = h;
    clock.textContent = fmt(h);
    const d = Math.min(6, Math.floor(h / 24)), hd = h - d * 24;
    days.forEach((el, i) => el.classList.toggle('is-today', i === d));
    const bd = days[d].lastElementChild;
    days[d].classList.toggle('is-night', hd < 6 || hd > 22);
    bd.style.setProperty('--ny', (Math.max(0, Math.min(16, hd - 6)) / 16 * bd.offsetHeight).toFixed(1) + 'px');
    posts.forEach(p => { if (p.at <= h && !p.el.classList.contains('is-pub')) publish(p); });
  };
  // Wait ms, or move the clock to h1: both stand still while paused or out of view
  const tick = (ms, fn, t) => new Promise(res => {
    let el = 0, last = performance.now();
    const f = now => {
      if (t !== token) return res(false);
      if (!stopped()) el += Math.min(now - last, 100);
      last = now;
      const k = Math.min(1, el / ms);
      if (fn) fn(k);
      if (k < 1) requestAnimationFrame(f); else res(true);
    };
    requestAnimationFrame(f);
  });
  const tween = (h1, t) => { const h0 = H; return tick(Math.max(350, (h1 - h0) * 50), k => setH(h0 + (h1 - h0) * (k < .5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2)), t); };

  const prepare = () => {
    posts.forEach(p => p.el.classList.remove('is-pub', 'is-flash'));
    if (motion) posts.forEach(p => p.el.classList.add('is-wait'));
    for (const k in count) setN(k, 0);
    msgs.textContent = '';
    msgs.innerHTML = '<li class="fb-empty"><i><svg><use href="#fb-i-cmt"/></svg></i>Beskederne lander her.<br>Svarene går ud med det samme.</li>';
    days.forEach(el => el.classList.remove('is-today', 'is-night'));
    H = 6;
    clock.textContent = 'Man 06.00';
  };
  const run = async () => {
    const t = ++token, alive = () => t === token;
    prepare();
    clockBox.classList.add('is-run');
    pauseB.hidden = false;
    setPaused(false);
    clock.textContent = 'Planlægger';
    posts.forEach((p, i) => setTimeout(() => { if (alive()) p.el.classList.remove('is-wait'); }, 250 + i * 150));
    if (!await tick(250 + posts.length * 150 + 800, null, t)) return;
    setH(6);
    for (const c of WEEK) {
      if (!await tween(c.at, t)) return;
      await queue(() => talk(c, fmt(c.at), alive));
      if (!alive()) return;
    }
    if (!await tween(END, t)) return;
    clockBox.classList.remove('is-run');
    pauseB.hidden = true;
    step(3);
  };

  /* ---------------- Controls ---------------- */
  const setPaused = v => {
    paused = v;
    pauseB.setAttribute('aria-pressed', String(v));
    pauseB.innerHTML = v ? '<svg><use href="#fb-i-play"/></svg><span>Fortsæt</span>' : '<svg><use href="#fb-i-pause"/></svg><span>Pause</span>';
    clockBox.classList.toggle('is-run', !v);
  };
  pauseB.addEventListener('click', () => { ev(paused ? 'fortsaet' : 'pause'); setPaused(!paused); });
  againB.addEventListener('click', () => { ev('se-igen'); started = true; run(); });
  let busy = false;
  asks.forEach(b => b.addEventListener('click', () => {
    if (busy) return;
    const k = b.dataset.fbAsk, c = { ...ASK[k], you: true };
    ev('spoerg-' + k);
    busy = true;
    asks.forEach(x => x.setAttribute('aria-disabled', 'true'));
    queue(async () => {
      await talk(c, started && H < END ? fmt(H) : 'nu', () => true);
      live.textContent = `Du spurgte: ${c.q} Svar: ${c.a}${c.hand ? ' ' + c.hand : ''}`;
      busy = false;
      asks.forEach(x => x.removeAttribute('aria-disabled'));
    });
  }));

  if (!motion) {
    const io0 = 'IntersectionObserver' in window && new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { step(1); io0.disconnect(); } }, { threshold: .3 });
    if (io0) io0.observe(plan);
    return;
  }
  againB.hidden = false;
  prepare();
  if (!('IntersectionObserver' in window)) { visible = true; started = true; step(1); run(); return; }
  // Starts when a third of the plan shows; the week only runs while some of it is on screen
  new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting && e.intersectionRatio >= .3 && !started) { started = true; visible = true; step(1); run(); }
  }), { threshold: [0, .3] }).observe(plan);
  new IntersectionObserver(es => es.forEach(e => { visible = e.isIntersecting; }), { threshold: 0 }).observe($('.fb'));
}
