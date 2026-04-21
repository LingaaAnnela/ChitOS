import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [],
  styles: [`
    :host { display: block; }

    /* ── KEYFRAMES ── */
    @keyframes scroll { from { transform: translateX(0) } to { transform: translateX(-50%) } }
    @keyframes blink  { 0%,100% { opacity:1 } 50% { opacity:0.2 } }

    /* ── NAV ── */
    .nav {
      background: var(--card); border-bottom: 0.5px solid var(--b2);
      padding: 0 16px; height: 52px;
      display: flex; align-items: center; justify-content: space-between;
      position: sticky; top: 0; z-index: 100;
    }
    @media (min-width: 768px) { .nav { padding: 0 40px; height: 56px; } }
    .nav-logo { font-family: var(--font-serif); font-size: 18px; font-weight: 300;
                color: var(--t1); letter-spacing: -0.3px;
                display: flex; align-items: center; gap: 8px; text-decoration: none; }
    @media (min-width: 768px) { .nav-logo { font-size: 20px; } }
    .nav-logo-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--green); }
    @media (min-width: 768px) { .nav-logo-dot { width: 8px; height: 8px; } }
    .nav-logo em { font-style: normal; color: var(--green); }
    .nav-links { display: none; gap: 28px; }
    @media (min-width: 768px) { .nav-links { display: flex; } }
    .nav-links a { font-size: 13px; color: var(--t2); text-decoration: none; transition: color 0.15s; cursor: pointer; }
    .nav-links a:hover { color: var(--t1); }
    .nav-r { display: none; gap: 8px; align-items: center; }
    @media (min-width: 768px) { .nav-r { display: flex; } }
    .btn-ghost { font-size: 13px; padding: 7px 16px; border-radius: var(--rs);
                 border: 0.5px solid var(--b2); background: none; color: var(--t1);
                 cursor: pointer; font-family: var(--font-sans); transition: background 0.15s; }
    .btn-ghost:hover { background: var(--warm2); }
    .btn-cta { font-size: 13px; padding: 8px 18px; border-radius: var(--rs);
               border: none; background: var(--green); color: #fff;
               cursor: pointer; font-family: var(--font-sans); font-weight: 500; }
    .btn-cta:hover { opacity: 0.88; }
    .nav-cta-mobile { display: block; font-size: 12px; padding: 7px 14px;
                      border-radius: var(--rs); background: var(--t1); color: #fff;
                      border: none; font-family: var(--font-sans); font-weight: 500; cursor: pointer; }
    @media (min-width: 768px) { .nav-cta-mobile { display: none; } }

    /* ── HERO ── */
    .hero { padding: 40px 16px 32px; }
    @media (min-width: 1024px) {
      .hero { display: grid; grid-template-columns: 1fr 420px; gap: 48px;
              max-width: 1100px; margin: 0 auto; padding: 80px 40px 64px;
              align-items: center; }
    }
    .hero-eyebrow { display: inline-flex; align-items: center; gap: 7px;
                    background: var(--gbg); border: 0.5px solid var(--gb);
                    border-radius: 100px; padding: 5px 14px 5px 8px; margin-bottom: 20px;
                    font-size: 12px; color: var(--green); font-weight: 500; }
    .eyebrow-dot { width: 6px; height: 6px; border-radius: 50%;
                   background: var(--green); animation: blink 1.8s ease-in-out infinite; }
    .hero-h1 { font-family: var(--font-serif); font-size: 40px; font-weight: 300;
               line-height: 1.08; letter-spacing: -1.5px; margin-bottom: 16px; color: var(--t1); }
    @media (min-width: 1024px) { .hero-h1 { font-size: 54px; letter-spacing: -2px; margin-bottom: 20px; } }
    .hero-h1 .pill { display: inline-block; background: var(--saffron); color: #fff;
                     padding: 2px 16px 6px; border-radius: 100px;
                     font-style: normal; letter-spacing: -1px; line-height: 1.1; }
    .hero-sub { font-size: 15px; color: var(--t2); line-height: 1.7; margin-bottom: 28px;
                font-weight: 300; }
    @media (min-width: 1024px) { .hero-sub { font-size: 17px; margin-bottom: 32px; max-width: 440px; } }
    .hero-btns { display: flex; flex-direction: column; gap: 8px; margin-bottom: 28px; }
    @media (min-width: 480px) { .hero-btns { flex-direction: row; } }
    @media (min-width: 1024px) { .hero-btns { margin-bottom: 36px; } }
    .btn-hero { font-size: 15px; padding: 13px 28px; border-radius: var(--rs);
                font-family: var(--font-sans); cursor: pointer; font-weight: 500;
                transition: all 0.15s; width: 100%; }
    @media (min-width: 480px) { .btn-hero { width: auto; } }
    .btn-hero-p { background: var(--t1); color: #fff; border: none; }
    .btn-hero-p:hover { opacity: 0.85; transform: translateY(-1px); }
    .btn-hero-o { background: none; color: var(--t1); border: 0.5px solid var(--b2); }
    .btn-hero-o:hover { background: var(--warm2); }
    .lang-chips { display: flex; gap: 7px; flex-wrap: wrap; }
    .lang-chip { font-size: 13px; padding: 5px 13px; border-radius: 100px;
                 border: 0.5px solid var(--b2); color: var(--t2); background: var(--card);
                 transition: all 0.15s; }
    .lang-chip:hover { border-color: var(--green); color: var(--green); background: var(--gbg); }

    /* Hero desktop mockup */
    .hero-mockup { display: none; }
    @media (min-width: 1024px) { .hero-mockup { display: block; } }
    .hc { background: var(--card); border: 0.5px solid var(--b2); border-radius: var(--r); overflow: hidden; }
    .hc-top { background: var(--warm2); padding: 10px 14px; border-bottom: 0.5px solid var(--b);
              display: flex; align-items: center; gap: 6px; }
    .hc-dot { width: 9px; height: 9px; border-radius: 50%; }
    .hc-url { font-size: 10px; color: var(--t3); background: var(--card); border-radius: 4px;
              padding: 2px 10px; margin-left: 6px; font-family: var(--font-mono); }
    .hc-body { padding: 16px; }
    .hc-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .hc-title { font-family: var(--font-serif); font-size: 17px; font-weight: 300; }
    .hc-badge { font-size: 10px; font-weight: 500; padding: 3px 9px; border-radius: 100px;
                background: var(--gbg); color: #15803D; border: 0.5px solid var(--gb); }
    .hc-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; margin-bottom: 14px; }
    .hcs { background: var(--warm2); border-radius: var(--rs); padding: 10px; }
    .hcs-v { font-family: var(--font-serif); font-size: 20px; font-weight: 300; color: var(--t1); }
    .hcs-v.g { color: var(--green); }
    .hcs-v.r { color: var(--red); }
    .hcs-l { font-size: 10px; color: var(--t3); margin-top: 1px; }
    .hc-group { background: var(--warm2); border-radius: var(--rs); padding: 10px 12px; margin-bottom: 6px; }
    .hcg-top { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
    .hcg-ind { width: 3px; height: 28px; border-radius: 2px; flex-shrink: 0; }
    .hcg-name { font-size: 12px; font-weight: 500; color: var(--t1); }
    .hcg-meta { font-size: 10px; color: var(--t3); }
    .hcg-tag { margin-left: auto; font-size: 10px; padding: 2px 7px; border-radius: 100px; }
    .hcg-prog { height: 3px; background: rgba(0,0,0,0.08); border-radius: 2px; overflow: hidden; }
    .hcg-fill { height: 100%; border-radius: 2px; }

    /* Hero mobile preview card */
    .hero-mobile-preview { padding: 0 0 24px; }
    @media (min-width: 1024px) { .hero-mobile-preview { display: none; } }
    .mpc { background: var(--card); border: 0.5px solid var(--b2); border-radius: var(--r); overflow: hidden; }
    .mpc-top { background: var(--warm2); padding: 8px 12px; border-bottom: 0.5px solid var(--b);
               display: flex; align-items: center; gap: 5px; }
    .mpc-dot { width: 7px; height: 7px; border-radius: 50%; }
    .mpc-url { font-size: 9px; color: var(--t3); font-family: var(--font-mono); margin-left: 5px; }
    .mpc-body { padding: 12px; }
    .mpc-greet { font-size: 10px; color: var(--t3); }
    .mpc-name  { font-family: var(--font-serif); font-size: 16px; font-weight: 300; margin-bottom: 10px; }
    .mpc-pot   { background: var(--saffron); border-radius: var(--rs); padding: 12px; margin-bottom: 8px;
                 position: relative; overflow: hidden; }
    .mpc-pot::after { content:''; position:absolute; top:-15px; right:-15px; width:60px; height:60px;
                      border-radius:50%; background:rgba(255,255,255,0.12); }
    .mpc-pot-lbl { font-size: 9px; color: rgba(255,255,255,0.7); font-weight: 500;
                   text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 3px; }
    .mpc-pot-val { font-family: var(--font-serif); font-size: 24px; font-weight: 300;
                   color: #fff; letter-spacing: -0.5px; }
    .mpc-pot-sub { font-size: 10px; color: rgba(255,255,255,0.65); }
    .mpc-groups { display: flex; flex-direction: column; gap: 5px; }
    .mpc-group { background: var(--warm2); border-radius: var(--rs); padding: 8px 10px;
                 display: flex; align-items: center; gap: 7px; }
    .mpg-ind  { width: 3px; height: 26px; border-radius: 2px; flex-shrink: 0; }
    .mpg-info { flex: 1; }
    .mpg-name { font-size: 11px; font-weight: 500; }
    .mpg-meta { font-size: 9px; color: var(--t3); }
    .mpg-amt  { font-size: 12px; font-weight: 500; }

    /* ── TICKER ── */
    .ticker-wrap { background: var(--green); overflow: hidden; padding: 12px 0; }
    .ticker-inner { display: flex; animation: scroll 20s linear infinite; white-space: nowrap; }
    .ticker-item { font-size: 13px; font-weight: 500; color: #fff;
                   display: inline-flex; align-items: center; gap: 16px; padding: 0 24px; }
    .ticker-sep { opacity: 0.4; font-size: 18px; }

    /* ── SOCIAL PROOF ── */
    .proof { background: var(--warm2); border-top: 0.5px solid var(--b);
             border-bottom: 0.5px solid var(--b); padding: 24px 16px; }
    @media (min-width: 768px) { .proof { padding: 48px 40px; } }
    .proof-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    @media (min-width: 768px) {
      .proof-inner { display: flex; gap: 40px; align-items: center;
                     justify-content: space-between; max-width: 1100px; margin: 0 auto; }
    }
    .proof-stat { text-align: center; }
    .ps-val { font-family: var(--font-serif); font-size: 28px; font-weight: 300;
              color: var(--t1); letter-spacing: -1px; }
    @media (min-width: 768px) { .ps-val { font-size: 36px; } }
    .ps-lbl { font-size: 12px; color: var(--t3); margin-top: 2px; }
    @media (min-width: 768px) { .ps-lbl { font-size: 13px; } }
    .proof-divider { display: none; }
    @media (min-width: 768px) { .proof-divider { display: block; width: 1px; height: 48px; background: var(--b2); } }

    /* ── SECTION SHARED ── */
    .section-wrap { padding: 48px 16px; }
    @media (min-width: 768px) { .section-wrap { padding: 80px 40px; max-width: 1100px; margin: 0 auto; } }
    .eyebrow-row { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; }
    .eyebrow-row.center { justify-content: center; }
    .eyebrow-line { width: 24px; height: 1px; background: var(--green); }
    .eyebrow-text { font-size: 11px; color: var(--green); font-weight: 500;
                    letter-spacing: 1px; text-transform: uppercase; font-family: var(--font-mono); }
    .section-h2 { font-family: var(--font-serif); font-size: 30px; font-weight: 300;
                  letter-spacing: -1px; line-height: 1.1; margin-bottom: 10px; color: var(--t1); }
    @media (min-width: 768px) { .section-h2 { font-size: 40px; letter-spacing: -1.5px; } }
    .section-h2 em { font-style: italic; }
    .section-sub { font-size: 14px; color: var(--t2); line-height: 1.7; font-weight: 300;
                   margin-bottom: 40px; }
    @media (min-width: 768px) { .section-sub { font-size: 15px; margin-bottom: 48px; max-width: 480px; } }

    /* ── FEATURES GRID ── */
    .feat-grid { display: grid; grid-template-columns: 1fr;
                 border: 0.5px solid var(--b); border-radius: var(--r); overflow: hidden; }
    @media (min-width: 768px)  { .feat-grid { grid-template-columns: repeat(2,1fr); } }
    @media (min-width: 1024px) { .feat-grid { grid-template-columns: repeat(3,1fr); } }
    .feat-cell { padding: 20px; border-right: 0.5px solid var(--b);
                 border-bottom: 0.5px solid var(--b); transition: background 0.15s; }
    @media (min-width: 1024px) {
      .feat-cell:nth-child(3n)   { border-right: none; }
      .feat-cell:nth-child(n+4)  { border-bottom: none; }
    }
    @media (min-width: 768px) and (max-width: 1023px) {
      .feat-cell:nth-child(2n)  { border-right: none; }
      .feat-cell:nth-child(n+5) { border-bottom: none; }
      .feat-cell:last-child     { border-right: none; border-bottom: none; }
    }
    @media (max-width: 767px) {
      .feat-cell { border-right: none; }
      .feat-cell:last-child { border-bottom: none; }
    }
    .feat-cell:hover { background: var(--warm2); }
    .feat-num  { font-size: 10px; color: var(--t3); font-weight: 500;
                 font-family: var(--font-mono); margin-bottom: 14px; }
    .feat-icon { width: 36px; height: 36px; border-radius: var(--rs);
                 display: flex; align-items: center; justify-content: center; margin-bottom: 12px; }
    .feat-icon svg { width: 18px; height: 18px; fill: none; stroke-width: 1.5;
                     stroke-linecap: round; stroke-linejoin: round; }
    .fi-g { background: var(--gbg); }  .fi-g svg { stroke: var(--green); }
    .fi-b { background: var(--bbg); }  .fi-b svg { stroke: var(--blue); }
    .fi-a { background: var(--abg); }  .fi-a svg { stroke: var(--amber); }
    .fi-s { background: var(--sfbg); } .fi-s svg { stroke: var(--saffron); }
    .feat-cell h3 { font-size: 15px; font-weight: 500; color: var(--t1); margin-bottom: 7px; }
    .feat-cell p  { font-size: 13px; color: var(--t2); line-height: 1.6; font-weight: 300; }

    /* ── HOW IT WORKS ── */
    .how-section { background: var(--warm2); border-top: 0.5px solid var(--b);
                   border-bottom: 0.5px solid var(--b); padding: 48px 16px; }
    @media (min-width: 768px) { .how-section { padding: 80px 40px; } }
    .how-inner { max-width: 1100px; margin: 0 auto; }
    .steps-grid { display: grid; grid-template-columns: 1fr;
                  border: 0.5px solid var(--b); border-radius: var(--r);
                  overflow: hidden; background: var(--card); margin-top: 32px; }
    @media (min-width: 768px)  { .steps-grid { grid-template-columns: repeat(2,1fr); } }
    @media (min-width: 1024px) { .steps-grid { grid-template-columns: repeat(4,1fr); } }
    .step-box { padding: 20px; border-right: 0.5px solid var(--b);
                border-bottom: 0.5px solid var(--b); transition: background 0.15s; }
    @media (min-width: 1024px) {
      .step-box:last-child { border-right: none; }
      .step-box:nth-child(n+1) { border-bottom: none; }
    }
    @media (min-width: 768px) and (max-width: 1023px) {
      .step-box:nth-child(2n)   { border-right: none; }
      .step-box:nth-child(n+3)  { border-bottom: none; }
    }
    @media (max-width: 767px) {
      .step-box { border-right: none; }
      .step-box:last-child { border-bottom: none; }
    }
    .step-box:hover { background: var(--warm2); }
    .step-n { font-size: 10px; color: var(--t3); font-weight: 500;
              font-family: var(--font-mono); margin-bottom: 14px; }
    .step-icon-ring { width: 32px; height: 32px; border-radius: 50%;
                      border: 0.5px solid var(--gb); background: var(--gbg);
                      display: flex; align-items: center; justify-content: center; margin-bottom: 12px; }
    .step-icon-ring svg { width: 15px; height: 15px; stroke: var(--green); fill: none;
                          stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
    .step-box h4 { font-size: 14px; font-weight: 500; color: var(--t1); margin-bottom: 6px; }
    .step-box p  { font-size: 12px; color: var(--t2); line-height: 1.6; font-weight: 300; }

    /* ── LANGUAGES ── */
    .langs-section { padding: 48px 16px; }
    @media (min-width: 768px) { .langs-section { padding: 80px 40px; max-width: 1100px; margin: 0 auto; } }
    .langs-grid { display: grid; grid-template-columns: 1fr; gap: 32px; }
    @media (min-width: 1024px) { .langs-grid { grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; } }
    .lang-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .lang-card { background: var(--card); border: 0.5px solid var(--b);
                 border-radius: var(--r); padding: 14px; transition: all 0.2s; }
    @media (min-width: 768px) { .lang-card { padding: 16px; } }
    .lang-card:hover { border-color: var(--gb); background: var(--gbg); }
    .lang-card-wide { display: flex; gap: 16px; align-items: center; }
    .lang-card-wide .lc-right { flex: 1; border-left: 0.5px solid var(--b); padding-left: 16px; }
    .lc-script { font-size: 20px; color: var(--t1); margin-bottom: 4px; }
    @media (min-width: 768px) { .lc-script { font-size: 22px; } }
    .lc-name   { font-size: 12px; font-weight: 500; color: var(--t1); }
    .lc-region { font-size: 11px; color: var(--t3); }
    .lc-sample { font-size: 11px; color: var(--t2); margin-top: 6px; font-style: italic; line-height: 1.4; }
    .langs-mono { font-size: 13px; color: var(--t3); font-family: var(--font-mono); margin-top: 20px; }

    /* ── PRICING ── */
    .pricing-section { background: var(--warm2); border-top: 0.5px solid var(--b);
                       padding: 48px 16px; }
    @media (min-width: 768px) { .pricing-section { padding: 80px 40px; } }
    .pricing-inner { max-width: 1100px; margin: 0 auto; }
    .pricing-header { text-align: center; margin-bottom: 40px; }
    @media (min-width: 768px) { .pricing-header { margin-bottom: 48px; } }
    .plans-row { display: grid; grid-template-columns: 1fr; gap: 14px; }
    @media (min-width: 768px) { .plans-row { grid-template-columns: repeat(3,1fr); } }
    .plan { background: var(--card); border: 0.5px solid var(--b);
            border-radius: var(--r); padding: 24px; }
    .plan:hover { border-color: var(--b2); }
    .plan.featured { border: 1.5px solid var(--green); }
    .plan-featured-badge { font-size: 10px; font-weight: 500; padding: 3px 10px;
                           border-radius: 100px; background: var(--green); color: #fff;
                           display: inline-block; margin-bottom: 12px; font-family: var(--font-mono); }
    .plan-name { font-family: var(--font-serif); font-size: 22px; font-weight: 300; margin-bottom: 4px; }
    .plan-desc { font-size: 12px; color: var(--t3); margin-bottom: 20px; font-weight: 300; }
    .plan-price { margin-bottom: 20px; padding-bottom: 20px; border-bottom: 0.5px solid var(--b); }
    .plan-amt { font-family: var(--font-serif); font-size: 38px; font-weight: 300;
                letter-spacing: -1px; color: var(--t1); }
    .plan-per { font-size: 13px; color: var(--t3); }
    .plan-feats { list-style: none; margin-bottom: 24px; display: flex; flex-direction: column; gap: 9px; }
    .plan-feats li { font-size: 13px; color: var(--t2); display: flex; gap: 8px;
                     align-items: flex-start; font-weight: 300; }
    .pf-check svg { width: 14px; height: 14px; stroke: var(--green); fill: none;
                    stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;
                    margin-top: 1px; flex-shrink: 0; }
    .btn-plan-p { width: 100%; background: var(--t1); color: #fff; border: none;
                  border-radius: var(--rs); padding: 11px; font-size: 13px;
                  font-family: var(--font-sans); font-weight: 500; cursor: pointer; }
    .btn-plan-p:hover { opacity: 0.85; }
    .btn-plan-o { width: 100%; background: none; color: var(--t1);
                  border: 0.5px solid var(--b2); border-radius: var(--rs); padding: 11px;
                  font-size: 13px; font-family: var(--font-sans); cursor: pointer; }
    .btn-plan-o:hover { background: var(--warm); }

    /* ── TESTIMONIALS ── */
    .testi-section { padding: 48px 16px; }
    @media (min-width: 768px) { .testi-section { padding: 80px 40px; max-width: 1100px; margin: 0 auto; } }
    .testi-header { text-align: center; margin-bottom: 36px; }
    @media (min-width: 768px) { .testi-header { margin-bottom: 40px; } }
    .testi-grid { display: grid; grid-template-columns: 1fr; gap: 14px; }
    @media (min-width: 768px) { .testi-grid { grid-template-columns: repeat(3,1fr); } }
    .testi-card { background: var(--card); border: 0.5px solid var(--b);
                  border-radius: var(--r); padding: 20px; }
    .testi-quote { font-family: var(--font-serif); font-size: 16px; font-weight: 300;
                   font-style: italic; color: var(--t1); line-height: 1.6; margin-bottom: 16px; }
    .testi-by   { display: flex; align-items: center; gap: 10px; }
    .testi-av   { width: 34px; height: 34px; border-radius: 50%;
                  display: flex; align-items: center; justify-content: center;
                  font-size: 11px; font-weight: 500; flex-shrink: 0; }
    .testi-name { font-size: 13px; font-weight: 500; color: var(--t1); }
    .testi-role { font-size: 11px; color: var(--t3); }

    /* ── CTA BAND ── */
    .cta-band { background: var(--t1); padding: 64px 16px; text-align: center; }
    @media (min-width: 768px) { .cta-band { padding: 80px 40px; } }
    .cta-h { font-family: var(--font-serif); font-size: 38px; font-weight: 300;
             color: #fff; line-height: 1.05; letter-spacing: -1.5px; margin-bottom: 14px; }
    @media (min-width: 768px) { .cta-h { font-size: 48px; } }
    .cta-h em { font-style: italic; color: var(--green); }
    .cta-sub { font-size: 14px; color: rgba(255,255,255,0.55); margin-bottom: 32px; font-weight: 300; }
    @media (min-width: 768px) { .cta-sub { font-size: 15px; } }
    .btn-cta-white { font-size: 15px; padding: 14px 36px; border-radius: var(--rs); border: none;
                     background: #fff; color: var(--t1); cursor: pointer;
                     font-family: var(--font-sans); font-weight: 500; width: 100%; }
    @media (min-width: 480px) { .btn-cta-white { width: auto; font-size: 16px; } }
    .btn-cta-white:hover { opacity: 0.9; }

    /* ── FOOTER ── */
    .footer { border-top: 0.5px solid var(--b); padding: 20px 16px;
              display: flex; flex-direction: column; align-items: center;
              gap: 12px; background: var(--card); text-align: center; }
    @media (min-width: 768px) {
      .footer { flex-direction: row; justify-content: space-between;
                padding: 24px 40px; text-align: left; }
    }
    .footer-logo { font-family: var(--font-serif); font-size: 17px; font-weight: 300; color: var(--t1); }
    .footer-logo em { font-style: normal; color: var(--green); }
    .footer-links { display: flex; gap: 16px; flex-wrap: wrap; justify-content: center; }
    @media (min-width: 768px) { .footer-links { gap: 20px; } }
    .footer-links a { font-size: 12px; color: var(--t3); text-decoration: none; }
    .footer-links a:hover { color: var(--t2); }
    .footer-copy { font-size: 11px; color: var(--t3); font-family: var(--font-mono); }
  `],
  template: `
    <!-- NAVBAR -->
    <nav class="nav">
      <a class="nav-logo"><div class="nav-logo-dot"></div>Chit<em>OS</em></a>
      <div class="nav-links">
        <a (click)="scrollToSection('features-section')">Features</a>
        <a (click)="scrollToSection('how-it-works')">How it works</a>
        <a (click)="scrollToSection('languages-section')">Languages</a>
        <a (click)="scrollToSection('pricing-section')">Pricing</a>
      </div>
      <div class="nav-r">
        <button class="btn-ghost" (click)="goToAuth()">Log in</button>
        <button class="btn-cta"   (click)="goToAuth()">Start free ↗</button>
      </div>
      <button class="nav-cta-mobile" (click)="goToAuth()">Start free</button>
    </nav>

    <!-- HERO -->
    <section class="hero">
      <div>
        <div class="hero-eyebrow"><div class="eyebrow-dot"></div>Now in early access · chitos.app</div>
        <h1 class="hero-h1">Run your chit<br>circle <span class="pill">your way.</span></h1>
        <p class="hero-sub">The self-serve platform for friend groups, families, and offices across India — transparent, fair, and in your own language.</p>
        <div class="hero-btns">
          <button class="btn-hero btn-hero-p" (click)="goToAuth()">Create your group</button>
          <button class="btn-hero btn-hero-o" (click)="scrollToSection('how-it-works')">See how it works</button>
        </div>
        <div class="lang-chips">
          <div class="lang-chip">తెలుగు</div>
          <div class="lang-chip">हिन्दी</div>
          <div class="lang-chip">தமிழ்</div>
          <div class="lang-chip">ಕನ್ನಡ</div>
          <div class="lang-chip">മലയാളം</div>
          <div class="lang-chip">English</div>
        </div>
        <!-- Mobile preview card (below text on small screens) -->
        <div class="hero-mobile-preview" style="margin-top: 28px;">
          <div class="mpc">
            <div class="mpc-top">
              <div class="mpc-dot" style="background:#FF5F57;"></div>
              <div class="mpc-dot" style="background:#FFBD2E;"></div>
              <div class="mpc-dot" style="background:#28CA41;"></div>
              <div class="mpc-url">app.chitos.app</div>
            </div>
            <div class="mpc-body">
              <div class="mpc-greet">Good morning,</div>
              <div class="mpc-name">Ravi Kumar</div>
              <div class="mpc-pot">
                <div class="mpc-pot-lbl">Total pot value</div>
                <div class="mpc-pot-val">₹1,20,000</div>
                <div class="mpc-pot-sub">Across 3 active groups</div>
              </div>
              <div class="mpc-groups">
                <div class="mpc-group">
                  <div class="mpg-ind" style="background:var(--green);"></div>
                  <div class="mpg-info">
                    <div class="mpg-name">Friends Circle</div>
                    <div class="mpg-meta">Month 4 · Auction open</div>
                  </div>
                  <div class="mpg-amt" style="color:var(--green);">₹10K</div>
                </div>
                <div class="mpc-group">
                  <div class="mpg-ind" style="background:var(--amber);"></div>
                  <div class="mpg-info">
                    <div class="mpg-name">Office Gang</div>
                    <div class="mpg-meta">Starts Jun · Lottery</div>
                  </div>
                  <div class="mpg-amt" style="color:var(--amber);">₹16K</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Desktop app mockup (right column) -->
      <div class="hero-mockup">
        <div class="hc">
          <div class="hc-top">
            <div class="hc-dot" style="background:#FF5F57;"></div>
            <div class="hc-dot" style="background:#FFBD2E;"></div>
            <div class="hc-dot" style="background:#28CA41;"></div>
            <div class="hc-url">app.chitos.app/console</div>
          </div>
          <div class="hc-body">
            <div class="hc-row">
              <div class="hc-title">Ravi's console</div>
              <div class="hc-badge">Pro plan</div>
            </div>
            <div class="hc-stats">
              <div class="hcs"><div class="hcs-v g">3</div><div class="hcs-l">Active groups</div></div>
              <div class="hcs"><div class="hcs-v">24</div><div class="hcs-l">Members</div></div>
              <div class="hcs"><div class="hcs-v r">2</div><div class="hcs-l">Overdue</div></div>
            </div>
            <div class="hc-group">
              <div class="hcg-top">
                <div class="hcg-ind" style="background:var(--green);"></div>
                <div>
                  <div class="hcg-name">Friends Circle</div>
                  <div class="hcg-meta">₹1,000/month · Month 4 of 10</div>
                </div>
                <div class="hcg-tag" style="margin-left:auto;background:var(--bbg);color:#1D4ED8;border:0.5px solid var(--bb);font-size:10px;padding:2px 7px;border-radius:100px;">Auction</div>
              </div>
              <div class="hcg-prog"><div class="hcg-fill" style="width:40%;background:var(--green);"></div></div>
            </div>
            <div class="hc-group">
              <div class="hcg-top">
                <div class="hcg-ind" style="background:var(--amber);"></div>
                <div>
                  <div class="hcg-name">Office Gang</div>
                  <div class="hcg-meta">₹2,000/month · Starts Jun 2026</div>
                </div>
                <div class="hcg-tag" style="margin-left:auto;background:var(--gbg);color:#15803D;border:0.5px solid var(--gb);font-size:10px;padding:2px 7px;border-radius:100px;">Lottery</div>
              </div>
              <div class="hcg-prog"><div class="hcg-fill" style="width:75%;background:var(--amber);"></div></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- TICKER -->
    <div class="ticker-wrap">
      <div class="ticker-inner">
        <div class="ticker-item">Auction mode <span class="ticker-sep">·</span></div>
        <div class="ticker-item">Lottery mode <span class="ticker-sep">·</span></div>
        <div class="ticker-item">Fixed order <span class="ticker-sep">·</span></div>
        <div class="ticker-item">6 Indian languages <span class="ticker-sep">·</span></div>
        <div class="ticker-item">Custom branding <span class="ticker-sep">·</span></div>
        <div class="ticker-item">PWA + iOS + Android <span class="ticker-sep">·</span></div>
        <div class="ticker-item">Member approvals <span class="ticker-sep">·</span></div>
        <div class="ticker-item">Trust scores <span class="ticker-sep">·</span></div>
        <div class="ticker-item">WhatsApp invites <span class="ticker-sep">·</span></div>
        <div class="ticker-item">Cycle PDF export <span class="ticker-sep">·</span></div>
        <!-- duplicate for seamless loop -->
        <div class="ticker-item">Auction mode <span class="ticker-sep">·</span></div>
        <div class="ticker-item">Lottery mode <span class="ticker-sep">·</span></div>
        <div class="ticker-item">Fixed order <span class="ticker-sep">·</span></div>
        <div class="ticker-item">6 Indian languages <span class="ticker-sep">·</span></div>
        <div class="ticker-item">Custom branding <span class="ticker-sep">·</span></div>
        <div class="ticker-item">PWA + iOS + Android <span class="ticker-sep">·</span></div>
        <div class="ticker-item">Member approvals <span class="ticker-sep">·</span></div>
        <div class="ticker-item">Trust scores <span class="ticker-sep">·</span></div>
        <div class="ticker-item">WhatsApp invites <span class="ticker-sep">·</span></div>
        <div class="ticker-item">Cycle PDF export <span class="ticker-sep">·</span></div>
      </div>
    </div>

    <!-- SOCIAL PROOF -->
    <div class="proof">
      <div class="proof-inner">
        <div class="proof-stat"><div class="ps-val">₹2.4Cr+</div><div class="ps-lbl">managed on ChitOS</div></div>
        <div class="proof-divider"></div>
        <div class="proof-stat"><div class="ps-val">1,200+</div><div class="ps-lbl">active groups</div></div>
        <div class="proof-divider"></div>
        <div class="proof-stat"><div class="ps-val">14,000+</div><div class="ps-lbl">members across India</div></div>
        <div class="proof-divider"></div>
        <div class="proof-stat"><div class="ps-val">6</div><div class="ps-lbl">Indian languages</div></div>
        <div class="proof-divider"></div>
        <div class="proof-stat"><div class="ps-val">4.9 ★</div><div class="ps-lbl">organiser rating</div></div>
      </div>
    </div>

    <!-- FEATURES -->
    <section class="section-wrap" id="features-section">
      <div class="eyebrow-row"><div class="eyebrow-line"></div><div class="eyebrow-text">Features</div></div>
      <h2 class="section-h2">Built for every <em>circle.</em></h2>
      <p class="section-sub">Everything an organiser needs — without the complexity of enterprise chit fund software.</p>
      <div class="feat-grid">
        <div class="feat-cell">
          <div class="feat-num">01</div>
          <div class="feat-icon fi-g">
            <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          </div>
          <h3>Multi-group console</h3>
          <p>Manage friends, family, and office circles from one dashboard. Each with its own rules, members, and cycle history.</p>
        </div>
        <div class="feat-cell">
          <div class="feat-num">02</div>
          <div class="feat-icon fi-b">
            <svg viewBox="0 0 24 24"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
          </div>
          <h3>Four payout strategies</h3>
          <p>Auction, lottery, fixed order, or consensus. You pick the strategy that fits your group — change it each cycle.</p>
        </div>
        <div class="feat-cell">
          <div class="feat-num">03</div>
          <div class="feat-icon fi-a">
            <svg viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <h3>Smart interest engine</h3>
          <p>Early takers pay a fair premium. Patient waiters earn a reward. Every calculation shown transparently to all members.</p>
        </div>
        <div class="feat-cell">
          <div class="feat-num">04</div>
          <div class="feat-icon fi-g">
            <svg viewBox="0 0 24 24"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><path d="M16 11l2 2 4-4"/></svg>
          </div>
          <h3>Member approval flow</h3>
          <p>Every member who clicks your invite link needs your approval before joining. No strangers, no surprises.</p>
        </div>
        <div class="feat-cell">
          <div class="feat-num">05</div>
          <div class="feat-icon fi-s">
            <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          </div>
          <h3>Mid-cycle import</h3>
          <p>Already running a chit on paper or WhatsApp? Import your history and track going forward from any point.</p>
        </div>
        <div class="feat-cell">
          <div class="feat-num">06</div>
          <div class="feat-icon fi-b">
            <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <h3>Trust scores</h3>
          <p>A 0–100 score per member based on payment consistency, auction participation, and tenure. Know who to trust.</p>
        </div>
      </div>
    </section>

    <!-- HOW IT WORKS -->
    <section class="how-section" id="how-it-works">
      <div class="how-inner">
        <div class="eyebrow-row"><div class="eyebrow-line"></div><div class="eyebrow-text">How it works</div></div>
        <h2 class="section-h2">Up and running <em>in minutes.</em></h2>
        <div class="steps-grid">
          <div class="step-box">
            <div class="step-n">Step 01</div>
            <div class="step-icon-ring"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg></div>
            <h4>Create your group</h4>
            <p>Set contribution amount, pay frequency, max members, and payout strategy in under 2 minutes.</p>
          </div>
          <div class="step-box">
            <div class="step-n">Step 02</div>
            <div class="step-icon-ring"><svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.87 9.5 19.79 19.79 0 0 1 1.81.82a2 2 0 0 1 1.99-1.82h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9a16 16 0 0 0 6.29 6.29l.94-1.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 14.92z"/></svg></div>
            <h4>Invite via WhatsApp</h4>
            <p>Share a link. Members request to join and you approve each one. Group chat is already in your pocket.</p>
          </div>
          <div class="step-box">
            <div class="step-n">Step 03</div>
            <div class="step-icon-ring"><svg viewBox="0 0 24 24"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg></div>
            <h4>Run the cycle</h4>
            <p>Track contributions, open the auction room, declare the winner, and log the payout from your phone.</p>
          </div>
          <div class="step-box">
            <div class="step-n">Step 04</div>
            <div class="step-icon-ring"><svg viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg></div>
            <h4>Close and repeat</h4>
            <p>Export a one-page PDF summary, view the full ledger, and start the next cycle with one tap.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- LANGUAGES -->
    <section class="langs-section" id="languages-section">
      <div class="langs-grid">
        <div>
          <div class="eyebrow-row"><div class="eyebrow-line"></div><div class="eyebrow-text">Languages</div></div>
          <h2 class="section-h2"><em>Your language,</em><br>your terms.</h2>
          <p class="section-sub" style="margin-bottom: 0;">Every member sees ChitOS in their own preferred language — set individually per person. Six Indian languages supported at launch.</p>
          <div class="langs-mono">Telugu · Hindi · Tamil · Kannada · Malayalam · English</div>
        </div>
        <div class="lang-cards">
          <div class="lang-card">
            <div class="lc-script">తెలుగు</div>
            <div class="lc-name">Telugu</div>
            <div class="lc-region">Andhra Pradesh · Telangana</div>
            <div class="lc-sample">"మీ చిట్ సర్కిల్ ని మేనేజ్ చేయండి"</div>
          </div>
          <div class="lang-card">
            <div class="lc-script">हिन्दी</div>
            <div class="lc-name">Hindi</div>
            <div class="lc-region">Pan-India · 500M+ speakers</div>
            <div class="lc-sample">"अपना चिट सर्कल आसानी से चलाएं"</div>
          </div>
          <div class="lang-card">
            <div class="lc-script">தமிழ்</div>
            <div class="lc-name">Tamil</div>
            <div class="lc-region">Tamil Nadu · Sri Lanka</div>
            <div class="lc-sample">"உங்கள் குழுவை நிர்வகிக்கவும்"</div>
          </div>
          <div class="lang-card">
            <div class="lc-script">ಕನ್ನಡ</div>
            <div class="lc-name">Kannada</div>
            <div class="lc-region">Karnataka</div>
            <div class="lc-sample">"ನಿಮ್ಮ ಚಿಟ್ ಗ್ರೂಪ್ ನಿರ್ವಹಿಸಿ"</div>
          </div>
          <div class="lang-card lang-card-wide" style="grid-column: span 2;">
            <div style="flex:1;">
              <div class="lc-script">മലയാളം</div>
              <div class="lc-name">Malayalam</div>
              <div class="lc-region">Kerala</div>
              <div class="lc-sample">"നിങ്ങളുടെ ഗ്രൂപ്പ് നിയന്ത്രിക്കൂ"</div>
            </div>
            <div class="lc-right">
              <div class="lc-script" style="font-family:var(--font-sans);font-size:18px;font-weight:300;">English</div>
              <div class="lc-name">English</div>
              <div class="lc-region">Pan-India default</div>
              <div class="lc-sample">"Run your circle, your way"</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- PRICING -->
    <section class="pricing-section" id="pricing-section">
      <div class="pricing-inner">
        <div class="pricing-header">
          <div class="eyebrow-row center"><div class="eyebrow-line"></div><div class="eyebrow-text">Pricing</div><div class="eyebrow-line"></div></div>
          <h2 class="section-h2">Simple, <em>honest</em> pricing.</h2>
          <p style="font-size:15px;color:var(--t2);font-weight:300;">No hidden fees. No lock-in. Cancel any time.</p>
        </div>
        <div class="plans-row">
          <div class="plan">
            <div class="plan-name">Free</div>
            <div class="plan-desc">Get started, no card needed</div>
            <div class="plan-price">
              <div class="plan-amt">₹0</div>
              <div class="plan-per">/ month, forever</div>
            </div>
            <ul class="plan-feats">
              <li><span class="pf-check"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></span>3 groups · 15 members each</li>
              <li><span class="pf-check"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></span>All 4 payout strategies</li>
              <li><span class="pf-check"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></span>WhatsApp invites</li>
              <li><span class="pf-check"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></span>ChitOS branding</li>
            </ul>
            <button class="btn-plan-o" (click)="goToAuth()">Get started</button>
          </div>
          <div class="plan featured">
            <div class="plan-featured-badge">Most popular</div>
            <div class="plan-name">Pro</div>
            <div class="plan-desc">For serious organisers</div>
            <div class="plan-price">
              <div class="plan-amt">₹499</div>
              <div class="plan-per">/ month</div>
            </div>
            <ul class="plan-feats">
              <li><span class="pf-check"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></span>Unlimited groups + members</li>
              <li><span class="pf-check"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></span>Custom branding</li>
              <li><span class="pf-check"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></span>Reports + PDF export</li>
              <li><span class="pf-check"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></span>All 6 languages</li>
              <li><span class="pf-check"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></span>Mid-cycle import</li>
            </ul>
            <button class="btn-plan-p" (click)="goToAuth()">Start Pro ↗</button>
          </div>
          <div class="plan">
            <div class="plan-name">Business</div>
            <div class="plan-desc">White-label and scale</div>
            <div class="plan-price">
              <div class="plan-amt">₹999</div>
              <div class="plan-per">/ month</div>
            </div>
            <ul class="plan-feats">
              <li><span class="pf-check"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></span>Everything in Pro</li>
              <li><span class="pf-check"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></span>Custom domain</li>
              <li><span class="pf-check"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></span>Remove ChitOS branding</li>
              <li><span class="pf-check"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></span>Trust scores + audit logs</li>
              <li><span class="pf-check"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></span>Priority support</li>
            </ul>
            <button class="btn-plan-o" (click)="goToAuth()">Contact us</button>
          </div>
        </div>
      </div>
    </section>

    <!-- TESTIMONIALS -->
    <section class="testi-section">
      <div class="testi-header">
        <div class="eyebrow-row center"><div class="eyebrow-line"></div><div class="eyebrow-text">Organisers love it</div><div class="eyebrow-line"></div></div>
        <h2 class="section-h2">What <em>real circles</em> say.</h2>
      </div>
      <div class="testi-grid">
        <div class="testi-card">
          <div class="testi-quote">"We were running our office chit on a WhatsApp group and an Excel sheet. ChitOS replaced both. The auction room alone is worth it — no more arguments about who bid what."</div>
          <div class="testi-by">
            <div class="testi-av" style="background:var(--gbg);color:var(--green);">VR</div>
            <div>
              <div class="testi-name">Venkat Rao</div>
              <div class="testi-role">Organiser · Hyderabad · 10 members</div>
            </div>
          </div>
        </div>
        <div class="testi-card">
          <div class="testi-quote">"Finally a chit app that works in Telugu! My group members who aren't comfortable with English can use it themselves. The language switch is seamless."</div>
          <div class="testi-by">
            <div class="testi-av" style="background:var(--abg);color:var(--amber);">SR</div>
            <div>
              <div class="testi-name">Sravani Reddy</div>
              <div class="testi-role">Organiser · Vijayawada · 8 members</div>
            </div>
          </div>
        </div>
        <div class="testi-card">
          <div class="testi-quote">"The import feature was the game-changer. We had 6 months of history in a notebook. Took 10 minutes to import and now everything is tracked properly going forward."</div>
          <div class="testi-by">
            <div class="testi-av" style="background:var(--bbg);color:var(--blue);">MK</div>
            <div>
              <div class="testi-name">Mahesh Kumar</div>
              <div class="testi-role">Organiser · Chennai · 12 members</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA BAND -->
    <div class="cta-band">
      <h2 class="cta-h">Your chit.<br><em>Your rules.</em></h2>
      <p class="cta-sub">Join the organisers already running their circles on ChitOS. No card needed to start.</p>
      <button class="btn-cta-white" (click)="goToAuth()">Create your group — it's free ↗</button>
    </div>

    <!-- FOOTER -->
    <footer class="footer">
      <div class="footer-logo">Chit<em>OS</em></div>
      <div class="footer-links">
        <a href="#">Privacy</a>
        <a href="#">Terms</a>
        <a href="#">Contact</a>
        <a href="#">Blog</a>
        <a href="#">Changelog</a>
      </div>
      <div class="footer-copy">© 2026 ChitOS · chitos.app</div>
    </footer>
  `,
})
export class LandingPage {
  private router = inject(Router);

  goToAuth(): void { this.router.navigate(['/auth']); }

  scrollToSection(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }
}
